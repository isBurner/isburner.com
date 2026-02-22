'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

const EXAMPLES = [
  { email: 'user@mailinator.com', disposable: true },
  { email: 'hello@company.com', disposable: false },
  { email: 'dev@guerrillamail.com', disposable: true },
  { email: 'real@gmail.com', disposable: false },
  { email: 'signup@yopmail.fr', disposable: true },
];

type Phase = 'typing' | 'response' | 'pause';

const KNOWN_DISPOSABLE = [
  'mailinator.com',
  'guerrillamail.com',
  'yopmail.com',
  'yopmail.fr',
  'tempmail.com',
  'throwaway.email',
  'sharklasers.com',
  'maildrop.cc',
  'trashmail.com',
];

function buildResponse(email: string, disposable: boolean): string[] {
  const domain = email.split('@')[1];
  return [
    '{',
    `  "disposable": ${disposable},`,
    `  "score": ${disposable ? '1.0' : '0.0'},`,
    `  "domain": "${domain}",`,
    disposable ? '  "reasons": ["Known disposable domain"]' : '  "reasons": []',
    '}',
  ];
}

export default function TerminalDemo() {
  const [phase, setPhase] = useState<Phase>('typing');
  const [exampleIdx, setExampleIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [visibleLines, setVisibleLines] = useState(0);
  const [isManual, setIsManual] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [manualEmail, setManualEmail] = useState('');
  const [manualDisposable, setManualDisposable] = useState(false);
  const [showManualResult, setShowManualResult] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const example = EXAMPLES[exampleIdx];
  const typedEmail = example.email.slice(0, charIdx);
  const response = buildResponse(example.email, example.disposable);

  useEffect(() => {
    if (isManual) return;

    if (phase === 'typing') {
      if (charIdx < example.email.length) {
        timerRef.current = setTimeout(() => setCharIdx((c) => c + 1), 50 + Math.random() * 50);
      } else {
        timerRef.current = setTimeout(() => {
          setPhase('response');
          setVisibleLines(0);
        }, 500);
      }
    }

    if (phase === 'response') {
      if (visibleLines < response.length) {
        timerRef.current = setTimeout(() => setVisibleLines((v) => v + 1), 80);
      } else {
        timerRef.current = setTimeout(() => setPhase('pause'), 2000);
      }
    }

    if (phase === 'pause') {
      timerRef.current = setTimeout(() => {
        setExampleIdx((i) => (i + 1) % EXAMPLES.length);
        setCharIdx(0);
        setVisibleLines(0);
        setPhase('typing');
      }, 400);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [phase, charIdx, visibleLines, isManual, example, response.length]);

  const handleCheck = useCallback(() => {
    if (!inputValue.includes('@')) return;
    setIsManual(true);
    setManualEmail(inputValue);
    const domain = inputValue.split('@')[1]?.toLowerCase() ?? '';
    setManualDisposable(KNOWN_DISPOSABLE.includes(domain));
    setShowManualResult(false);
    setTimeout(() => setShowManualResult(true), 300);
  }, [inputValue]);

  const displayEmail = isManual ? manualEmail : typedEmail;
  const showingResponse = isManual ? showManualResult : phase === 'response' || phase === 'pause';
  const displayResponse = isManual ? buildResponse(manualEmail, manualDisposable) : response;
  const displayLines = isManual ? displayResponse.length : visibleLines;
  const displayDisposable = isManual ? manualDisposable : example.disposable;

  return (
    <div className="terminal glow-accent relative w-full scanline">
      {/* Title bar */}
      <div className="terminal-bar">
        <div className="terminal-dot" style={{ background: '#ff5f57' }} />
        <div className="terminal-dot" style={{ background: '#febc2e' }} />
        <div className="terminal-dot" style={{ background: '#28c840' }} />
        <span className="ml-3 font-mono text-xs text-text-faint">isburner-api</span>
      </div>

      <div className="terminal-body">
        {/* Curl command */}
        <div className="mb-2">
          <span className="text-accent-dim">$ </span>
          <span className="text-text-muted">curl </span>
          <span className="text-text-faint">&quot;https://api.isburner.com/check?email=</span>
          <span className="text-accent">{displayEmail}</span>
          {!isManual && phase === 'typing' && (
            <span className="cursor-blink text-accent">&#9608;</span>
          )}
          <span className="text-text-faint">&quot;</span>
        </div>

        {/* JSON response — fixed height so layout doesn't jump */}
        <div className="my-4" style={{ minHeight: 180 }}>
          {showingResponse &&
            displayResponse.slice(0, displayLines).map((line, i) => {
              if (i === 0 || i === displayResponse.length - 1) {
                return (
                  <div key={i} className="text-text-faint leading-7">
                    {line}
                  </div>
                );
              }

              const keyMatch = line.match(/"(\w+)":/);
              const key = keyMatch?.[1] ?? '';

              return (
                <div key={i} className="leading-7">
                  <span className="text-text-faint">{'  '}&quot;</span>
                  <span className="text-text">{key}</span>
                  <span className="text-text-faint">&quot;: </span>
                  {key === 'disposable' && (
                    <>
                      <span className={displayDisposable ? 'text-error' : 'text-safe'}>
                        {String(displayDisposable)}
                      </span>
                      <span className="text-text-faint">,</span>
                    </>
                  )}
                  {key === 'score' && (
                    <>
                      <span className="text-warning">{displayDisposable ? '1.0' : '0.0'}</span>
                      <span className="text-text-faint">,</span>
                    </>
                  )}
                  {key === 'domain' && (
                    <>
                      <span className="text-text-faint">&quot;</span>
                      <span className="text-text-muted">
                        {(isManual ? manualEmail : example.email).split('@')[1]}
                      </span>
                      <span className="text-text-faint">&quot;,</span>
                    </>
                  )}
                  {key === 'reasons' && (
                    <>
                      {displayDisposable ? (
                        <>
                          <span className="text-text-faint">[&quot;</span>
                          <span className="text-text-muted">Known disposable domain</span>
                          <span className="text-text-faint">&quot;]</span>
                        </>
                      ) : (
                        <span className="text-text-faint">[]</span>
                      )}
                    </>
                  )}
                </div>
              );
            })}
        </div>

        {/* Try it input */}
        <div className="flex items-center gap-3 border-t border-border pt-4">
          <span className="font-mono text-[10px] tracking-widest text-accent-dim uppercase">
            Try it
          </span>
          <input
            type="email"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
            onFocus={() => setIsManual(true)}
            placeholder="type an email and hit enter..."
            className="flex-1 border-none bg-transparent font-mono text-sm text-accent outline-none placeholder:text-text-faint"
          />
          <button
            onClick={handleCheck}
            className="rounded-md border border-border-bright bg-bg-hover px-3 py-1.5 font-mono text-xs text-text-muted transition-colors hover:border-accent hover:text-accent"
          >
            Check
          </button>
        </div>
      </div>
    </div>
  );
}
