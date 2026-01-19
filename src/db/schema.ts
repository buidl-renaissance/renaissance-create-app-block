import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// User roles
export type UserRole = 'user' | 'organizer' | 'admin';

// User status enum values
export const USER_STATUSES = ['active', 'inactive', 'banned'] as const;
export type UserStatus = typeof USER_STATUSES[number];

// Users table
export const users = sqliteTable('users', {
  id: text('id').primaryKey(), // UUID
  renaissanceId: text('renaissanceId').unique(), // Renaissance app user ID
  phone: text('phone').unique(), // Primary login method
  email: text('email'), // Optional
  username: text('username'),
  name: text('name'), // Display name
  pfpUrl: text('pfpUrl'), // Profile picture URL
  displayName: text('displayName'), // App-specific name (editable)
  profilePicture: text('profilePicture'), // App-specific profile picture (editable)
  accountAddress: text('accountAddress'), // Wallet address
  pinHash: text('pinHash'), // bcrypt hash of 4-digit PIN
  failedPinAttempts: integer('failedPinAttempts').default(0), // Failed PIN attempts counter
  lockedAt: integer('lockedAt', { mode: 'timestamp' }), // Timestamp when account was locked
  status: text('status').$type<UserStatus>().default('active'), // User status: active, inactive, banned
  role: text('role').$type<UserRole>().default('user').notNull(),
  peopleUserId: integer('peopleUserId'), // Legacy field for People API integration
  createdAt: integer('createdAt', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
});

// ============================================
// App Block Connect Tables
// ============================================

// App Blocks - self-contained applications within Renaissance City
export const appBlocks = sqliteTable('app_blocks', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  ownerUserId: text('owner_user_id').notNull().references(() => users.id),
  serviceAccountId: text('service_account_id'),
  description: text('description'),
  iconUrl: text('icon_url'),
  // Status and progress tracking
  status: text('status').notNull().default('draft'), // draft, active, archived
  blockType: text('block_type'), // creator, community, project, business, game, unsure
  onboardingStage: text('onboarding_stage').default('questions'), // questions, followup, document, connectors, complete
  onboardingData: text('onboarding_data'), // JSON: { summary, processedAnswers, followUpQuestions, followUpAnswers, prd }
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
});

// App Block status type
export type AppBlockStatus = 'draft' | 'active' | 'archived';

// Onboarding stage type
export type OnboardingStage = 'questions' | 'followup' | 'document' | 'connectors' | 'complete';

// Connectors - integrations available for App Blocks (Events, Collab, DJQ, etc.)
export const connectors = sqliteTable('connectors', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  iconUrl: text('icon_url'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
});

// Scopes - define what data/actions are available per connector
export const scopes = sqliteTable('scopes', {
  id: text('id').primaryKey(),
  connectorId: text('connector_id').notNull().references(() => connectors.id),
  name: text('name').notNull(), // e.g., "events.read", "djq.queue.write"
  description: text('description'),
  requiredRole: text('required_role'), // visitor, member, creator, organizer, admin
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
});

// Connector Installations - active connections between App Blocks and Connectors
export const connectorInstallations = sqliteTable('connector_installations', {
  id: text('id').primaryKey(),
  appBlockId: text('app_block_id').notNull().references(() => appBlocks.id),
  connectorId: text('connector_id').notNull().references(() => connectors.id),
  grantedScopes: text('granted_scopes').notNull(), // JSON array of scope IDs
  authType: text('auth_type').notNull(), // "user" | "service"
  status: text('status').notNull().default('active'), // "active" | "expired" | "revoked" | "error"
  lastUsedAt: integer('last_used_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
});

// Service Accounts - identity for non-user-specific App Block access
export const serviceAccounts = sqliteTable('service_accounts', {
  id: text('id').primaryKey(),
  appBlockId: text('app_block_id').notNull().references(() => appBlocks.id).unique(),
  apiKeyHash: text('api_key_hash').notNull(),
  lastRotatedAt: integer('last_rotated_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
});

// Connector Recipes - predefined scope bundles for quick onboarding
export const connectorRecipes = sqliteTable('connector_recipes', {
  id: text('id').primaryKey(),
  connectorId: text('connector_id').notNull().references(() => connectors.id),
  name: text('name').notNull(),
  description: text('description'),
  scopes: text('scopes').notNull(), // JSON array of scope IDs
  uiModules: text('ui_modules'), // JSON array of UI module names
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
});

// Access Tokens - short-lived tokens for API access
export const accessTokens = sqliteTable('access_tokens', {
  id: text('id').primaryKey(),
  token: text('token').notNull().unique(),
  subjectType: text('subject_type').notNull(), // "user" | "service"
  subjectId: text('subject_id').notNull(), // user ID or service account ID
  appBlockId: text('app_block_id').references(() => appBlocks.id),
  scopes: text('scopes').notNull(), // JSON array of granted scope names
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
});

// ============================================
// App Block Registry Tables
// ============================================

// App Block Registry - public index of discoverable App Blocks
export const appBlockRegistry = sqliteTable('app_block_registry', {
  id: text('id').primaryKey(),
  appBlockId: text('app_block_id').notNull().references(() => appBlocks.id).unique(),
  slug: text('slug').notNull().unique(), // URL-friendly identifier
  displayName: text('display_name').notNull(),
  description: text('description'),
  iconUrl: text('icon_url'),
  category: text('category').notNull().default('other'), // events, tools, music, games, community, other
  visibility: text('visibility').notNull().default('private'), // public, unlisted, private
  installable: integer('installable', { mode: 'boolean' }).default(true).notNull(),
  requiresApproval: integer('requires_approval', { mode: 'boolean' }).default(false).notNull(),
  contactEmail: text('contact_email'),
  contactUrl: text('contact_url'),
  tags: text('tags'), // JSON array of tags
  featuredAt: integer('featured_at', { mode: 'timestamp' }), // if featured in registry
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
});

// App Block Providers - blocks that expose APIs for other blocks to consume
export const appBlockProviders = sqliteTable('app_block_providers', {
  id: text('id').primaryKey(),
  appBlockId: text('app_block_id').notNull().references(() => appBlocks.id).unique(),
  baseApiUrl: text('base_api_url').notNull(), // where the provider API listens
  apiVersion: text('api_version').notNull().default('v1'),
  authMethods: text('auth_methods').notNull().default('["user"]'), // JSON array: user, service
  status: text('status').notNull().default('active'), // active, deprecated, disabled
  rateLimitPerMinute: integer('rate_limit_per_minute').default(120),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
});

// Provider Scopes - scopes exposed by a provider for other blocks to request
export const providerScopes = sqliteTable('provider_scopes', {
  id: text('id').primaryKey(),
  providerId: text('provider_id').notNull().references(() => appBlockProviders.id),
  scopeName: text('scope_name').notNull(), // e.g., "djq.queue.read"
  description: text('description'),
  isPublicRead: integer('is_public_read', { mode: 'boolean' }).default(false).notNull(),
  requiredRole: text('required_role'), // visitor, member, creator, organizer, admin
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
});

// App Block Installations - app-to-app connections (consumer installs provider)
export const appBlockInstallations = sqliteTable('app_block_installations', {
  id: text('id').primaryKey(),
  consumerAppBlockId: text('consumer_app_block_id').notNull().references(() => appBlocks.id),
  providerAppBlockId: text('provider_app_block_id').notNull().references(() => appBlocks.id),
  grantedScopes: text('granted_scopes').notNull(), // JSON array of scope names
  authType: text('auth_type').notNull().default('user'), // user, service
  status: text('status').notNull().default('pending'), // pending, active, expired, revoked, error
  approvedAt: integer('approved_at', { mode: 'timestamp' }),
  lastUsedAt: integer('last_used_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
});

// ============================================
// Type Exports for App Block Connect
// ============================================

export type AppBlock = typeof appBlocks.$inferSelect;
export type NewAppBlock = typeof appBlocks.$inferInsert;

export type Connector = typeof connectors.$inferSelect;
export type NewConnector = typeof connectors.$inferInsert;

export type Scope = typeof scopes.$inferSelect;
export type NewScope = typeof scopes.$inferInsert;

export type ConnectorInstallation = typeof connectorInstallations.$inferSelect;
export type NewConnectorInstallation = typeof connectorInstallations.$inferInsert;

export type ServiceAccount = typeof serviceAccounts.$inferSelect;
export type NewServiceAccount = typeof serviceAccounts.$inferInsert;

export type ConnectorRecipe = typeof connectorRecipes.$inferSelect;
export type NewConnectorRecipe = typeof connectorRecipes.$inferInsert;

export type AccessToken = typeof accessTokens.$inferSelect;
export type NewAccessToken = typeof accessTokens.$inferInsert;

export type AppBlockRegistryEntry = typeof appBlockRegistry.$inferSelect;
export type NewAppBlockRegistryEntry = typeof appBlockRegistry.$inferInsert;

export type AppBlockProvider = typeof appBlockProviders.$inferSelect;
export type NewAppBlockProvider = typeof appBlockProviders.$inferInsert;

export type ProviderScope = typeof providerScopes.$inferSelect;
export type NewProviderScope = typeof providerScopes.$inferInsert;

export type AppBlockInstallation = typeof appBlockInstallations.$inferSelect;
export type NewAppBlockInstallation = typeof appBlockInstallations.$inferInsert;

// Role type for permission enforcement
export type Role = 'visitor' | 'member' | 'creator' | 'organizer' | 'admin';

// Installation status type
export type InstallationStatus = 'active' | 'expired' | 'revoked' | 'error';

// Auth type for installations
export type AuthType = 'user' | 'service';

// Registry category type
export type RegistryCategory = 'events' | 'tools' | 'music' | 'games' | 'community' | 'other';

// Registry visibility type
export type RegistryVisibility = 'public' | 'unlisted' | 'private';

// Provider status type
export type ProviderStatus = 'active' | 'deprecated' | 'disabled';

// App Block installation status type
export type AppBlockInstallationStatus = 'pending' | 'active' | 'expired' | 'revoked' | 'error';

// ============================================
// Pending App Blocks Table
// ============================================

// Pending App Blocks - blocks submitted for creation (awaiting admin review/build)
export const pendingAppBlocks = sqliteTable('pending_app_blocks', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  blockName: text('block_name').notNull(),
  blockType: text('block_type').notNull(),
  prdData: text('prd_data').notNull(), // JSON string of ProductRequirementsDocument
  summaryData: text('summary_data'), // JSON string of BlockSummary
  status: text('status').notNull().default('pending'), // pending, approved, rejected, building, completed
  notificationSent: integer('notification_sent', { mode: 'boolean' }).default(false).notNull(),
  adminNotes: text('admin_notes'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
});

export type PendingAppBlock = typeof pendingAppBlocks.$inferSelect;
export type NewPendingAppBlock = typeof pendingAppBlocks.$inferInsert;

// Pending block status type
export type PendingBlockStatus = 'pending' | 'approved' | 'rejected' | 'building' | 'completed';
