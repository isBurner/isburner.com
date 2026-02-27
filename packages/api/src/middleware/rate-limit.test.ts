import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Hono } from 'hono';
import type { AppEnv, ApiKeyData } from '../types';
import { rateLimitMiddleware } from './rate-limit';
import { createMockKV } from '../__tests__/helpers/mock-kv';
import { createTestEnv, createMockExecutionCtx } from '../__tests__/helpers/test-app';

const FREE_KEY: ApiKeyData = {
  userId: 'user_123',
  keyId: 'key_abc',
  tier: 'free',
  rateLimit: 10,
  monthlyLimit: 1000,
  isActive: true,
  billingPeriodStart: null,
};

describe('rateLimitMiddleware', () => {
  let kv: ReturnType<typeof createMockKV>;
  let app: Hono<AppEnv>;
  let env: ReturnType<typeof createTestEnv>;
  let execCtx: ReturnType<typeof createMockExecutionCtx>;

  beforeEach(() => {
    kv = createMockKV();
    env = createTestEnv({ kv });
    execCtx = createMockExecutionCtx();

    app = new Hono<AppEnv>();
    // Inject apiKey into context (simulating auth middleware)
    app.use('*', async (c, next) => {
      c.set('apiKey', FREE_KEY);
      c.set('keyHash', 'fakehash');
      await next();
    });
    app.use('*', rateLimitMiddleware);
    app.get('/test', (c) => c.json({ ok: true }));

    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-26T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('allows request when count is below limit', async () => {
    const res = await app.request('/test', {}, env, execCtx.ctx);
    expect(res.status).toBe(200);
  });

  it('allows request at limit - 1', async () => {
    const epoch = Math.floor(Date.now() / 1000);
    kv._store.set(`rl:user_123:${epoch}`, '9');

    const res = await app.request('/test', {}, env, execCtx.ctx);
    expect(res.status).toBe(200);
  });

  it('returns 429 when count reaches rateLimit', async () => {
    const epoch = Math.floor(Date.now() / 1000);
    kv._store.set(`rl:user_123:${epoch}`, '10');

    const res = await app.request('/test', {}, env, execCtx.ctx);
    expect(res.status).toBe(429);

    const body = await res.json();
    expect(body.error).toBe('Rate limit exceeded.');
    expect(body.limit).toBe(10);
    expect(body.retry_after).toBe(1);
    expect(res.headers.get('Retry-After')).toBe('1');
  });

  it('returns 429 when count exceeds rateLimit', async () => {
    const epoch = Math.floor(Date.now() / 1000);
    kv._store.set(`rl:user_123:${epoch}`, '999');

    const res = await app.request('/test', {}, env, execCtx.ctx);
    expect(res.status).toBe(429);
  });

  it('constructs correct KV key with userId and epoch second', async () => {
    await app.request('/test', {}, env, execCtx.ctx);

    const epoch = Math.floor(Date.now() / 1000);
    expect(kv.get).toHaveBeenCalledWith(`rl:user_123:${epoch}`);
  });

  it('increments counter via waitUntil (non-blocking)', async () => {
    await app.request('/test', {}, env, execCtx.ctx);
    await execCtx.flush();

    const epoch = Math.floor(Date.now() / 1000);
    expect(kv.put).toHaveBeenCalledWith(`rl:user_123:${epoch}`, '1', { expirationTtl: 10 });
  });

  it('handles NaN in KV value gracefully', async () => {
    const epoch = Math.floor(Date.now() / 1000);
    kv._store.set(`rl:user_123:${epoch}`, 'not-a-number');

    const res = await app.request('/test', {}, env, execCtx.ctx);
    expect(res.status).toBe(200);
  });
});
