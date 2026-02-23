import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { TIER_CONFIG, type Tier } from '@/lib/tier-config';
import { getCurrentMonthUsage, getDailyUsage } from '@/lib/usage';
import UsageBar from '@/components/dashboard/UsageBar';
import UsageChart from '@/components/dashboard/UsageChart';

export default async function UsagePage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });
  if (!user) redirect('/sign-in');

  const tier = user.tier as Tier;
  const config = TIER_CONFIG[tier];
  const usage = await getCurrentMonthUsage(userId);
  const dailyUsage = await getDailyUsage(userId, 30);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h1 className="font-mono text-2xl font-bold tracking-tight">Usage</h1>
        <p className="mt-1 text-sm text-text-muted">
          API lookup usage for the current billing period.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Monthly total */}
        <div className="rounded-xl border border-border bg-bg-surface/40 p-6">
          <h2 className="mb-4 font-mono text-sm font-medium text-text-muted">This Month</h2>
          <UsageBar used={usage} limit={config.monthlyLimit} />
        </div>

        {/* Chart */}
        <div className="rounded-xl border border-border bg-bg-surface/40 p-6">
          <h2 className="mb-4 font-mono text-sm font-medium text-text-muted">
            Daily Lookups (Last 30 Days)
          </h2>
          <UsageChart data={dailyUsage} />
        </div>

        {/* Daily breakdown table */}
        {dailyUsage.length > 0 && (
          <div className="rounded-xl border border-border bg-bg-surface/40 p-6">
            <h2 className="mb-4 font-mono text-sm font-medium text-text-muted">Daily Breakdown</h2>
            <div className="space-y-1">
              {[...dailyUsage].reverse().map((d) => (
                <div
                  key={d.date}
                  className="flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-bg-elevated/30"
                >
                  <span className="font-mono text-text-muted">{d.date}</span>
                  <span className="font-mono text-text">{d.count.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
