import { db } from '@/lib/db';
import { subscriptions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { stripe } from '@/lib/stripe';
import { TIER_CONFIG, type Tier } from '@/lib/tier-config';
import { ensureUser } from '@/lib/ensure-user';
import PlanBadge from '@/components/dashboard/PlanBadge';
import UpgradeButton from '@/components/dashboard/UpgradeButton';
import ManageSubscriptionButton from '@/components/dashboard/ManageSubscriptionButton';

async function getSubscriptionDetails(stripeSubscriptionId: string) {
  // Try local DB first
  const local = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.id, stripeSubscriptionId),
  });
  if (local) return local;

  // Fall back to Stripe directly
  try {
    const sub = await stripe.subscriptions.retrieve(stripeSubscriptionId);
    const item = sub.items.data[0];
    return {
      status: sub.status,
      currentPeriodStart: new Date(item.current_period_start * 1000),
      currentPeriodEnd: new Date(item.current_period_end * 1000),
      cancelAtPeriodEnd: sub.cancel_at_period_end,
    };
  } catch {
    return null;
  }
}

export default async function BillingPage() {
  const user = await ensureUser();

  const tier = user.tier as Tier;
  const config = TIER_CONFIG[tier];

  const subscription = user.stripeSubscriptionId
    ? await getSubscriptionDetails(user.stripeSubscriptionId)
    : null;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h1 className="font-mono text-2xl font-bold tracking-tight">Billing</h1>
        <p className="mt-1 text-sm text-text-muted">
          Manage your subscription and billing details.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Current Plan */}
        <div className="rounded-xl border border-border bg-bg-surface/40 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-mono text-sm font-medium text-text-muted">Current Plan</h2>
            <PlanBadge tier={tier} />
          </div>
          <div className="mb-2 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-bold">{config.name}</span>
          </div>
          <ul className="mb-6 space-y-2">
            {config.features.map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-sm text-text-muted">
                <span className="font-mono text-accent">+</span>
                {feature}
              </li>
            ))}
          </ul>

          {tier === 'pro' ? (
            <ManageSubscriptionButton />
          ) : tier === 'starter' ? (
            <div className="flex flex-wrap items-center gap-3">
              <UpgradeButton currentTier="starter" />
              <ManageSubscriptionButton />
            </div>
          ) : (
            <UpgradeButton currentTier="free" />
          )}
        </div>

        {/* Subscription Details (for paying users) */}
        {subscription && (
          <div className="rounded-xl border border-border bg-bg-surface/40 p-6">
            <h2 className="mb-4 font-mono text-sm font-medium text-text-muted">
              Subscription Details
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-text-muted">Status</span>
                <span
                  className={`font-mono ${subscription.status === 'active' ? 'text-accent' : 'text-warning'}`}
                >
                  {subscription.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Current period</span>
                <span className="font-mono text-text">
                  {subscription.currentPeriodStart.toLocaleDateString()} —{' '}
                  {subscription.currentPeriodEnd.toLocaleDateString()}
                </span>
              </div>
              {subscription.cancelAtPeriodEnd && (
                <div className="mt-3 rounded-lg border border-warning/30 bg-warning/5 p-3 text-xs text-warning">
                  Your subscription will be canceled at the end of the current period.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
