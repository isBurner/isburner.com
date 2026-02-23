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
