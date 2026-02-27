import { Hono } from 'hono';
import { cors } from 'hono/cors';
import * as Sentry from '@sentry/cloudflare';
import type { AppEnv, Env } from './types';
import { authMiddleware } from './middleware/auth';
import { rateLimitMiddleware } from './middleware/rate-limit';
import { usageMiddleware } from './middleware/usage';
import internal from './routes/internal';
import { DISPOSABLE_DOMAINS } from './data/domains';
import { DISPOSABLE_MX_HOSTS, DISPOSABLE_MX_PATTERNS } from './data/mx-patterns';
import { checkMxRecords } from './mx';

const app = new Hono<AppEnv>();

// CORS — allow any origin (public API)
app.use(
  '*',
  cors({
    origin: '*',
    allowMethods: ['GET', 'OPTIONS'],
    allowHeaders: ['X-API-Key'],
    maxAge: 86400,
  })
);

// Capture errors in Sentry, then return consistent error format
app.onError((err, c) => {
  Sentry.captureException(err);
  c.executionCtx.waitUntil(Sentry.flush(2000));
  return c.json({ error: 'Internal server error' }, 500);
});

app.notFound((c) => {
  return c.json({ error: 'Not found', docs: 'https://isburner.com/docs' }, 404);
});

// Public routes (no auth required)
app.get('/', (c) => {
  return c.json({
    name: 'isBurner API',
    version: '0.1.0',
    docs: 'https://isburner.com/docs',
  });
});

app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    domains_loaded: DISPOSABLE_DOMAINS.size,
    mx_hosts_loaded: DISPOSABLE_MX_HOSTS.size,
    mx_patterns_loaded: DISPOSABLE_MX_PATTERNS.length,
  });
});

// Internal routes (protected by shared secret)
app.route('/internal', internal);

// Auth + rate limiting + usage tracking for /api/* routes
app.use('/api/*', authMiddleware, rateLimitMiddleware, usageMiddleware);

// Main endpoint — check if an email is disposable
app.get('/api/check', async (c) => {
  const email = c.req.query('email');

  if (!email) {
    return c.json({ error: 'Missing required parameter: email' }, 400);
  }

  // RFC 5321: email addresses must be ≤ 254 characters
  if (email.length > 254) {
    return c.json({ error: 'Invalid email format' }, 400);
  }

  // Basic email format validation
  const atIndex = email.lastIndexOf('@');
  if (atIndex < 1 || atIndex === email.length - 1) {
    return c.json({ error: 'Invalid email format' }, 400);
  }

  const domain = email.slice(atIndex + 1).toLowerCase();

  if (!domain.includes('.')) {
    return c.json({ error: 'Invalid email domain' }, 400);
  }

  const apiKey = c.get('apiKey');
  const reasons: string[] = [];
  let score = 0;

  // 1. Check against known disposable domain list (sub-microsecond, in-memory Set)
  const onBlocklist = DISPOSABLE_DOMAINS.has(domain);
  if (onBlocklist) {
    score = 1.0;
    reasons.push('Known disposable domain');
  }

  // 2. MX record heuristic analysis — paid tiers only
  if (!onBlocklist && apiKey.tier !== 'free') {
    const mxResult = await checkMxRecords(domain);
    if (mxResult) {
      score = Math.max(score, 0.9);
      reasons.push(`MX records route through ${mxResult.provider}`);
    }
  }

  return c.json({
    email,
    domain,
    disposable: score > 0.5,
    score,
    reasons,
  });
});

export { app };

export default Sentry.withSentry<Env>(
  (env) => ({
    dsn: env.SENTRY_DSN,
    tracesSampleRate: env.SENTRY_DSN ? 0.2 : 0,
    sendDefaultPii: false,
  }),
  app as unknown as ExportedHandler<Env>
) as unknown as typeof app;
