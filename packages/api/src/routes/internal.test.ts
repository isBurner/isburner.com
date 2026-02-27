import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Hono } from 'hono';
import type { Env } from '../types';
import internal from './internal';
import { createMockKV } from '../__tests__/helpers/mock-kv';
import { createTestEnv } from '../__tests__/helpers/test-app';

describe('internal routes', () => {
  let kv: ReturnType<typeof createMockKV>;
  let app: Hono<{ Bindings: Env }>;
  let env: ReturnType<typeof createTestEnv>;

  beforeEach(() => {
    kv = createMockKV();
    env = createTestEnv({ kv, internalSecret: 'the-secret' });
    app = new Hono<{ Bindings: Env }>();
    app.route('/internal', internal);

    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-26T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('auth guard', () => {
    it('returns 401 when X-Internal-Secret header is missing', async () => {
      const res = await app.request('/internal/usage?userId=u1', {}, env);
      expect(res.status).toBe(401);
    });

    it('returns 401 when secret does not match', async () => {
      const res = await app.request(
        '/internal/usage?userId=u1',
        { headers: { 'X-Internal-Secret': 'wrong' } },
        env
      );
      expect(res.status).toBe(401);
    });

    it('allows request when secret matches', async () => {
      const res = await app.request(
        '/internal/usage?userId=u1',
        { headers: { 'X-Internal-Secret': 'the-secret' } },
        env
      );
      expect(res.status).toBe(200);
    });
  });

  describe('GET /internal/usage', () => {
    const headers = { 'X-Internal-Secret': 'the-secret' };

    it('returns 400 when userId is missing', async () => {
      const res = await app.request('/internal/usage', { headers }, env);
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toContain('userId');
    });

    it('returns usage count from KV for given userId', async () => {
      kv._store.set('usage:user_42:2026-02', '150');

      const res = await app.request('/internal/usage?userId=user_42', { headers }, env);
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.userId).toBe('user_42');
      expect(body.period).toBe('2026-02');
      expect(body.count).toBe(150);
    });

    it('uses billingPeriodStart query param when provided', async () => {
      kv._store.set('usage:user_42:2026-02-15', '300');

      const res = await app.request(
        '/internal/usage?userId=user_42&billingPeriodStart=2026-02-15',
        { headers },
        env
      );
      const body = await res.json();
      expect(body.period).toBe('2026-02-15');
      expect(body.count).toBe(300);
    });

    it('returns 0 when no usage exists', async () => {
      const res = await app.request('/internal/usage?userId=new_user', { headers }, env);
      const body = await res.json();
      expect(body.count).toBe(0);
    });

    it('handles NaN usage values gracefully', async () => {
      kv._store.set('usage:user_42:2026-02', 'corrupt');

      const res = await app.request('/internal/usage?userId=user_42', { headers }, env);
      const body = await res.json();
      expect(body.count).toBe(0);
    });
  });
});
