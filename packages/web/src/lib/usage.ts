import { db } from './db';
import { usageLogs } from './db/schema';
import { eq, and, sql, gte } from 'drizzle-orm';

/** Get total usage for a user in the current billing month. */
export async function getCurrentMonthUsage(userId: string): Promise<number> {
  const now = new Date();
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

  const result = await db
    .select({ total: sql<number>`coalesce(sum(${usageLogs.lookupCount}), 0)` })
    .from(usageLogs)
    .where(and(eq(usageLogs.userId, userId), gte(usageLogs.date, monthStart)));

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
