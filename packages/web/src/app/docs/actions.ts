'use server';

import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { apiKeys } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function getApiKeyPrefixes(): Promise<{ keyPrefix: string; name: string }[]> {
  const { userId } = await auth();
  if (!userId) return [];

  const keys = await db.query.apiKeys.findMany({
    where: and(eq(apiKeys.userId, userId), eq(apiKeys.isActive, true)),
    columns: { keyPrefix: true, name: true },
    orderBy: (keys, { desc }) => [desc(keys.createdAt)],
  });

  return keys;
}
