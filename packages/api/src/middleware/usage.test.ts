import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Hono } from 'hono';
import type { AppEnv, ApiKeyData } from '../types';
import { usageMiddleware } from './usage';
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

const PAID_KEY: ApiKeyData = {
  ...FREE_KEY,
  tier: 'starter',
  rateLimit: 50,
  monthlyLimit: 10000,
  billingPeriodStart: '2026-02-15',
};

describe('usageMiddleware', () => {
  let kv: ReturnType<typeof createMockKV>;
  let app: Hono<AppEnv>;
  let env: ReturnType<typeof createTestEnv>;
  let execCtx: ReturnType<typeof createMockExecutionCtx>;
  let currentKeyData: ApiKeyData;

  beforeEach(() => {
    kv = createMockKV();
    env = createTestEnv({ kv });
    execCtx = createMockExecutionCtx();
    currentKeyData = FREE_KEY;

    app = new Hono<AppEnv>();
    app.use('*', async (c, next) => {
      c.set('apiKey', currentKeyData);
      c.set('keyHash', 'fakehash');
      await next();
    });
    app.use('*', usageMiddleware);
    app.get('/test', (c) => c.json({ ok: true }));

    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-26T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('allows request when usage is below monthlyLimit', async () => {
    const res = await app.request('/test', {}, env, execCtx.ctx);
    expect(res.status).toBe(200);
  });

  it('returns 429 when usage equals monthlyLimit', async () => {
    kv._store.set('usage:user_123:2026-02', '1000');

    const res = await app.request('/test', {}, env, execCtx.ctx);
    expect(res.status).toBe(429);

    const body = await res.json();
    expect(body.error).toBe('Monthly usage limit exceeded.');
    expect(body.limit).toBe(1000);
    expect(body.used).toBe(1000);
  });

  it('returns 429 when usage exceeds monthlyLimit', async () => {
    kv._store.set('usage:user_123:2026-02', '5000');

    const res = await app.request('/test', {}, env, execCtx.ctx);
    expect(res.status).toBe(429);
  });

  it('uses billingPeriodStart for paid users period key', async () => {
    currentKeyData = PAID_KEY;

    await app.request('/test', {}, env, execCtx.ctx);
    expect(kv.get).toHaveBeenCalledWith('usage:user_123:2026-02-15');
  });

  it('uses calendar month (YYYY-MM) for free users period key', async () => {
    await app.request('/test', {}, env, execCtx.ctx);
    expect(kv.get).toHaveBeenCalledWith('usage:user_123:2026-02');
  });

  it('increments usage after next() completes via waitUntil', async () => {
    await app.request('/test', {}, env, execCtx.ctx);
    await execCtx.flush();

    expect(kv.put).toHaveBeenCalledWith('usage:user_123:2026-02', '1', {
      expirationTtl: 60 * 60 * 24 * 35,
    });
  });

  it('handles NaN in KV value gracefully', async () => {
    kv._store.set('usage:user_123:2026-02', 'garbage');

    const res = await app.request('/test', {}, env, execCtx.ctx);
    expect(res.status).toBe(200);
  });
});
