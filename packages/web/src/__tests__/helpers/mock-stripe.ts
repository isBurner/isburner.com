/** Mock Stripe SDK matching the methods used across the codebase. */
export function createMockStripe() {
  return {
    webhooks: {
      constructEvent: vi.fn(),
    },
    subscriptions: {
      retrieve: vi.fn(),
      update: vi.fn(),
      cancel: vi.fn(),
    },
    customers: {
      create: vi.fn(),
    },
    checkout: {
      sessions: { create: vi.fn() },
    },
    billingPortal: {
      sessions: { create: vi.fn() },
    },
  };
}

export type MockStripe = ReturnType<typeof createMockStripe>;
