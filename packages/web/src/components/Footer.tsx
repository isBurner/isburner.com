import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-8 py-10 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
        <div>
          <Link href="/" className="font-mono text-sm font-bold tracking-tight">
            is<span className="text-accent">Burner</span>
          </Link>
          <p className="mt-1.5 text-xs text-text-faint">
            Disposable email detection for developers.
          </p>
        </div>
        <div className="flex flex-wrap gap-6 sm:gap-8">
          <Link
            href="/docs"
            className="text-xs text-text-faint transition-colors hover:text-text-muted"
          >
            Docs
          </Link>
          <a href="#" className="text-xs text-text-faint transition-colors hover:text-text-muted">
            Status
          </a>
          <a
            href="https://github.com/isBurner"
            className="text-xs text-text-faint transition-colors hover:text-text-muted"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
          <a href="#" className="text-xs text-text-faint transition-colors hover:text-text-muted">
            Terms
          </a>
        </div>
      </div>
    </footer>
  );
}
