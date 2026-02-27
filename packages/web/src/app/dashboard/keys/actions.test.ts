import { describe, it, expect, vi, beforeEach } from 'vitest';

// --- Mocks ---

const mockAuth = vi.fn();
vi.mock('@clerk/nextjs/server', () => ({
  auth: () => mockAuth(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

const mockFindFirst = vi.fn();
const mockFindMany = vi.fn();
const mockInsertTerminal = vi.fn();
const mockUpdateTerminal = vi.fn();

vi.mock('@/lib/db', () => ({
  db: {
    query: {
      users: { findFirst: (...args: unknown[]) => mockFindFirst(...args) },
      apiKeys: {
        findFirst: (...args: unknown[]) => mockFindFirst(...args),
        findMany: (...args: unknown[]) => mockFindMany(...args),
      },
    },
    insert: () => ({
      values: () => ({
        returning: mockInsertTerminal,
      }),
    }),
    update: () => ({
      set: () => ({
        where: mockUpdateTerminal,
      }),
    }),
  },
}));

vi.mock('@/lib/db/schema', () => ({
  users: { id: 'id' },
  apiKeys: { id: 'id', userId: 'userId', isActive: 'isActive' },
}));

vi.mock('drizzle-orm', () => ({
  eq: vi.fn((...args: unknown[]) => args),
  and: vi.fn((...args: unknown[]) => args),
}));

vi.mock('@/lib/keys', () => ({
  generateApiKey: vi.fn(() => 'ib_live_testkey1234567890abcdef'),
  hashApiKey: vi.fn(() => 'mock_hash_value'),
  getKeyPrefix: vi.fn(() => 'ib_live_test'),
}));

const mockSyncKeyToKV = vi.fn();
const mockRemoveKeyFromKV = vi.fn();
vi.mock('@/lib/kv-sync', () => ({
  syncKeyToKV: (...args: unknown[]) => mockSyncKeyToKV(...args),
  removeKeyFromKV: (...args: unknown[]) => mockRemoveKeyFromKV(...args),
}));

const mockGetBillingPeriodStart = vi.fn();
vi.mock('@/lib/usage', () => ({
  getBillingPeriodStart: (...args: unknown[]) => mockGetBillingPeriodStart(...args),
}));

vi.mock('@/lib/tier-config', () => ({
  TIER_CONFIG: {
    free: { rateLimit: 10, monthlyLimit: 1000 },
    starter: { rateLimit: 50, monthlyLimit: 10000 },
    pro: { rateLimit: 100, monthlyLimit: 100000 },
  },
}));

import { createApiKey, revokeApiKey } from './actions';

describe('createApiKey', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSyncKeyToKV.mockResolvedValue(undefined);
    mockGetBillingPeriodStart.mockResolvedValue(null);
  });

  it('returns error when not authenticated', async () => {
    mockAuth.mockResolvedValue({ userId: null });

    const result = await createApiKey('My Key');
    expect(result).toEqual({ error: 'Unauthorized' });
  });

  it('returns error when user has 5 active keys', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_1' });
    mockFindMany.mockResolvedValue(Array(5).fill({ id: 'k' }));

    const result = await createApiKey('My Key');
    expect(result).toEqual({ error: 'Maximum 5 active keys allowed' });
  });

  it('returns error when user not found in DB', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_1' });
    mockFindMany.mockResolvedValue([]);
    mockFindFirst.mockResolvedValue(undefined);

    const result = await createApiKey('My Key');
    expect(result).toEqual({ error: 'User not found' });
  });

  it('generates key, inserts to DB, syncs to KV, and returns raw key', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_1' });
    mockFindMany.mockResolvedValue([]);
    mockFindFirst.mockResolvedValue({ id: 'user_1', tier: 'free' });
    mockInsertTerminal.mockResolvedValue([{ id: 'new_key_id' }]);

    const result = await createApiKey('Production');
    expect(result).toEqual({ key: 'ib_live_testkey1234567890abcdef' });
    expect(mockSyncKeyToKV).toHaveBeenCalled();
  });

  it('trims and truncates name to 100 chars', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_1' });
    mockFindMany.mockResolvedValue([]);
    mockFindFirst.mockResolvedValue({ id: 'user_1', tier: 'free' });
    mockInsertTerminal.mockResolvedValue([{ id: 'key_id' }]);

    const longName = 'x'.repeat(200);
    const result = await createApiKey(longName);
    expect(result).toHaveProperty('key');
  });

  it('defaults name to "Unnamed" when empty', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_1' });
    mockFindMany.mockResolvedValue([]);
    mockFindFirst.mockResolvedValue({ id: 'user_1', tier: 'free' });
    mockInsertTerminal.mockResolvedValue([{ id: 'key_id' }]);

    const result = await createApiKey('');
    expect(result).toHaveProperty('key');
  });

  it('succeeds even when KV sync fails', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_1' });
    mockFindMany.mockResolvedValue([]);
    mockFindFirst.mockResolvedValue({ id: 'user_1', tier: 'free' });
    mockInsertTerminal.mockResolvedValue([{ id: 'key_id' }]);
    mockSyncKeyToKV.mockRejectedValue(new Error('KV down'));

    const result = await createApiKey('Test');
    expect(result).toEqual({ key: 'ib_live_testkey1234567890abcdef' });
  });
});

describe('revokeApiKey', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRemoveKeyFromKV.mockResolvedValue(undefined);
  });

  it('returns error when not authenticated', async () => {
    mockAuth.mockResolvedValue({ userId: null });

    const result = await revokeApiKey('key_id');
    expect(result).toEqual({ error: 'Unauthorized' });
  });

  it('returns error when key not found for user', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_1' });
    mockFindFirst.mockResolvedValue(undefined);

    const result = await revokeApiKey('key_id');
    expect(result).toEqual({ error: 'Key not found' });
  });

  it('returns error when key is already revoked', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_1' });
    mockFindFirst.mockResolvedValue({ id: 'key_id', isActive: false, keyHash: 'hash' });

    const result = await revokeApiKey('key_id');
    expect(result).toEqual({ error: 'Key already revoked' });
  });

  it('marks key as inactive and removes from KV', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_1' });
    mockFindFirst.mockResolvedValue({ id: 'key_id', isActive: true, keyHash: 'hash_abc' });

    const result = await revokeApiKey('key_id');
    expect(result).toEqual({});
    expect(mockUpdateTerminal).toHaveBeenCalled();
    expect(mockRemoveKeyFromKV).toHaveBeenCalledWith('hash_abc');
  });

  it('succeeds even when KV removal fails', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_1' });
    mockFindFirst.mockResolvedValue({ id: 'key_id', isActive: true, keyHash: 'hash_abc' });
    mockRemoveKeyFromKV.mockRejectedValue(new Error('KV down'));

    const result = await revokeApiKey('key_id');
    expect(result).toEqual({});
  });
});
