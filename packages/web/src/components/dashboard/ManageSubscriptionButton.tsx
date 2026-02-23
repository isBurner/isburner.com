'use client';

import { useState } from 'react';

export default function ManageSubscriptionButton() {
  const [loading, setLoading] = useState(false);

  async function handleManage() {
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch {
      console.error('Failed to create portal session');
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleManage}
      disabled={loading}
      className="rounded-lg border border-border px-6 py-3 font-mono text-sm text-text-muted transition-colors hover:border-border-bright hover:text-text disabled:opacity-50"
    >
      {loading ? 'Redirecting...' : 'Manage Subscription'}
    </button>
  );
}
