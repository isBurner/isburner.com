import { describe, it, expect, beforeEach, afterEach, vi, beforeAll } from 'vitest';
import type { ApiKeyData } from './types';
import { createMockKV } from './__tests__/helpers/mock-kv';
import { createTestEnv, createMockExecutionCtx } from './__tests__/helpers/test-app';

// Mock Sentry so the default export is the raw Hono app
vi.mock('@sentry/cloudflare', () => ({
  withSentry: (_cfg: unknown, handler: unknown) => handler,
  captureException: vi.fn(),
  flush: vi.fn(() => Promise.resolve()),
}));

// Mock MX to isolate integration tests from DNS
vi.mock('./mx', () => ({
  checkMxRecords: vi.fn(),
}));

import { app } from './index';
import { checkMxRecords } from './mx';

const mockCheckMx = vi.mocked(checkMxRecords);

/** SHA-256 hash (matches auth middleware implementation). */
async function sha256(input: string): Promise<string> {
  const encoded = new TextEncoder().encode(input);
  const buffer = await crypto.subtle.digest('SHA-256', encoded);
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

const TEST_KEY = 'ib_live_integration_test_key_1234';
let TEST_KEY_HASH: string;

const FREE_KEY_DATA: ApiKeyData = {
  userId: 'user_int',
  keyId: 'key_int',
  tier: 'free',
  rateLimit: 10,
  monthlyLimit: 1000,
  isActive: true,
  billingPeriodStart: null,
};

const STARTER_KEY_DATA: ApiKeyData = {
  ...FREE_KEY_DATA,
  tier: 'starter',
  rateLimit: 50,
  monthlyLimit: 10000,
  billingPeriodStart: '2026-02-01',
};

describe('API integration', () => {
  let kv: ReturnType<typeof createMockKV>;
  let env: ReturnType<typeof createTestEnv>;
  let execCtx: ReturnType<typeof createMockExecutionCtx>;

  beforeAll(async () => {
    TEST_KEY_HASH = await sha256(TEST_KEY);
  });

  beforeEach(() => {
    kv = createMockKV();
    env = createTestEnv({ kv });
    execCtx = createMockExecutionCtx();
    mockCheckMx.mockReset();

    // Seed a valid free-tier key
    kv._store.set(TEST_KEY_HASH, JSON.stringify(FREE_KEY_DATA));

    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-26T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const authHeaders = { 'X-API-Key': TEST_KEY };

  function req(url: string, headers?: Record<string, string>) {
    return app.request(url, { headers: { ...authHeaders, ...headers } }, env, execCtx.ctx);
  }

  describe('public routes', () => {
    it('GET / returns API info', async () => {
      const res = await app.request('/', {}, env);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.name).toBe('isBurner API');
      expect(body.version).toBeTruthy();
    });

    it('GET /health returns status with domain counts', async () => {
      const res = await app.request('/health', {}, env);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.status).toBe('ok');
      expect(body.domains_loaded).toBeGreaterThan(70000);
      expect(body.mx_hosts_loaded).toBeGreaterThan(0);
      expect(body.mx_patterns_loaded).toBeGreaterThan(0);
    });

    it('returns 404 JSON for unknown routes', async () => {
      const res = await app.request('/nonexistent', {}, env);
      expect(res.status).toBe(404);
      const body = await res.json();
      expect(body.error).toBe('Not found');
    });
  });

  describe('GET /api/check — email validation', () => {
    it('returns 400 when email param is missing', async () => {
      const res = await req('/api/check');
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toContain('email');
    });

    it('returns 400 when email exceeds 254 characters', async () => {
      const longEmail = 'a'.repeat(246) + '@test.com';
      const res = await req(`/api/check?email=${longEmail}`);
      expect(res.status).toBe(400);
    });

    it('returns 400 when email has no @ sign', async () => {
      const res = await req('/api/check?email=noatsign.com');
      expect(res.status).toBe(400);
    });

    it('returns 400 when email starts with @', async () => {
      const res = await req('/api/check?email=@domain.com');
      expect(res.status).toBe(400);
    });

    it('returns 400 when domain has no dot', async () => {
      const res = await req('/api/check?email=user@localhost');
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/check — blocklist matching', () => {
    it('detects known disposable domain with score 1.0', async () => {
      const res = await req('/api/check?email=test@mailinator.com');
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.disposable).toBe(true);
      expect(body.score).toBe(1);
      expect(body.reasons).toContain('Known disposable domain');
      expect(body.domain).toBe('mailinator.com');
    });

    it('returns disposable: false for a legitimate domain', async () => {
      const res = await req('/api/check?email=user@gmail.com');
      const body = await res.json();
      expect(body.disposable).toBe(false);
      expect(body.score).toBe(0);
      expect(body.reasons).toEqual([]);
    });

    it('lowercases domain before checking', async () => {
      const res = await req('/api/check?email=user@MAILINATOR.COM');
      const body = await res.json();
      expect(body.disposable).toBe(true);
      expect(body.domain).toBe('mailinator.com');
    });
  });

  describe('GET /api/check — MX heuristics', () => {
    it('skips MX check for free tier', async () => {
      await req('/api/check?email=user@unknown-domain.com');
      expect(mockCheckMx).not.toHaveBeenCalled();
    });

    it('runs MX check for starter tier when domain is not on blocklist', async () => {
      kv._store.set(TEST_KEY_HASH, JSON.stringify(STARTER_KEY_DATA));
      mockCheckMx.mockResolvedValue({ provider: 'Mailinator', mxHost: 'mail.mailinator.com' });

      const res = await req('/api/check?email=user@custom-domain.com');
      const body = await res.json();

      expect(mockCheckMx).toHaveBeenCalledWith('custom-domain.com');
      expect(body.disposable).toBe(true);
      expect(body.score).toBe(0.9);
      expect(body.reasons[0]).toContain('Mailinator');
    });

    it('skips MX check when domain IS on blocklist', async () => {
      kv._store.set(TEST_KEY_HASH, JSON.stringify(STARTER_KEY_DATA));

      const res = await req('/api/check?email=user@mailinator.com');
      const body = await res.json();

      expect(mockCheckMx).not.toHaveBeenCalled();
      expect(body.score).toBe(1);
    });

    it('returns disposable: false when MX check returns null', async () => {
      kv._store.set(TEST_KEY_HASH, JSON.stringify(STARTER_KEY_DATA));
      mockCheckMx.mockResolvedValue(null);

      const res = await req('/api/check?email=user@legit-domain.com');
      const body = await res.json();
      expect(body.disposable).toBe(false);
      expect(body.score).toBe(0);
    });
  });
});
