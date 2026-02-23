import type { Metadata } from 'next';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import JsonLd from '@/components/JsonLd';
import Collapsible from '@/components/Collapsible';

const SITE_URL = 'https://isburner.com';

export const metadata: Metadata = {
  title: 'Pricing — Disposable Email Detection API',
  description:
    'Free tier with 1,000 lookups/mo. Paid plans from $5/mo. No credit card required. Compare isBurner plans for disposable email detection.',
  keywords: [
    'disposable email API pricing',
    'email validation API cost',
    'free burner email checker API',
    'block fake signups pricing',
    'temporary email detection pricing',
    'cheap email verification API',
    'disposable email API free tier',
  ],
  openGraph: {
    title: 'Pricing — Disposable Email Detection API | isBurner',
    description:
      'Free tier with 1,000 lookups/mo. Paid plans from $5/mo. No credit card required.',
    url: `${SITE_URL}/pricing`,
  },
  twitter: {
    title: 'Pricing — Disposable Email Detection API | isBurner',
    description:
      'Free tier with 1,000 lookups/mo. Paid plans from $5/mo. No credit card required.',
  },
  alternates: {
    canonical: `${SITE_URL}/pricing`,
  },
};

const productSchema = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'isBurner API',
  description:
    'Disposable email detection API. 30,000+ known domains, MX heuristic analysis, sub-5ms response.',
  url: `${SITE_URL}/pricing`,
  image: `${SITE_URL}/og-image.png`,
  brand: { '@type': 'Organization', name: 'isBurner' },
  offers: [
    {
      '@type': 'Offer',
      name: 'Free',
      price: '0',
      priceCurrency: 'USD',
      description: '1,000 lookups/mo, 10 req/sec, blocklist detection, email support',
      availability: 'https://schema.org/InStock',
      url: `${SITE_URL}/pricing`,
    },
    {
      '@type': 'Offer',
      name: 'Starter',
      price: '5.00',
      priceCurrency: 'USD',
      description: '25,000 lookups/mo, 50 req/sec, MX heuristic analysis, usage dashboard',
      availability: 'https://schema.org/InStock',
      url: `${SITE_URL}/pricing`,
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: '5.00',
        priceCurrency: 'USD',
        billingDuration: 'P1M',
        unitText: 'MONTH',
      },
    },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'Pricing', item: `${SITE_URL}/pricing` },
  ],
};

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'For side projects and testing.',
    features: ['1,000 lookups/mo', '10 req/sec', 'Community domain list', 'Email support'],
    cta: 'Start free',
    highlighted: false,
  },
  {
    name: 'Starter',
    price: '$5',
    period: '/mo',
    description: 'For production apps that need more.',
    features: [
      '25,000 lookups/mo',
      '50 req/sec',
      'MX heuristic analysis',
      'Usage dashboard',
      'Email support',
    ],
    cta: 'Get started',
    highlighted: true,
  },
];

const comparisonRows = [
  { feature: 'Monthly lookups', free: '1,000', starter: '25,000' },
  { feature: 'Rate limit', free: '10 req/sec', starter: '50 req/sec' },
  { feature: 'Blocklist detection', free: true, starter: true },
  { feature: 'MX heuristic analysis', free: false, starter: true },
  { feature: 'Usage dashboard', free: false, starter: true },
  { feature: 'Email support', free: true, starter: true },
  { feature: 'API key required', free: false, starter: true },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3 font-mono text-xs tracking-widest text-accent uppercase">{children}</h2>
  );
}

function PricingHero() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-6xl px-8 pb-16 pt-32 text-center">
        <SectionLabel>Pricing</SectionLabel>
        <h1 className="mb-5 text-4xl font-bold tracking-tight lg:text-5xl">
          Simple, transparent pricing
        </h1>
        <p className="mx-auto max-w-xl text-lg leading-relaxed text-text-muted">
          Start detecting disposable emails for free. No credit card, no surprises. Upgrade when
          your app needs more.
        </p>
      </div>
    </section>
  );
}

function PricingCards() {
  return (
    <section className="border-t border-border">
      <div className="mx-auto max-w-6xl px-8 py-24 lg:py-32">
        <div className="mx-auto grid max-w-2xl gap-6 sm:grid-cols-2">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-2xl border p-7 transition-all ${
                plan.highlighted
                  ? 'glow-accent-strong border-accent/30 bg-accent/5'
                  : 'border-border bg-bg-surface/60 hover:border-border-bright'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-4 py-1 font-mono text-xs font-semibold text-bg">
                  Popular
                </div>
              )}
              <div className="mb-6">
                <h3 className="font-mono text-sm font-medium text-text-muted">{plan.name}</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-4xl font-bold tracking-tight">{plan.price}</span>
                  <span className="text-sm text-text-faint">{plan.period}</span>
                </div>
                <p className="mt-3 text-sm text-text-faint">{plan.description}</p>
              </div>
              <ul className="mb-8 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm text-text-muted">
                    <span className="mt-0.5 font-mono text-accent">+</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <a
                href="#"
                className={`block rounded-xl py-3 text-center font-mono text-sm transition-all ${
                  plan.highlighted
                    ? 'bg-accent font-semibold text-bg hover:bg-accent-dim'
                    : 'border border-border text-text-muted hover:border-border-bright hover:text-text'
                }`}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureComparison() {
  return (
    <section className="border-t border-border">
      <div className="mx-auto max-w-6xl px-8 py-24 lg:py-32">
        <div className="mb-14 text-center">
          <SectionLabel>Compare plans</SectionLabel>
          <p className="text-3xl font-bold tracking-tight lg:text-4xl">
            Everything you get at every tier
          </p>
        </div>
        <div className="mx-auto max-w-2xl overflow-hidden rounded-xl border border-border">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-bg-surface/60">
                <th className="px-5 py-3 font-mono text-xs font-medium text-text-faint">
                  Feature
                </th>
                <th className="px-5 py-3 text-center font-mono text-xs font-medium text-text-faint">
                  Free
                </th>
                <th className="px-5 py-3 text-center font-mono text-xs font-medium text-accent">
                  Starter
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {comparisonRows.map((row) => (
                <tr key={row.feature}>
                  <td className="px-5 py-3 text-text-muted">{row.feature}</td>
                  <td className="px-5 py-3 text-center font-mono text-text-muted">
                    {typeof row.free === 'boolean' ? (
                      row.free ? (
                        <span className="text-accent">&#x2713;</span>
                      ) : (
                        <span className="text-text-faint">&#x2014;</span>
                      )
                    ) : (
                      row.free
                    )}
                  </td>
                  <td className="px-5 py-3 text-center font-mono text-text-muted">
                    {typeof row.starter === 'boolean' ? (
                      row.starter ? (
                        <span className="text-accent">&#x2713;</span>
                      ) : (
                        <span className="text-text-faint">&#x2014;</span>
                      )
                    ) : (
                      row.starter
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const questions = [
    {
      q: 'Is there a free disposable email detection API?',
      a: 'Yes. isBurner offers a free tier with 1,000 lookups per month, 10 requests per second, and access to our 30,000+ domain blocklist. No API key or credit card required — just send a GET request and start blocking burner emails.',
    },
    {
      q: 'How much does an email validation API cost?',
      a: 'isBurner starts at $0 (free forever). The Starter plan is $5/mo for 25,000 lookups and includes MX heuristic analysis to catch disposable services that static blocklists miss. Competitors like Kickbox, ZeroBounce, and NeverBounce charge $17–99/mo for the same check bundled into suites you don\u2019t need.',
    },
    {
      q: 'Do I need a credit card to start?',
      a: 'No. The free tier requires no credit card and no payment information. Create an account with just an email address and start detecting disposable emails immediately.',
    },
    {
      q: 'What happens when I hit my monthly lookup limit?',
      a: 'Requests beyond your monthly limit return a 429 (Too Many Requests) status code. Your service won\u2019t break — you just won\u2019t get results until the next billing cycle. You can upgrade to a higher plan at any time and the new limit takes effect immediately.',
    },
    {
      q: 'Can I detect burner emails without an API key?',
      a: 'Yes. The free tier requires no authentication — just send a GET request to the /api/check endpoint with an email parameter. Paid plans use an X-API-Key header for higher rate limits and access to MX heuristic analysis.',
    },
    {
      q: 'How does isBurner compare to Kickbox or ZeroBounce?',
      a: 'isBurner is purpose-built for one thing: detecting disposable and throwaway email addresses. Kickbox, ZeroBounce, and NeverBounce bundle disposable detection inside expensive email verification suites. If all you need is to block burner emails at signup, isBurner does it better and cheaper — starting at $0.',
    },
    {
      q: 'Is there a pay-as-you-go option?',
      a: 'Not yet. We currently offer fixed monthly plans (Free and Starter). If you need custom volume pricing for high-traffic applications, reach out and we\u2019ll work out a plan that fits.',
    },
    {
      q: 'Can I switch plans or cancel anytime?',
      a: 'Yes. No contracts, no lock-in. Upgrade, downgrade, or cancel whenever you want. Plan changes take effect at the start of your next billing cycle.',
    },
  ];

  return (
    <section id="faq" className="border-t border-border bg-bg-surface/30">
      <div className="mx-auto max-w-6xl px-8 py-24 lg:py-32">
        <div className="mb-14 text-center">
          <SectionLabel>FAQ</SectionLabel>
          <p className="text-3xl font-bold tracking-tight lg:text-4xl">
            Frequently asked questions
          </p>
        </div>
        <div className="mx-auto max-w-2xl space-y-4">
          {questions.map((item) => (
            <Collapsible key={item.q} title={item.q}>
              {item.a}
            </Collapsible>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="border-t border-border">
      <div className="mx-auto max-w-3xl px-8 py-24 text-center lg:py-32">
        <h2 className="mb-5 font-mono text-4xl font-bold tracking-tight lg:text-5xl">
          Start free.
          <br />
          <span className="text-glow text-accent">No credit card.</span>
        </h2>
        <p className="mb-10 text-lg text-text-muted">
          1,000 free lookups every month. Block disposable emails in under 5 minutes.
        </p>
        <a
          href="#"
          className="glow-accent inline-block rounded-xl bg-accent px-8 py-4 font-mono text-sm font-semibold text-bg transition-all hover:bg-accent-dim"
        >
          Get your free API key
        </a>
      </div>
    </section>
  );
}

export default function PricingPage() {
  return (
    <div className="noise relative">
      <JsonLd data={productSchema} />
      <JsonLd data={breadcrumbSchema} />
      <Nav />
      <main>
        <PricingHero />
        <PricingCards />
        <FeatureComparison />
        <FAQ />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
