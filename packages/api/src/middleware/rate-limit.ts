import type { Context, Next } from 'hono';
import type { AppEnv } from '../types';

/**
 * Per-second sliding window rate limiter using KV.
 * KV key: `rl:{keyHash}:{epoch-second}` with 10s TTL.
 */
export async function rateLimitMiddleware(c: Context<AppEnv>, next: Next) {
  const apiKey = c.get('apiKey');
  const keyHash = c.get('keyHash');

  const now = Math.floor(Date.now() / 1000);
  const rlKey = `rl:${keyHash}:${now}`;

  const current = await c.env.API_KEYS.get(rlKey);
  const parsed = current ? parseInt(current, 10) : 0;
  const count = Number.isNaN(parsed) ? 0 : parsed;

  if (count >= apiKey.rateLimit) {
    c.header('Retry-After', '1');
    return c.json(
      {
        error: 'Rate limit exceeded.',
        limit: apiKey.rateLimit,
        retry_after: 1,
      },
      429
    );
  }

  // Increment (best-effort, KV is eventually consistent)
  c.executionCtx.waitUntil(c.env.API_KEYS.put(rlKey, String(count + 1), { expirationTtl: 10 }));

  await next();
}
