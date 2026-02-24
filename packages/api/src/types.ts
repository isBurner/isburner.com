export interface Env {
  API_KEYS: KVNamespace;
  INTERNAL_SECRET: string;
  SENTRY_DSN: string;
}

export interface ApiKeyData {
  userId: string;
  keyId: string;
  tier: 'free' | 'starter' | 'pro';
  rateLimit: number;
  monthlyLimit: number;
  isActive: boolean;
  /** ISO date string (YYYY-MM-DD) of Stripe billing period start. Null/undefined for free tier. */
  billingPeriodStart?: string | null;
}

export interface AppVariables {
  apiKey: ApiKeyData;
  keyHash: string;
}

export type AppEnv = { Bindings: Env; Variables: AppVariables };
