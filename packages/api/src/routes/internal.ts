import { Hono } from 'hono';
import type { Env } from '../types';
import { timingSafeEqual } from '../util';

const internal = new Hono<{ Bindings: Env }>();

/** Protect internal routes with a shared secret. */
internal.use('*', async (c, next) => {
  const secret = c.req.header('X-Internal-Secret');
  if (!secret || !timingSafeEqual(secret, c.env.INTERNAL_SECRET)) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  await next();
});

/**
 * GET /internal/usage?userId=xxx[&billingPeriodStart=YYYY-MM-DD]
 * Returns the current period's usage count for a user from KV.
 */
internal.get('/usage', async (c) => {
  const userId = c.req.query('userId');
  if (!userId) {
    return c.json({ error: 'Missing userId parameter' }, 400);
  }

  const now = new Date();
  const calendarMonth = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
  const period = c.req.query('billingPeriodStart') || calendarMonth;

  const usageKey = `usage:${userId}:${period}`;
  const raw = await c.env.API_KEYS.get(usageKey);
  const parsed = raw ? parseInt(raw, 10) : 0;
  const count = Number.isNaN(parsed) ? 0 : parsed;

  return c.json({ userId, period, count });
});

export default internal;
