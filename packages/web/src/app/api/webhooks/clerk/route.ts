import { Webhook } from 'svix';
import { headers } from 'next/headers';
import type { WebhookEvent } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { users, apiKeys } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { removeKeyFromKV } from '@/lib/kv-sync';
import { stripe } from '@/lib/stripe';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    throw new Error('Missing CLERK_WEBHOOK_SECRET env var');
  }

  const headerPayload = await headers();
  const svixId = headerPayload.get('svix-id');
  const svixTimestamp = headerPayload.get('svix-timestamp');
  const svixSignature = headerPayload.get('svix-signature');

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response('Missing svix headers', { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  let event: WebhookEvent;

  try {
    event = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as WebhookEvent;
  } catch {
    console.error('Webhook signature verification failed');
    return new Response('Invalid signature', { status: 400 });
  }

  switch (event.type) {
    case 'user.created': {
      const { id, email_addresses } = event.data;
      const primaryEmail = email_addresses.find(
        (e) => e.id === event.data.primary_email_address_id
      );
      const email = primaryEmail?.email_address ?? email_addresses[0]?.email_address ?? '';

      // Create user row (no-op if ensureUser already created it)
      await db.insert(users).values({ id, email }).onConflictDoNothing();
      break;
    }

    case 'user.updated': {
      const { id, email_addresses } = event.data;
      const primaryEmail = email_addresses.find(
        (e) => e.id === event.data.primary_email_address_id
      );
      const email = primaryEmail?.email_address ?? email_addresses[0]?.email_address;

      if (email) {
        await db.update(users).set({ email, updatedAt: new Date() }).where(eq(users.id, id));
      }
      break;
    }

    case 'user.deleted': {
      const { id } = event.data;
      if (id) {
        const user = await db.query.users.findFirst({ where: eq(users.id, id) });

        // Cancel Stripe subscription before deleting DB records
        if (user?.stripeSubscriptionId) {
          try {
            await stripe.subscriptions.cancel(user.stripeSubscriptionId);
          } catch (e) {
            console.error('Failed to cancel Stripe subscription for deleted user:', e);
            // Don't block user deletion — Stripe will eventually cancel due to failed payments
          }
        }

        // Remove all active keys from KV before cascade-deleting from DB
        const activeKeys = await db.query.apiKeys.findMany({
          where: and(eq(apiKeys.userId, id), eq(apiKeys.isActive, true)),
        });
        await Promise.all(activeKeys.map((k) => removeKeyFromKV(k.keyHash).catch(console.error)));
        await db.delete(users).where(eq(users.id, id));
      }
      break;
    }
  }

  return new Response('OK', { status: 200 });
}
