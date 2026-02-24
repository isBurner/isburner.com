import type { Context, Next } from 'hono';
import type { AppEnv } from '../types';

/**
 * Usage tracking middleware. Checks monthly limit before processing.
 * Increments counter async via waitUntil().
 * KV key: `usage:{keyHash}:{YYYY-MM}` → integer count.
 */
export async function usageMiddleware(c: Context<AppEnv>, next: Next) {
  const apiKey = c.get('apiKey');
  const keyHash = c.get('keyHash');

  const now = new Date();
  // Paid users: reset usage on billing period boundary. Free users: calendar month.
  const period = apiKey.billingPeriodStart
    ? apiKey.billingPeriodStart
    : `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
  const usageKey = `usage:${keyHash}:${period}`;

  // Check current usage
  const raw = await c.env.API_KEYS.get(usageKey);
  const parsed = raw ? parseInt(raw, 10) : 0;
  const currentUsage = Number.isNaN(parsed) ? 0 : parsed;

  if (currentUsage >= apiKey.monthlyLimit) {
    return c.json(
      {
        error: 'Monthly usage limit exceeded.',
        limit: apiKey.monthlyLimit,
        used: currentUsage,
      },
      429
    );
  }

  // Process request
  await next();

  // Increment usage counter async (don't block response)
  c.executionCtx.waitUntil(
    c.env.API_KEYS.put(usageKey, String(currentUsage + 1), {
      // Expire after 35 days to auto-cleanup old months
      expirationTtl: 60 * 60 * 24 * 35,
    })
  );
}
