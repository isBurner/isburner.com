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

// Mock DNS-dependent modules to isolate integration tests
vi.mock('./mx', () => ({
  resolveMxRecords: vi.fn(),
}));

vi.mock('./signals/dns-auth', () => ({
  analyzeDnsAuth: vi.fn(),
}));

import { app } from './index';
import { resolveMxRecords } from './mx';
import { analyzeDnsAuth } from './signals/dns-auth';

const mockResolveMx = vi.mocked(resolveMxRecords);
const mockDnsAuth = vi.mocked(analyzeDnsAuth);

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
    mockResolveMx.mockReset();
    mockDnsAuth.mockReset();

    // Default: DNS auth returns neutral
    mockDnsAuth.mockResolvedValue({ name: 'dns_auth', score: 0, reason: null });

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

    it('returns disposable: false for a legitimate domain (free tier)', async () => {
      // gmail.com: SLD 'gmail' = 5 chars (below entropy threshold), .com = low risk
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

    it('short-circuits on blocklist hit without running MX or DNS auth', async () => {
      kv._store.set(TEST_KEY_HASH, JSON.stringify(STARTER_KEY_DATA));
      const res = await req('/api/check?email=user@mailinator.com');
      const body = await res.json();

      expect(mockResolveMx).not.toHaveBeenCalled();
      expect(mockDnsAuth).not.toHaveBeenCalled();
      expect(body.score).toBe(1);
    });
  });

  describe('GET /api/check — MX heuristics', () => {
    it('skips MX and DNS auth for free tier', async () => {
      await req('/api/check?email=user@acme.com');
      expect(mockResolveMx).not.toHaveBeenCalled();
      expect(mockDnsAuth).not.toHaveBeenCalled();
    });

    it('runs MX check for starter tier and includes disposable MX score', async () => {
      kv._store.set(TEST_KEY_HASH, JSON.stringify(STARTER_KEY_DATA));
      mockResolveMx.mockResolvedValue({
        records: [{ exchange: 'mail.mailinator.com', priority: 10 }],
        disposableMatch: { provider: 'Mailinator', mxHost: 'mail.mailinator.com' },
      });

      // Use 'acme.com' — short SLD (4 chars, below entropy threshold), .com = 0 TLD risk
      const res = await req('/api/check?email=user@acme.com');
      const body = await res.json();

      expect(mockResolveMx).toHaveBeenCalledWith('acme.com');
      expect(body.disposable).toBe(false); // 0.4 < 0.5
      expect(body.score).toBe(0.4);
      expect(body.reasons).toContainEqual(expect.stringContaining('Mailinator'));
    });

    it('returns disposable: false when MX check returns null', async () => {
      kv._store.set(TEST_KEY_HASH, JSON.stringify(STARTER_KEY_DATA));
      mockResolveMx.mockResolvedValue(null);

      const res = await req('/api/check?email=user@acme.com');
      const body = await res.json();
      expect(body.disposable).toBe(false);
      expect(body.score).toBe(0);
    });
  });

  describe('GET /api/check — composite scoring', () => {
    it('free tier gets lexical + TLD signals only', async () => {
      // 'temp' keyword triggers lexical (0.10), .tk triggers TLD (0.30) = 0.40 total
      const res = await req('/api/check?email=user@tempbox.tk');
      const body = await res.json();

      expect(body.score).toBe(0.4);
      expect(body.disposable).toBe(false); // 0.40 < 0.50 threshold
      expect(body.reasons.some((r: string) => r.includes('temp'))).toBe(true);
      expect(body.reasons.some((r: string) => r.includes('.tk'))).toBe(true);
      // No DNS signals on free tier
      expect(mockResolveMx).not.toHaveBeenCalled();
      expect(mockDnsAuth).not.toHaveBeenCalled();
    });

    it('legitimate MX provider reduces score', async () => {
      kv._store.set(TEST_KEY_HASH, JSON.stringify(STARTER_KEY_DATA));
      mockResolveMx.mockResolvedValue({
        records: [{ exchange: 'aspmx.l.google.com', priority: 1 }],
        disposableMatch: null,
      });
      // SPF + strict DMARC = -0.10
      mockDnsAuth.mockResolvedValue({
        name: 'dns_auth',
        score: -0.1,
        reason: 'SPF + strict DMARC policy (reject/quarantine)',
      });

      // .xyz = medium TLD risk (0.15), but Google MX (-0.3) + strict DMARC (-0.1) pulls it down
      const res = await req('/api/check?email=user@shop.xyz');
      const body = await res.json();

      expect(body.disposable).toBe(false);
      expect(body.score).toBe(0); // 0.15 + (-0.3) + (-0.1) = -0.25, clamped to 0
    });

    it('stacked signals cross the threshold', async () => {
      kv._store.set(TEST_KEY_HASH, JSON.stringify(STARTER_KEY_DATA));
      mockResolveMx.mockResolvedValue({
        records: [{ exchange: 'mail.mailinator.com', priority: 10 }],
        disposableMatch: { provider: 'Mailinator', mxHost: 'mail.mailinator.com' },
      });
      // No SPF/DMARC = +0.20
      mockDnsAuth.mockResolvedValue({
        name: 'dns_auth',
        score: 0.2,
        reason: 'No SPF or DMARC records (no email authentication)',
      });

      // 'acme.com': lexical=0, tld=0, disposable_mx=0.4, dns_auth=0.2 = 0.60
      const res = await req('/api/check?email=user@acme.com');
      const body = await res.json();

      expect(body.disposable).toBe(true);
      expect(body.score).toBe(0.6);
      expect(body.reasons).toContainEqual(expect.stringContaining('Mailinator'));
      expect(body.reasons).toContainEqual(expect.stringContaining('No SPF'));
    });

    it('rounds score to 2 decimal places', async () => {
      // .xyz TLD gives 0.15 — already clean, but verifies rounding doesn't corrupt
      const res = await req('/api/check?email=user@shop.xyz');
      const body = await res.json();
      const decimalPlaces = body.score.toString().split('.')[1]?.length ?? 0;
      expect(decimalPlaces).toBeLessThanOrEqual(2);
    });

    it('response shape includes all expected fields', async () => {
      const res = await req('/api/check?email=user@acme.com');
      const body = await res.json();
      expect(body).toHaveProperty('email');
      expect(body).toHaveProperty('domain');
      expect(body).toHaveProperty('disposable');
      expect(body).toHaveProperty('score');
      expect(body).toHaveProperty('reasons');
      expect(Array.isArray(body.reasons)).toBe(true);
    });
  });
});
