import { describe, it, expect, vi, beforeEach } from 'vitest';

// --- Mocks ---

const mockAuth = vi.fn();
vi.mock('@clerk/nextjs/server', () => ({
  auth: () => mockAuth(),
}));

const mockFindFirst = vi.fn();
vi.mock('@/lib/db', () => ({
  db: {
    query: {
      users: { findFirst: (...args: unknown[]) => mockFindFirst(...args) },
    },
  },
}));

vi.mock('@/lib/db/schema', () => ({
  users: { id: 'id' },
}));

vi.mock('drizzle-orm', () => ({
  eq: vi.fn((...args: unknown[]) => args),
}));

const mockPortalCreate = vi.fn();
vi.mock('@/lib/stripe', () => ({
  stripe: {
    billingPortal: {
      sessions: { create: (...args: unknown[]) => mockPortalCreate(...args) },
    },
  },
}));

import { POST } from './route';

describe('POST /api/stripe/portal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    mockAuth.mockResolvedValue({ userId: null });

    const res = await POST();
    expect(res.status).toBe(401);
  });

  it('returns 404 when user has no stripeCustomerId', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_1' });
    mockFindFirst.mockResolvedValue({ id: 'user_1', stripeCustomerId: null });

    const res = await POST();
    expect(res.status).toBe(404);
  });

  it('returns billing portal URL on success', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_1' });
    mockFindFirst.mockResolvedValue({ id: 'user_1', stripeCustomerId: 'cus_123' });
    mockPortalCreate.mockResolvedValue({ url: 'https://billing.stripe.com/portal' });

    const res = await POST();
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.url).toBe('https://billing.stripe.com/portal');
  });

  it('returns 502 on Stripe SDK error', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_1' });
    mockFindFirst.mockResolvedValue({ id: 'user_1', stripeCustomerId: 'cus_123' });
    mockPortalCreate.mockRejectedValue(new Error('Stripe error'));

    const res = await POST();
    expect(res.status).toBe(502);
  });
});
