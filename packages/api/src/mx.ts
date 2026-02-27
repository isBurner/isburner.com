import { resolveMx } from 'node:dns/promises';
import { DISPOSABLE_MX_HOSTS, DISPOSABLE_MX_PATTERNS } from './data/mx-patterns';

export type MxMatch = {
  provider: string;
  mxHost: string;
};

export type MxResolution = {
  records: { exchange: string; priority: number }[];
  disposableMatch: MxMatch | null;
};

/** Pure function: checks resolved MX records against known disposable hosts/patterns. */
function findDisposableMx(
  mxRecords: { exchange: string; priority: number }[]
): MxMatch | null {
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

/**
 * Resolves MX records for a domain and checks against known disposable infrastructure.
 * Returns both the raw records (for use by other signals like legitimate-MX detection)
 * and the disposable match result.
 */
export async function resolveMxRecords(domain: string): Promise<MxResolution | null> {
  let mxRecords: { exchange: string; priority: number }[];

  try {
    mxRecords = await resolveMx(domain);
  } catch {
    return null;
  }

  if (!mxRecords || mxRecords.length === 0) {
    return null;
  }

  return { records: mxRecords, disposableMatch: findDisposableMx(mxRecords) };
}

/**
 * @deprecated Use resolveMxRecords() instead for access to raw MX records.
 */
export async function checkMxRecords(domain: string): Promise<MxMatch | null> {
  const result = await resolveMxRecords(domain);
  return result?.disposableMatch ?? null;
}
