export type Tier = 'free' | 'starter' | 'pro';

export interface TierConfig {
  name: string;
  rateLimit: number; // requests per second
  monthlyLimit: number; // lookups per month
  mxAnalysis: boolean;
  support: string;
  features: string[];
}

export const TIER_CONFIG: Record<Tier, TierConfig> = {
  free: {
    name: 'Free',
    rateLimit: 10,
    monthlyLimit: 1_000,
    mxAnalysis: false,
    support: 'Community support',
    features: [
      '1,000 lookups/mo',
      '10 req/sec',
      'Community domain list',
      'Community support',
    ],
  },
  starter: {
    name: 'Starter',
    rateLimit: 50,
    monthlyLimit: 10_000,
    mxAnalysis: true,
    support: 'Email support',
    features: [
      '10,000 lookups/mo',
      '50 req/sec',
      'MX heuristic analysis',
      'Usage dashboard',
      'Email support',
    ],
  },
  pro: {
    name: 'Pro',
    rateLimit: 100,
    monthlyLimit: 100_000,
    mxAnalysis: true,
    support: 'Priority support',
    features: [
      '100,000 lookups/mo',
      '100 req/sec',
      'MX heuristic analysis',
      'Usage dashboard',
      'Priority support',
    ],
  },
} as const;
