import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('node:dns/promises', () => ({
  resolveMx: vi.fn(),
}));

import { resolveMx } from 'node:dns/promises';
import { checkMxRecords } from './mx';

const mockResolveMx = vi.mocked(resolveMx);

describe('checkMxRecords', () => {
  beforeEach(() => {
    mockResolveMx.mockReset();
  });

  it('returns match when MX host is in DISPOSABLE_MX_HOSTS (exact match)', async () => {
    mockResolveMx.mockResolvedValue([{ exchange: 'mail.mailinator.com', priority: 10 }]);

    const result = await checkMxRecords('custom-domain.com');
    expect(result).toEqual({ provider: 'Mailinator', mxHost: 'mail.mailinator.com' });
  });

  it('strips trailing dot from MX exchange before matching', async () => {
    mockResolveMx.mockResolvedValue([{ exchange: 'mx1.guerrillamail.com.', priority: 10 }]);

    const result = await checkMxRecords('some-domain.org');
    expect(result).toEqual({ provider: 'Guerrilla Mail', mxHost: 'mx1.guerrillamail.com' });
  });

  it('lowercases MX exchange before matching', async () => {
    mockResolveMx.mockResolvedValue([{ exchange: 'MAIL.MAILINATOR.COM', priority: 10 }]);

    const result = await checkMxRecords('example.com');
    expect(result).toEqual({ provider: 'Mailinator', mxHost: 'mail.mailinator.com' });
  });

  it('returns match when MX host matches a substring pattern', async () => {
    mockResolveMx.mockResolvedValue([{ exchange: 'relay3.mailinator.com', priority: 10 }]);

    const result = await checkMxRecords('sneaky-domain.com');
    expect(result).not.toBeNull();
    expect(result!.provider).toBe('Mailinator');
  });

  it('returns null for legitimate MX records', async () => {
    mockResolveMx.mockResolvedValue([
      { exchange: 'alt1.gmail-smtp-in.l.google.com', priority: 5 },
      { exchange: 'alt2.gmail-smtp-in.l.google.com', priority: 10 },
    ]);

    expect(await checkMxRecords('company.com')).toBeNull();
  });

  it('returns null when DNS resolution fails', async () => {
    mockResolveMx.mockRejectedValue(new Error('NXDOMAIN'));
    expect(await checkMxRecords('nonexistent.xyz')).toBeNull();
  });

  it('returns null when no MX records exist', async () => {
    mockResolveMx.mockResolvedValue([]);
    expect(await checkMxRecords('no-mx.com')).toBeNull();
  });

  it('checks all MX records, not just the first', async () => {
    mockResolveMx.mockResolvedValue([
      { exchange: 'alt1.gmail-smtp-in.l.google.com', priority: 5 },
      { exchange: 'mail.mailinator.com', priority: 20 },
    ]);

    const result = await checkMxRecords('mixed.com');
    expect(result).toEqual({ provider: 'Mailinator', mxHost: 'mail.mailinator.com' });
  });
});
