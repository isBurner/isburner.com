import { describe, it, expect } from 'vitest';
import { analyzeTld } from './tld';

describe('analyzeTld', () => {
  it('scores high-risk TLD .tk', () => {
    const result = analyzeTld('anything.tk');
    expect(result.score).toBe(0.3);
    expect(result.reason).toContain('.tk');
    expect(result.reason).toContain('High-risk');
  });

  it('scores high-risk TLD .ml', () => {
    const result = analyzeTld('domain.ml');
    expect(result.score).toBe(0.3);
  });

  it('scores high-risk TLD .ga', () => {
    expect(analyzeTld('foo.ga').score).toBe(0.3);
  });

  it('scores high-risk TLD .cf', () => {
    expect(analyzeTld('bar.cf').score).toBe(0.3);
  });

  it('scores high-risk TLD .gq', () => {
    expect(analyzeTld('baz.gq').score).toBe(0.3);
  });

  it('scores medium-risk TLD .xyz', () => {
    const result = analyzeTld('domain.xyz');
    expect(result.score).toBe(0.15);
    expect(result.reason).toContain('.xyz');
    expect(result.reason).toContain('Medium-risk');
  });

  it('scores medium-risk TLD .top', () => {
    expect(analyzeTld('site.top').score).toBe(0.15);
  });

  it('scores medium-risk TLD .click', () => {
    expect(analyzeTld('site.click').score).toBe(0.15);
  });

  it('returns zero for .com', () => {
    const result = analyzeTld('google.com');
    expect(result.score).toBe(0);
    expect(result.reason).toBeNull();
  });

  it('returns zero for .org', () => {
    expect(analyzeTld('wikipedia.org').score).toBe(0);
  });

  it('returns zero for .io', () => {
    expect(analyzeTld('github.io').score).toBe(0);
  });

  it('returns zero for unknown TLDs (conservative)', () => {
    expect(analyzeTld('my.pizza').score).toBe(0);
  });

  it('extracts TLD from subdomain correctly', () => {
    const result = analyzeTld('sub.domain.tk');
    expect(result.score).toBe(0.3);
  });

  it('handles uppercase TLDs', () => {
    const result = analyzeTld('DOMAIN.TK');
    expect(result.score).toBe(0.3);
  });
});
