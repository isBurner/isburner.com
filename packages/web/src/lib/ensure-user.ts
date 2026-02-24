import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

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

  return newUser;
}
