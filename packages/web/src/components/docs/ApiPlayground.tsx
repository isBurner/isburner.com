'use client';

import { useState, useEffect, useCallback } from 'react';
import { SignedIn, SignedOut } from '@clerk/nextjs';
import Link from 'next/link';
import { getApiKeyPrefixes } from '@/app/docs/actions';
import { getSnippets } from '@/lib/code-snippets';
import CodeTabs from './CodeTabs';
import ResponseViewer from './ResponseViewer';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.isburner.com';
const STORAGE_KEY = 'isburner_playground_key';

interface ApiResponse {
  status: number;
  body: Record<string, unknown>;
  timeMs: number;
}

export default function ApiPlayground() {
  const [email, setEmail] = useState('user@tempmail.com');
  const [apiKey, setApiKey] = useState('');
  const [keyCount, setKeyCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Restore API key from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setApiKey(saved);
  }, []);

  // Persist API key to localStorage
  useEffect(() => {
    if (apiKey) {
      localStorage.setItem(STORAGE_KEY, apiKey);
    }
  }, [apiKey]);

  // Fetch key count for logged-in users
  useEffect(() => {
    getApiKeyPrefixes()
      .then((keys) => setKeyCount(keys.length))
      .catch(() => {});
  }, []);

  const handleSend = useCallback(async () => {
    if (!apiKey) {
      setError('Enter your API key to make a request.');
      return;
    }
    if (!email) {
      setError('Enter an email address to check.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResponse(null);

    const start = performance.now();
    try {
      const res = await fetch(`${API_BASE}/api/check?email=${encodeURIComponent(email)}`, {
        headers: { 'X-API-Key': apiKey },
      });
      const body = await res.json();
      const timeMs = Math.round(performance.now() - start);
      setResponse({ status: res.status, body, timeMs });
    } catch {
      setError('Request failed. Check your network connection.');
    } finally {
      setIsLoading(false);
    }
  }, [email, apiKey]);

  const displayKey = apiKey || 'your_api_key';
  const snippets = getSnippets(email || 'user@example.com', displayKey);

  return (
    <section id="playground" className="border-t border-border">
      <div className="mx-auto max-w-6xl px-8 py-20">
        <span className="mb-3 block font-mono text-xs tracking-widest text-accent uppercase">
          Try it
        </span>
        <h2 className="mb-6 text-2xl font-bold tracking-tight">API Playground</h2>
        <p className="mb-8 max-w-2xl leading-relaxed text-text-muted">
          Make a real API request from your browser. Enter your API key and an email address, then
          hit Send.
        </p>

        {/* API Key input */}
        <div className="mb-6">
          <label htmlFor="playground-key" className="mb-2 block font-mono text-xs text-text-faint">
            API Key
          </label>
          <SignedIn>
            <input
              id="playground-key"
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="ib_live_..."
              className="w-full max-w-md rounded-lg border border-border bg-bg-surface px-4 py-2.5 font-mono text-sm text-text placeholder:text-text-faint focus:border-accent focus:outline-none"
            />
            {keyCount > 0 && (
              <p className="mt-2 text-xs text-text-faint">
                You have {keyCount} active key{keyCount !== 1 ? 's' : ''}.{' '}
                <Link href="/dashboard/keys" className="text-accent hover:underline">
                  Copy from dashboard
                </Link>
              </p>
            )}
          </SignedIn>
          <SignedOut>
            <div className="flex max-w-md items-center gap-3 rounded-lg border border-border bg-bg-surface/60 px-4 py-3">
              <span className="font-mono text-sm text-text-faint">your_api_key</span>
              <Link
                href="/sign-up"
                className="ml-auto rounded-md border border-accent/30 bg-accent/5 px-3 py-1.5 font-mono text-xs text-accent transition-all hover:border-accent/60 hover:bg-accent/10"
              >
                Sign up for free
              </Link>
            </div>
          </SignedOut>
        </div>

        {/* Email input + send */}
        <div className="mb-6">
          <label
            htmlFor="playground-email"
            className="mb-2 block font-mono text-xs text-text-faint"
          >
            Email to check
          </label>
          <div className="flex max-w-md items-center gap-3">
            <input
              id="playground-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="user@tempmail.com"
              className="flex-1 rounded-lg border border-border bg-bg-surface px-4 py-2.5 font-mono text-sm text-text placeholder:text-text-faint focus:border-accent focus:outline-none"
            />
            <button
              onClick={handleSend}
              disabled={isLoading}
              className="rounded-lg bg-accent px-5 py-2.5 font-mono text-sm font-semibold text-bg transition-colors hover:bg-accent-dim disabled:opacity-50"
            >
              {isLoading ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && <p className="mb-4 font-mono text-xs text-error">{error}</p>}

        {/* Live code snippets */}
        <div className="mb-6">
          <CodeTabs snippets={snippets} />
        </div>

        {/* Response */}
        {response && (
          <ResponseViewer status={response.status} body={response.body} timeMs={response.timeMs} />
        )}
      </div>
    </section>
  );
}
