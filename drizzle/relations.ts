import { relations } from "drizzle-orm/relations";
import { appBlocks, accessTokens, appBlockInstallations, appBlockProviders, appBlockRegistry, users, connectors, connectorInstallations, connectorRecipes, pendingAppBlocks, providerScopes, scopes, serviceAccounts } from "./schema";

export const accessTokensRelations = relations(accessTokens, ({one}) => ({
	appBlock: one(appBlocks, {
		fields: [accessTokens.appBlockId],
		references: [appBlocks.id]
	}),
}));

export const appBlocksRelations = relations(appBlocks, ({one, many}) => ({
	accessTokens: many(accessTokens),
	appBlockInstallations_providerAppBlockId: many(appBlockInstallations, {
		relationName: "appBlockInstallations_providerAppBlockId_appBlocks_id"
	}),
	appBlockInstallations_consumerAppBlockId: many(appBlockInstallations, {
		relationName: "appBlockInstallations_consumerAppBlockId_appBlocks_id"
	}),
	appBlockProviders: many(appBlockProviders),
	appBlockRegistries: many(appBlockRegistry),
	user: one(users, {
		fields: [appBlocks.ownerUserId],
		references: [users.id]
	}),
	connectorInstallations: many(connectorInstallations),
	serviceAccounts: many(serviceAccounts),
}));

export const appBlockInstallationsRelations = relations(appBlockInstallations, ({one}) => ({
	appBlock_providerAppBlockId: one(appBlocks, {
		fields: [appBlockInstallations.providerAppBlockId],
		references: [appBlocks.id],
		relationName: "appBlockInstallations_providerAppBlockId_appBlocks_id"
	}),
	appBlock_consumerAppBlockId: one(appBlocks, {
		fields: [appBlockInstallations.consumerAppBlockId],
		references: [appBlocks.id],
		relationName: "appBlockInstallations_consumerAppBlockId_appBlocks_id"
	}),
}));

export const appBlockProvidersRelations = relations(appBlockProviders, ({one, many}) => ({
	appBlock: one(appBlocks, {
		fields: [appBlockProviders.appBlockId],
		references: [appBlocks.id]
	}),
	providerScopes: many(providerScopes),
}));

export const appBlockRegistryRelations = relations(appBlockRegistry, ({one}) => ({
	appBlock: one(appBlocks, {
		fields: [appBlockRegistry.appBlockId],
		references: [appBlocks.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	appBlocks: many(appBlocks),
	pendingAppBlocks: many(pendingAppBlocks),
}));

export const connectorInstallationsRelations = relations(connectorInstallations, ({one}) => ({
	connector: one(connectors, {
		fields: [connectorInstallations.connectorId],
		references: [connectors.id]
	}),
	appBlock: one(appBlocks, {
		fields: [connectorInstallations.appBlockId],
		references: [appBlocks.id]
	}),
}));

export const connectorsRelations = relations(connectors, ({many}) => ({
	connectorInstallations: many(connectorInstallations),
	connectorRecipes: many(connectorRecipes),
	scopes: many(scopes),
}));

export const connectorRecipesRelations = relations(connectorRecipes, ({one}) => ({
	connector: one(connectors, {
		fields: [connectorRecipes.connectorId],
		references: [connectors.id]
	}),
}));

export const pendingAppBlocksRelations = relations(pendingAppBlocks, ({one}) => ({
	user: one(users, {
		fields: [pendingAppBlocks.userId],
		references: [users.id]
	}),
}));

export const providerScopesRelations = relations(providerScopes, ({one}) => ({
	appBlockProvider: one(appBlockProviders, {
		fields: [providerScopes.providerId],
		references: [appBlockProviders.id]
	}),
}));

export const scopesRelations = relations(scopes, ({one}) => ({
	connector: one(connectors, {
		fields: [scopes.connectorId],
		references: [connectors.id]
	}),
}));

export const serviceAccountsRelations = relations(serviceAccounts, ({one}) => ({
	appBlock: one(appBlocks, {
		fields: [serviceAccounts.appBlockId],
		references: [appBlocks.id]
	}),
}));