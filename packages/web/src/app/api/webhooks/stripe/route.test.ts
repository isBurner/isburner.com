import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Tier } from '@/lib/tier-config';

// --- Mocks ---

const mockConstructEvent = vi.fn();
const mockSubRetrieve = vi.fn();

vi.mock('@/lib/stripe', () => ({
  stripe: {
    webhooks: { constructEvent: (...args: unknown[]) => mockConstructEvent(...args) },
    subscriptions: { retrieve: (...args: unknown[]) => mockSubRetrieve(...args) },
  },
}));

const mockFindFirst = {
  users: vi.fn(),
  subscriptions: vi.fn(),
  apiKeys: vi.fn(),
};
const mockFindMany = { apiKeys: vi.fn() };
const mockUpdate = vi.fn();
const mockInsert = vi.fn();

vi.mock('@/lib/db', () => ({
  db: {
    query: {
      users: { findFirst: (...args: unknown[]) => mockFindFirst.users(...args) },
      subscriptions: { findFirst: (...args: unknown[]) => mockFindFirst.subscriptions(...args) },
      apiKeys: { findMany: (...args: unknown[]) => mockFindMany.apiKeys(...args) },
    },
    update: () => ({ set: () => ({ where: mockUpdate }) }),
    insert: () => ({
      values: () => ({
        onConflictDoUpdate: () => ({ returning: vi.fn() }),
      }),
    }),
  },
}));

vi.mock('@/lib/db/schema', () => ({
  users: { id: 'id', stripeCustomerId: 'stripeCustomerId', stripeSubscriptionId: 'stripeSubscriptionId', isActive: 'isActive' },
  subscriptions: { id: 'id', userId: 'userId' },
  apiKeys: { userId: 'userId', isActive: 'isActive' },
}));

vi.mock('drizzle-orm', () => ({
  eq: vi.fn((...args: unknown[]) => args),
  and: vi.fn((...args: unknown[]) => args),
}));

const mockSyncUserKeysToKV = vi.fn();
vi.mock('@/lib/kv-sync', () => ({
  syncUserKeysToKV: (...args: unknown[]) => mockSyncUserKeysToKV(...args),
}));

import { POST } from './route';

// --- Helpers ---

function makeRequest(body: string, signature = 'valid_sig') {
  return new Request('https://localhost/api/webhooks/stripe', {
    method: 'POST',
    body,
    headers: { 'stripe-signature': signature },
  });
}

const PERIOD_TS = 1740787200; // 2025-02-28T00:00:00Z (close enough)

function makeStripeEvent(type: string, data: Record<string, unknown>) {
  return { type, data: { object: data } };
}

function makeSubscriptionObject(overrides: Record<string, unknown> = {}) {
  return {
    id: 'sub_123',
    customer: 'cus_456',
    status: 'active',
    cancel_at_period_end: false,
    items: {
      data: [
        {
          price: { id: 'price_starter' },
          current_period_start: PERIOD_TS,
          current_period_end: PERIOD_TS + 30 * 86400,
        },
      ],
    },
    ...overrides,
  };
}

describe('POST /api/webhooks/stripe', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('STRIPE_WEBHOOK_SECRET', 'whsec_test');
    vi.stubEnv('STRIPE_STARTER_PRICE_ID', 'price_starter');
    vi.stubEnv('STRIPE_PRO_PRICE_ID', 'price_pro');

    mockFindMany.apiKeys.mockResolvedValue([]);
    mockSyncUserKeysToKV.mockResolvedValue(undefined);
    mockUpdate.mockResolvedValue(undefined);
  });

  describe('signature verification', () => {
    it('returns 400 when stripe-signature header is missing', async () => {
      const req = new Request('https://localhost/api/webhooks/stripe', {
        method: 'POST',
        body: '{}',
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it('returns 500 when STRIPE_WEBHOOK_SECRET is not configured', async () => {
      vi.stubEnv('STRIPE_WEBHOOK_SECRET', '');
      const req = makeRequest('{}');
      const res = await POST(req);
      expect(res.status).toBe(500);
    });

    it('returns 400 when signature verification fails', async () => {
      mockConstructEvent.mockImplementation(() => {
        throw new Error('Invalid signature');
      });

      const res = await POST(makeRequest('{}', 'bad_sig'));
      expect(res.status).toBe(400);
    });
  });

  describe('checkout.session.completed', () => {
    it('updates user tier and syncs KV', async () => {
      const session = {
        subscription: 'sub_123',
        customer: 'cus_456',
        metadata: { userId: 'user_1' },
      };

      mockConstructEvent.mockReturnValue(makeStripeEvent('checkout.session.completed', session));
      mockSubRetrieve.mockResolvedValue(makeSubscriptionObject());
      mockFindMany.apiKeys.mockResolvedValue([{ keyHash: 'h1', id: 'k1' }]);

      const res = await POST(makeRequest('{}'));
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.received).toBe(true);
      expect(mockSyncUserKeysToKV).toHaveBeenCalled();
    });

    it('falls back to stripeCustomerId lookup when metadata has no userId', async () => {
      const session = {
        subscription: 'sub_123',
        customer: 'cus_456',
        metadata: {},
      };

      mockConstructEvent.mockReturnValue(makeStripeEvent('checkout.session.completed', session));
      mockFindFirst.users.mockResolvedValue({ id: 'user_found' });
      mockSubRetrieve.mockResolvedValue(makeSubscriptionObject());

      const res = await POST(makeRequest('{}'));
      expect(res.status).toBe(200);
      expect(mockFindFirst.users).toHaveBeenCalled();
    });

    it('skips processing when session has no subscription', async () => {
      const session = { customer: 'cus_456', metadata: { userId: 'user_1' } };
      mockConstructEvent.mockReturnValue(makeStripeEvent('checkout.session.completed', session));

      const res = await POST(makeRequest('{}'));
      expect(res.status).toBe(200);
      expect(mockSubRetrieve).not.toHaveBeenCalled();
    });
  });

  describe('customer.subscription.updated', () => {
    it('updates user tier for active subscription', async () => {
      const sub = makeSubscriptionObject({ status: 'active' });
      mockConstructEvent.mockReturnValue(makeStripeEvent('customer.subscription.updated', sub));
      mockFindFirst.subscriptions.mockResolvedValue({ userId: 'user_1' });

      const res = await POST(makeRequest('{}'));
      expect(res.status).toBe(200);
      expect(mockUpdate).toHaveBeenCalled();
    });

    it('downgrades user for canceled status', async () => {
      const sub = makeSubscriptionObject({ status: 'canceled' });
      mockConstructEvent.mockReturnValue(makeStripeEvent('customer.subscription.updated', sub));
      mockFindFirst.subscriptions.mockResolvedValue({ userId: 'user_1' });

      const res = await POST(makeRequest('{}'));
      expect(res.status).toBe(200);
      // downgradeUser sets tier to 'free' and syncs KV
      expect(mockUpdate).toHaveBeenCalled();
    });

    it('falls back to stripeCustomerId lookup', async () => {
      const sub = makeSubscriptionObject();
      mockConstructEvent.mockReturnValue(makeStripeEvent('customer.subscription.updated', sub));
      // First two lookups fail
      mockFindFirst.subscriptions.mockResolvedValue(undefined);
      mockFindFirst.users
        .mockResolvedValueOnce(undefined) // stripeSubscriptionId lookup
        .mockResolvedValueOnce({ id: 'user_fallback' }); // stripeCustomerId lookup

      const res = await POST(makeRequest('{}'));
      expect(res.status).toBe(200);
    });
  });

  describe('customer.subscription.deleted', () => {
    it('marks subscription as canceled and downgrades user', async () => {
      const sub = makeSubscriptionObject();
      mockConstructEvent.mockReturnValue(makeStripeEvent('customer.subscription.deleted', sub));
      mockFindFirst.subscriptions.mockResolvedValue({ userId: 'user_1' });

      const res = await POST(makeRequest('{}'));
      expect(res.status).toBe(200);
      expect(mockUpdate).toHaveBeenCalled();
    });
  });

  describe('invoice.payment_failed', () => {
    it('logs but returns 200', async () => {
      const invoice = { customer: 'cus_456' };
      mockConstructEvent.mockReturnValue(makeStripeEvent('invoice.payment_failed', invoice));

      const res = await POST(makeRequest('{}'));
      expect(res.status).toBe(200);
    });
  });

  describe('customer.deleted', () => {
    it('clears Stripe references and sets user to free tier', async () => {
      const customer = { id: 'cus_456' };
      mockConstructEvent.mockReturnValue(makeStripeEvent('customer.deleted', customer));
      mockFindFirst.users.mockResolvedValue({ id: 'user_1' });

      const res = await POST(makeRequest('{}'));
      expect(res.status).toBe(200);
      expect(mockUpdate).toHaveBeenCalled();
      expect(mockSyncUserKeysToKV).toHaveBeenCalled();
    });
  });

  describe('unknown event', () => {
    it('returns 200 for unhandled event types', async () => {
      mockConstructEvent.mockReturnValue(makeStripeEvent('some.unknown.event', {}));

      const res = await POST(makeRequest('{}'));
      expect(res.status).toBe(200);
    });
  });
});
