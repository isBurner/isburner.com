import { describe, it, expect, vi, beforeEach } from 'vitest';

// Set env vars BEFORE module import (PRICE_IDS is captured at module scope)
vi.hoisted(() => {
  process.env.STRIPE_STARTER_PRICE_ID = 'price_starter';
  process.env.STRIPE_PRO_PRICE_ID = 'price_pro';
  process.env.NEXT_PUBLIC_SITE_URL = 'https://isburner.com';
});

// --- Mocks ---

const mockAuth = vi.fn();
vi.mock('@clerk/nextjs/server', () => ({
  auth: () => mockAuth(),
}));

const mockFindFirst = vi.fn();
const mockUpdate = vi.fn();

vi.mock('@/lib/db', () => ({
  db: {
    query: {
      users: { findFirst: (...args: unknown[]) => mockFindFirst(...args) },
    },
    update: () => ({ set: () => ({ where: mockUpdate }) }),
  },
}));

vi.mock('@/lib/db/schema', () => ({
  users: { id: 'id' },
}));

vi.mock('drizzle-orm', () => ({
  eq: vi.fn((...args: unknown[]) => args),
}));

const mockCustomersCreate = vi.fn();
const mockSubsRetrieve = vi.fn();
const mockSubsUpdate = vi.fn();
const mockCheckoutCreate = vi.fn();

vi.mock('@/lib/stripe', () => ({
  stripe: {
    customers: { create: (...args: unknown[]) => mockCustomersCreate(...args) },
    subscriptions: {
      retrieve: (...args: unknown[]) => mockSubsRetrieve(...args),
      update: (...args: unknown[]) => mockSubsUpdate(...args),
    },
    checkout: {
      sessions: { create: (...args: unknown[]) => mockCheckoutCreate(...args) },
    },
  },
}));

import { POST } from './route';

// --- Helpers ---

function makeRequest(body: Record<string, unknown> = {}) {
  return new Request('https://localhost/api/stripe/checkout', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('POST /api/stripe/checkout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    mockAuth.mockResolvedValue({ userId: null });

    const res = await POST(makeRequest({ tier: 'starter' }));
    expect(res.status).toBe(401);
  });

  it('returns 400 for invalid tier', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_1' });

    const res = await POST(makeRequest({ tier: 'platinum' }));
    expect(res.status).toBe(400);
  });

  it('returns 404 when user not found in DB', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_1' });
    mockFindFirst.mockResolvedValue(undefined);

    const res = await POST(makeRequest({ tier: 'starter' }));
    expect(res.status).toBe(404);
  });

  it('returns 400 when attempting to downgrade', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_1' });
    mockFindFirst.mockResolvedValue({ id: 'user_1', tier: 'pro', stripeCustomerId: 'cus_1' });

    const res = await POST(makeRequest({ tier: 'starter' }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('billing portal');
  });

  it('returns 400 when selecting same tier', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_1' });
    mockFindFirst.mockResolvedValue({ id: 'user_1', tier: 'starter', stripeCustomerId: 'cus_1' });

    const res = await POST(makeRequest({ tier: 'starter' }));
    expect(res.status).toBe(400);
  });

  it('creates Stripe customer when user has no stripeCustomerId', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_1' });
    mockFindFirst.mockResolvedValue({
      id: 'user_1',
      tier: 'free',
      email: 'test@example.com',
      stripeCustomerId: null,
      stripeSubscriptionId: null,
    });
    mockCustomersCreate.mockResolvedValue({ id: 'cus_new' });
    mockCheckoutCreate.mockResolvedValue({ url: 'https://checkout.stripe.com/session' });

    const res = await POST(makeRequest({ tier: 'starter' }));
    expect(res.status).toBe(200);
    expect(mockCustomersCreate).toHaveBeenCalled();
  });

  it('updates existing active subscription instead of creating new checkout', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_1' });
    mockFindFirst.mockResolvedValue({
      id: 'user_1',
      tier: 'starter',
      stripeCustomerId: 'cus_1',
      stripeSubscriptionId: 'sub_1',
    });
    mockSubsRetrieve.mockResolvedValue({
      status: 'active',
      items: { data: [{ id: 'si_1', price: { id: 'price_starter' } }] },
    });
    mockSubsUpdate.mockResolvedValue({});

    const res = await POST(makeRequest({ tier: 'pro' }));
    expect(res.status).toBe(200);
    expect(mockSubsUpdate).toHaveBeenCalled();
    expect(mockCheckoutCreate).not.toHaveBeenCalled();
  });

  it('creates checkout session for users without existing subscription', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_1' });
    mockFindFirst.mockResolvedValue({
      id: 'user_1',
      tier: 'free',
      email: 'test@example.com',
      stripeCustomerId: 'cus_1',
      stripeSubscriptionId: null,
    });
    mockCheckoutCreate.mockResolvedValue({ url: 'https://checkout.stripe.com/new' });

    const res = await POST(makeRequest({ tier: 'starter' }));
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.url).toBe('https://checkout.stripe.com/new');
  });

  it('returns 502 on Stripe SDK error', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_1' });
    mockFindFirst.mockResolvedValue({
      id: 'user_1',
      tier: 'free',
      stripeCustomerId: 'cus_1',
      stripeSubscriptionId: null,
    });
    mockCheckoutCreate.mockRejectedValue(new Error('Stripe down'));

    const res = await POST(makeRequest({ tier: 'starter' }));
    expect(res.status).toBe(502);
  });
});
