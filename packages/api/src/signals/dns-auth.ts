import { resolveTxt } from 'node:dns/promises';
import type { SignalResult } from './types';

interface SpfResult {
  present: true;
}

interface DmarcResult {
  present: true;
  strict: boolean;
}

async function querySpf(domain: string): Promise<SpfResult | null> {
  try {
    const records = await resolveTxt(domain);
    const flat = records.map((r) => r.join(''));
    const spf = flat.find((r) => r.startsWith('v=spf1'));
    return spf ? { present: true } : null;
  } catch {
    return null;
  }
}

async function queryDmarc(domain: string): Promise<DmarcResult | null> {
  try {
    const records = await resolveTxt(`_dmarc.${domain}`);
    const flat = records.map((r) => r.join(''));
    const dmarc = flat.find((r) => r.toLowerCase().startsWith('v=dmarc1'));
    if (!dmarc) return null;
    const pMatch = dmarc.match(/;\s*p\s*=\s*(reject|quarantine|none)/i);
    const policy = pMatch ? pMatch[1].toLowerCase() : 'none';
    return { present: true, strict: policy === 'reject' || policy === 'quarantine' };
  } catch {
    return null;
  }
}

export async function analyzeDnsAuth(domain: string): Promise<SignalResult> {
  const [spf, dmarc] = await Promise.all([querySpf(domain), queryDmarc(domain)]);

  // Both missing — no email authentication at all
  if (!spf && !dmarc) {
    return {
      name: 'dns_auth',
      score: 0.2,
      reason: 'No SPF or DMARC records (no email authentication)',
    };
  }

  // SPF only, no DMARC
  if (spf && !dmarc) {
    return {
      name: 'dns_auth',
      score: 0.1,
      reason: 'SPF present but no DMARC policy',
    };
  }

  // DMARC only, no SPF (unusual)
  if (!spf && dmarc) {
    return {
      name: 'dns_auth',
      score: 0.1,
      reason: 'DMARC present but no SPF record',
    };
  }

  // Both present — check DMARC strictness
  if (dmarc!.strict) {
    return {
      name: 'dns_auth',
      score: -0.1,
      reason: 'SPF + strict DMARC policy (reject/quarantine)',
    };
  }

  // Both present, lax DMARC (p=none)
  return { name: 'dns_auth', score: 0, reason: null };
}
