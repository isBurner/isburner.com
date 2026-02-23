'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';

export default function Nav() {
  const [open, setOpen] = useState(false);
  const toggle = useCallback(() => setOpen((o) => !o), []);
  const close = useCallback(() => setOpen(false), []);

  return (
    <nav className="fixed top-0 z-40 w-full border-b border-border/40 bg-bg/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-8 py-4">
        <Link href="/" className="font-mono text-lg font-bold tracking-tight">
          is<span className="text-accent">Burner</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="/docs"
            className="hidden font-mono text-xs tracking-wide text-text-muted transition-colors hover:text-text sm:block"
          >
            Docs
          </Link>
          <Link
            href="/pricing"
            className="hidden font-mono text-xs tracking-wide text-text-muted transition-colors hover:text-text sm:block"
          >
            Pricing
          </Link>
          <a
            href="https://github.com/isBurner"
            className="hidden font-mono text-xs tracking-wide text-text-muted transition-colors hover:text-text sm:block"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
          <a
            href="#"
            className="hidden rounded-lg border border-accent/30 bg-accent/5 px-4 py-2 font-mono text-xs text-accent transition-all hover:border-accent/60 hover:bg-accent/10 sm:block"
          >
            Get API Key
          </a>
          <button
            onClick={toggle}
            aria-label="Toggle menu"
            aria-expanded={open}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border font-mono text-sm text-text-muted transition-colors hover:border-border-bright hover:text-text sm:hidden"
          >
            {open ? '×' : '≡'}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-border/40 bg-bg/95 px-8 py-4 backdrop-blur-xl sm:hidden">
          <div className="flex flex-col gap-4">
            <Link
              href="/docs"
              onClick={close}
              className="font-mono text-sm text-text-muted transition-colors hover:text-text"
            >
              Docs
            </Link>
            <Link
              href="/pricing"
              onClick={close}
              className="font-mono text-sm text-text-muted transition-colors hover:text-text"
            >
              Pricing
            </Link>
            <a
              href="https://github.com/isBurner"
              className="font-mono text-sm text-text-muted transition-colors hover:text-text"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
            <a
              href="#"
              className="mt-2 rounded-lg border border-accent/30 bg-accent/5 px-4 py-2.5 text-center font-mono text-sm text-accent transition-all hover:border-accent/60 hover:bg-accent/10"
            >
              Get API Key
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
