import { Hono } from 'hono';
import type { Env } from '../types';

const internal = new Hono<{ Bindings: Env }>();

/** Protect internal routes with a shared secret. */
internal.use('*', async (c, next) => {
  const secret = c.req.header('X-Internal-Secret');
  if (secret !== c.env.INTERNAL_SECRET) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  await next();
});

/**
 * GET /internal/usage?keyHash=xxx
 * Returns the current month's usage count for a key from KV.
 */
internal.get('/usage', async (c) => {
  const keyHash = c.req.query('keyHash');
  if (!keyHash) {
    return c.json({ error: 'Missing keyHash parameter' }, 400);
  }

  // Look up the key metadata to check for billing period
  const keyData = await c.env.API_KEYS.get(keyHash);
  const now = new Date();
  let period: string;

  if (keyData) {
    const parsed = JSON.parse(keyData);
    period = parsed.billingPeriodStart
      ? parsed.billingPeriodStart
      : `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
  } else {
    period = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
  }

  const usageKey = `usage:${keyHash}:${period}`;
  const raw = await c.env.API_KEYS.get(usageKey);
  const count = raw ? parseInt(raw, 10) : 0;

  return c.json({ keyHash, period, count });
});

export default internal;
