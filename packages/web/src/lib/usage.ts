import { db } from './db';
import { usageLogs, subscriptions } from './db/schema';
import { eq, and, sql, gte, inArray } from 'drizzle-orm';

/** Get total usage for a user in the current billing period.
 *  Paid users: counts from their Stripe billing period start.
 *  Free users: counts from the 1st of the current calendar month. */
export async function getCurrentMonthUsage(
  userId: string,
  billingPeriodStart?: string | null
): Promise<number> {
  let periodStart: string;

  if (billingPeriodStart) {
    periodStart = billingPeriodStart;
  } else {
    const now = new Date();
    periodStart = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-01`;
  }

  const result = await db
    .select({ total: sql<number>`coalesce(sum(${usageLogs.lookupCount}), 0)` })
    .from(usageLogs)
    .where(and(eq(usageLogs.userId, userId), gte(usageLogs.date, periodStart)));

  return Number(result[0]?.total ?? 0);
}

/** Get daily usage breakdown for a user over a date range. */
export async function getDailyUsage(
  userId: string,
  days: number = 30
): Promise<Array<{ date: string; count: number }>> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startStr = startDate.toISOString().slice(0, 10);

  const rows = await db
    .select({
      date: usageLogs.date,
      count: sql<number>`coalesce(sum(${usageLogs.lookupCount}), 0)`,
    })
    .from(usageLogs)
    .where(and(eq(usageLogs.userId, userId), gte(usageLogs.date, startStr)))
    .groupBy(usageLogs.date)
    .orderBy(usageLogs.date);

  return rows.map((r) => ({ date: r.date, count: Number(r.count) }));
}

/** Look up the current billing period start for a user.
 *  Returns YYYY-MM-DD string for paid users, null for free users.
 *  Matches the webhook logic that grants access for active, trialing, and past_due. */
export async function getBillingPeriodStart(userId: string): Promise<string | null> {
  const sub = await db.query.subscriptions.findFirst({
    where: and(
      eq(subscriptions.userId, userId),
      inArray(subscriptions.status, ['active', 'trialing', 'past_due'])
    ),
  });

  if (!sub?.currentPeriodStart) return null;
  return sub.currentPeriodStart.toISOString().slice(0, 10);
}
