import { describe, it, expect } from 'vitest';
import { timingSafeEqual } from './util';

describe('timingSafeEqual', () => {
  it('returns true for identical strings', () => {
    expect(timingSafeEqual('hello', 'hello')).toBe(true);
  });

  it('returns false for different strings of equal length', () => {
    expect(timingSafeEqual('hello', 'world')).toBe(false);
  });

  it('returns false for different length strings', () => {
    expect(timingSafeEqual('short', 'much longer string')).toBe(false);
  });

  it('returns true for two empty strings', () => {
    expect(timingSafeEqual('', '')).toBe(true);
  });

  it('returns false for empty vs non-empty string', () => {
    expect(timingSafeEqual('', 'x')).toBe(false);
    expect(timingSafeEqual('x', '')).toBe(false);
  });

  it('handles unicode characters correctly', () => {
    expect(timingSafeEqual('café', 'café')).toBe(true);
    expect(timingSafeEqual('café', 'cafe')).toBe(false);
  });

  it('handles secret-like strings', () => {
    const secret = 'sk_live_abc123def456ghi789';
    expect(timingSafeEqual(secret, secret)).toBe(true);
    expect(timingSafeEqual(secret, secret.slice(0, -1) + 'x')).toBe(false);
  });
});
