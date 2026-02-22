import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { DISPOSABLE_DOMAINS } from './data/domains';
import { DISPOSABLE_MX_HOSTS, DISPOSABLE_MX_PATTERNS } from './data/mx-patterns';
import { checkMxRecords } from './mx';

type Bindings = {
  // KV namespace for dynamic overrides (added later)
  // DOMAINS_KV: KVNamespace;
};

const app = new Hono<{ Bindings: Bindings }>();

// CORS — allow any origin for now (public API), lock down later with API keys
app.use(
  '*',
  cors({
    origin: '*',
    allowMethods: ['GET', 'OPTIONS'],
    maxAge: 86400,
  }),
);

// Consistent error format
app.onError((err, c) => {
  console.error('Unhandled error:', err);
  return c.json({ error: 'Internal server error' }, 500);
});

app.notFound((c) => {
  return c.json({ error: 'Not found', docs: 'https://isburner.com/docs' }, 404);
});

// Root — API info
app.get('/', (c) => {
  return c.json({
    name: 'isBurner API',
    version: '0.1.0',
    docs: 'https://isburner.com/docs',
  });
});

// Main endpoint — check if an email is disposable
app.get('/api/check', async (c) => {
  const email = c.req.query('email');

  if (!email) {
    return c.json({ error: 'Missing required parameter: email' }, 400);
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

  const reasons: string[] = [];
  let score = 0;

  // 1. Check against known disposable domain list (sub-microsecond, in-memory Set)
  const onBlocklist = DISPOSABLE_DOMAINS.has(domain);
  if (onBlocklist) {
    score = 1.0;
    reasons.push('Known disposable domain');
  }

  // 2. MX record heuristic analysis (~20ms, skip if already confirmed disposable)
  if (!onBlocklist) {
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

// Health check
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    domains_loaded: DISPOSABLE_DOMAINS.size,
    mx_hosts_loaded: DISPOSABLE_MX_HOSTS.size,
    mx_patterns_loaded: DISPOSABLE_MX_PATTERNS.length,
  });
});

export default app;
