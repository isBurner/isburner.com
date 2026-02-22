// Known disposable email domains
// Sources:
//   - disposable-email-domains/disposable-email-domains (CC0, ~4K domains)
//   - disposable/disposable (MIT, ~5.2K domains)
//
// This is a starter set. The full list will be aggregated from open-source
// sources and deduplicated via a build script.
//
// TODO: Build script to pull and merge from GitHub sources
// TODO: Add allowlist for privacy services (Apple Hide My Email, Firefox Relay)

const DOMAINS_LIST = [
  // Top disposable email providers (starter set for dev/testing)
  'mailinator.com',
  'guerrillamail.com',
  'guerrillamail.net',
  'guerrillamail.org',
  'tempmail.com',
  'throwaway.email',
  'temp-mail.org',
  'fakeinbox.com',
  'sharklasers.com',
  'guerrillamailblock.com',
  'grr.la',
  'dispostable.com',
  'yopmail.com',
  'yopmail.fr',
  'trashmail.com',
  'trashmail.me',
  'trashmail.net',
  'mailnesia.com',
  'maildrop.cc',
  'discard.email',
  'mailsac.com',
  'getairmail.com',
  'mohmal.com',
  'tempail.com',
  'burnermail.io',
  'inboxbear.com',
  'mailcatch.com',
  'mintemail.com',
  'tempinbox.com',
  'harakirimail.com',
  'mailexpire.com',
  'jetable.org',
  'tempr.email',
  'throwam.com',
  'wegwerfmail.de',
  'spamgourmet.com',
  'mytemp.email',
  'getnada.com',
  'emailondeck.com',
  'temp-mail.io',
  '10minutemail.com',
  '10minutemail.net',
  'guerrillamail.de',
  'tempmailo.com',
  'disposableemailaddresses.emailmiser.com',
];

export const DISPOSABLE_DOMAINS: ReadonlySet<string> = new Set(DOMAINS_LIST);
