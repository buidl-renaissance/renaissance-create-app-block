import { sqliteTable, AnySQLiteColumn, uniqueIndex, foreignKey, text, integer } from "drizzle-orm/sqlite-core"
  import { sql } from "drizzle-orm"

export const accessTokens = sqliteTable("access_tokens", {
	id: text().primaryKey().notNull(),
	token: text().notNull(),
	subjectType: text("subject_type").notNull(),
	subjectId: text("subject_id").notNull(),
	appBlockId: text("app_block_id").references(() => appBlocks.id),
	scopes: text().notNull(),
	expiresAt: integer("expires_at").notNull(),
	createdAt: integer("created_at").default(sql`(strftime('%s', 'now'))`).notNull(),
},
(table) => [
	uniqueIndex("access_tokens_token_unique").on(table.token),
]);

export const appBlockInstallations = sqliteTable("app_block_installations", {
	id: text().primaryKey().notNull(),
	consumerAppBlockId: text("consumer_app_block_id").notNull().references(() => appBlocks.id),
	providerAppBlockId: text("provider_app_block_id").notNull().references(() => appBlocks.id),
	grantedScopes: text("granted_scopes").notNull(),
	authType: text("auth_type").default("user").notNull(),
	status: text().default("pending").notNull(),
	approvedAt: integer("approved_at"),
	lastUsedAt: integer("last_used_at"),
	createdAt: integer("created_at").default(sql`(strftime('%s', 'now'))`).notNull(),
});

export const appBlockProviders = sqliteTable("app_block_providers", {
	id: text().primaryKey().notNull(),
	appBlockId: text("app_block_id").notNull().references(() => appBlocks.id),
	baseApiUrl: text("base_api_url").notNull(),
	apiVersion: text("api_version").default("v1").notNull(),
	authMethods: text("auth_methods").default("[\"user\"]").notNull(),
	status: text().default("active").notNull(),
	rateLimitPerMinute: integer("rate_limit_per_minute").default(120),
	createdAt: integer("created_at").default(sql`(strftime('%s', 'now'))`).notNull(),
	updatedAt: integer("updated_at").default(sql`(strftime('%s', 'now'))`).notNull(),
},
(table) => [
	uniqueIndex("app_block_providers_app_block_id_unique").on(table.appBlockId),
]);

export const appBlockRegistry = sqliteTable("app_block_registry", {
	id: text().primaryKey().notNull(),
	appBlockId: text("app_block_id").notNull().references(() => appBlocks.id),
	slug: text().notNull(),
	displayName: text("display_name").notNull(),
	description: text(),
	iconUrl: text("icon_url"),
	category: text().default("other").notNull(),
	visibility: text().default("private").notNull(),
	installable: integer().default(true).notNull(),
	requiresApproval: integer("requires_approval").default(false).notNull(),
	contactEmail: text("contact_email"),
	contactUrl: text("contact_url"),
	tags: text(),
	featuredAt: integer("featured_at"),
	createdAt: integer("created_at").default(sql`(strftime('%s', 'now'))`).notNull(),
	updatedAt: integer("updated_at").default(sql`(strftime('%s', 'now'))`).notNull(),
},
(table) => [
	uniqueIndex("app_block_registry_slug_unique").on(table.slug),
	uniqueIndex("app_block_registry_app_block_id_unique").on(table.appBlockId),
]);

export const appBlocks = sqliteTable("app_blocks", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	ownerUserId: text("owner_user_id").notNull().references(() => users.id),
	serviceAccountId: text("service_account_id"),
	description: text(),
	iconUrl: text("icon_url"),
	status: text().default("draft").notNull(),
	blockType: text("block_type"),
	onboardingStage: text("onboarding_stage").default("questions"),
	onboardingData: text("onboarding_data"),
	githubRepoOwner: text("github_repo_owner"),
	githubRepoName: text("github_repo_name"),
	githubWorkflowFile: text("github_workflow_file"),
	githubBranch: text("github_branch").default("main"),
	createdAt: integer("created_at").default(sql`(strftime('%s', 'now'))`).notNull(),
	updatedAt: integer("updated_at").default(sql`(strftime('%s', 'now'))`).notNull(),
	githubUrl: text("github_url"),
	appUrl: text("app_url"),
	tags: text(),
});

export const connectorInstallations = sqliteTable("connector_installations", {
	id: text().primaryKey().notNull(),
	appBlockId: text("app_block_id").notNull().references(() => appBlocks.id),
	connectorId: text("connector_id").notNull().references(() => connectors.id),
	grantedScopes: text("granted_scopes").notNull(),
	authType: text("auth_type").notNull(),
	status: text().default("active").notNull(),
	lastUsedAt: integer("last_used_at"),
	createdAt: integer("created_at").default(sql`(strftime('%s', 'now'))`).notNull(),
});

export const connectorRecipes = sqliteTable("connector_recipes", {
	id: text().primaryKey().notNull(),
	connectorId: text("connector_id").notNull().references(() => connectors.id),
	name: text().notNull(),
	description: text(),
	scopes: text().notNull(),
	uiModules: text("ui_modules"),
	createdAt: integer("created_at").default(sql`(strftime('%s', 'now'))`).notNull(),
});

export const connectors = sqliteTable("connectors", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
	iconUrl: text("icon_url"),
	isActive: integer("is_active").default(true).notNull(),
	createdAt: integer("created_at").default(sql`(strftime('%s', 'now'))`).notNull(),
});

export const pendingAppBlocks = sqliteTable("pending_app_blocks", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull().references(() => users.id),
	blockName: text("block_name").notNull(),
	blockType: text("block_type").notNull(),
	prdData: text("prd_data").notNull(),
	summaryData: text("summary_data"),
	status: text().default("pending").notNull(),
	notificationSent: integer("notification_sent").default(false).notNull(),
	adminNotes: text("admin_notes"),
	createdAt: integer("created_at").default(sql`(strftime('%s', 'now'))`).notNull(),
	updatedAt: integer("updated_at").default(sql`(strftime('%s', 'now'))`).notNull(),
});

export const providerScopes = sqliteTable("provider_scopes", {
	id: text().primaryKey().notNull(),
	providerId: text("provider_id").notNull().references(() => appBlockProviders.id),
	scopeName: text("scope_name").notNull(),
	description: text(),
	isPublicRead: integer("is_public_read").default(false).notNull(),
	requiredRole: text("required_role"),
	createdAt: integer("created_at").default(sql`(strftime('%s', 'now'))`).notNull(),
});

export const scopes = sqliteTable("scopes", {
	id: text().primaryKey().notNull(),
	connectorId: text("connector_id").notNull().references(() => connectors.id),
	name: text().notNull(),
	description: text(),
	requiredRole: text("required_role"),
	createdAt: integer("created_at").default(sql`(strftime('%s', 'now'))`).notNull(),
});

export const serviceAccounts = sqliteTable("service_accounts", {
	id: text().primaryKey().notNull(),
	appBlockId: text("app_block_id").notNull().references(() => appBlocks.id),
	apiKeyHash: text("api_key_hash").notNull(),
	lastRotatedAt: integer("last_rotated_at"),
	createdAt: integer("created_at").default(sql`(strftime('%s', 'now'))`).notNull(),
},
(table) => [
	uniqueIndex("service_accounts_app_block_id_unique").on(table.appBlockId),
]);

export const users = sqliteTable("users", {
	id: text().primaryKey().notNull(),
	renaissanceId: text(),
	username: text(),
	displayName: text(),
	pfpUrl: text(),
	accountAddress: text(),
	peopleUserId: integer(),
	createdAt: integer().default(sql`(strftime('%s', 'now'))`).notNull(),
	updatedAt: integer().default(sql`(strftime('%s', 'now'))`).notNull(),
	phone: text(),
	email: text(),
	name: text(),
	profilePicture: text(),
	pinHash: text(),
	failedPinAttempts: integer().default(0),
	lockedAt: integer(),
	status: text().default("active"),
	role: text().default("user").notNull(),
},
(table) => [
	uniqueIndex("users_phone_unique").on(table.phone),
	uniqueIndex("users_renaissanceId_unique").on(table.renaissanceId),
]);

export const blockSubmissions = sqliteTable("block_submissions", {
	id: text().primaryKey().notNull(),
	blockName: text("block_name").notNull(),
	submitterName: text("submitter_name").notNull(),
	email: text().notNull(),
	projectDescription: text("project_description").notNull(),
	projectUrl: text("project_url").notNull(),
	iconUrl: text("icon_url"),
	status: text().default("pending").notNull(),
	adminNotes: text("admin_notes"),
	createdAt: integer("created_at").default(sql`(strftime('%s', 'now'))`).notNull(),
	updatedAt: integer("updated_at").default(sql`(strftime('%s', 'now'))`).notNull(),
});

