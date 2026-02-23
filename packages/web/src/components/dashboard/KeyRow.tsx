'use client';

import { useTransition } from 'react';
import { revokeApiKey } from '@/app/dashboard/keys/actions';

interface KeyRowProps {
  id: string;
  keyPrefix: string;
  name: string;
  isActive: boolean;
  createdAt: string;
}

export default function KeyRow({ id, keyPrefix, name, isActive, createdAt }: KeyRowProps) {
  const [isPending, startTransition] = useTransition();

  function handleRevoke() {
    startTransition(async () => {
      await revokeApiKey(id);
    });
  }

  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-bg-surface/40 px-5 py-4">
      <div className="flex items-center gap-4">
        <div className={`h-2 w-2 rounded-full ${isActive ? 'bg-accent' : 'bg-text-faint'}`} />
        <div>
          <div className="flex items-center gap-2">
            <code className="font-mono text-sm text-text">
              {keyPrefix}
              {'•'.repeat(20)}
            </code>
            {!isActive && (
              <span className="rounded bg-error/10 px-2 py-0.5 font-mono text-xs text-error">
                Revoked
              </span>
            )}
          </div>
          <div className="mt-1 flex items-center gap-3 text-xs text-text-faint">
            <span>{name}</span>
            <span>Created {new Date(createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
      {isActive && (
        <button
          onClick={handleRevoke}
          disabled={isPending}
          className="rounded-lg border border-border px-3 py-1.5 font-mono text-xs text-text-muted transition-colors hover:border-error/50 hover:text-error disabled:opacity-50"
        >
          {isPending ? 'Revoking...' : 'Revoke'}
        </button>
      )}
    </div>
  );
}
