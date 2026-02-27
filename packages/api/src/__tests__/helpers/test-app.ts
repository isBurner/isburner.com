import type { Env } from '../../types';

interface TestEnvOptions {
  kv: KVNamespace;
  internalSecret?: string;
}

/** Builds a mock Cloudflare Workers env for Hono tests. */
export function createTestEnv(opts: TestEnvOptions): Env {
  return {
    API_KEYS: opts.kv,
    INTERNAL_SECRET: opts.internalSecret ?? 'test-secret',
    SENTRY_DSN: '',
  };
}

/** Captures waitUntil promises so tests can verify async side effects. */
export function createMockExecutionCtx() {
  const promises: Promise<unknown>[] = [];
  return {
    ctx: {
      waitUntil: vi.fn((p: Promise<unknown>) => {
        promises.push(p);
      }),
      passThroughOnException: vi.fn(),
    },
    flush: () => Promise.all(promises),
  };
}
