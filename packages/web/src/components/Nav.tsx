import Link from 'next/link';

export default function Nav() {
  return (
    <nav className="hud-slide fixed top-0 z-40 w-full border-b border-border/40 bg-bg/70 backdrop-blur-xl">
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
            href="/#pricing"
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
            className="rounded-lg border border-accent/30 bg-accent/5 px-4 py-2 font-mono text-xs text-accent transition-all hover:border-accent/60 hover:bg-accent/10"
          >
            Get API Key
          </a>
        </div>
      </div>
    </nav>
  );
}
