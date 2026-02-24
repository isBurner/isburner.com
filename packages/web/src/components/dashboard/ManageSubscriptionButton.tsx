'use client';

import { useState } from 'react';

export default function ManageSubscriptionButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleManage() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong');
        return;
      }
      if (data.url) window.location.href = data.url;
    } catch {
      setError('Failed to open billing portal');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={handleManage}
        disabled={loading}
        className="rounded-lg border border-border px-6 py-3 font-mono text-sm text-text-muted transition-colors hover:border-border-bright hover:text-text disabled:opacity-50"
      >
        {loading ? 'Redirecting...' : 'Manage Subscription'}
      </button>
      {error && <p className="mt-2 font-mono text-xs text-red-400">{error}</p>}
    </div>
  );
}
