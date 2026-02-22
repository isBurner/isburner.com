import { resolveMx } from 'node:dns/promises';
import { DISPOSABLE_MX_HOSTS, DISPOSABLE_MX_PATTERNS } from './data/mx-patterns';

type MxMatch = {
  provider: string;
  mxHost: string;
};

/**
 * Checks a domain's MX records against known disposable email infrastructure.
 * Returns the matching provider info if found, null otherwise.
 *
 * This catches custom domains that route mail through known disposable services
 * (e.g., a user registers "my-fake-domain.com" but points MX to mailinator).
 */
export async function checkMxRecords(domain: string): Promise<MxMatch | null> {
  let mxRecords: { exchange: string; priority: number }[];

  try {
    mxRecords = await resolveMx(domain);
  } catch {
    // DNS failure (NXDOMAIN, timeout, etc.) — can't determine, return null
    return null;
  }

  if (!mxRecords || mxRecords.length === 0) {
    return null;
  }

  for (const record of mxRecords) {
    const mx = record.exchange.toLowerCase().replace(/\.$/, '');

    // Exact match against known disposable MX hosts
    const exactMatch = DISPOSABLE_MX_HOSTS.get(mx);
    if (exactMatch) {
      return { provider: exactMatch, mxHost: mx };
    }

    // Substring pattern match
    for (const { pattern, provider } of DISPOSABLE_MX_PATTERNS) {
      if (mx.includes(pattern)) {
        return { provider, mxHost: mx };
      }
    }
  }

  return null;
}
