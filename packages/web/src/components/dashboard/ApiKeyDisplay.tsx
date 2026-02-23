'use client';

import { useState, useCallback } from 'react';

interface ApiKeyDisplayProps {
  keyPrefix: string;
  /** Full key — only provided once on creation. */
  fullKey?: string;
}

export default function ApiKeyDisplay({ keyPrefix, fullKey }: ApiKeyDisplayProps) {
  const [copied, setCopied] = useState(false);
  const [revealed, setRevealed] = useState(!!fullKey);

  const displayValue = revealed && fullKey ? fullKey : `${keyPrefix}${'•'.repeat(24)}`;

  const handleCopy = useCallback(async () => {
    const text = fullKey ?? keyPrefix;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [fullKey, keyPrefix]);

  return (
    <div className="flex items-center gap-3">
      <code className="flex-1 rounded-lg border border-border bg-bg px-4 py-2.5 font-mono text-sm text-text-muted">
        {displayValue}
      </code>
      {fullKey && !revealed && (
        <button
          onClick={() => setRevealed(true)}
          className="rounded-lg border border-border px-3 py-2 font-mono text-xs text-text-muted transition-colors hover:border-border-bright hover:text-text"
        >
          Reveal
        </button>
      )}
      <button
        onClick={handleCopy}
        className="rounded-lg border border-border px-3 py-2 font-mono text-xs text-text-muted transition-colors hover:border-border-bright hover:text-text"
      >
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  );
}
