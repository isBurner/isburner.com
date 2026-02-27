import { describe, it, expect } from 'vitest';
import { analyzeLexical, extractSld, shannonEntropy } from './lexical';

describe('extractSld', () => {
  it('extracts SLD from simple domain', () => {
    expect(extractSld('google.com')).toBe('google');
  });

  it('extracts SLD from subdomain', () => {
    expect(extractSld('mail.google.com')).toBe('google');
  });

  it('handles compound TLDs', () => {
    expect(extractSld('example.co.uk')).toBe('example');
    expect(extractSld('shop.com.br')).toBe('shop');
  });

  it('handles subdomain with compound TLD', () => {
    expect(extractSld('www.example.co.uk')).toBe('example');
  });

  it('returns domain if only one part', () => {
    expect(extractSld('localhost')).toBe('localhost');
  });
});

describe('shannonEntropy', () => {
  it('returns 0 for empty string', () => {
    expect(shannonEntropy('')).toBe(0);
  });

  it('returns 0 for single repeated character', () => {
    expect(shannonEntropy('aaaa')).toBe(0);
  });

  it('returns 1.0 for two equally distributed characters', () => {
    expect(shannonEntropy('ab')).toBeCloseTo(1.0);
  });

  it('returns higher entropy for random-looking strings', () => {
    const random = shannonEntropy('xk3j9rndq');
    const english = shannonEntropy('google');
    expect(random).toBeGreaterThan(english);
  });
});

describe('analyzeLexical', () => {
  it('returns zero for normal English domain', () => {
    const result = analyzeLexical('shopify.com');
    expect(result.score).toBe(0);
    expect(result.reason).toBeNull();
  });

  it('detects high-entropy random domain', () => {
    const result = analyzeLexical('xk3j9rndq2m.com');
    expect(result.score).toBeGreaterThan(0);
    expect(result.reason).toContain('randomness');
  });

  it('detects suspicious keyword "temp"', () => {
    const result = analyzeLexical('tempmail123.com');
    expect(result.score).toBeGreaterThanOrEqual(0.1);
    expect(result.reason).toContain('temp');
  });

  it('detects suspicious keyword "burner"', () => {
    const result = analyzeLexical('burneremail.net');
    expect(result.score).toBeGreaterThanOrEqual(0.1);
    expect(result.reason).toContain('burner');
  });

  it('detects suspicious keyword "disposable"', () => {
    const result = analyzeLexical('disposableaddress.org');
    expect(result.score).toBeGreaterThanOrEqual(0.1);
    expect(result.reason).toContain('disposable');
  });

  it('detects unusually long domain names', () => {
    const result = analyzeLexical('abcdefghijklmnopqrstuvwxyz123.com');
    expect(result.score).toBeGreaterThan(0);
    expect(result.reason).toContain('long');
  });

  it('caps score at MAX_SCORE (0.30)', () => {
    // High entropy + keyword + long = would exceed 0.30 uncapped
    const result = analyzeLexical('xk3j9temptrashburnerxxxxx1234567890abc.tk');
    expect(result.score).toBeLessThanOrEqual(0.3);
  });

  it('skips entropy for very short SLDs', () => {
    const result = analyzeLexical('x9.com');
    // 'x9' is only 2 chars — entropy check skipped, no keyword match
    expect(result.score).toBe(0);
  });

  it('handles compound TLDs correctly', () => {
    const result = analyzeLexical('tempmail.co.uk');
    expect(result.reason).toContain('temp');
  });

  it('only counts one keyword match', () => {
    const result = analyzeLexical('temptrashjunk.com');
    // Should match "temp" (first hit) and stop, scoring 0.10 once
    expect(result.score).toBeLessThanOrEqual(0.3);
  });

  it('returns zero for short normal domains', () => {
    const result = analyzeLexical('go.com');
    expect(result.score).toBe(0);
    expect(result.reason).toBeNull();
  });
});
