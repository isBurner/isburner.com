'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ backgroundColor: '#06060a', color: '#e0e0e0', fontFamily: 'monospace' }}>
        <div style={{ maxWidth: 480, margin: '80px auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>Something went wrong</h2>
          <p style={{ marginTop: 8, fontSize: 14, color: '#888' }}>
            An unexpected error occurred. This has been reported automatically.
          </p>
          <button
            onClick={reset}
            style={{
              marginTop: 24,
              padding: '8px 20px',
              backgroundColor: '#00ff88',
              color: '#06060a',
              border: 'none',
              borderRadius: 8,
              fontFamily: 'monospace',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
