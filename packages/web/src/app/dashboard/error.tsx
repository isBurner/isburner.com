'use client';

export default function DashboardError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-xl py-20 text-center">
      <h2 className="font-mono text-xl font-bold">Something went wrong</h2>
      <p className="mt-2 text-sm text-text-muted">
        We ran into an issue loading this page. This is usually temporary.
      </p>
      <button
        onClick={reset}
        className="mt-6 rounded-lg bg-accent px-5 py-2 font-mono text-sm font-semibold text-bg transition-colors hover:bg-accent-dim"
      >
        Try again
      </button>
    </div>
  );
}
