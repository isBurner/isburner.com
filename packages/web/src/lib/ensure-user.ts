import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { users, apiKeys } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { generateApiKey, hashApiKey, getKeyPrefix } from '@/lib/keys';
import { syncKeyToKV } from '@/lib/kv-sync';
import { TIER_CONFIG } from '@/lib/tier-config';

/**
 * Ensures the authenticated Clerk user has a corresponding database row.
 * Creates one (with a default API key) if missing — handles the case where
 * the Clerk webhook hasn't fired yet (common in local dev).
 */
export async function ensureUser() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const existing = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (existing) return existing;

  // Webhook hasn't fired yet — create the user inline
  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses[0]?.emailAddress ?? '';

  const [newUser] = await db
    .insert(users)
    .values({ id: userId, email })
    .onConflictDoNothing()
    .returning();

  // If insert was a no-op (webhook beat us), return the existing row
  if (!newUser) {
    return (await db.query.users.findFirst({ where: eq(users.id, userId) }))!;
  }

  // Generate default API key
  const rawKey = generateApiKey();
  const keyHash = hashApiKey(rawKey);
  const [inserted] = await db
    .insert(apiKeys)
    .values({
      userId,
      keyHash,
      keyPrefix: getKeyPrefix(rawKey),
      name: 'Default',
    })
    .returning({ id: apiKeys.id });

  // Best-effort KV sync (won't have CF credentials in local dev)
  try {
    await syncKeyToKV(keyHash, {
      userId,
      keyId: inserted.id,
      tier: 'free',
      rateLimit: TIER_CONFIG.free.rateLimit,
      monthlyLimit: TIER_CONFIG.free.monthlyLimit,
      isActive: true,
    });
  } catch {
    // Expected to fail in local dev without Cloudflare credentials
  }

  return newUser;
}
