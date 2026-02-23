import type { Metadata } from 'next';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

const SITE_URL = 'https://isburner.com';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for the isBurner disposable email detection API.',
  alternates: { canonical: `${SITE_URL}/terms` },
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  return (
    <div className="noise relative">
      <Nav />
      <main className="mx-auto max-w-3xl px-8 pb-24 pt-32">
        <h1 className="mb-2 font-mono text-3xl font-bold tracking-tight">Terms of Service</h1>
        <p className="mb-10 text-sm text-text-faint">Last updated: February 22, 2026</p>

        <div className="prose-terminal space-y-8 text-sm leading-relaxed text-text-muted">
          <section>
            <h2 className="mb-3 font-mono text-lg font-semibold text-text">1. Acceptance</h2>
            <p>
              By accessing or using the isBurner API and website (&ldquo;Service&rdquo;), you agree
              to be bound by these Terms of Service. If you do not agree, do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-mono text-lg font-semibold text-text">
              2. Description of Service
            </h2>
            <p>
              isBurner provides a disposable email detection API. The Service checks email addresses
              against a maintained list of known disposable email providers and performs MX record
              heuristic analysis.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-mono text-lg font-semibold text-text">3. Accounts</h2>
            <p>
              You must create an account to use the API. You are responsible for maintaining the
              security of your account credentials and API keys. You are responsible for all
              activity that occurs under your account.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-mono text-lg font-semibold text-text">4. API Usage</h2>
            <p>
              Your use of the API is subject to the rate limits and monthly lookup limits of your
              plan. You may not attempt to circumvent these limits. You may not use the API for any
              unlawful purpose or to facilitate discrimination against individuals based on their
              email provider.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-mono text-lg font-semibold text-text">
              5. Payment and Billing
            </h2>
            <p>
              Paid plans are billed monthly via Stripe. You authorize us to charge your payment
              method on a recurring basis. You may cancel at any time; cancellation takes effect at
              the end of the current billing period. No refunds are provided for partial billing
              periods.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-mono text-lg font-semibold text-text">
              6. Intellectual Property
            </h2>
            <p>
              The Service, including its design, code, and documentation, is owned by isBurner. The
              open-source domain list is available under its respective license on GitHub. You
              retain ownership of any data you send to or receive from the API.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-mono text-lg font-semibold text-text">
              7. Disclaimer of Warranties
            </h2>
            <p>
              The Service is provided &ldquo;as is&rdquo; without warranties of any kind, express or
              implied. We do not guarantee that the Service will identify all disposable email
              addresses or that it will be uninterrupted or error-free.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-mono text-lg font-semibold text-text">
              8. Limitation of Liability
            </h2>
            <p>
              To the maximum extent permitted by law, isBurner shall not be liable for any indirect,
              incidental, special, consequential, or punitive damages arising from your use of the
              Service. Our total liability shall not exceed the amount you paid us in the 12 months
              preceding the claim.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-mono text-lg font-semibold text-text">9. Termination</h2>
            <p>
              We may suspend or terminate your access to the Service at any time for violation of
              these Terms. You may terminate your account at any time by contacting us or deleting
              your account through the dashboard.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-mono text-lg font-semibold text-text">10. Changes</h2>
            <p>
              We may update these Terms from time to time. Continued use of the Service after
              changes constitutes acceptance of the updated Terms.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-mono text-lg font-semibold text-text">11. Contact</h2>
            <p>
              Questions about these Terms? Email us at{' '}
              <a href="mailto:support@isburner.com" className="text-accent hover:text-accent-dim">
                support@isburner.com
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
