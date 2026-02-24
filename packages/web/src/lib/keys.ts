import { randomBytes, createHash } from 'node:crypto';

const KEY_PREFIX = 'ib_live_';

/** Generate a new API key: `ib_live_` + 32 hex chars. */
export function generateApiKey(): string {
  return KEY_PREFIX + randomBytes(16).toString('hex');
}

/** SHA-256 hash of a full API key, used for storage and KV lookups. */
export function hashApiKey(key: string): string {
  return createHash('sha256').update(key).digest('hex');
}

/** First 12 characters of a key for display (e.g. `ib_live_a1b2`). */
export function getKeyPrefix(key: string): string {
  return key.slice(0, 12);
}
