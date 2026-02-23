'use client';

import { useState } from 'react';

const UPGRADE_OPTIONS = [
  { tier: 'starter', label: 'Starter — $5/mo', description: '10,000 lookups/mo' },
  { tier: 'pro', label: 'Pro — $19/mo', description: '100,000 lookups/mo' },
] as const;

export default function UpgradeButton({ currentTier = 'free' }: { currentTier?: string }) {
  const [loading, setLoading] = useState<string | null>(null);

  const options = UPGRADE_OPTIONS.filter((o) => {
    if (currentTier === 'starter') return o.tier === 'pro';
    return true;
  });

  async function handleUpgrade(tier: string) {
    setLoading(tier);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch {
      console.error('Failed to create checkout session');
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex flex-wrap gap-3">
      {options.map((option) => (
        <button
          key={option.tier}
          onClick={() => handleUpgrade(option.tier)}
          disabled={loading !== null}
          className={`rounded-lg px-6 py-3 font-mono text-sm font-semibold transition-colors disabled:opacity-50 ${
            option.tier === 'pro'
              ? 'bg-accent text-bg hover:bg-accent-dim'
              : 'border border-border text-text-muted hover:border-accent/40 hover:text-text'
          }`}
        >
          {loading === option.tier ? 'Redirecting...' : option.label}
        </button>
      ))}
    </div>
  );
}
