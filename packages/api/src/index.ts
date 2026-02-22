import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { DISPOSABLE_DOMAINS } from './data/domains';

type Bindings = {
  // KV namespace for dynamic overrides (added later)
  // DOMAINS_KV: KVNamespace;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use('*', cors());

app.get('/', (c) => {
  return c.json({
    name: 'isBurner API',
    version: '0.1.0',
    docs: 'https://isburner.com/docs',
  });
});

app.get('/api/check', async (c) => {
  const email = c.req.query('email');

  if (!email) {
    return c.json({ error: 'Missing required parameter: email' }, 400);
  }

  const atIndex = email.lastIndexOf('@');
  if (atIndex === -1) {
    return c.json({ error: 'Invalid email format' }, 400);
  }

  const domain = email.slice(atIndex + 1).toLowerCase();
  const reasons: string[] = [];
  let score = 0;

  // Check against known disposable domain list
  if (DISPOSABLE_DOMAINS.has(domain)) {
    score = 1.0;
    reasons.push('Domain is on known disposable email list');
  }

  // TODO: MX record analysis
  // TODO: Domain age check

  return c.json({
    email,
    domain,
    disposable: score > 0.5,
    score,
    reasons,
  });
});

app.get('/health', (c) => {
  return c.json({ status: 'ok', domains_loaded: DISPOSABLE_DOMAINS.size });
});

export default app;
