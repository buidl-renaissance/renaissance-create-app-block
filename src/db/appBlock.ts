import { eq, and, desc, ne } from 'drizzle-orm';
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
  AppBlockStatus,
  OnboardingStage,
  RenAIConfig,
} from './schema';

// ============================================
// App Block Operations
// ============================================

export async function createAppBlock(data: {
  name: string;
  ownerUserId: string;
  description?: string;
  iconUrl?: string;
  gitHubUrl?: string;
  appUrl?: string;
  tags?: string[];
  status?: AppBlockStatus;
  blockType?: string;
  onboardingStage?: OnboardingStage;
  onboardingData?: object;
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
    gitHubUrl: data.gitHubUrl,
    appUrl: data.appUrl,
    tags: data.tags ? JSON.stringify(data.tags) : null,
    status: data.status || 'draft',
    blockType: data.blockType,
    onboardingStage: data.onboardingStage || 'questions',
    onboardingData: data.onboardingData ? JSON.stringify(data.onboardingData) : null,
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

/**
 * Create a draft app block during onboarding
 */
export async function createDraftAppBlock(data: {
  name: string;
  ownerUserId: string;
  blockType: string;
  onboardingData?: object;
}): Promise<AppBlock> {
  return createAppBlock({
    name: data.name,
    ownerUserId: data.ownerUserId,
    blockType: data.blockType,
    status: 'draft',
    onboardingStage: 'questions',
    onboardingData: data.onboardingData,
  });
}

/**
 * Update onboarding progress for a draft block
 */
export async function updateOnboardingProgress(
  id: string,
  data: {
    onboardingStage?: OnboardingStage;
    onboardingData?: object;
    name?: string;
    description?: string;
  }
): Promise<AppBlock | null> {
  const db = getDb();
  
  const updateData: Record<string, unknown> = {
    updatedAt: new Date(),
  };
  
  if (data.onboardingStage) {
    updateData.onboardingStage = data.onboardingStage;
  }
  if (data.onboardingData) {
    updateData.onboardingData = JSON.stringify(data.onboardingData);
  }
  if (data.name) {
    updateData.name = data.name;
  }
  if (data.description) {
    updateData.description = data.description;
  }
  
  await db.update(appBlocks)
    .set(updateData)
    .where(eq(appBlocks.id, id));
  
  return getAppBlockById(id);
}

/**
 * Activate a draft block (mark as complete)
 */
export async function activateAppBlock(id: string): Promise<AppBlock | null> {
  const db = getDb();
  await db.update(appBlocks)
    .set({ 
      status: 'active',
      onboardingStage: 'complete',
      updatedAt: new Date(),
    })
    .where(eq(appBlocks.id, id));
  
  return getAppBlockById(id);
}

/**
 * Get user's draft blocks (in progress)
 */
export async function getDraftBlocksByUser(userId: string): Promise<AppBlock[]> {
  const db = getDb();
  return db.select()
    .from(appBlocks)
    .where(and(
      eq(appBlocks.ownerUserId, userId),
      eq(appBlocks.status, 'draft')
    ))
    .orderBy(desc(appBlocks.updatedAt));
}

/**
 * Get user's active blocks
 */
export async function getActiveBlocksByUser(userId: string): Promise<AppBlock[]> {
  const db = getDb();
  return db.select()
    .from(appBlocks)
    .where(and(
      eq(appBlocks.ownerUserId, userId),
      eq(appBlocks.status, 'active')
    ))
    .orderBy(desc(appBlocks.updatedAt));
}

/**
 * Parse onboarding data from JSON string
 */
export function parseOnboardingData(data: string | null): {
  summary?: {
    name: string;
    tagline: string;
    description: string;
    targetAudience: string;
    coreFeatures: string[];
    nextSteps: string[];
  };
  processedAnswers?: Array<{
    question: string;
    answer: string;
    keyPoints: string[];
  }>;
  followUpQuestions?: Array<{
    id: string;
    question: string;
    context: string;
    type: 'single' | 'multi' | 'open';
    options?: string[];
  }>;
  followUpAnswers?: Record<string, {
    questionId: string;
    question: string;
    answer: string | string[];
    skipped: boolean;
  }>;
  prd?: object;
} | null {
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
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
  data: Partial<Pick<NewAppBlock, 'name' | 'description' | 'iconUrl' | 'gitHubUrl' | 'appUrl'>> & { tags?: string[] }
): Promise<AppBlock | null> {
  const db = getDb();
  const updateData: Record<string, unknown> = { ...data, updatedAt: new Date() };
  
  // Convert tags array to JSON string if provided
  if (data.tags !== undefined) {
    updateData.tags = data.tags ? JSON.stringify(data.tags) : null;
    delete updateData.tags; // Remove from spread
  }
  
  await db.update(appBlocks)
    .set({
      ...data,
      tags: data.tags ? JSON.stringify(data.tags) : undefined,
      updatedAt: new Date(),
    })
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
// Ren.AI Configuration Operations
// ============================================

/**
 * Get Ren.AI configuration for an app block
 */
export async function getRenAIConfig(appBlockId: string): Promise<RenAIConfig | null> {
  const appBlock = await getAppBlockById(appBlockId);
  if (!appBlock) return null;
  
  return {
    repoOwner: appBlock.githubRepoOwner,
    repoName: appBlock.githubRepoName,
    workflowFile: appBlock.githubWorkflowFile,
    branch: appBlock.githubBranch,
  };
}

/**
 * Build repository path from config (for Ren.AI API calls)
 */
export function buildRepositoryPath(config: RenAIConfig): string | null {
  if (!config.repoOwner || !config.repoName) return null;
  return `./repos/${config.repoName}`;
}

/**
 * Update Ren.AI configuration for an app block
 */
export async function updateRenAIConfig(
  appBlockId: string,
  config: Partial<RenAIConfig>
): Promise<AppBlock | null> {
  const db = getDb();
  
  const updateData: Record<string, unknown> = {
    updatedAt: new Date(),
  };
  
  if (config.repoOwner !== undefined) {
    updateData.githubRepoOwner = config.repoOwner;
  }
  if (config.repoName !== undefined) {
    updateData.githubRepoName = config.repoName;
  }
  if (config.workflowFile !== undefined) {
    updateData.githubWorkflowFile = config.workflowFile;
  }
  if (config.branch !== undefined) {
    updateData.githubBranch = config.branch;
  }
  
  await db.update(appBlocks)
    .set(updateData)
    .where(eq(appBlocks.id, appBlockId));
  
  return getAppBlockById(appBlockId);
}

/**
 * Check if an app block has Ren.AI configured
 */
export function hasRenAIConfigured(appBlock: AppBlock): boolean {
  return !!appBlock.githubRepoOwner && !!appBlock.githubRepoName;
}

// ============================================
// Helper Functions
// ============================================

export function parseTags(tagsJson: string | null): string[] {
  if (!tagsJson) return [];
  try {
    return JSON.parse(tagsJson);
  } catch {
    return [];
  }
}

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
