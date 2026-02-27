import { describe, it, expect, vi, beforeEach } from 'vitest';
import { analyzeDnsAuth } from './dns-auth';

vi.mock('node:dns/promises', () => ({
  resolveTxt: vi.fn(),
}));

import { resolveTxt } from 'node:dns/promises';
const mockResolveTxt = vi.mocked(resolveTxt);

function mockDnsResponses(opts: {
  spf?: string | null;
  dmarc?: string | null;
  spfError?: boolean;
  dmarcError?: boolean;
}) {
  mockResolveTxt.mockImplementation(async (hostname: string) => {
    if (typeof hostname === 'string' && hostname.startsWith('_dmarc.')) {
      if (opts.dmarcError) throw new Error('NXDOMAIN');
      if (opts.dmarc === null || opts.dmarc === undefined) throw new Error('NXDOMAIN');
      return [[opts.dmarc]];
    }
    // SPF query (domain itself)
    if (opts.spfError) throw new Error('NXDOMAIN');
    if (opts.spf === null || opts.spf === undefined) return [['some-other-record']];
    return [[opts.spf]];
  });
}

describe('analyzeDnsAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns +0.20 when no SPF and no DMARC', async () => {
    mockDnsResponses({ spfError: true, dmarcError: true });
    const result = await analyzeDnsAuth('example.com');
    expect(result.score).toBe(0.2);
    expect(result.reason).toContain('No SPF or DMARC');
  });

  it('returns +0.10 when SPF only, no DMARC', async () => {
    mockDnsResponses({ spf: 'v=spf1 include:_spf.google.com ~all', dmarcError: true });
    const result = await analyzeDnsAuth('example.com');
    expect(result.score).toBe(0.1);
    expect(result.reason).toContain('SPF present');
    expect(result.reason).toContain('no DMARC');
  });

  it('returns +0.10 when DMARC only, no SPF', async () => {
    mockDnsResponses({ spfError: true, dmarc: 'v=DMARC1; p=reject;' });
    const result = await analyzeDnsAuth('example.com');
    expect(result.score).toBe(0.1);
    expect(result.reason).toContain('DMARC present');
    expect(result.reason).toContain('no SPF');
  });

  it('returns -0.10 for SPF + strict DMARC (p=reject)', async () => {
    mockDnsResponses({ spf: 'v=spf1 include:_spf.google.com ~all', dmarc: 'v=DMARC1; p=reject;' });
    const result = await analyzeDnsAuth('example.com');
    expect(result.score).toBe(-0.1);
    expect(result.reason).toContain('strict DMARC');
  });

  it('returns -0.10 for SPF + strict DMARC (p=quarantine)', async () => {
    mockDnsResponses({
      spf: 'v=spf1 include:_spf.google.com ~all',
      dmarc: 'v=DMARC1; p=quarantine;',
    });
    const result = await analyzeDnsAuth('example.com');
    expect(result.score).toBe(-0.1);
  });

  it('returns 0 for SPF + lax DMARC (p=none)', async () => {
    mockDnsResponses({ spf: 'v=spf1 include:_spf.google.com ~all', dmarc: 'v=DMARC1; p=none;' });
    const result = await analyzeDnsAuth('example.com');
    expect(result.score).toBe(0);
    expect(result.reason).toBeNull();
  });

  it('handles multi-chunk TXT records', async () => {
    mockResolveTxt.mockImplementation(async (hostname: string) => {
      if (typeof hostname === 'string' && hostname.startsWith('_dmarc.')) {
        return [['v=DMARC1; p=', 'reject; rua=mailto:d@example.com']];
      }
      return [['v=spf1 ', 'include:_spf.google.com ~all']];
    });
    const result = await analyzeDnsAuth('example.com');
    expect(result.score).toBe(-0.1);
  });

  it('handles case-insensitive DMARC', async () => {
    mockDnsResponses({ spf: 'v=spf1 ~all', dmarc: 'V=DMARC1; P=REJECT;' });
    const result = await analyzeDnsAuth('example.com');
    expect(result.score).toBe(-0.1);
  });

  it('queries _dmarc.domain for DMARC', async () => {
    mockDnsResponses({ spfError: true, dmarcError: true });
    await analyzeDnsAuth('test.example.com');
    expect(mockResolveTxt).toHaveBeenCalledWith('_dmarc.test.example.com');
  });
});
