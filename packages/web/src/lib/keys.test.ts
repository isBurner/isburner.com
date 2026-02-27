import { describe, it, expect } from 'vitest';
import { generateApiKey, hashApiKey, getKeyPrefix } from './keys';

describe('generateApiKey', () => {
  it('returns a string starting with ib_live_', () => {
    expect(generateApiKey()).toMatch(/^ib_live_/);
  });

  it('returns exactly 40 characters (8 prefix + 32 hex)', () => {
    expect(generateApiKey()).toHaveLength(40);
  });

  it('hex portion contains only valid hex characters', () => {
    const key = generateApiKey();
    const hex = key.slice(8);
    expect(hex).toMatch(/^[0-9a-f]{32}$/);
  });

  it('generates unique keys on each call', () => {
    const keys = new Set(Array.from({ length: 100 }, () => generateApiKey()));
    expect(keys.size).toBe(100);
  });
});

describe('hashApiKey', () => {
  it('returns a 64-character hex string (SHA-256)', () => {
    const hash = hashApiKey('ib_live_abc123');
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it('returns the same hash for the same input', () => {
    const key = 'ib_live_test1234567890abcdef';
    expect(hashApiKey(key)).toBe(hashApiKey(key));
  });

  it('returns different hashes for different inputs', () => {
    expect(hashApiKey('key_a')).not.toBe(hashApiKey('key_b'));
  });

  it('matches known SHA-256 output', () => {
    // SHA-256 of "test" is a well-known value
    expect(hashApiKey('test')).toBe(
      '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08'
    );
  });
});

describe('getKeyPrefix', () => {
  it('returns first 12 characters of the key', () => {
    expect(getKeyPrefix('ib_live_abcd1234xxxx')).toBe('ib_live_abcd');
  });

  it('works with keys shorter than 12 characters', () => {
    expect(getKeyPrefix('short')).toBe('short');
  });
});
