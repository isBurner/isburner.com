import { describe, it, expect, beforeEach } from 'vitest';
import { Hono } from 'hono';
import type { AppEnv, ApiKeyData } from '../types';
import { authMiddleware } from './auth';
import { createMockKV } from '../__tests__/helpers/mock-kv';
import { createTestEnv } from '../__tests__/helpers/test-app';

/** SHA-256 hash a string the same way the middleware does. */
async function sha256(input: string): Promise<string> {
  const encoded = new TextEncoder().encode(input);
  const buffer = await crypto.subtle.digest('SHA-256', encoded);
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

const VALID_KEY_DATA: ApiKeyData = {
  userId: 'user_123',
  keyId: 'key_abc',
  tier: 'free',
  rateLimit: 10,
  monthlyLimit: 1000,
  isActive: true,
  billingPeriodStart: null,
};

describe('authMiddleware', () => {
  let kv: ReturnType<typeof createMockKV>;
  let app: Hono<AppEnv>;
  let env: ReturnType<typeof createTestEnv>;

  beforeEach(() => {
    kv = createMockKV();
    env = createTestEnv({ kv });
    app = new Hono<AppEnv>();
    app.use('*', authMiddleware);
    app.get('/test', (c) =>
      c.json({ apiKey: c.get('apiKey'), keyHash: c.get('keyHash') })
    );
  });

  it('returns 401 when X-API-Key header is missing', async () => {
    const res = await app.request('/test', {}, env);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toContain('Missing API key');
  });

  it('returns 401 when key hash not found in KV', async () => {
    const res = await app.request('/test', { headers: { 'X-API-Key': 'bad_key' } }, env);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe('Invalid API key.');
  });

  it('returns 401 when KV value is malformed JSON', async () => {
    const hash = await sha256('broken_key');
    kv._store.set(hash, 'not-json');

    const res = await app.request('/test', { headers: { 'X-API-Key': 'broken_key' } }, env);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe('Invalid API key.');
  });

  it('returns 401 when key isActive is false', async () => {
    const hash = await sha256('revoked_key');
    kv._store.set(hash, JSON.stringify({ ...VALID_KEY_DATA, isActive: false }));

    const res = await app.request('/test', { headers: { 'X-API-Key': 'revoked_key' } }, env);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe('API key has been revoked.');
  });

  it('sets apiKey and keyHash in context on success', async () => {
    const testKey = 'ib_live_test1234567890abcdef12345678';
    const hash = await sha256(testKey);
    kv._store.set(hash, JSON.stringify(VALID_KEY_DATA));

    const res = await app.request('/test', { headers: { 'X-API-Key': testKey } }, env);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.apiKey).toEqual(VALID_KEY_DATA);
    expect(body.keyHash).toBe(hash);
  });

  it('SHA-256 hashing is deterministic', async () => {
    const hash1 = await sha256('deterministic_test');
    const hash2 = await sha256('deterministic_test');
    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64);
  });
});
