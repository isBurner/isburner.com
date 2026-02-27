import { describe, it, expect } from 'vitest';
import { TIER_CONFIG, type Tier } from './tier-config';

describe('TIER_CONFIG', () => {
  it('defines exactly three tiers: free, starter, pro', () => {
    expect(Object.keys(TIER_CONFIG).sort()).toEqual(['free', 'pro', 'starter']);
  });

  it('free tier has rateLimit 10 and monthlyLimit 1000', () => {
    expect(TIER_CONFIG.free.rateLimit).toBe(10);
    expect(TIER_CONFIG.free.monthlyLimit).toBe(1_000);
  });

  it('starter tier has rateLimit 50 and monthlyLimit 10000', () => {
    expect(TIER_CONFIG.starter.rateLimit).toBe(50);
    expect(TIER_CONFIG.starter.monthlyLimit).toBe(10_000);
  });

  it('pro tier has rateLimit 100 and monthlyLimit 100000', () => {
    expect(TIER_CONFIG.pro.rateLimit).toBe(100);
    expect(TIER_CONFIG.pro.monthlyLimit).toBe(100_000);
  });

  it('free tier has mxAnalysis disabled', () => {
    expect(TIER_CONFIG.free.mxAnalysis).toBe(false);
  });

  it('starter and pro tiers have mxAnalysis enabled', () => {
    expect(TIER_CONFIG.starter.mxAnalysis).toBe(true);
    expect(TIER_CONFIG.pro.mxAnalysis).toBe(true);
  });

  it('all tiers have non-empty name and features array', () => {
    for (const tier of Object.values(TIER_CONFIG)) {
      expect(tier.name).toBeTruthy();
      expect(tier.features.length).toBeGreaterThan(0);
    }
  });

  it('tier limits are strictly increasing (free < starter < pro)', () => {
    const tiers: Tier[] = ['free', 'starter', 'pro'];
    for (let i = 1; i < tiers.length; i++) {
      expect(TIER_CONFIG[tiers[i]].rateLimit).toBeGreaterThan(
        TIER_CONFIG[tiers[i - 1]].rateLimit
      );
      expect(TIER_CONFIG[tiers[i]].monthlyLimit).toBeGreaterThan(
        TIER_CONFIG[tiers[i - 1]].monthlyLimit
      );
    }
  });
});
