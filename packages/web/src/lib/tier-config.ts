export type Tier = 'free' | 'starter' | 'pro';

export interface TierConfig {
  name: string;
  rateLimit: number; // requests per second
  monthlyLimit: number; // lookups per month
  mxAnalysis: boolean;
}

export const TIER_CONFIG: Record<Tier, TierConfig> = {
  free: {
    name: 'Free',
    rateLimit: 10,
    monthlyLimit: 1_000,
    mxAnalysis: false,
  },
  starter: {
    name: 'Starter',
    rateLimit: 50,
    monthlyLimit: 10_000,
    mxAnalysis: true,
  },
  pro: {
    name: 'Pro',
    rateLimit: 100,
    monthlyLimit: 100_000,
    mxAnalysis: true,
  },
} as const;
