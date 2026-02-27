import { describe, it, expect } from 'vitest';
import { computeCompositeScore } from './score';
import type { SignalResult } from './types';

function signal(score: number, reason: string | null = null): SignalResult {
  return { name: 'test', score, reason };
}

describe('computeCompositeScore', () => {
  it('sums positive signals', () => {
    const result = computeCompositeScore([signal(0.30), signal(0.15), signal(0.20)]);
    expect(result.score).toBeCloseTo(0.65);
  });

  it('clamps to 1.0 max', () => {
    const result = computeCompositeScore([signal(0.6), signal(0.6)]);
    expect(result.score).toBe(1.0);
  });

  it('clamps to 0.0 min when negative signals dominate', () => {
    const result = computeCompositeScore([signal(0.15), signal(-0.3)]);
    expect(result.score).toBe(0.0);
  });

  it('handles all-zero signals', () => {
    const result = computeCompositeScore([signal(0), signal(0)]);
    expect(result.score).toBe(0);
    expect(result.reasons).toEqual([]);
  });

  it('collects only non-null reasons', () => {
    const result = computeCompositeScore([
      signal(0.1, 'reason A'),
      signal(0, null),
      signal(0.2, 'reason B'),
    ]);
    expect(result.reasons).toEqual(['reason A', 'reason B']);
  });

  it('returns empty reasons when all are null', () => {
    const result = computeCompositeScore([signal(0.1), signal(0.2)]);
    expect(result.reasons).toEqual([]);
  });

  it('handles empty signal array', () => {
    const result = computeCompositeScore([]);
    expect(result.score).toBe(0);
    expect(result.reasons).toEqual([]);
  });

  it('applies negative signals correctly', () => {
    const result = computeCompositeScore([signal(0.40), signal(-0.30), signal(0.15)]);
    expect(result.score).toBeCloseTo(0.25);
  });
});
