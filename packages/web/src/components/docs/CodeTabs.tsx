'use client';

import { useState, useCallback } from 'react';

const STORAGE_KEY = 'isburner_docs_lang';

interface Snippet {
  language: string;
  code: string;
}

function getInitialIdx(snippets: Snippet[]): number {
  if (typeof window === 'undefined') return 0;
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return 0;
  const idx = snippets.findIndex((s) => s.language === saved);
  return idx >= 0 ? idx : 0;
}

export default function CodeTabs({ snippets }: { snippets: Snippet[] }) {
  const [activeIdx, setActiveIdx] = useState(() => getInitialIdx(snippets));
  const [copied, setCopied] = useState(false);

  const handleTabClick = useCallback(
    (idx: number) => {
      setActiveIdx(idx);
      localStorage.setItem(STORAGE_KEY, snippets[idx].language);
    },
    [snippets]
  );

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(snippets[activeIdx].code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [snippets, activeIdx]);

  return (
    <div className="terminal overflow-hidden">
      <div className="terminal-bar flex items-center justify-between">
        <div className="-mb-[15px] flex">
          {snippets.map((s, i) => (
            <button
              key={s.language}
              onClick={() => handleTabClick(i)}
              className={`code-tab ${i === activeIdx ? 'code-tab-active' : ''}`}
            >
              {s.language}
            </button>
          ))}
        </div>
        <button
          onClick={handleCopy}
          className="copy-btn rounded px-2 py-1 font-mono text-xs text-text-faint transition-colors hover:text-accent"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <div className="terminal-body">
        <pre className="overflow-x-auto text-sm leading-relaxed text-text-muted">
          <code>{snippets[activeIdx].code}</code>
        </pre>
      </div>
    </div>
  );
}
