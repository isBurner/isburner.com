import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import JsonLd from '@/components/JsonLd';
import CodeBlock from '@/components/CodeBlock';
import type { DomainMeta } from '@/data/domain-meta';
import domains from '@/data/domains.json';
import { DOMAIN_META, SEED_DOMAINS, getCategoryLabel } from '@/data/domain-meta';

const SITE_URL = 'https://isburner.com';
const domainSet = new Set<string>(domains);

export const dynamicParams = true;
export const revalidate = 604800; // 7 days

type PageProps = { params: Promise<{ domain: string }> };

// ---------------------------------------------------------------------------
// Static params — only pre-build the top ~200 domains
// ---------------------------------------------------------------------------

export function generateStaticParams(): { domain: string }[] {
  return SEED_DOMAINS.filter((d) => domainSet.has(d)).map((domain) => ({ domain }));
}

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { domain } = await params;
  const isDisposable = domainSet.has(domain);
  const meta = DOMAIN_META[domain];

  const title = `Is ${domain} Disposable?`;
  const description = isDisposable
    ? meta
      ? `${domain} is a known disposable email domain operated by ${meta.provider}. Block it with the isBurner API.`
      : `${domain} is a known disposable email domain. Detect and block it with the isBurner API.`
    : `${domain} is not in the isBurner disposable email blocklist. Check any domain with our API.`;

  return {
    title,
    description,
    openGraph: {
      title: `${title} | isBurner`,
      description,
      url: `${SITE_URL}/domain/${domain}`,
    },
    twitter: {
      title: `${title} | isBurner`,
      description,
    },
    alternates: {
      canonical: `${SITE_URL}/domain/${domain}`,
    },
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getTld(domain: string): string {
  const parts = domain.split('.');
  return '.' + parts[parts.length - 1];
}

function getRelatedDomains(domain: string): string[] {
  const meta = DOMAIN_META[domain];
  if (meta?.relatedDomains.length) {
    return meta.relatedDomains.filter((d) => domainSet.has(d));
  }

  // Fallback: find domains sharing the same base name
  const base = domain.split('.')[0];
  if (base.length < 4) return [];

  const related: string[] = [];
  for (const d of domains) {
    if (d === domain) continue;
    if (d.startsWith(base) && related.length < 8) {
      related.push(d);
    }
  }
  return related;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function DomainPage({ params }: PageProps) {
  const { domain } = await params;

  // Validate domain format
  if (!domain.includes('.') || domain.length > 255 || domain.length < 3) {
    notFound();
  }

  const isDisposable = domainSet.has(domain);
  const meta = DOMAIN_META[domain];
  const tld = getTld(domain);
  const relatedDomains = isDisposable ? getRelatedDomains(domain) : [];

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Domain Lookup',
        item: `${SITE_URL}/domain`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: domain,
        item: `${SITE_URL}/domain/${domain}`,
      },
    ],
  };

  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `Is ${domain} Disposable?`,
    url: `${SITE_URL}/domain/${domain}`,
    description: isDisposable
      ? `${domain} is a known disposable email domain.`
      : `${domain} is not in the isBurner disposable email blocklist.`,
    breadcrumb: breadcrumbSchema,
    publisher: {
      '@type': 'Organization',
      name: 'isBurner',
      url: SITE_URL,
    },
  };

  return (
    <div className="noise relative">
      <JsonLd data={webPageSchema} />
      <JsonLd data={breadcrumbSchema} />
      <Nav />
      <main>
        <HeroSection domain={domain} isDisposable={isDisposable} meta={meta} />
        <DetailsSection domain={domain} isDisposable={isDisposable} meta={meta} tld={tld} />
        {isDisposable && <AboutSection domain={domain} meta={meta} />}
        {relatedDomains.length > 0 && (
          <RelatedDomainsSection domain={domain} relatedDomains={relatedDomains} />
        )}
        {isDisposable && <BlockSection domain={domain} />}
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sections
// ---------------------------------------------------------------------------

function Breadcrumb({ domain }: { domain: string }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 font-mono text-xs">
      <Link href="/" className="text-text-faint transition-colors hover:text-text-muted">
        Home
      </Link>
      <span className="text-text-faint">/</span>
      <span className="text-text-faint">Domain Lookup</span>
      <span className="text-text-faint">/</span>
      <span className="text-text-muted">{domain}</span>
    </nav>
  );
}

function HeroSection({
  domain,
  isDisposable,
  meta,
}: {
  domain: string;
  isDisposable: boolean;
  meta: DomainMeta | undefined;
}) {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-6xl px-8 pb-16 pt-32">
        <Breadcrumb domain={domain} />

        <h1 className="mb-6 font-mono text-3xl font-bold tracking-tight lg:text-4xl">
          Is <span className="text-accent">{domain}</span> a disposable email?
        </h1>

        <div className="flex flex-wrap items-center gap-4">
          <div
            className={`inline-flex items-center gap-2 rounded-full border px-5 py-2 font-mono text-sm font-semibold ${
              isDisposable
                ? 'border-accent/30 bg-accent/10 text-accent'
                : 'border-border-bright bg-bg-surface text-text-muted'
            }`}
          >
            <span className="text-lg">{isDisposable ? '\u2717' : '\u2713'}</span>
            {isDisposable ? 'Disposable' : 'Not in blocklist'}
          </div>

          {meta && (
            <span className="font-mono text-sm text-text-muted">
              Operated by <strong className="text-text">{meta.provider}</strong>
            </span>
          )}
        </div>
      </div>
    </section>
  );
}

function DetailsSection({
  domain,
  isDisposable,
  meta,
  tld,
}: {
  domain: string;
  isDisposable: boolean;
  meta: DomainMeta | undefined;
  tld: string;
}) {
  const rows: { label: string; value: string }[] = [
    { label: 'Domain', value: domain },
    { label: 'TLD', value: tld },
    {
      label: 'Status',
      value: isDisposable ? 'Disposable' : 'Not in blocklist',
    },
  ];

  if (isDisposable) {
    rows.push({ label: 'Detection', value: 'Blocklist match (score 1.0)' });
  }

  if (meta) {
    rows.push({ label: 'Provider', value: meta.provider });
    rows.push({ label: 'Category', value: getCategoryLabel(meta.category) });
  }

  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-6xl px-8 py-16">
        <span className="mb-3 block font-mono text-xs tracking-widest text-accent uppercase">
          Details
        </span>
        <h2 className="mb-6 text-2xl font-bold tracking-tight">Domain Information</h2>

        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-left text-sm">
            <tbody className="divide-y divide-border">
              {rows.map((row) => (
                <tr key={row.label}>
                  <td className="whitespace-nowrap px-5 py-3 font-mono text-xs font-medium text-text-faint">
                    {row.label}
                  </td>
                  <td className="px-5 py-3 font-mono text-text-muted">{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function AboutSection({
  domain,
  meta,
}: {
  domain: string;
  meta: DomainMeta | undefined;
}) {
  const description = meta
    ? meta.description
    : `${domain} is a disposable email domain found in the isBurner blocklist. Emails from this domain are temporary and should not be trusted for account registration or communication. Blocking disposable domains helps protect your platform from abuse, fake signups, and spam.`;

  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-6xl px-8 py-16">
        <span className="mb-3 block font-mono text-xs tracking-widest text-accent uppercase">
          About
        </span>
        <h2 className="mb-6 text-2xl font-bold tracking-tight">About {domain}</h2>
        <p className="max-w-3xl leading-relaxed text-text-muted">{description}</p>
      </div>
    </section>
  );
}

function RelatedDomainsSection({
  domain,
  relatedDomains,
}: {
  domain: string;
  relatedDomains: string[];
}) {
  const meta = DOMAIN_META[domain];

  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-6xl px-8 py-16">
        <span className="mb-3 block font-mono text-xs tracking-widest text-accent uppercase">
          Related
        </span>
        <h2 className="mb-6 text-2xl font-bold tracking-tight">
          {meta ? `Other ${meta.provider} Domains` : 'Related Domains'}
        </h2>
        <div className="flex flex-wrap gap-3">
          {relatedDomains.map((d) => (
            <Link
              key={d}
              href={`/domain/${d}`}
              className="rounded-lg border border-border bg-bg-surface/60 px-4 py-2 font-mono text-sm text-text-muted transition-all hover:border-accent/30 hover:text-accent"
            >
              {d}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function BlockSection({ domain }: { domain: string }) {
  const code = `const res = await fetch(
  \`https://api.isburner.com/api/check?email=user@${domain}\`,
  { headers: { 'X-API-Key': 'your_api_key' } }
);
const { disposable } = await res.json();

if (disposable) {
  // Block signup, show warning, or flag for review
  throw new Error('Disposable email not allowed');
}`;

  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-6xl px-8 py-16">
        <span className="mb-3 block font-mono text-xs tracking-widest text-accent uppercase">
          Integration
        </span>
        <h2 className="mb-6 text-2xl font-bold tracking-tight">
          How to Block {domain}
        </h2>
        <p className="mb-8 max-w-2xl leading-relaxed text-text-muted">
          Use the isBurner API to detect and block emails from {domain} in your signup flow.
          One API call, sub-5&#8239;ms response.
        </p>
        <CodeBlock title="JavaScript / TypeScript" code={code} />
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="bg-bg-surface/30">
      <div className="mx-auto max-w-3xl px-8 py-20 text-center">
        <h2 className="mb-4 font-mono text-2xl font-bold tracking-tight lg:text-3xl">
          Check any email with the{' '}
          <span className="text-glow text-accent">isBurner API</span>
        </h2>
        <p className="mb-8 text-text-muted">
          72,000+ disposable domains. MX heuristics. Sub-5&#8239;ms response. Free to start.
        </p>
        <Link
          href="/sign-up"
          className="glow-accent inline-block rounded-xl bg-accent px-8 py-4 font-mono text-sm font-semibold text-bg transition-all hover:bg-accent-dim"
        >
          Get your free API key
        </Link>
        <div className="mt-4 font-mono text-xs text-text-faint">
          1,000 free lookups/mo — no credit card required
        </div>
      </div>
    </section>
  );
}
