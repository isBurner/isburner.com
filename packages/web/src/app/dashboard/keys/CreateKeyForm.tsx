'use client';

import { useState, useTransition } from 'react';
import { createApiKey } from './actions';
import ApiKeyDisplay from '@/components/dashboard/ApiKeyDisplay';

export default function CreateKeyForm() {
  const [isPending, startTransition] = useTransition();
  const [newKey, setNewKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');

  function handleCreate() {
    startTransition(async () => {
      const result = await createApiKey(name || 'Unnamed');
      if ('error' in result) {
        setError(result.error);
      } else {
        setNewKey(result.key);
        setError(null);
        setShowForm(false);
        setName('');
      }
    });
  }

  return (
    <div>
      {newKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/80 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-lg rounded-2xl border border-border bg-bg-surface p-8">
            <h2 className="mb-2 font-mono text-lg font-bold">API Key Created</h2>
            <p className="mb-6 text-sm text-text-muted">
              Copy your key now. You won&apos;t be able to see the full key again.
            </p>
            <ApiKeyDisplay keyPrefix={newKey.slice(0, 12)} fullKey={newKey} />
            <button
              onClick={() => setNewKey(null)}
              className="mt-6 w-full rounded-lg bg-accent py-2.5 font-mono text-sm font-semibold text-bg transition-colors hover:bg-accent-dim"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {error && <p className="mb-2 text-xs text-error">{error}</p>}

      {showForm ? (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Key name"
            maxLength={100}
            className="rounded-lg border border-border bg-bg px-3 py-2 font-mono text-sm text-text placeholder:text-text-faint focus:border-accent focus:outline-none"
          />
          <button
            onClick={handleCreate}
            disabled={isPending}
            className="rounded-lg bg-accent px-4 py-2 font-mono text-sm font-semibold text-bg transition-colors hover:bg-accent-dim disabled:opacity-50"
          >
            {isPending ? 'Creating...' : 'Create'}
          </button>
          <button
            onClick={() => {
              setShowForm(false);
              setName('');
              setError(null);
            }}
            className="rounded-lg border border-border px-3 py-2 font-mono text-sm text-text-muted transition-colors hover:text-text"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="rounded-lg bg-accent px-4 py-2 font-mono text-sm font-semibold text-bg transition-colors hover:bg-accent-dim"
        >
          + New Key
        </button>
      )}
    </div>
  );
}
