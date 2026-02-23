import { db } from '@/lib/db';
import { apiKeys } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { TIER_CONFIG, type Tier } from '@/lib/tier-config';
import { getCurrentMonthUsage, getBillingPeriodStart } from '@/lib/usage';
import { ensureUser } from '@/lib/ensure-user';
import PlanBadge from '@/components/dashboard/PlanBadge';
import UsageBar from '@/components/dashboard/UsageBar';
import ApiKeyDisplay from '@/components/dashboard/ApiKeyDisplay';
import Link from 'next/link';

export default async function DashboardPage() {
  const user = await ensureUser();

  const tier = user.tier as Tier;
  const config = TIER_CONFIG[tier];
  const billingPeriodStart = await getBillingPeriodStart(user.id);
  const usage = await getCurrentMonthUsage(user.id, billingPeriodStart);

  const primaryKey = await db.query.apiKeys.findFirst({
    where: and(eq(apiKeys.userId, user.id), eq(apiKeys.isActive, true)),
    orderBy: (apiKeys, { asc }) => [asc(apiKeys.createdAt)],
  });

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h1 className="font-mono text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-text-muted">Overview of your isBurner account.</p>
      </div>

      <div className="grid gap-6">
        {/* Plan */}
        <div className="rounded-xl border border-border bg-bg-surface/40 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-mono text-sm font-medium text-text-muted">Current Plan</h2>
            <PlanBadge tier={tier} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-3xl font-bold">{config.name}</span>
            <span className="text-sm text-text-faint">
              {config.monthlyLimit.toLocaleString()} lookups/mo
            </span>
          </div>
          {tier !== 'pro' && (
            <Link
              href="/dashboard/billing"
              className="mt-4 inline-block rounded-lg bg-accent px-4 py-2 font-mono text-xs font-semibold text-bg transition-colors hover:bg-accent-dim"
            >
              {tier === 'free' ? 'Upgrade' : 'Upgrade to Pro'}
            </Link>
          )}
        </div>

        {/* Usage */}
        <div className="rounded-xl border border-border bg-bg-surface/40 p-6">
          <h2 className="mb-4 font-mono text-sm font-medium text-text-muted">Monthly Usage</h2>
          <UsageBar used={usage} limit={config.monthlyLimit} />
          <Link
            href="/dashboard/usage"
            className="mt-3 inline-block font-mono text-xs text-text-faint transition-colors hover:text-accent"
          >
            View details &rarr;
          </Link>
        </div>

        {/* Primary API Key */}
        <div className="rounded-xl border border-border bg-bg-surface/40 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-mono text-sm font-medium text-text-muted">API Key</h2>
            <Link
              href="/dashboard/keys"
              className="font-mono text-xs text-text-faint transition-colors hover:text-accent"
            >
              Manage keys &rarr;
            </Link>
          </div>
          {primaryKey ? (
            <ApiKeyDisplay keyPrefix={primaryKey.keyPrefix} />
          ) : (
            <p className="text-sm text-text-faint">
              No active API key.{' '}
              <Link href="/dashboard/keys" className="text-accent hover:text-accent-dim">
                Create one
              </Link>
            </p>
          )}
        </div>

        {/* Quick Links */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/docs"
            className="rounded-xl border border-border bg-bg-surface/40 p-5 transition-colors hover:border-border-bright"
          >
            <span className="mb-1 block font-mono text-xs text-accent">?</span>
            <span className="font-mono text-sm font-medium">Documentation</span>
            <p className="mt-1 text-xs text-text-faint">API reference and guides</p>
          </Link>
          <Link
            href="/dashboard/billing"
            className="rounded-xl border border-border bg-bg-surface/40 p-5 transition-colors hover:border-border-bright"
          >
            <span className="mb-1 block font-mono text-xs text-accent">$</span>
            <span className="font-mono text-sm font-medium">Billing</span>
            <p className="mt-1 text-xs text-text-faint">Manage your subscription</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
