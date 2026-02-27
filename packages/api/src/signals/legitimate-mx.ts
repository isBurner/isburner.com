import type { SignalResult } from './types';

const LEGITIMATE_MX_PROVIDERS: readonly { pattern: string; provider: string }[] = [
  // Google Workspace
  { pattern: 'aspmx.l.google.com', provider: 'Google Workspace' },
  { pattern: 'google.com', provider: 'Google Workspace' },
  { pattern: 'googlemail.com', provider: 'Google Workspace' },

  // Microsoft 365
  { pattern: 'mail.protection.outlook.com', provider: 'Microsoft 365' },
  { pattern: 'olc.protection.outlook.com', provider: 'Microsoft 365' },

  // Zoho
  { pattern: 'zoho.com', provider: 'Zoho Mail' },
  { pattern: 'zoho.eu', provider: 'Zoho Mail' },
  { pattern: 'zoho.in', provider: 'Zoho Mail' },

  // Fastmail
  { pattern: 'messagingengine.com', provider: 'Fastmail' },

  // ProtonMail
  { pattern: 'protonmail.ch', provider: 'ProtonMail' },

  // Mimecast (enterprise email security)
  { pattern: 'mimecast.com', provider: 'Mimecast' },

  // Barracuda (enterprise email security)
  { pattern: 'barracudanetworks.com', provider: 'Barracuda' },
];

function matchesMxPattern(mxHost: string, pattern: string): boolean {
  return mxHost === pattern || mxHost.endsWith(`.${pattern}`);
}

/**
 * Detects known legitimate email providers from pre-resolved MX records.
 * Returns a negative score (counter-signal) when a legitimate provider is found.
 * Does NOT make any DNS calls — receives already-resolved MX records.
 */
export function detectLegitimateMx(
  mxRecords: { exchange: string; priority: number }[]
): SignalResult {
  for (const record of mxRecords) {
    const mx = record.exchange.toLowerCase().replace(/\.$/, '');

    for (const { pattern, provider } of LEGITIMATE_MX_PROVIDERS) {
      if (matchesMxPattern(mx, pattern)) {
        return {
          name: 'legitimate_mx',
          score: -0.3,
          reason: `MX routes through ${provider} (legitimate provider)`,
        };
      }
    }
  }

  return { name: 'legitimate_mx', score: 0, reason: null };
}
