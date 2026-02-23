import type { Metadata } from 'next';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import JsonLd from '@/components/JsonLd';
import CodeBlock from '@/components/CodeBlock';

const SITE_URL = 'https://isburner.com';
const API_BASE = 'https://api.isburner.com';

export const metadata: Metadata = {
  title: 'API Documentation',
  description:
    'isBurner API reference — disposable email detection in one GET request. Check any email against 30,000+ known domains with MX heuristic analysis.',
  keywords: [
    'disposable email API documentation',
    'email validation API reference',
    'burner email detection API',
    'disposable email checker API',
  ],
  openGraph: {
    title: 'API Documentation | isBurner',
    description:
      'Disposable email detection API reference. One GET request, sub-5ms response, 30,000+ domains.',
    url: `${SITE_URL}/docs`,
  },
  twitter: {
    title: 'API Documentation | isBurner',
    description:
      'Disposable email detection API reference. One GET request, sub-5ms response, 30,000+ domains.',
  },
  alternates: {
    canonical: `${SITE_URL}/docs`,
  },
};

const techArticleSchema = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: 'isBurner API Documentation',
  description:
    'Complete API reference for the isBurner disposable email detection API. Endpoints, authentication, error handling, and rate limits.',
  url: `${SITE_URL}/docs`,
  author: { '@type': 'Organization', name: 'isBurner' },
  publisher: { '@type': 'Organization', name: 'isBurner', url: SITE_URL },
  dateModified: new Date().toISOString(),
  proficiencyLevel: 'Beginner',
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-3 block font-mono text-xs tracking-widest text-accent uppercase">{children}</span>
  );
}

function DocsHero() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-6xl px-8 pb-16 pt-32">
        <SectionLabel>API Reference</SectionLabel>
        <h1 className="mb-4 text-4xl font-bold tracking-tight lg:text-5xl">Documentation</h1>
        <p className="mb-8 max-w-2xl text-lg leading-relaxed text-text-muted">
          Detect disposable emails with a single GET request. No SDK required — just HTTP.
        </p>
        <div className="inline-flex items-center gap-3 rounded-xl border border-border bg-bg-surface/60 px-5 py-3 font-mono text-sm">
          <span className="text-text-faint">Base URL</span>
          <span className="text-accent">{API_BASE}</span>
        </div>
      </div>
    </section>
  );
}

function AuthSection() {
  return (
    <section id="authentication" className="border-t border-border">
      <div className="mx-auto max-w-6xl px-8 py-20">
        <SectionLabel>Authentication</SectionLabel>
        <h2 className="mb-6 text-2xl font-bold tracking-tight">API Keys</h2>
        <p className="mb-6 max-w-2xl leading-relaxed text-text-muted">
          Free tier requires no authentication. For paid plans, pass your API key via the{' '}
          <code className="rounded bg-bg-surface px-2 py-0.5 text-sm text-accent">X-API-Key</code>{' '}
          header.
        </p>
        <CodeBlock
          title="Authenticated request"
          code={`curl -H "X-API-Key: your_api_key" \\
  "${API_BASE}/api/check?email=user@example.com"`}
        />
      </div>
    </section>
  );
}

function CheckEndpoint() {
  return (
    <section id="check-email" className="border-t border-border">
      <div className="mx-auto max-w-6xl px-8 py-20">
        <SectionLabel>Endpoint</SectionLabel>
        <h2 className="mb-6 text-2xl font-bold tracking-tight">Check Email</h2>

        <div className="mb-8 inline-flex items-center gap-3 rounded-lg border border-border bg-bg-surface/60 px-4 py-2 font-mono text-sm">
          <span className="rounded bg-accent/10 px-2 py-0.5 font-semibold text-accent">GET</span>
          <span className="text-text-muted">/api/check</span>
        </div>

        <p className="mb-8 max-w-2xl leading-relaxed text-text-muted">
          Check whether an email address belongs to a known disposable email provider.
        </p>

        {/* Query Parameters */}
        <h3 className="mb-4 text-lg font-semibold">Query parameters</h3>
        <div className="mb-10 overflow-hidden rounded-xl border border-border">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-bg-surface/60">
                <th className="px-5 py-3 font-mono text-xs font-medium text-text-faint">Param</th>
                <th className="px-5 py-3 font-mono text-xs font-medium text-text-faint">Type</th>
                <th className="px-5 py-3 font-mono text-xs font-medium text-text-faint">
                  Required
                </th>
                <th className="px-5 py-3 font-mono text-xs font-medium text-text-faint">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-5 py-3 font-mono text-accent">email</td>
                <td className="px-5 py-3 font-mono text-text-muted">string</td>
                <td className="px-5 py-3 font-mono text-accent">Yes</td>
                <td className="px-5 py-3 text-text-muted">
                  The email address to check (e.g. <code className="text-text">user@example.com</code>
                  )
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Request Example */}
        <h3 className="mb-4 text-lg font-semibold">Request</h3>
        <div className="mb-10">
          <CodeBlock
            title="cURL"
            code={`curl "${API_BASE}/api/check?email=user@tempmail.com"`}
          />
        </div>

        {/* Response Schema */}
        <h3 className="mb-4 text-lg font-semibold">Response</h3>
        <div className="mb-6 overflow-hidden rounded-xl border border-border">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-bg-surface/60">
                <th className="px-5 py-3 font-mono text-xs font-medium text-text-faint">Field</th>
                <th className="px-5 py-3 font-mono text-xs font-medium text-text-faint">Type</th>
                <th className="px-5 py-3 font-mono text-xs font-medium text-text-faint">
                  Description
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr>
                <td className="px-5 py-3 font-mono text-accent">disposable</td>
                <td className="px-5 py-3 font-mono text-text-muted">boolean</td>
                <td className="px-5 py-3 text-text-muted">
                  Whether the email is from a disposable provider
                </td>
              </tr>
              <tr>
                <td className="px-5 py-3 font-mono text-accent">score</td>
                <td className="px-5 py-3 font-mono text-text-muted">number</td>
                <td className="px-5 py-3 text-text-muted">
                  Confidence score from 0.0 (clean) to 1.0 (disposable)
                </td>
              </tr>
              <tr>
                <td className="px-5 py-3 font-mono text-accent">domain</td>
                <td className="px-5 py-3 font-mono text-text-muted">string</td>
                <td className="px-5 py-3 text-text-muted">The domain extracted from the email</td>
              </tr>
              <tr>
                <td className="px-5 py-3 font-mono text-accent">reasons</td>
                <td className="px-5 py-3 font-mono text-text-muted">string[]</td>
                <td className="px-5 py-3 text-text-muted">
                  Why the email was flagged (e.g. &quot;Known disposable domain&quot;)
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Example Responses */}
        <div className="mb-10 grid gap-6 lg:grid-cols-2">
          <div>
            <h3 className="mb-4 text-lg font-semibold">
              Disposable email <span className="text-error">&#x2717;</span>
            </h3>
            <CodeBlock
              title="200 OK"
              code={`{
  "disposable": true,
  "score": 1.0,
  "domain": "tempmail.com",
  "reasons": ["Known disposable domain"]
}`}
            />
          </div>
          <div>
            <h3 className="mb-4 text-lg font-semibold">
              Clean email <span className="text-safe">&#x2713;</span>
            </h3>
            <CodeBlock
              title="200 OK"
              code={`{
  "disposable": false,
  "score": 0.0,
  "domain": "gmail.com",
  "reasons": []
}`}
            />
          </div>
        </div>

        {/* Error Responses */}
        <h3 className="mb-4 text-lg font-semibold">Error responses</h3>
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-bg-surface/60">
                <th className="px-5 py-3 font-mono text-xs font-medium text-text-faint">Status</th>
                <th className="px-5 py-3 font-mono text-xs font-medium text-text-faint">Body</th>
                <th className="px-5 py-3 font-mono text-xs font-medium text-text-faint">Cause</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr>
                <td className="px-5 py-3 font-mono text-warning">400</td>
                <td className="px-5 py-3 font-mono text-text-muted">
                  {`{ "error": "Missing email parameter" }`}
                </td>
                <td className="px-5 py-3 text-text-muted">
                  <code className="text-text">email</code> query param not provided
                </td>
              </tr>
              <tr>
                <td className="px-5 py-3 font-mono text-warning">400</td>
                <td className="px-5 py-3 font-mono text-text-muted">
                  {`{ "error": "Invalid email format" }`}
                </td>
                <td className="px-5 py-3 text-text-muted">Value is not a valid email address</td>
              </tr>
              <tr>
                <td className="px-5 py-3 font-mono text-error">500</td>
                <td className="px-5 py-3 font-mono text-text-muted">
                  {`{ "error": "Internal server error" }`}
                </td>
                <td className="px-5 py-3 text-text-muted">Unexpected server failure</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function DetectionMethods() {
  return (
    <section id="detection" className="border-t border-border">
      <div className="mx-auto max-w-6xl px-8 py-20">
        <SectionLabel>How it works</SectionLabel>
        <h2 className="mb-6 text-2xl font-bold tracking-tight">Detection Methods</h2>
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-bg-surface/60 p-8">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-bg font-mono text-lg text-accent">
              #
            </div>
            <h3 className="mb-3 text-lg font-semibold">Blocklist matching</h3>
            <p className="text-sm leading-relaxed text-text-muted">
              Every request is checked against 30,000+ known disposable email domains. The list is
              open-source, community-maintained, and updated daily. Blocklist matches return a score
              of <code className="text-text">1.0</code>.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-bg-surface/60 p-8">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-bg font-mono text-lg text-accent">
              !
            </div>
            <h3 className="mb-3 text-lg font-semibold">MX heuristics</h3>
            <p className="text-sm leading-relaxed text-text-muted">
              Static lists miss new disposable services. We analyze MX records to detect custom
              domains routing through known throwaway mail infrastructure. MX-based detections
              return a score between <code className="text-text">0.5</code> and{' '}
              <code className="text-text">0.9</code> depending on confidence. Available on Starter
              plan and above.
            </p>
          </div>
        </div>
        <div className="mt-8 rounded-xl border border-border bg-bg-surface/60 p-6">
          <h3 className="mb-2 font-mono text-sm font-semibold">Understanding the score</h3>
          <p className="text-sm leading-relaxed text-text-muted">
            The <code className="text-text">score</code> field ranges from{' '}
            <code className="text-text">0.0</code> (definitely clean) to{' '}
            <code className="text-text">1.0</code> (definitely disposable). Use the{' '}
            <code className="text-text">disposable</code> boolean for simple block/allow decisions.
            Use the score for nuanced handling — e.g., flag emails above{' '}
            <code className="text-text">0.5</code> for manual review instead of blocking outright.
          </p>
        </div>
      </div>
    </section>
  );
}

function RateLimits() {
  return (
    <section id="rate-limits" className="border-t border-border">
      <div className="mx-auto max-w-6xl px-8 py-20">
        <SectionLabel>Limits</SectionLabel>
        <h2 className="mb-6 text-2xl font-bold tracking-tight">Rate Limits</h2>
        <p className="mb-8 max-w-2xl leading-relaxed text-text-muted">
          Rate limits are applied per API key (or per IP for unauthenticated requests). Exceeding
          the limit returns a <code className="rounded bg-bg-surface px-2 py-0.5 text-sm text-warning">429</code>{' '}
          status code.
        </p>
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-bg-surface/60">
                <th className="px-5 py-3 font-mono text-xs font-medium text-text-faint">Plan</th>
                <th className="px-5 py-3 font-mono text-xs font-medium text-text-faint">Price</th>
                <th className="px-5 py-3 font-mono text-xs font-medium text-text-faint">
                  Lookups / mo
                </th>
                <th className="px-5 py-3 font-mono text-xs font-medium text-text-faint">
                  Rate limit
                </th>
                <th className="px-5 py-3 font-mono text-xs font-medium text-text-faint">
                  MX heuristics
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr>
                <td className="px-5 py-3 font-mono font-medium text-text">Free</td>
                <td className="px-5 py-3 text-text-muted">$0</td>
                <td className="px-5 py-3 text-text-muted">1,000</td>
                <td className="px-5 py-3 text-text-muted">10 req/sec</td>
                <td className="px-5 py-3 text-text-faint">&#x2014;</td>
              </tr>
              <tr>
                <td className="px-5 py-3 font-mono font-medium text-accent">Starter</td>
                <td className="px-5 py-3 text-text-muted">$5/mo</td>
                <td className="px-5 py-3 text-text-muted">25,000</td>
                <td className="px-5 py-3 text-text-muted">50 req/sec</td>
                <td className="px-5 py-3 text-accent">&#x2713;</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function HealthEndpoint() {
  return (
    <section id="health" className="border-t border-border">
      <div className="mx-auto max-w-6xl px-8 py-20">
        <SectionLabel>Endpoint</SectionLabel>
        <h2 className="mb-6 text-2xl font-bold tracking-tight">Health Check</h2>

        <div className="mb-8 inline-flex items-center gap-3 rounded-lg border border-border bg-bg-surface/60 px-4 py-2 font-mono text-sm">
          <span className="rounded bg-accent/10 px-2 py-0.5 font-semibold text-accent">GET</span>
          <span className="text-text-muted">/health</span>
        </div>

        <p className="mb-8 max-w-2xl leading-relaxed text-text-muted">
          Returns the API&apos;s operational status. Use this for uptime monitoring.
        </p>

        <CodeBlock
          title="Response — 200 OK"
          code={`{
  "status": "ok"
}`}
        />
      </div>
    </section>
  );
}

function TableOfContents() {
  const sections = [
    { id: 'authentication', label: 'Authentication' },
    { id: 'check-email', label: 'Check Email' },
    { id: 'detection', label: 'Detection Methods' },
    { id: 'rate-limits', label: 'Rate Limits' },
    { id: 'health', label: 'Health Check' },
  ];

  return (
    <nav className="border-t border-border bg-bg-surface/30">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-8 py-4">
        <span className="font-mono text-xs text-text-faint">Jump to:</span>
        {sections.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="font-mono text-xs text-text-muted transition-colors hover:text-accent"
          >
            {s.label}
          </a>
        ))}
      </div>
    </nav>
  );
}

export default function DocsPage() {
  return (
    <div className="noise relative">
      <JsonLd data={techArticleSchema} />
      <Nav />
      <main>
        <DocsHero />
        <TableOfContents />
        <AuthSection />
        <CheckEndpoint />
        <DetectionMethods />
        <RateLimits />
        <HealthEndpoint />
      </main>
      <Footer />
    </div>
  );
}
