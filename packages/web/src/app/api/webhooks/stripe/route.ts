import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { db } from '@/lib/db';
import { users, subscriptions, apiKeys } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { syncUserKeysToKV } from '@/lib/kv-sync';
import type { Tier } from '@/lib/tier-config';
import type Stripe from 'stripe';

function tierFromPriceId(priceId: string): Tier | null {
  if (priceId === process.env.STRIPE_PRO_PRICE_ID) return 'pro';
  if (priceId === process.env.STRIPE_STARTER_PRICE_ID) return 'starter';
  console.error(`Unknown Stripe price ID: ${priceId} — skipping event`);
  return null;
}

/** Extract period timestamps from a subscription's first item. */
function getSubPeriod(sub: Stripe.Subscription) {
  const item = sub.items.data[0];
  return {
    start: new Date(item.current_period_start * 1000),
    end: new Date(item.current_period_end * 1000),
  };
}

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    console.error('Stripe webhook signature verification failed');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      if (!session.subscription) break;

      let userId = session.metadata?.userId;
      if (!userId && session.customer) {
        const customerId =
          typeof session.customer === 'string' ? session.customer : session.customer.id;
        const user = await db.query.users.findFirst({
          where: eq(users.stripeCustomerId, customerId),
        });
        userId = user?.id;
      }
      if (!userId) break;

      const subscriptionId =
        typeof session.subscription === 'string' ? session.subscription : session.subscription.id;
      const customerId =
        typeof session.customer === 'string' ? session.customer : session.customer?.id;

      const sub = await stripe.subscriptions.retrieve(subscriptionId);
      const period = getSubPeriod(sub);
      const tier = tierFromPriceId(sub.items.data[0].price.id);
      if (!tier) break;

      // Update user tier, subscription ID, and customer ID
      await db
        .update(users)
        .set({
          tier,
          stripeSubscriptionId: subscriptionId,
          stripeCustomerId: customerId ?? undefined,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));

      // Upsert subscription record
      await db
        .insert(subscriptions)
        .values({
          id: subscriptionId,
          userId,
          stripePriceId: sub.items.data[0].price.id,
          status: sub.status as typeof subscriptions.$inferInsert.status,
          currentPeriodStart: period.start,
          currentPeriodEnd: period.end,
          cancelAtPeriodEnd: sub.cancel_at_period_end,
        })
        .onConflictDoUpdate({
          target: subscriptions.id,
          set: {
            status: sub.status as typeof subscriptions.$inferInsert.status,
            currentPeriodStart: period.start,
            currentPeriodEnd: period.end,
            cancelAtPeriodEnd: sub.cancel_at_period_end,
            updatedAt: new Date(),
          },
        });

      // Sync all active keys to KV with new tier and billing period
      const periodStartStr = period.start.toISOString().slice(0, 10);
      await syncActiveKeys(userId, tier, periodStartStr);
      break;
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object;
      let userId = await getUserIdFromSubscription(sub.id);

      // Fallback: look up by stripeSubscriptionId on users table
      if (!userId) {
        const user = await db.query.users.findFirst({
          where: eq(users.stripeSubscriptionId, sub.id),
        });
        userId = user?.id ?? null;
      }

      // Fallback: look up by Stripe customer ID (handles out-of-order events)
      if (!userId) {
        const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id;
        const user = await db.query.users.findFirst({
          where: eq(users.stripeCustomerId, customerId),
        });
        userId = user?.id ?? null;
      }
      if (!userId) break;

      const period = getSubPeriod(sub);
      const tier = tierFromPriceId(sub.items.data[0].price.id);
      if (!tier) break;

      // Upsert subscription record (handles both new and updated)
      await db
        .insert(subscriptions)
        .values({
          id: sub.id,
          userId,
          stripePriceId: sub.items.data[0].price.id,
          status: sub.status as typeof subscriptions.$inferInsert.status,
          currentPeriodStart: period.start,
          currentPeriodEnd: period.end,
          cancelAtPeriodEnd: sub.cancel_at_period_end,
        })
        .onConflictDoUpdate({
          target: subscriptions.id,
          set: {
            stripePriceId: sub.items.data[0].price.id,
            status: sub.status as typeof subscriptions.$inferInsert.status,
            currentPeriodStart: period.start,
            currentPeriodEnd: period.end,
            cancelAtPeriodEnd: sub.cancel_at_period_end,
            updatedAt: new Date(),
          },
        });

      // Update user tier and ensure stripeSubscriptionId is set.
      // Keep access during past_due to allow Stripe's dunning/retry to recover payment.
      if (sub.status === 'active' || sub.status === 'trialing' || sub.status === 'past_due') {
        await db
          .update(users)
          .set({ tier, stripeSubscriptionId: sub.id, updatedAt: new Date() })
          .where(eq(users.id, userId));
        const periodStartStr = period.start.toISOString().slice(0, 10);
        await syncActiveKeys(userId, tier, periodStartStr);
      } else {
        await downgradeUser(userId);
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object;
      let userId = await getUserIdFromSubscription(sub.id);

      if (!userId) {
        const user = await db.query.users.findFirst({
          where: eq(users.stripeSubscriptionId, sub.id),
        });
        userId = user?.id ?? null;
      }
      if (!userId) {
        const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id;
        const user = await db.query.users.findFirst({
          where: eq(users.stripeCustomerId, customerId),
        });
        userId = user?.id ?? null;
      }
      if (!userId) break;

      await db
        .update(subscriptions)
        .set({ status: 'canceled', updatedAt: new Date() })
        .where(eq(subscriptions.id, sub.id));

      await downgradeUser(userId);
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object;
      console.error('Payment failed for customer:', invoice.customer);
      break;
    }
  }

  return NextResponse.json({ received: true });
}

async function getUserIdFromSubscription(subscriptionId: string): Promise<string | null> {
  const sub = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.id, subscriptionId),
  });
  return sub?.userId ?? null;
}

async function downgradeUser(userId: string) {
  await db
    .update(users)
    .set({
      tier: 'free' as Tier,
      stripeSubscriptionId: null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  await syncActiveKeys(userId, 'free');
}

async function syncActiveKeys(userId: string, tier: Tier, billingPeriodStart: string | null = null) {
  const keys = await db.query.apiKeys.findMany({
    where: and(eq(apiKeys.userId, userId), eq(apiKeys.isActive, true)),
  });

  try {
    await syncUserKeysToKV(
      keys.map((k) => ({ keyHash: k.keyHash, id: k.id })),
      userId,
      tier,
      billingPeriodStart
    );
  } catch (e) {
    console.error('Failed to sync keys to KV after tier change:', e);
  }
}
