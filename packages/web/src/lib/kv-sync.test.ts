import { describe, it, expect, beforeEach, vi } from 'vitest';
import { syncKeyToKV, removeKeyFromKV, syncUserKeysToKV } from './kv-sync';

// Stub env vars
const TEST_ENV = {
  CLOUDFLARE_ACCOUNT_ID: 'acct_123',
  CLOUDFLARE_KV_NAMESPACE_ID: 'ns_456',
  CLOUDFLARE_API_TOKEN: 'token_789',
};

const EXPECTED_URL_PREFIX =
  'https://api.cloudflare.com/client/v4/accounts/acct_123/storage/kv/namespaces/ns_456/values/';

describe('kv-sync', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    for (const [key, value] of Object.entries(TEST_ENV)) {
      vi.stubEnv(key, value);
    }
  });

  const baseData = {
    userId: 'user_1',
    keyId: 'key_1',
    tier: 'free' as const,
    rateLimit: 10,
    monthlyLimit: 1000,
    isActive: true,
    billingPeriodStart: null,
  };

  describe('syncKeyToKV', () => {
    it('sends PUT request to correct Cloudflare KV URL', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('', { status: 200 }));

      await syncKeyToKV('hash_abc', baseData);

      expect(fetchSpy).toHaveBeenCalledWith(
        EXPECTED_URL_PREFIX + 'hash_abc',
        expect.objectContaining({ method: 'PUT' })
      );
    });

    it('includes Authorization header with Bearer token', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('', { status: 200 }));

      await syncKeyToKV('hash_abc', baseData);

      const call = fetchSpy.mock.calls[0];
      const headers = call[1]?.headers as Record<string, string>;
      expect(headers.Authorization).toBe('Bearer token_789');
    });

    it('sends JSON body with tier config limits applied', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('', { status: 200 }));

      await syncKeyToKV('hash_abc', { ...baseData, tier: 'starter' as const });

      const call = fetchSpy.mock.calls[0];
      const body = JSON.parse(call[1]?.body as string);
      // Tier config for starter: rateLimit 50, monthlyLimit 10000
      expect(body.rateLimit).toBe(50);
      expect(body.monthlyLimit).toBe(10000);
      expect(body.tier).toBe('starter');
    });

    it('throws on non-ok response', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('Forbidden', { status: 403 }));

      await expect(syncKeyToKV('hash_abc', baseData)).rejects.toThrow('Failed to sync key to KV: 403');
    });

    it('retries on 500 errors up to MAX_RETRIES', async () => {
      const fetchSpy = vi
        .spyOn(globalThis, 'fetch')
        .mockResolvedValueOnce(new Response('', { status: 500 }))
        .mockResolvedValueOnce(new Response('', { status: 500 }))
        .mockResolvedValueOnce(new Response('', { status: 500 }));

      await expect(syncKeyToKV('hash_abc', baseData)).rejects.toThrow();
      // 1 initial + 2 retries = 3 total
      expect(fetchSpy).toHaveBeenCalledTimes(3);
    });

    it('does not retry on 4xx errors', async () => {
      const fetchSpy = vi
        .spyOn(globalThis, 'fetch')
        .mockResolvedValue(new Response('Bad Request', { status: 400 }));

      await expect(syncKeyToKV('hash_abc', baseData)).rejects.toThrow();
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('removeKeyFromKV', () => {
    it('sends DELETE request to correct URL', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('', { status: 200 }));

      await removeKeyFromKV('hash_xyz');

      expect(fetchSpy).toHaveBeenCalledWith(
        EXPECTED_URL_PREFIX + 'hash_xyz',
        expect.objectContaining({ method: 'DELETE' })
      );
    });

    it('throws on non-ok response', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('Not Found', { status: 404 }));
      await expect(removeKeyFromKV('hash_xyz')).rejects.toThrow();
    });
  });

  describe('syncUserKeysToKV', () => {
    it('calls syncKeyToKV for each key in the array', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('', { status: 200 }));

      const keys = [
        { keyHash: 'hash_a', id: 'id_a' },
        { keyHash: 'hash_b', id: 'id_b' },
      ];

      await syncUserKeysToKV(keys, 'user_1', 'starter', '2026-02-01');

      expect(fetchSpy).toHaveBeenCalledTimes(2);
      expect(fetchSpy).toHaveBeenCalledWith(
        EXPECTED_URL_PREFIX + 'hash_a',
        expect.anything()
      );
      expect(fetchSpy).toHaveBeenCalledWith(
        EXPECTED_URL_PREFIX + 'hash_b',
        expect.anything()
      );
    });

    it('handles empty keys array without error', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('', { status: 200 }));

      await syncUserKeysToKV([], 'user_1', 'free');
      expect(fetchSpy).not.toHaveBeenCalled();
    });
  });
});
