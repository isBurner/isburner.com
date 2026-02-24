import type { Metadata } from 'next';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

const SITE_URL = 'https://isburner.com';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for the isBurner disposable email detection API.',
  alternates: { canonical: `${SITE_URL}/privacy` },
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <div className="noise relative">
      <Nav />
      <main className="mx-auto max-w-3xl px-8 pb-24 pt-32">
        <h1 className="mb-2 font-mono text-3xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="mb-10 text-sm text-text-faint">Last updated: February 22, 2026</p>

        <div className="prose-terminal space-y-8 text-sm leading-relaxed text-text-muted">
          <section>
            <h2 className="mb-3 font-mono text-lg font-semibold text-text">1. Overview</h2>
            <p>
              isBurner (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) operates the
              isburner.com website and the isBurner API (collectively, the &ldquo;Service&rdquo;).
              This Privacy Policy describes how we collect, use, store, and protect your information
              when you use the Service. By using the Service, you agree to the practices described
              in this policy.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-mono text-lg font-semibold text-text">
              2. Information We Collect
            </h2>

            <h3 className="mb-2 font-mono text-sm font-medium text-text">Account information</h3>
            <p className="mb-3">
              When you create an account, we collect your email address and authentication data via
              Clerk (our authentication provider). If you subscribe to a paid plan, Stripe (our
              payment processor) collects your payment information directly &mdash; we do not store
              credit card numbers, bank account details, or other payment credentials on our
              servers.
            </p>

            <h3 className="mb-2 font-mono text-sm font-medium text-text">API usage data</h3>
            <p className="mb-3">
              We log aggregated API usage counts (number of lookups per day per API key). We do{' '}
              <strong className="text-text">not</strong> store the email addresses you query through
              the API. Queries are processed in memory on Cloudflare Workers and discarded
              immediately after generating a response. No query logs are written to persistent
              storage.
            </p>

            <h3 className="mb-2 font-mono text-sm font-medium text-text">
              Technical and device data
            </h3>
            <p className="mb-3">
              When you visit our website, we may collect standard technical information such as your
              IP address, browser type, operating system, referring URL, and pages visited. This
              data is used solely for security monitoring and improving the Service.
            </p>

            <h3 className="mb-2 font-mono text-sm font-medium text-text">Website analytics</h3>
            <p>
              We may use privacy-respecting analytics to understand how visitors use our website. We
              do not use third-party advertising trackers or sell data to ad networks.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-mono text-lg font-semibold text-text">
              3. Cookies and Similar Technologies
            </h2>
            <p className="mb-3">
              The Service uses cookies and similar technologies for the following purposes:
            </p>
            <ul className="list-inside list-disc space-y-1">
              <li>
                <strong className="text-text">Authentication cookies</strong> &mdash; set by Clerk
                to maintain your login session. These are strictly necessary and cannot be disabled
                while using the Service.
              </li>
              <li>
                <strong className="text-text">Payment cookies</strong> &mdash; set by Stripe during
                the checkout process to prevent fraud and process payments.
              </li>
              <li>
                <strong className="text-text">Preference cookies</strong> &mdash; to remember your
                settings and preferences across sessions.
              </li>
            </ul>
            <p className="mt-3">
              We do not use advertising or marketing cookies. You can configure your browser to
              reject cookies, but this may prevent you from signing in or using paid features.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-mono text-lg font-semibold text-text">
              4. How We Use Your Information
            </h2>
            <p className="mb-3">We use the information we collect to:</p>
            <ul className="list-inside list-disc space-y-1">
              <li>Provide, operate, and maintain the Service</li>
              <li>Authenticate your identity and API requests</li>
              <li>Track usage against your plan limits</li>
              <li>Process payments and manage subscriptions via Stripe</li>
              <li>
                Send transactional emails (account changes, billing notifications, usage alerts)
              </li>
              <li>Respond to support requests</li>
              <li>Detect and prevent fraud, abuse, or security threats</li>
              <li>Comply with legal obligations</li>
            </ul>
            <p className="mt-3">
              We do not use your information for profiling, automated decision-making, or targeted
              advertising.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-mono text-lg font-semibold text-text">
              5. Legal Basis for Processing (GDPR)
            </h2>
            <p className="mb-3">
              If you are located in the European Economic Area (EEA), United Kingdom, or
              Switzerland, we process your personal data under the following legal bases:
            </p>
            <ul className="list-inside list-disc space-y-1">
              <li>
                <strong className="text-text">Contract performance</strong> &mdash; processing
                necessary to provide the Service you signed up for (account management, API access,
                billing).
              </li>
              <li>
                <strong className="text-text">Legitimate interests</strong> &mdash; security
                monitoring, fraud prevention, and service improvement, where these interests are not
                overridden by your rights.
              </li>
              <li>
                <strong className="text-text">Legal obligation</strong> &mdash; where we are
                required to process data to comply with applicable law.
              </li>
              <li>
                <strong className="text-text">Consent</strong> &mdash; where you have given explicit
                consent (e.g., opting into marketing communications). You may withdraw consent at
                any time.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 font-mono text-lg font-semibold text-text">
              6. Data Sharing and Sub-processors
            </h2>
            <p className="mb-3">
              We do not sell, rent, or trade your personal information. We share data only with the
              following service providers (&ldquo;sub-processors&rdquo;), strictly for operating the
              Service:
            </p>
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-bg-surface/60">
                    <th className="px-4 py-2 font-mono text-xs font-medium text-text-faint">
                      Provider
                    </th>
                    <th className="px-4 py-2 font-mono text-xs font-medium text-text-faint">
                      Purpose
                    </th>
                    <th className="px-4 py-2 font-mono text-xs font-medium text-text-faint">
                      Data Location
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="px-4 py-2">
                      <a
                        href="https://clerk.com/privacy"
                        className="text-accent hover:text-accent-dim"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Clerk
                      </a>
                    </td>
                    <td className="px-4 py-2">Authentication</td>
                    <td className="px-4 py-2">United States</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2">
                      <a
                        href="https://stripe.com/privacy"
                        className="text-accent hover:text-accent-dim"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Stripe
                      </a>
                    </td>
                    <td className="px-4 py-2">Payment processing</td>
                    <td className="px-4 py-2">United States</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2">
                      <a
                        href="https://neon.tech/privacy"
                        className="text-accent hover:text-accent-dim"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Neon
                      </a>
                    </td>
                    <td className="px-4 py-2">Database hosting</td>
                    <td className="px-4 py-2">United States</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2">
                      <a
                        href="https://www.cloudflare.com/privacypolicy/"
                        className="text-accent hover:text-accent-dim"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Cloudflare
                      </a>
                    </td>
                    <td className="px-4 py-2">API hosting, edge caching, DNS</td>
                    <td className="px-4 py-2">Global edge network</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2">
                      <a
                        href="https://vercel.com/legal/privacy-policy"
                        className="text-accent hover:text-accent-dim"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Vercel
                      </a>
                    </td>
                    <td className="px-4 py-2">Website hosting</td>
                    <td className="px-4 py-2">United States</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-3">
              Each sub-processor is contractually bound to process your data only as necessary to
              provide their services to us, and to maintain appropriate security measures.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-mono text-lg font-semibold text-text">
              7. International Data Transfers
            </h2>
            <p>
              Your data may be transferred to and processed in the United States and other countries
              where our sub-processors operate. Where required by law (e.g., GDPR), such transfers
              rely on Standard Contractual Clauses (SCCs) or other legally approved transfer
              mechanisms provided by our sub-processors. By using the Service, you acknowledge that
              your data may be processed outside your country of residence.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-mono text-lg font-semibold text-text">8. Data Retention</h2>
            <p className="mb-3">We retain your data according to the following schedule:</p>
            <ul className="list-inside list-disc space-y-1">
              <li>
                <strong className="text-text">Account data</strong> &mdash; retained while your
                account is active, plus 30 days after deletion.
              </li>
              <li>
                <strong className="text-text">API usage logs</strong> &mdash; retained for 12
                months, then automatically purged.
              </li>
              <li>
                <strong className="text-text">Billing records</strong> &mdash; retained as required
                by tax and accounting law (typically 7 years).
              </li>
              <li>
                <strong className="text-text">API query content</strong> &mdash; not retained. Email
                addresses sent to the API are processed in memory and never written to disk.
              </li>
            </ul>
            <p className="mt-3">
              If you delete your account, we delete your personal data within 30 days, except where
              retention is required by law.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-mono text-lg font-semibold text-text">9. Security</h2>
            <p>We implement industry-standard security measures to protect your data, including:</p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>All data transmitted over HTTPS/TLS encryption</li>
              <li>API keys stored as irreversible SHA-256 hashes</li>
              <li>Database connections encrypted with SSL</li>
              <li>
                Webhook payloads verified via cryptographic signatures (Svix for Clerk, Stripe
                signature verification)
              </li>
              <li>No plaintext storage of secrets, passwords, or payment credentials</li>
            </ul>
            <p className="mt-3">
              While we take reasonable precautions, no method of transmission or storage is 100%
              secure. If you discover a security vulnerability, please report it to{' '}
              <a href="mailto:security@isburner.com" className="text-accent hover:text-accent-dim">
                security@isburner.com
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-mono text-lg font-semibold text-text">10. Your Rights</h2>
            <p className="mb-3">
              Depending on your location, you may have the following rights regarding your personal
              data:
            </p>

            <h3 className="mb-2 font-mono text-sm font-medium text-text">All users</h3>
            <ul className="mb-3 list-inside list-disc space-y-1">
              <li>
                <strong className="text-text">Access</strong> &mdash; request a copy of the personal
                data we hold about you.
              </li>
              <li>
                <strong className="text-text">Correction</strong> &mdash; request correction of
                inaccurate data.
              </li>
              <li>
                <strong className="text-text">Deletion</strong> &mdash; delete your account and
                associated data through the dashboard, or by contacting us.
              </li>
              <li>
                <strong className="text-text">Data portability</strong> &mdash; request your data in
                a machine-readable format.
              </li>
            </ul>

            <h3 className="mb-2 font-mono text-sm font-medium text-text">
              EEA, UK, and Swiss residents (GDPR)
            </h3>
            <ul className="mb-3 list-inside list-disc space-y-1">
              <li>Right to restrict processing of your personal data</li>
              <li>Right to object to processing based on legitimate interests</li>
              <li>Right to withdraw consent at any time</li>
              <li>Right to lodge a complaint with your local data protection authority</li>
            </ul>

            <h3 className="mb-2 font-mono text-sm font-medium text-text">
              California residents (CCPA/CPRA)
            </h3>
            <ul className="list-inside list-disc space-y-1">
              <li>Right to know what personal information we collect, use, and disclose</li>
              <li>Right to request deletion of your personal information</li>
              <li>
                Right to opt out of the sale of personal information (we do not sell your data)
              </li>
              <li>Right to non-discrimination for exercising your privacy rights</li>
            </ul>

            <p className="mt-3">
              To exercise any of these rights, email{' '}
              <a href="mailto:privacy@isburner.com" className="text-accent hover:text-accent-dim">
                privacy@isburner.com
              </a>
              . We will respond within 30 days (or sooner where required by law).
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-mono text-lg font-semibold text-text">
              11. Children&apos;s Privacy
            </h2>
            <p>
              The Service is not directed at children under the age of 16 (or 13 in jurisdictions
              where permitted). We do not knowingly collect personal data from children. If you
              believe a child has provided us with personal data, please contact us at{' '}
              <a href="mailto:privacy@isburner.com" className="text-accent hover:text-accent-dim">
                privacy@isburner.com
              </a>{' '}
              and we will promptly delete it.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-mono text-lg font-semibold text-text">
              12. Data Processing Agreements
            </h2>
            <p>
              If your organization requires a Data Processing Agreement (DPA) for GDPR compliance,
              contact us at{' '}
              <a href="mailto:privacy@isburner.com" className="text-accent hover:text-accent-dim">
                privacy@isburner.com
              </a>
              . We can provide a DPA covering our processing activities as described in this policy.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-mono text-lg font-semibold text-text">
              13. Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of material
              changes by posting the new policy on this page with an updated date. For significant
              changes, we may also notify you via email. Continued use of the Service after changes
              constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-mono text-lg font-semibold text-text">14. Contact</h2>
            <p>
              Questions about this Privacy Policy? Email us at{' '}
              <a href="mailto:privacy@isburner.com" className="text-accent hover:text-accent-dim">
                privacy@isburner.com
              </a>
              .
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
