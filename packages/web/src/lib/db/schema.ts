import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey(), // Clerk user ID
  email: text('email').notNull(),
  tier: text('tier', { enum: ['free', 'starter', 'pro'] })
    .notNull()
    .default('free'),
  stripeCustomerId: text('stripe_customer_id'),
  stripeSubscriptionId: text('stripe_subscription_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const apiKeys = pgTable(
  'api_keys',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    keyHash: text('key_hash').notNull(),
    keyPrefix: text('key_prefix').notNull(), // first 12 chars for display
    name: text('name').notNull().default('Default'),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
  },
  (table) => [
    uniqueIndex('api_keys_key_hash_idx').on(table.keyHash),
    index('api_keys_user_id_idx').on(table.userId),
  ]
);

export const usageLogs = pgTable(
  'usage_logs',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    apiKeyId: text('api_key_id')
      .notNull()
      .references(() => apiKeys.id, { onDelete: 'cascade' }),
    date: text('date').notNull(), // YYYY-MM-DD
    lookupCount: integer('lookup_count').notNull().default(0),
  },
  (table) => [
    uniqueIndex('usage_logs_key_date_idx').on(table.apiKeyId, table.date),
    index('usage_logs_user_id_idx').on(table.userId),
  ]
);

export const subscriptions = pgTable(
  'subscriptions',
  {
    id: text('id').primaryKey(), // Stripe subscription ID
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    stripePriceId: text('stripe_price_id').notNull(),
    status: text('status', {
      enum: [
        'active',
        'canceled',
        'incomplete',
        'incomplete_expired',
        'past_due',
        'trialing',
        'unpaid',
        'paused',
      ],
    }).notNull(),
    currentPeriodStart: timestamp('current_period_start', { withTimezone: true }).notNull(),
    currentPeriodEnd: timestamp('current_period_end', { withTimezone: true }).notNull(),
    cancelAtPeriodEnd: boolean('cancel_at_period_end').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [index('subscriptions_user_id_idx').on(table.userId)]
);
