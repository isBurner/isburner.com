export interface Env {
  API_KEYS: KVNamespace;
  INTERNAL_SECRET: string;
}

export interface ApiKeyData {
  userId: string;
  keyId: string;
  tier: 'free' | 'starter' | 'pro';
  rateLimit: number;
  monthlyLimit: number;
  isActive: boolean;
}

export interface AppVariables {
  apiKey: ApiKeyData;
  keyHash: string;
}

export type AppEnv = { Bindings: Env; Variables: AppVariables };
