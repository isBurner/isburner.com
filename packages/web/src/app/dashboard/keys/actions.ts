'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { users, apiKeys } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { generateApiKey, hashApiKey, getKeyPrefix } from '@/lib/keys';
import { syncKeyToKV, removeKeyFromKV } from '@/lib/kv-sync';
import type { Tier } from '@/lib/tier-config';

const MAX_KEYS_PER_USER = 5;

export async function createApiKey(name: string): Promise<{ key: string } | { error: string }> {
  const { userId } = await auth();
  if (!userId) return { error: 'Unauthorized' };

  // Check key limit
  const existing = await db.query.apiKeys.findMany({
    where: and(eq(apiKeys.userId, userId), eq(apiKeys.isActive, true)),
  });

  if (existing.length >= MAX_KEYS_PER_USER) {
    return { error: `Maximum ${MAX_KEYS_PER_USER} active keys allowed` };
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });
  if (!user) return { error: 'User not found' };

  const rawKey = generateApiKey();
  const keyHash = hashApiKey(rawKey);
  const keyPrefix = getKeyPrefix(rawKey);

  const [inserted] = await db
    .insert(apiKeys)
    .values({
      userId,
      keyHash,
      keyPrefix,
      name: name || 'Unnamed',
    })
    .returning({ id: apiKeys.id });

  // Sync to KV
  try {
    await syncKeyToKV(keyHash, {
      userId,
      keyId: inserted.id,
      tier: user.tier as Tier,
      rateLimit: 0, // filled by syncKeyToKV from tier config
      monthlyLimit: 0,
      isActive: true,
    });
  } catch (e) {
    console.error('Failed to sync new key to KV:', e);
  }

  revalidatePath('/dashboard/keys');
  revalidatePath('/dashboard');
  return { key: rawKey };
}

export async function revokeApiKey(keyId: string): Promise<{ error?: string }> {
  const { userId } = await auth();
  if (!userId) return { error: 'Unauthorized' };

  const key = await db.query.apiKeys.findFirst({
    where: and(eq(apiKeys.id, keyId), eq(apiKeys.userId, userId)),
  });

  if (!key) return { error: 'Key not found' };
  if (!key.isActive) return { error: 'Key already revoked' };

  await db
    .update(apiKeys)
    .set({ isActive: false, revokedAt: new Date() })
    .where(eq(apiKeys.id, keyId));

  // Remove from KV
  try {
    await removeKeyFromKV(key.keyHash);
  } catch (e) {
    console.error('Failed to remove key from KV:', e);
  }

  revalidatePath('/dashboard/keys');
  revalidatePath('/dashboard');
  return {};
}
