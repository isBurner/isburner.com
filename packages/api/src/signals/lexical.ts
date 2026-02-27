import type { SignalResult } from './types';

const MAX_SCORE = 0.3;

const SUSPICIOUS_KEYWORDS: readonly string[] = [
  'temp',
  'throw',
  'trash',
  'disposable',
  'burner',
  'fake',
  'junk',
  'spam',
  'dump',
  'anon',
  'mailinator',
  'guerrilla',
  'yopmail',
];

/** Common compound TLDs where the SLD is the part before the compound suffix. */
const COMPOUND_TLDS: ReadonlySet<string> = new Set([
  'co.uk',
  'co.jp',
  'co.kr',
  'co.nz',
  'co.za',
  'co.in',
  'co.id',
  'com.au',
  'com.br',
  'com.mx',
  'com.cn',
  'com.tw',
  'com.ar',
  'com.tr',
  'org.uk',
  'net.au',
  'ac.uk',
]);

/** Extract the second-level domain (the registrable name, not subdomains or TLD). */
export function extractSld(domain: string): string {
  const parts = domain.split('.');
  if (parts.length < 2) return domain;

  // Check for compound TLDs (e.g., co.uk)
  if (parts.length >= 3) {
    const lastTwo = `${parts[parts.length - 2]}.${parts[parts.length - 1]}`;
    if (COMPOUND_TLDS.has(lastTwo)) {
      return parts[parts.length - 3];
    }
  }

  return parts[parts.length - 2];
}

/** Shannon entropy in bits per character. */
export function shannonEntropy(s: string): number {
  if (s.length === 0) return 0;
  const freq = new Map<string, number>();
  for (const ch of s) {
    freq.set(ch, (freq.get(ch) ?? 0) + 1);
  }
  let entropy = 0;
  for (const count of freq.values()) {
    const p = count / s.length;
    entropy -= p * Math.log2(p);
  }
  return entropy;
}

export function analyzeLexical(domain: string): SignalResult {
  const sld = extractSld(domain);
  let score = 0;
  const triggers: string[] = [];

  // Skip very short SLDs — not enough data for meaningful entropy
  if (sld.length >= 6) {
    const entropy = shannonEntropy(sld);
    if (entropy > 3.5) {
      score += 0.12;
      triggers.push(`high randomness (entropy: ${entropy.toFixed(1)})`);
    } else if (entropy > 3.0) {
      score += 0.06;
      triggers.push(`moderate randomness (entropy: ${entropy.toFixed(1)})`);
    }
  }

  // Long SLD heuristic
  if (sld.length > 20) {
    score += 0.08;
    triggers.push('unusually long domain name');
  }

  // Suspicious keyword match
  const sldLower = sld.toLowerCase();
  for (const keyword of SUSPICIOUS_KEYWORDS) {
    if (sldLower.includes(keyword)) {
      score += 0.1;
      triggers.push(`suspicious keyword: "${keyword}"`);
      break; // Only count once
    }
  }

  score = Math.min(score, MAX_SCORE);

  return {
    name: 'lexical',
    score,
    reason: triggers.length > 0 ? `Suspicious domain name (${triggers.join(', ')})` : null,
  };
}
