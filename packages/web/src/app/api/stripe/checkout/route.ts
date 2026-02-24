import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const PRICE_IDS: Record<string, string | undefined> = {
  starter: process.env.STRIPE_STARTER_PRICE_ID,
  pro: process.env.STRIPE_PRO_PRICE_ID,
};

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const tier = (body as { tier?: string }).tier ?? 'starter';
  const priceId = PRICE_IDS[tier];

  if (!priceId) {
    return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Prevent downgrades via checkout — use billing portal instead
  const TIER_ORDER: Record<string, number> = { free: 0, starter: 1, pro: 2 };
  if (TIER_ORDER[tier] <= (TIER_ORDER[user.tier] ?? 0)) {
    return NextResponse.json(
      { error: 'Use the billing portal to downgrade or manage your subscription' },
      { status: 400 }
    );
  }

  // Reuse existing Stripe customer or create one
  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { userId },
    });
    customerId = customer.id;
    await db
      .update(users)
      .set({ stripeCustomerId: customerId, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  // If user already has an active subscription, update it instead of creating a new one
  if (user.stripeSubscriptionId) {
    const existingSub = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
    const existingItem = existingSub.items.data[0];
    if (
      existingItem &&
      (existingSub.status === 'active' || existingSub.status === 'trialing')
    ) {
      // Single atomic update: reverse cancellation (if any) and upgrade in one call
      await stripe.subscriptions.update(user.stripeSubscriptionId, {
        cancel_at_period_end: false,
        items: [
          {
            id: existingItem.id,
            price: priceId,
          },
        ],
        proration_behavior: 'create_prorations',
      });

      // Tier update handled by the subscription.updated webhook — don't update eagerly
      // as the proration invoice may fail, leaving the user on the wrong tier.
      return NextResponse.json({
        url: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://isburner.com'}/dashboard/billing?success=true`,
      });
    }
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://isburner.com'}/dashboard/billing?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://isburner.com'}/dashboard/billing`,
    metadata: { userId },
  });

  return NextResponse.json({ url: session.url });
}
