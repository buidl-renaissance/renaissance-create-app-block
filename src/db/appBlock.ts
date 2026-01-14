import { eq, and, desc } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { createHash, randomBytes } from 'crypto';
import { getDb } from './drizzle';
import {
  appBlocks,
  connectors,
  scopes,
  connectorInstallations,
  serviceAccounts,
  connectorRecipes,
  accessTokens,
  AppBlock,
  NewAppBlock,
  Connector,
  Scope,
  ConnectorInstallation,
  ServiceAccount,
  ConnectorRecipe,
  AccessToken,
  InstallationStatus,
  AuthType,
} from './schema';

// ============================================
// App Block Operations
// ============================================

export async function createAppBlock(data: {
  name: string;
  ownerUserId: string;
  description?: string;
  iconUrl?: string;
}): Promise<AppBlock> {
  const db = getDb();
  const id = uuidv4();
  
  // Create the app block
  await db.insert(appBlocks).values({
    id,
    name: data.name,
    ownerUserId: data.ownerUserId,
    description: data.description,
    iconUrl: data.iconUrl,
  });
  
  // Create associated service account
  const serviceAccount = await createServiceAccount(id);
  
  // Update app block with service account reference
  await db.update(appBlocks)
    .set({ serviceAccountId: serviceAccount.id })
    .where(eq(appBlocks.id, id));
  
  const [result] = await db.select().from(appBlocks).where(eq(appBlocks.id, id));
  return result;
}

export async function getAppBlockById(id: string): Promise<AppBlock | null> {
  const db = getDb();
  const [result] = await db.select().from(appBlocks).where(eq(appBlocks.id, id));
  return result || null;
}

export async function getAppBlocksByUser(userId: string): Promise<AppBlock[]> {
  const db = getDb();
  return db.select()
    .from(appBlocks)
    .where(eq(appBlocks.ownerUserId, userId))
    .orderBy(desc(appBlocks.createdAt));
}

export async function updateAppBlock(
  id: string,
  data: Partial<Pick<NewAppBlock, 'name' | 'description' | 'iconUrl'>>
): Promise<AppBlock | null> {
  const db = getDb();
  await db.update(appBlocks)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(appBlocks.id, id));
  
  return getAppBlockById(id);
}

export async function deleteAppBlock(id: string): Promise<boolean> {
  const db = getDb();
  
  // Delete associated data first
  await db.delete(connectorInstallations).where(eq(connectorInstallations.appBlockId, id));
  await db.delete(accessTokens).where(eq(accessTokens.appBlockId, id));
  await db.delete(serviceAccounts).where(eq(serviceAccounts.appBlockId, id));
  
  const result = await db.delete(appBlocks).where(eq(appBlocks.id, id));
  return result.rowsAffected > 0;
}

// ============================================
// Connector Operations
// ============================================

export async function getAllConnectors(): Promise<Connector[]> {
  const db = getDb();
  return db.select()
    .from(connectors)
    .where(eq(connectors.isActive, true));
}

export async function getConnectorById(id: string): Promise<Connector | null> {
  const db = getDb();
  const [result] = await db.select().from(connectors).where(eq(connectors.id, id));
  return result || null;
}

export async function getConnectorWithScopes(id: string): Promise<{
  connector: Connector;
  scopes: Scope[];
} | null> {
  const connector = await getConnectorById(id);
  if (!connector) return null;
  
  const db = getDb();
  const connectorScopes = await db.select()
    .from(scopes)
    .where(eq(scopes.connectorId, id));
  
  return { connector, scopes: connectorScopes };
}

export async function getScopesByConnector(connectorId: string): Promise<Scope[]> {
  const db = getDb();
  return db.select()
    .from(scopes)
    .where(eq(scopes.connectorId, connectorId));
}

// ============================================
// Connector Installation Operations
// ============================================

export async function installConnector(data: {
  appBlockId: string;
  connectorId: string;
  grantedScopes: string[];
  authType: AuthType;
}): Promise<ConnectorInstallation> {
  const db = getDb();
  const id = uuidv4();
  
  // Check if already installed
  const existing = await getInstallation(data.appBlockId, data.connectorId);
  if (existing) {
    // Update existing installation
    await db.update(connectorInstallations)
      .set({
        grantedScopes: JSON.stringify(data.grantedScopes),
        authType: data.authType,
        status: 'active',
      })
      .where(eq(connectorInstallations.id, existing.id));
    
    const [updated] = await db.select()
      .from(connectorInstallations)
      .where(eq(connectorInstallations.id, existing.id));
    return updated;
  }
  
  // Create new installation
  await db.insert(connectorInstallations).values({
    id,
    appBlockId: data.appBlockId,
    connectorId: data.connectorId,
    grantedScopes: JSON.stringify(data.grantedScopes),
    authType: data.authType,
    status: 'active',
  });
  
  const [result] = await db.select()
    .from(connectorInstallations)
    .where(eq(connectorInstallations.id, id));
  return result;
}

export async function getInstallation(
  appBlockId: string,
  connectorId: string
): Promise<ConnectorInstallation | null> {
  const db = getDb();
  const [result] = await db.select()
    .from(connectorInstallations)
    .where(and(
      eq(connectorInstallations.appBlockId, appBlockId),
      eq(connectorInstallations.connectorId, connectorId)
    ));
  return result || null;
}

export async function getInstallationById(id: string): Promise<ConnectorInstallation | null> {
  const db = getDb();
  const [result] = await db.select()
    .from(connectorInstallations)
    .where(eq(connectorInstallations.id, id));
  return result || null;
}

export async function getInstallationsByAppBlock(appBlockId: string): Promise<ConnectorInstallation[]> {
  const db = getDb();
  return db.select()
    .from(connectorInstallations)
    .where(eq(connectorInstallations.appBlockId, appBlockId));
}

export async function updateInstallationStatus(
  id: string,
  status: InstallationStatus
): Promise<ConnectorInstallation | null> {
  const db = getDb();
  await db.update(connectorInstallations)
    .set({ status })
    .where(eq(connectorInstallations.id, id));
  
  return getInstallationById(id);
}

export async function updateInstallationLastUsed(id: string): Promise<void> {
  const db = getDb();
  await db.update(connectorInstallations)
    .set({ lastUsedAt: new Date() })
    .where(eq(connectorInstallations.id, id));
}

export async function revokeConnector(installationId: string): Promise<boolean> {
  const db = getDb();
  const result = await db.update(connectorInstallations)
    .set({ status: 'revoked' })
    .where(eq(connectorInstallations.id, installationId));
  return result.rowsAffected > 0;
}

export async function deleteConnectorInstallation(installationId: string): Promise<boolean> {
  const db = getDb();
  const result = await db.delete(connectorInstallations)
    .where(eq(connectorInstallations.id, installationId));
  return result.rowsAffected > 0;
}

// ============================================
// Service Account Operations
// ============================================

function hashApiKey(apiKey: string): string {
  return createHash('sha256').update(apiKey).digest('hex');
}

function generateApiKey(): string {
  return `rc_${randomBytes(32).toString('hex')}`;
}

export async function createServiceAccount(appBlockId: string): Promise<ServiceAccount & { apiKey: string }> {
  const db = getDb();
  const id = uuidv4();
  const apiKey = generateApiKey();
  const apiKeyHash = hashApiKey(apiKey);
  
  await db.insert(serviceAccounts).values({
    id,
    appBlockId,
    apiKeyHash,
  });
  
  const [result] = await db.select()
    .from(serviceAccounts)
    .where(eq(serviceAccounts.id, id));
  
  // Return with the unhashed API key (only time it's available)
  return { ...result, apiKey };
}

export async function getServiceAccountByAppBlock(appBlockId: string): Promise<ServiceAccount | null> {
  const db = getDb();
  const [result] = await db.select()
    .from(serviceAccounts)
    .where(eq(serviceAccounts.appBlockId, appBlockId));
  return result || null;
}

export async function validateServiceAccountKey(apiKey: string): Promise<ServiceAccount | null> {
  const db = getDb();
  const apiKeyHash = hashApiKey(apiKey);
  const [result] = await db.select()
    .from(serviceAccounts)
    .where(eq(serviceAccounts.apiKeyHash, apiKeyHash));
  return result || null;
}

export async function rotateServiceAccountKey(appBlockId: string): Promise<{ apiKey: string } | null> {
  const db = getDb();
  const apiKey = generateApiKey();
  const apiKeyHash = hashApiKey(apiKey);
  
  const result = await db.update(serviceAccounts)
    .set({ apiKeyHash, lastRotatedAt: new Date() })
    .where(eq(serviceAccounts.appBlockId, appBlockId));
  
  if (result.rowsAffected === 0) return null;
  return { apiKey };
}

// ============================================
// Connector Recipe Operations
// ============================================

export async function getRecipesByConnector(connectorId: string): Promise<ConnectorRecipe[]> {
  const db = getDb();
  return db.select()
    .from(connectorRecipes)
    .where(eq(connectorRecipes.connectorId, connectorId));
}

export async function getRecipeById(id: string): Promise<ConnectorRecipe | null> {
  const db = getDb();
  const [result] = await db.select()
    .from(connectorRecipes)
    .where(eq(connectorRecipes.id, id));
  return result || null;
}

// ============================================
// Access Token Operations
// ============================================

function generateToken(): string {
  return `rct_${randomBytes(32).toString('hex')}`;
}

export async function createAccessToken(data: {
  subjectType: 'user' | 'service';
  subjectId: string;
  appBlockId?: string;
  scopes: string[];
  expiresInMinutes?: number;
}): Promise<AccessToken> {
  const db = getDb();
  const id = uuidv4();
  const token = generateToken();
  const expiresInMinutes = data.expiresInMinutes || 60; // Default 1 hour
  const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);
  
  await db.insert(accessTokens).values({
    id,
    token,
    subjectType: data.subjectType,
    subjectId: data.subjectId,
    appBlockId: data.appBlockId,
    scopes: JSON.stringify(data.scopes),
    expiresAt,
  });
  
  const [result] = await db.select()
    .from(accessTokens)
    .where(eq(accessTokens.id, id));
  return result;
}

export async function validateAccessToken(token: string): Promise<{
  valid: boolean;
  accessToken?: AccessToken;
  scopes?: string[];
}> {
  const db = getDb();
  const [result] = await db.select()
    .from(accessTokens)
    .where(eq(accessTokens.token, token));
  
  if (!result) {
    return { valid: false };
  }
  
  // Check if expired
  if (new Date(result.expiresAt) < new Date()) {
    return { valid: false };
  }
  
  return {
    valid: true,
    accessToken: result,
    scopes: JSON.parse(result.scopes),
  };
}

export async function revokeAccessToken(token: string): Promise<boolean> {
  const db = getDb();
  const result = await db.delete(accessTokens)
    .where(eq(accessTokens.token, token));
  return result.rowsAffected > 0;
}

export async function cleanupExpiredTokens(): Promise<number> {
  const db = getDb();
  const result = await db.delete(accessTokens)
    .where(eq(accessTokens.expiresAt, new Date()));
  return result.rowsAffected;
}

// ============================================
// Helper Functions
// ============================================

export function parseScopes(scopesJson: string): string[] {
  try {
    return JSON.parse(scopesJson);
  } catch {
    return [];
  }
}

export function parseUiModules(uiModulesJson: string | null): string[] {
  if (!uiModulesJson) return [];
  try {
    return JSON.parse(uiModulesJson);
  } catch {
    return [];
  }
}

// Get installation with connector details
export async function getInstallationsWithConnectors(appBlockId: string): Promise<Array<{
  installation: ConnectorInstallation;
  connector: Connector;
}>> {
  const installations = await getInstallationsByAppBlock(appBlockId);
  const results: Array<{ installation: ConnectorInstallation; connector: Connector }> = [];
  
  for (const installation of installations) {
    const connector = await getConnectorById(installation.connectorId);
    if (connector) {
      results.push({ installation, connector });
    }
  }
  
  return results;
}
