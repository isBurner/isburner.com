import type { Tier } from './tier-config';
import { TIER_CONFIG } from './tier-config';

const CF_API_BASE = 'https://api.cloudflare.com/client/v4';

function kvUrl(key: string): string {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID!;
  const namespaceId = process.env.CLOUDFLARE_KV_NAMESPACE_ID!;
  return `${CF_API_BASE}/accounts/${accountId}/storage/kv/namespaces/${namespaceId}/values/${key}`;
}

function cfHeaders(): HeadersInit {
  return {
    Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
    'Content-Type': 'application/json',
  };
}

export interface KVKeyData {
  userId: string;
  keyId: string;
  tier: Tier;
  rateLimit: number;
  monthlyLimit: number;
  isActive: boolean;
}

/** Write API key metadata to Cloudflare KV for fast reads at the edge. */
export async function syncKeyToKV(keyHash: string, data: KVKeyData): Promise<void> {
  const config = TIER_CONFIG[data.tier];
  const value: KVKeyData = {
    ...data,
    rateLimit: config.rateLimit,
    monthlyLimit: config.monthlyLimit,
  };

  const res = await fetch(kvUrl(keyHash), {
    method: 'PUT',
    headers: cfHeaders(),
    body: JSON.stringify(value),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error('KV sync failed:', res.status, body);
    throw new Error(`Failed to sync key to KV: ${res.status}`);
  }
}

/** Remove an API key from KV (on revoke or user deletion). */
export async function removeKeyFromKV(keyHash: string): Promise<void> {
  const res = await fetch(kvUrl(keyHash), {
    method: 'DELETE',
    headers: cfHeaders(),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error('KV delete failed:', res.status, body);
    throw new Error(`Failed to remove key from KV: ${res.status}`);
  }
}

/** Update all active keys for a user when their tier changes. */
export async function syncUserKeysToKV(
  keys: Array<{ keyHash: string; id: string }>,
  userId: string,
  tier: Tier
): Promise<void> {
  await Promise.all(
    keys.map((key) =>
      syncKeyToKV(key.keyHash, {
        userId,
        keyId: key.id,
        tier,
        rateLimit: TIER_CONFIG[tier].rateLimit,
        monthlyLimit: TIER_CONFIG[tier].monthlyLimit,
        isActive: true,
      })
    )
  );
}
