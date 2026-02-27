import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the db module
const mockFindFirst = vi.fn();
const mockSelectResult = vi.fn();

vi.mock('@/lib/db', () => ({
  db: {
    query: {
      subscriptions: {
        findFirst: (...args: unknown[]) => mockFindFirst(...args),
      },
    },
    select: () => ({
      from: () => ({
        where: () => mockSelectResult(),
      }),
    }),
  },
}));

// Also mock the schema + drizzle-orm exports so the module loads
vi.mock('@/lib/db/schema', () => ({
  usageLogs: {
    userId: 'userId',
    date: 'date',
    lookupCount: 'lookupCount',
  },
  subscriptions: {
    userId: 'userId',
    status: 'status',
    currentPeriodStart: 'currentPeriodStart',
  },
}));

vi.mock('drizzle-orm', () => ({
  eq: vi.fn((...args: unknown[]) => args),
  and: vi.fn((...args: unknown[]) => args),
  sql: (strings: TemplateStringsArray, ...values: unknown[]) => ({ strings, values }),
  gte: vi.fn((...args: unknown[]) => args),
  inArray: vi.fn((...args: unknown[]) => args),
}));

import { getCurrentMonthUsage, getBillingPeriodStart } from './usage';

describe('getCurrentMonthUsage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns total from query result', async () => {
    mockSelectResult.mockResolvedValue([{ total: 250 }]);
    const result = await getCurrentMonthUsage('user_1', '2026-02-01');
    expect(result).toBe(250);
  });

  it('returns 0 when no usage logs exist', async () => {
    mockSelectResult.mockResolvedValue([{ total: 0 }]);
    const result = await getCurrentMonthUsage('user_1');
    expect(result).toBe(0);
  });

  it('returns 0 when result is empty', async () => {
    mockSelectResult.mockResolvedValue([]);
    const result = await getCurrentMonthUsage('user_1');
    expect(result).toBe(0);
  });
});

describe('getBillingPeriodStart', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns YYYY-MM-DD for user with active subscription', async () => {
    mockFindFirst.mockResolvedValue({
      currentPeriodStart: new Date('2026-02-15T00:00:00Z'),
      status: 'active',
    });
    const result = await getBillingPeriodStart('user_1');
    expect(result).toBe('2026-02-15');
  });

  it('returns null for user with no subscription', async () => {
    mockFindFirst.mockResolvedValue(undefined);
    const result = await getBillingPeriodStart('user_1');
    expect(result).toBeNull();
  });

  it('returns null when currentPeriodStart is missing', async () => {
    mockFindFirst.mockResolvedValue({ currentPeriodStart: null, status: 'active' });
    const result = await getBillingPeriodStart('user_1');
    expect(result).toBeNull();
  });
});
