import { describe, it, expect, vi, beforeEach } from 'vitest';

// --- Mocks ---

const mockVerify = vi.fn();
vi.mock('svix', () => ({
  Webhook: vi.fn().mockImplementation(function () {
    return { verify: mockVerify };
  }),
}));

const svixHeaders = {
  'svix-id': 'msg_123',
  'svix-timestamp': '1234567890',
  'svix-signature': 'v1,sig',
};

vi.mock('next/headers', () => ({
  headers: vi.fn(async () => ({
    get: vi.fn((name: string) => (svixHeaders as Record<string, string>)[name] ?? null),
  })),
}));

const mockFindFirst = {
  users: vi.fn(),
  apiKeys: vi.fn(),
};
const mockFindMany = { apiKeys: vi.fn() };
const mockInsertTerminal = vi.fn();
const mockUpdateTerminal = vi.fn();
const mockDeleteTerminal = vi.fn();

vi.mock('@/lib/db', () => ({
  db: {
    query: {
      users: { findFirst: (...args: unknown[]) => mockFindFirst.users(...args) },
      apiKeys: { findMany: (...args: unknown[]) => mockFindMany.apiKeys(...args) },
    },
    insert: () => ({
      values: () => ({
        onConflictDoNothing: mockInsertTerminal,
      }),
    }),
    update: () => ({
      set: () => ({
        where: mockUpdateTerminal,
      }),
    }),
    delete: () => ({
      where: mockDeleteTerminal,
    }),
  },
}));

vi.mock('@/lib/db/schema', () => ({
  users: { id: 'id' },
  apiKeys: { userId: 'userId', isActive: 'isActive' },
}));

vi.mock('drizzle-orm', () => ({
  eq: vi.fn((...args: unknown[]) => args),
  and: vi.fn((...args: unknown[]) => args),
}));

const mockRemoveKeyFromKV = vi.fn();
vi.mock('@/lib/kv-sync', () => ({
  removeKeyFromKV: (...args: unknown[]) => mockRemoveKeyFromKV(...args),
}));

const mockStripeSubsCancel = vi.fn();
vi.mock('@/lib/stripe', () => ({
  stripe: {
    subscriptions: { cancel: (...args: unknown[]) => mockStripeSubsCancel(...args) },
  },
}));

import { POST } from './route';

// --- Helpers ---

function makeRequest(body: Record<string, unknown>) {
  return new Request('https://localhost/api/webhooks/clerk', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

function makeUserEvent(type: string, data: Record<string, unknown>) {
  return { type, data };
}

describe('POST /api/webhooks/clerk', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('CLERK_WEBHOOK_SECRET', 'whsec_clerk');

    mockInsertTerminal.mockResolvedValue(undefined);
    mockUpdateTerminal.mockResolvedValue(undefined);
    mockDeleteTerminal.mockResolvedValue(undefined);
    mockRemoveKeyFromKV.mockResolvedValue(undefined);
    mockStripeSubsCancel.mockResolvedValue(undefined);
  });

  describe('signature verification', () => {
    it('returns 400 when svix headers are missing', async () => {
      // Override headers mock to return null for svix headers
      const { headers } = await import('next/headers');
      vi.mocked(headers).mockResolvedValueOnce({
        get: vi.fn(() => null),
      } as never);

      const res = await POST(makeRequest({ type: 'user.created', data: {} }));
      expect(res.status).toBe(400);
    });

    it('returns 400 when signature verification fails', async () => {
      mockVerify.mockImplementation(() => {
        throw new Error('Invalid signature');
      });

      const res = await POST(makeRequest({ type: 'user.created', data: {} }));
      expect(res.status).toBe(400);
    });
  });

  describe('user.created', () => {
    it('inserts new user with primary email', async () => {
      mockVerify.mockReturnValue(
        makeUserEvent('user.created', {
          id: 'user_new',
          primary_email_address_id: 'email_1',
          email_addresses: [
            { id: 'email_1', email_address: 'primary@example.com' },
            { id: 'email_2', email_address: 'other@example.com' },
          ],
        })
      );

      const res = await POST(makeRequest({}));
      expect(res.status).toBe(200);
      expect(mockInsertTerminal).toHaveBeenCalled();
    });

    it('falls back to first email when no primary email', async () => {
      mockVerify.mockReturnValue(
        makeUserEvent('user.created', {
          id: 'user_new',
          primary_email_address_id: 'nonexistent',
          email_addresses: [{ id: 'email_1', email_address: 'first@example.com' }],
        })
      );

      const res = await POST(makeRequest({}));
      expect(res.status).toBe(200);
    });
  });

  describe('user.updated', () => {
    it('updates user email when changed', async () => {
      mockVerify.mockReturnValue(
        makeUserEvent('user.updated', {
          id: 'user_1',
          primary_email_address_id: 'email_1',
          email_addresses: [{ id: 'email_1', email_address: 'newemail@example.com' }],
        })
      );

      const res = await POST(makeRequest({}));
      expect(res.status).toBe(200);
      expect(mockUpdateTerminal).toHaveBeenCalled();
    });
  });

  describe('user.deleted', () => {
    it('cancels Stripe subscription, removes KV keys, and deletes user', async () => {
      mockVerify.mockReturnValue(
        makeUserEvent('user.deleted', { id: 'user_del' })
      );
      mockFindFirst.users.mockResolvedValue({
        id: 'user_del',
        stripeSubscriptionId: 'sub_123',
      });
      mockFindMany.apiKeys.mockResolvedValue([
        { keyHash: 'hash_a' },
        { keyHash: 'hash_b' },
      ]);

      const res = await POST(makeRequest({}));
      expect(res.status).toBe(200);
      expect(mockStripeSubsCancel).toHaveBeenCalledWith('sub_123');
      expect(mockRemoveKeyFromKV).toHaveBeenCalledTimes(2);
      expect(mockDeleteTerminal).toHaveBeenCalled();
    });

    it('handles Stripe cancellation failure gracefully', async () => {
      mockVerify.mockReturnValue(
        makeUserEvent('user.deleted', { id: 'user_del' })
      );
      mockFindFirst.users.mockResolvedValue({
        id: 'user_del',
        stripeSubscriptionId: 'sub_123',
      });
      mockStripeSubsCancel.mockRejectedValue(new Error('Stripe error'));
      mockFindMany.apiKeys.mockResolvedValue([]);

      const res = await POST(makeRequest({}));
      // Should not crash — continues to delete user
      expect(res.status).toBe(200);
      expect(mockDeleteTerminal).toHaveBeenCalled();
    });

    it('does nothing when event data.id is undefined', async () => {
      mockVerify.mockReturnValue(
        makeUserEvent('user.deleted', {})
      );

      const res = await POST(makeRequest({}));
      expect(res.status).toBe(200);
      expect(mockFindFirst.users).not.toHaveBeenCalled();
    });
  });
});
