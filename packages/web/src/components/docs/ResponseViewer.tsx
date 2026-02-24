'use client';

import { type ReactNode, useState, useCallback } from 'react';

interface ResponseViewerProps {
  status: number;
  body: Record<string, unknown>;
  timeMs: number;
}

function statusColor(status: number): string {
  if (status >= 200 && status < 300) return 'text-accent';
  if (status >= 400 && status < 500) return 'text-warning';
  return 'text-error';
}

function statusLabel(status: number): string {
  const labels: Record<number, string> = {
    200: '200 OK',
    400: '400 Bad Request',
    401: '401 Unauthorized',
    429: '429 Too Many Requests',
    500: '500 Internal Server Error',
  };
  return labels[status] ?? `${status}`;
}

function colorizeValue(value: unknown): ReactNode {
  if (typeof value === 'boolean') {
    return <span className={value ? 'text-error' : 'text-safe'}>{String(value)}</span>;
  }
  if (typeof value === 'number') {
    return <span className="text-warning">{value}</span>;
  }
  if (typeof value === 'string') {
    return (
      <>
        <span className="text-text-faint">&quot;</span>
        <span className="text-text-muted">{value}</span>
        <span className="text-text-faint">&quot;</span>
      </>
    );
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="text-text-faint">[]</span>;
    return (
      <>
        <span className="text-text-faint">[</span>
        {value.map((item, i) => (
          <span key={i}>
            {i > 0 && <span className="text-text-faint">, </span>}
            {colorizeValue(item)}
          </span>
        ))}
        <span className="text-text-faint">]</span>
      </>
    );
  }
  return <span className="text-text-faint">{JSON.stringify(value)}</span>;
}

export default function ResponseViewer({ status, body, timeMs }: ResponseViewerProps) {
  const [copied, setCopied] = useState(false);
  const json = JSON.stringify(body, null, 2);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [json]);

  const entries = Object.entries(body);

  return (
    <div className="terminal overflow-hidden">
      <div className="terminal-bar flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className={`font-mono text-xs font-semibold ${statusColor(status)}`}>
            {statusLabel(status)}
          </span>
          <span className="font-mono text-xs text-text-faint">{timeMs}ms</span>
        </div>
        <button
          onClick={handleCopy}
          className="copy-btn rounded px-2 py-1 font-mono text-xs text-text-faint transition-colors hover:text-accent"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <div className="terminal-body">
        <div className="text-sm leading-7">
          <div className="text-text-faint">{'{'}</div>
          {entries.map(([key, value], i) => (
            <div key={key} className="pl-4">
              <span className="text-text-faint">&quot;</span>
              <span className="text-text">{key}</span>
              <span className="text-text-faint">&quot;: </span>
              {colorizeValue(value)}
              {i < entries.length - 1 && <span className="text-text-faint">,</span>}
            </div>
          ))}
          <div className="text-text-faint">{'}'}</div>
        </div>
      </div>
    </div>
  );
}
