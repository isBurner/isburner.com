import type { SignalResult } from './types';

/** Free-registration TLDs heavily abused by disposable services. */
const HIGH_RISK_TLDS: ReadonlySet<string> = new Set(['tk', 'ml', 'ga', 'cf', 'gq']);

/** gTLDs with elevated abuse rates. */
const MEDIUM_RISK_TLDS: ReadonlySet<string> = new Set([
  'xyz',
  'top',
  'click',
  'buzz',
  'website',
  'site',
  'space',
  'online',
  'icu',
  'fun',
  'rest',
  'monster',
  'uno',
]);

export function analyzeTld(domain: string): SignalResult {
  const tld = domain.split('.').pop()!.toLowerCase();

  if (HIGH_RISK_TLDS.has(tld)) {
    return {
      name: 'tld_risk',
      score: 0.3,
      reason: `High-risk TLD: .${tld} (free registration, heavily abused)`,
    };
  }

  if (MEDIUM_RISK_TLDS.has(tld)) {
    return {
      name: 'tld_risk',
      score: 0.15,
      reason: `Medium-risk TLD: .${tld}`,
    };
  }

  return { name: 'tld_risk', score: 0, reason: null };
}
