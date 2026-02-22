export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="max-w-2xl text-center">
        <h1 className="mb-4 font-mono text-5xl font-bold tracking-tight">
          is<span className="text-accent">Burner</span>
        </h1>
        <p className="mb-8 text-lg text-text-muted">
          Is this email trash? One API call to find out.
        </p>

        <pre className="mb-8 rounded-lg border border-border bg-bg-surface p-6 text-left text-sm">
          <code>
            <span className="text-text-muted">GET</span>{' '}
            <span className="text-accent">/api/check</span>
            <span className="text-text-faint">?email=user@tempmail.com</span>
            {'\n\n'}
            <span className="text-text-faint">{'{'}</span>
            {'\n'}
            {'  '}
            <span className="text-accent">&quot;disposable&quot;</span>:{' '}
            <span className="text-warning">true</span>,{'\n'}
            {'  '}
            <span className="text-accent">&quot;score&quot;</span>:{' '}
            <span className="text-text">1.0</span>,{'\n'}
            {'  '}
            <span className="text-accent">&quot;reasons&quot;</span>: [
            <span className="text-text-muted">
              &quot;Domain is on known disposable email list&quot;
            </span>
            ]{'\n'}
            <span className="text-text-faint">{'}'}</span>
          </code>
        </pre>

        <p className="text-sm text-text-faint">
          Coming soon. Built for developers who are tired of fake signups.
        </p>
      </div>
    </main>
  );
}
