import type { Context, Next } from 'hono';
import type { AppEnv, ApiKeyData } from '../types';

/** SHA-256 hash using Web Crypto API (available in Workers). */
async function sha256(input: string): Promise<string> {
  const encoded = new TextEncoder().encode(input);
  const buffer = await crypto.subtle.digest('SHA-256', encoded);
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Auth middleware: extracts X-API-Key header, hashes it, looks up in KV.
 * Sets `apiKey` in context on success. Returns 401 on failure.
 */
export async function authMiddleware(c: Context<AppEnv>, next: Next) {
  const apiKey = c.req.header('X-API-Key');

  if (!apiKey) {
    return c.json({ error: 'Missing API key. Pass it via the X-API-Key header.' }, 401);
  }

  const keyHash = await sha256(apiKey);
  const raw = await c.env.API_KEYS.get(keyHash);

  if (!raw) {
    return c.json({ error: 'Invalid API key.' }, 401);
  }

  const data: ApiKeyData = JSON.parse(raw);

  if (!data.isActive) {
    return c.json({ error: 'API key has been revoked.' }, 401);
  }

  c.set('apiKey', data);
  c.set('keyHash', keyHash);
  await next();
}
