import TerminalDemo from '@/components/TerminalDemo';
import JsonLd from '@/components/JsonLd';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

const SITE_URL = 'https://isburner.com';

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'isBurner',
  url: SITE_URL,
  logo: { '@type': 'ImageObject', url: `${SITE_URL}/favicon.svg`, width: 512, height: 512 },
  description: 'Disposable email detection API for developers.',
  sameAs: ['https://github.com/isBurner'],
};

const webSiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'isBurner',
  url: SITE_URL,
  description:
    'Is this email trash? One API call to find out. Fast, affordable disposable email detection for developers.',
};

const productSchema = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'isBurner API',
  url: SITE_URL,
  image: `${SITE_URL}/og-image.png`,
  brand: { '@type': 'Organization', name: 'isBurner' },
  description:
    'Disposable email detection API. 30,000+ known domains, MX heuristics, sub-5ms response.',
  offers: [
    {
      '@type': 'Offer',
      name: 'Free',
      price: '0',
      priceCurrency: 'USD',
      description: '1,000 lookups/mo, 10 req/sec',
      availability: 'https://schema.org/InStock',
      url: `${SITE_URL}/pricing`,
    },
    {
      '@type': 'Offer',
      name: 'Starter',
      price: '5.00',
      priceCurrency: 'USD',
      description: '25,000 lookups/mo, 50 req/sec, MX heuristic analysis',
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

function Hero() {
  return (
    <section className="bg-grid relative overflow-hidden">
      {/* Gradient orb behind terminal */}
      <div
        className="pointer-events-none absolute right-0 top-1/3 -translate-y-1/2 translate-x-1/4"
        style={{
          width: 800,
          height: 600,
          background: 'radial-gradient(ellipse, #00ff8812 0%, transparent 60%)',
          filter: 'blur(100px)',
        }}
      />

      <div className="mx-auto max-w-6xl px-8 pb-24 pt-32 lg:pb-32 lg:pt-40">
        <div className="grid items-center gap-16 lg:grid-cols-[1fr_1.2fr]">
          {/* Left: Copy */}
          <div>
            <div className="boot-in d1 mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-bg-surface/80 px-4 py-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-accent" />
              <span className="font-mono text-xs text-text-muted">v0.1 — now in beta</span>
            </div>

            <h1 className="boot-in d2 mb-6 font-mono text-5xl leading-[1.08] font-bold tracking-tight lg:text-6xl">
              Is this email
              <br />
              <span className="text-glow text-accent">trash?</span>
            </h1>

            <p className="boot-in d3 mb-10 max-w-md text-lg leading-relaxed text-text-muted">
              One API call. Sub-5&#8239;ms response. 30,000+ known disposable domains plus MX
              heuristics that catch the rest.
            </p>

            <div className="boot-in d4 flex flex-wrap items-center gap-4">
              <a
                href="#"
                className="glow-accent rounded-lg bg-accent px-6 py-3 font-mono text-sm font-semibold text-bg transition-all hover:bg-accent-dim"
              >
                Get free API key
              </a>
              <a
                href="#how"
                className="rounded-lg border border-border-bright px-6 py-3 font-mono text-sm text-text-muted transition-all hover:border-accent/40 hover:text-text"
              >
                See how it works
              </a>
            </div>

            {/* Proof points */}
            <div className="boot-in d5 mt-14 flex items-center gap-8">
              <div>
                <div className="font-mono text-2xl font-bold text-accent">30K+</div>
                <div className="mt-1 text-xs text-text-faint">disposable domains</div>
              </div>
              <div className="h-10 w-px bg-border-bright" />
              <div>
                <div className="font-mono text-2xl font-bold">&lt;5ms</div>
                <div className="mt-1 text-xs text-text-faint">avg response</div>
              </div>
              <div className="h-10 w-px bg-border-bright" />
              <div>
                <div className="font-mono text-2xl font-bold">$0</div>
                <div className="mt-1 text-xs text-text-faint">to start</div>
              </div>
            </div>
          </div>

          {/* Right: Terminal */}
          <div className="terminal-enter">
            <TerminalDemo />
          </div>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'Make a request',
      description: 'Send a GET request with any email address. No SDK required.',
      code: `curl "https://api.isburner.com/check\\
  ?email=user@tempmail.com"`,
    },
    {
      number: '02',
      title: 'Get an answer',
      description: 'Instant JSON response with a confidence score and reasons.',
      code: `{
  "disposable": true,
  "score": 1.0,
  "reasons": ["Known disposable domain"]
}`,
    },
    {
      number: '03',
      title: 'Block the burner',
      description: 'Use the response in your signup flow. Block, warn, or flag.',
      code: `if (result.disposable) {
  return res.status(422).json({
    error: "Please use a real email"
  });
}`,
    },
  ];

  return (
    <section id="how" className="relative border-t border-border">
      <div className="mx-auto max-w-6xl px-8 py-24 lg:py-32">
        <div className="mb-14">
          <h2 className="mb-3 font-mono text-xs tracking-widest text-accent uppercase">
            How it works
          </h2>
          <p className="text-3xl font-bold tracking-tight lg:text-4xl">
            Three lines of code. That&apos;s it.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.number}
              className="group rounded-2xl border border-border bg-bg-surface/60 p-8 transition-all hover:border-border-bright hover:bg-bg-surface"
            >
              <div className="mb-5 font-mono text-sm font-bold text-accent">{step.number}</div>
              <h3 className="mb-3 text-xl font-semibold">{step.title}</h3>
              <p className="mb-8 text-sm leading-relaxed text-text-muted">{step.description}</p>
              <pre className="overflow-x-auto rounded-xl border border-border bg-bg p-5 text-xs leading-relaxed text-text-muted">
                <code>{step.code}</code>
              </pre>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhySection() {
  const features = [
    {
      icon: '~',
      title: 'Not another verification suite',
      description:
        "We do one thing. Kickbox, ZeroBounce, NeverBounce bundle disposable detection with stuff you don't need. We don't.",
    },
    {
      icon: '>',
      title: 'Explainable results',
      description:
        'Every other API returns a boolean. We tell you why: blocklist match, MX fingerprint, domain age. Debug with confidence.',
    },
    {
      icon: '$',
      title: 'Built for indie budgets',
      description:
        'Free tier with 1,000 lookups/mo. Paid starts at $5. Competitors charge $17-99/mo for the same check buried in a suite.',
    },
    {
      icon: '#',
      title: 'Edge-fast, globally',
      description:
        "In-memory domain lookups on Cloudflare's edge network. Sub-5ms from anywhere. No cold starts, no database roundtrips.",
    },
    {
      icon: '!',
      title: 'MX heuristics catch the rest',
      description:
        'Static lists miss new disposable services. We analyze MX records to detect custom domains routing through known throwaway infrastructure.',
    },
    {
      icon: '*',
      title: 'Open-source domain list',
      description:
        'Our blocklist is open on GitHub. Community-maintained, updated daily. The API adds MX analysis, scoring, and convenience on top.',
    },
  ];

  return (
    <section className="relative border-t border-border bg-bg-surface/30">
      <div className="mx-auto max-w-6xl px-8 py-24 lg:py-32">
        <div className="mb-14">
          <h2 className="mb-3 font-mono text-xs tracking-widest text-accent uppercase">
            Why isBurner
          </h2>
          <p className="text-3xl font-bold tracking-tight lg:text-4xl">
            Stop burning money on fake signups.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl border border-transparent p-7 transition-all hover:border-border hover:bg-bg-elevated/50"
            >
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-bg font-mono text-lg text-accent">
                {feature.icon}
              </div>
              <h3 className="mb-3 text-lg font-semibold">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-text-muted">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
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

  return (
    <section id="pricing" className="relative border-t border-border">
      <div className="mx-auto max-w-6xl px-8 py-24 lg:py-32">
        <div className="mb-14 text-center">
          <h2 className="mb-3 font-mono text-xs tracking-widest text-accent uppercase">Pricing</h2>
          <p className="text-3xl font-bold tracking-tight lg:text-4xl">
            Start free. Scale when you&apos;re ready.
          </p>
          <p className="mt-4 text-text-muted">No credit card required. No surprise bills.</p>
        </div>

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
        <div className="mt-8 text-center">
          <a
            href="/pricing"
            className="font-mono text-sm text-text-muted transition-colors hover:text-accent"
          >
            Compare plans in detail &rarr;
          </a>
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="relative border-t border-border bg-bg-surface/30">
      <div className="mx-auto max-w-3xl px-8 py-24 text-center lg:py-32">
        <h2 className="mb-5 font-mono text-4xl font-bold tracking-tight lg:text-5xl">
          Stop letting burners
          <br />
          <span className="text-glow text-accent">burn your budget.</span>
        </h2>
        <p className="mb-10 text-lg text-text-muted">
          Free tier. No credit card. Start blocking disposable emails in under 5 minutes.
        </p>
        <a
          href="#"
          className="glow-accent inline-block rounded-xl bg-accent px-8 py-4 font-mono text-sm font-semibold text-bg transition-all hover:bg-accent-dim"
        >
          Get your free API key
        </a>
        <div className="mt-6 font-mono text-xs text-text-faint">
          1,000 free lookups/mo — no strings attached
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <div className="noise relative">
      <JsonLd data={organizationSchema} />
      <JsonLd data={webSiteSchema} />
      <JsonLd data={productSchema} />
      <Nav />
      <main>
        <Hero />
        <HowItWorks />
        <WhySection />
        <Pricing />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
