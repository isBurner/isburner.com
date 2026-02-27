/**
 * Mock Drizzle DB that matches the chained query builder pattern.
 * Each test configures return values via mockResolvedValueOnce().
 */

function chainable(...terminalMethods: string[]) {
  const chain: Record<string, ReturnType<typeof vi.fn>> = {};
  const terminal = vi.fn();

  // Terminal methods return the final result
  for (const method of terminalMethods) {
    chain[method] = terminal;
  }

  // Build the proxy that returns itself for any chained call, terminal for end
  const proxy = new Proxy(terminal, {
    get(_, prop: string) {
      if (prop in chain) return chain[prop];
      // Any non-terminal method returns a function that returns the proxy
      return vi.fn(() => proxy);
    },
    apply(target, thisArg, args) {
      return target.apply(thisArg, args);
    },
  });

  return { proxy, terminal };
}

export function createMockDb() {
  // query.*.findFirst / findMany
  const queryUsers = { findFirst: vi.fn(), findMany: vi.fn() };
  const queryApiKeys = { findFirst: vi.fn(), findMany: vi.fn() };
  const querySubscriptions = { findFirst: vi.fn(), findMany: vi.fn() };
  const queryUsageLogs = { findFirst: vi.fn(), findMany: vi.fn() };

  // Mutation chains — terminal methods vary per operation
  const insertTerminal = vi.fn();
  const updateTerminal = vi.fn();
  const deleteTerminal = vi.fn();
  const selectTerminal = vi.fn();

  const mockDb = {
    query: {
      users: queryUsers,
      apiKeys: queryApiKeys,
      subscriptions: querySubscriptions,
      usageLogs: queryUsageLogs,
    },

    // insert(table).values(data).onConflictDoNothing() / .onConflictDoUpdate(...) / .returning(...)
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        onConflictDoNothing: vi.fn(() => ({ returning: insertTerminal })),
        onConflictDoUpdate: vi.fn(() => ({ returning: insertTerminal })),
        returning: insertTerminal,
      })),
    })),

    // update(table).set(data).where(condition)
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: updateTerminal,
      })),
    })),

    // delete(table).where(condition)
    delete: vi.fn(() => ({
      where: deleteTerminal,
    })),

    // select(fields).from(table).where(condition).groupBy(...).orderBy(...)
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          groupBy: vi.fn(() => ({
            orderBy: selectTerminal,
          })),
        })),
      })),
    })),

    // Expose terminals for configuring return values
    _insertTerminal: insertTerminal,
    _updateTerminal: updateTerminal,
    _deleteTerminal: deleteTerminal,
    _selectTerminal: selectTerminal,
  };

  return mockDb;
}

export type MockDb = ReturnType<typeof createMockDb>;
