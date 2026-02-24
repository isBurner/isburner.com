import { db } from '@/lib/db';
import { apiKeys } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { ensureUser } from '@/lib/ensure-user';
import KeyRow from '@/components/dashboard/KeyRow';
import CreateKeyForm from './CreateKeyForm';

export default async function KeysPage() {
  const user = await ensureUser();
  const userId = user.id;

  const keys = await db.query.apiKeys.findMany({
    where: eq(apiKeys.userId, userId),
    orderBy: (apiKeys, { desc }) => [desc(apiKeys.createdAt)],
  });

  const activeCount = keys.filter((k) => k.isActive).length;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-mono text-2xl font-bold tracking-tight">API Keys</h1>
          <p className="mt-1 text-sm text-text-muted">
            {activeCount} active key{activeCount !== 1 ? 's' : ''}
          </p>
        </div>
        <CreateKeyForm />
      </div>

      <div className="space-y-3">
        {keys.length === 0 ? (
          <div className="rounded-xl border border-border bg-bg-surface/40 p-10 text-center">
            <p className="text-sm text-text-faint">No API keys yet. Create one to get started.</p>
          </div>
        ) : (
          keys.map((key) => (
            <KeyRow
              key={key.id}
              id={key.id}
              keyPrefix={key.keyPrefix}
              name={key.name}
              isActive={key.isActive}
              createdAt={key.createdAt.toISOString()}
            />
          ))
        )}
      </div>
    </div>
  );
}
