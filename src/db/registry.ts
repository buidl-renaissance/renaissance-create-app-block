import { eq, and, or, like, desc, inArray } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from './drizzle';
import {
  appBlocks,
  appBlockRegistry,
  appBlockProviders,
  providerScopes,
  appBlockInstallations,
  AppBlockRegistryEntry,
  NewAppBlockRegistryEntry,
  AppBlockProvider,
  NewAppBlockProvider,
  ProviderScope,
  NewProviderScope,
  AppBlockInstallation,
  NewAppBlockInstallation,
  RegistryCategory,
  RegistryVisibility,
  ProviderStatus,
  AppBlockInstallationStatus,
} from './schema';

// ============================================
// Registry Operations
// ============================================

export async function publishToRegistry(data: {
  appBlockId: string;
  slug: string;
  displayName: string;
  description?: string;
  iconUrl?: string;
  category?: RegistryCategory;
  visibility?: RegistryVisibility;
  installable?: boolean;
  requiresApproval?: boolean;
  contactEmail?: string;
  contactUrl?: string;
  tags?: string[];
}): Promise<AppBlockRegistryEntry> {
  const db = getDb();
  const id = uuidv4();

  await db.insert(appBlockRegistry).values({
    id,
    appBlockId: data.appBlockId,
    slug: data.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
    displayName: data.displayName,
    description: data.description,
    iconUrl: data.iconUrl,
    category: data.category || 'other',
    visibility: data.visibility || 'private',
    installable: data.installable ?? true,
    requiresApproval: data.requiresApproval ?? false,
    contactEmail: data.contactEmail,
    contactUrl: data.contactUrl,
    tags: data.tags ? JSON.stringify(data.tags) : null,
  });

  const [result] = await db.select().from(appBlockRegistry).where(eq(appBlockRegistry.id, id));
  return result;
}

export async function updateRegistryEntry(
  appBlockId: string,
  data: Partial<{
    slug: string;
    displayName: string;
    description: string;
    iconUrl: string;
    category: RegistryCategory;
    visibility: RegistryVisibility;
    installable: boolean;
    requiresApproval: boolean;
    contactEmail: string;
    contactUrl: string;
    tags: string[];
  }>
): Promise<AppBlockRegistryEntry | null> {
  const db = getDb();

  const updateData: Record<string, unknown> = { updatedAt: new Date() };

  if (data.slug !== undefined) {
    updateData.slug = data.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-');
  }
  if (data.displayName !== undefined) updateData.displayName = data.displayName;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.iconUrl !== undefined) updateData.iconUrl = data.iconUrl;
  if (data.category !== undefined) updateData.category = data.category;
  if (data.visibility !== undefined) updateData.visibility = data.visibility;
  if (data.installable !== undefined) updateData.installable = data.installable;
  if (data.requiresApproval !== undefined) updateData.requiresApproval = data.requiresApproval;
  if (data.contactEmail !== undefined) updateData.contactEmail = data.contactEmail;
  if (data.contactUrl !== undefined) updateData.contactUrl = data.contactUrl;
  if (data.tags !== undefined) updateData.tags = JSON.stringify(data.tags);

  await db.update(appBlockRegistry)
    .set(updateData)
    .where(eq(appBlockRegistry.appBlockId, appBlockId));

  return getRegistryEntryByAppBlockId(appBlockId);
}

export async function getRegistryEntryBySlug(slug: string): Promise<AppBlockRegistryEntry | null> {
  const db = getDb();
  const [result] = await db.select()
    .from(appBlockRegistry)
    .where(eq(appBlockRegistry.slug, slug.toLowerCase()));
  return result || null;
}

export async function getRegistryEntryByAppBlockId(appBlockId: string): Promise<AppBlockRegistryEntry | null> {
  const db = getDb();
  const [result] = await db.select()
    .from(appBlockRegistry)
    .where(eq(appBlockRegistry.appBlockId, appBlockId));
  return result || null;
}

export async function getRegistryEntryById(id: string): Promise<AppBlockRegistryEntry | null> {
  const db = getDb();
  const [result] = await db.select()
    .from(appBlockRegistry)
    .where(eq(appBlockRegistry.id, id));
  return result || null;
}

export interface BrowseRegistryOptions {
  category?: RegistryCategory;
  query?: string;
  tags?: string[];
  visibility?: RegistryVisibility | RegistryVisibility[];
  installableOnly?: boolean;
  limit?: number;
  offset?: number;
}

export async function browseRegistry(options: BrowseRegistryOptions = {}): Promise<{
  entries: AppBlockRegistryEntry[];
  total: number;
}> {
  const db = getDb();
  const {
    category,
    query,
    tags,
    visibility = 'public',
    installableOnly = false,
    limit = 20,
    offset = 0,
  } = options;

  // Build conditions
  const conditions = [];

  // Visibility filter
  if (Array.isArray(visibility)) {
    conditions.push(inArray(appBlockRegistry.visibility, visibility));
  } else {
    conditions.push(eq(appBlockRegistry.visibility, visibility));
  }

  // Category filter
  if (category) {
    conditions.push(eq(appBlockRegistry.category, category));
  }

  // Installable filter
  if (installableOnly) {
    conditions.push(eq(appBlockRegistry.installable, true));
  }

  // Search query (searches display name and description)
  if (query) {
    conditions.push(
      or(
        like(appBlockRegistry.displayName, `%${query}%`),
        like(appBlockRegistry.description, `%${query}%`),
        like(appBlockRegistry.slug, `%${query}%`)
      )
    );
  }

  // Get entries
  let queryBuilder = db.select()
    .from(appBlockRegistry)
    .orderBy(desc(appBlockRegistry.featuredAt), desc(appBlockRegistry.createdAt));

  if (conditions.length > 0) {
    queryBuilder = queryBuilder.where(and(...conditions)) as typeof queryBuilder;
  }

  const entries = await queryBuilder.limit(limit).offset(offset);

  // Filter by tags in memory (SQLite doesn't have good JSON array search)
  let filteredEntries = entries;
  if (tags && tags.length > 0) {
    filteredEntries = entries.filter(entry => {
      if (!entry.tags) return false;
      try {
        const entryTags = JSON.parse(entry.tags) as string[];
        return tags.some(tag => entryTags.includes(tag));
      } catch {
        return false;
      }
    });
  }

  // Get total count
  const allEntries = await db.select()
    .from(appBlockRegistry)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  return {
    entries: filteredEntries,
    total: allEntries.length,
  };
}

export async function deleteRegistryEntry(appBlockId: string): Promise<boolean> {
  const db = getDb();
  const result = await db.delete(appBlockRegistry)
    .where(eq(appBlockRegistry.appBlockId, appBlockId));
  return result.rowsAffected > 0;
}

// ============================================
// Provider Operations
// ============================================

export async function createProvider(data: {
  appBlockId: string;
  baseApiUrl: string;
  apiVersion?: string;
  authMethods?: ('user' | 'service')[];
  rateLimitPerMinute?: number;
}): Promise<AppBlockProvider> {
  const db = getDb();
  const id = uuidv4();

  await db.insert(appBlockProviders).values({
    id,
    appBlockId: data.appBlockId,
    baseApiUrl: data.baseApiUrl,
    apiVersion: data.apiVersion || 'v1',
    authMethods: JSON.stringify(data.authMethods || ['user']),
    rateLimitPerMinute: data.rateLimitPerMinute || 120,
    status: 'active',
  });

  const [result] = await db.select().from(appBlockProviders).where(eq(appBlockProviders.id, id));
  return result;
}

export async function updateProvider(
  appBlockId: string,
  data: Partial<{
    baseApiUrl: string;
    apiVersion: string;
    authMethods: ('user' | 'service')[];
    status: ProviderStatus;
    rateLimitPerMinute: number;
  }>
): Promise<AppBlockProvider | null> {
  const db = getDb();

  const updateData: Record<string, unknown> = { updatedAt: new Date() };

  if (data.baseApiUrl !== undefined) updateData.baseApiUrl = data.baseApiUrl;
  if (data.apiVersion !== undefined) updateData.apiVersion = data.apiVersion;
  if (data.authMethods !== undefined) updateData.authMethods = JSON.stringify(data.authMethods);
  if (data.status !== undefined) updateData.status = data.status;
  if (data.rateLimitPerMinute !== undefined) updateData.rateLimitPerMinute = data.rateLimitPerMinute;

  await db.update(appBlockProviders)
    .set(updateData)
    .where(eq(appBlockProviders.appBlockId, appBlockId));

  return getProviderByAppBlockId(appBlockId);
}

export async function getProviderByAppBlockId(appBlockId: string): Promise<AppBlockProvider | null> {
  const db = getDb();
  const [result] = await db.select()
    .from(appBlockProviders)
    .where(eq(appBlockProviders.appBlockId, appBlockId));
  return result || null;
}

export async function getProviderById(id: string): Promise<AppBlockProvider | null> {
  const db = getDb();
  const [result] = await db.select()
    .from(appBlockProviders)
    .where(eq(appBlockProviders.id, id));
  return result || null;
}

export async function deleteProvider(appBlockId: string): Promise<boolean> {
  const db = getDb();
  
  // First get the provider to delete its scopes
  const provider = await getProviderByAppBlockId(appBlockId);
  if (provider) {
    await db.delete(providerScopes).where(eq(providerScopes.providerId, provider.id));
  }
  
  const result = await db.delete(appBlockProviders)
    .where(eq(appBlockProviders.appBlockId, appBlockId));
  return result.rowsAffected > 0;
}

// ============================================
// Provider Scope Operations
// ============================================

export async function addProviderScope(data: {
  providerId: string;
  scopeName: string;
  description?: string;
  isPublicRead?: boolean;
  requiredRole?: string;
}): Promise<ProviderScope> {
  const db = getDb();
  const id = uuidv4();

  await db.insert(providerScopes).values({
    id,
    providerId: data.providerId,
    scopeName: data.scopeName,
    description: data.description,
    isPublicRead: data.isPublicRead ?? false,
    requiredRole: data.requiredRole,
  });

  const [result] = await db.select().from(providerScopes).where(eq(providerScopes.id, id));
  return result;
}

export async function getProviderScopes(providerId: string): Promise<ProviderScope[]> {
  const db = getDb();
  return db.select()
    .from(providerScopes)
    .where(eq(providerScopes.providerId, providerId));
}

export async function deleteProviderScope(scopeId: string): Promise<boolean> {
  const db = getDb();
  const result = await db.delete(providerScopes)
    .where(eq(providerScopes.id, scopeId));
  return result.rowsAffected > 0;
}

export async function updateProviderScopes(
  providerId: string,
  scopes: Array<{
    scopeName: string;
    description?: string;
    isPublicRead?: boolean;
    requiredRole?: string;
  }>
): Promise<ProviderScope[]> {
  const db = getDb();

  // Delete existing scopes
  await db.delete(providerScopes).where(eq(providerScopes.providerId, providerId));

  // Add new scopes
  const results: ProviderScope[] = [];
  for (const scope of scopes) {
    const newScope = await addProviderScope({
      providerId,
      ...scope,
    });
    results.push(newScope);
  }

  return results;
}

// ============================================
// Provider Manifest
// ============================================

export interface ProviderManifest {
  app_block_id: string;
  api_version: string;
  base_api_url: string;
  supported_scopes: Array<{
    name: string;
    description: string | null;
    is_public_read: boolean;
    required_role: string | null;
  }>;
  auth_methods: string[];
  rate_limits: {
    per_minute: number;
  };
  status: string;
}

export async function getProviderManifest(appBlockId: string): Promise<ProviderManifest | null> {
  const provider = await getProviderByAppBlockId(appBlockId);
  if (!provider) return null;

  const scopes = await getProviderScopes(provider.id);

  return {
    app_block_id: provider.appBlockId,
    api_version: provider.apiVersion,
    base_api_url: provider.baseApiUrl,
    supported_scopes: scopes.map(s => ({
      name: s.scopeName,
      description: s.description,
      is_public_read: s.isPublicRead,
      required_role: s.requiredRole,
    })),
    auth_methods: JSON.parse(provider.authMethods),
    rate_limits: {
      per_minute: provider.rateLimitPerMinute || 120,
    },
    status: provider.status,
  };
}

// ============================================
// App Block Installation Operations (App-to-App)
// ============================================

export async function installAppBlock(data: {
  consumerAppBlockId: string;
  providerAppBlockId: string;
  grantedScopes: string[];
  authType?: 'user' | 'service';
}): Promise<AppBlockInstallation> {
  const db = getDb();
  const id = uuidv4();

  // Check if provider requires approval
  const registryEntry = await getRegistryEntryByAppBlockId(data.providerAppBlockId);
  const requiresApproval = registryEntry?.requiresApproval ?? false;

  await db.insert(appBlockInstallations).values({
    id,
    consumerAppBlockId: data.consumerAppBlockId,
    providerAppBlockId: data.providerAppBlockId,
    grantedScopes: JSON.stringify(data.grantedScopes),
    authType: data.authType || 'user',
    status: requiresApproval ? 'pending' : 'active',
    approvedAt: requiresApproval ? null : new Date(),
  });

  const [result] = await db.select().from(appBlockInstallations).where(eq(appBlockInstallations.id, id));
  return result;
}

export async function getAppBlockInstallation(
  consumerAppBlockId: string,
  providerAppBlockId: string
): Promise<AppBlockInstallation | null> {
  const db = getDb();
  const [result] = await db.select()
    .from(appBlockInstallations)
    .where(and(
      eq(appBlockInstallations.consumerAppBlockId, consumerAppBlockId),
      eq(appBlockInstallations.providerAppBlockId, providerAppBlockId)
    ));
  return result || null;
}

export async function getAppBlockInstallationById(id: string): Promise<AppBlockInstallation | null> {
  const db = getDb();
  const [result] = await db.select()
    .from(appBlockInstallations)
    .where(eq(appBlockInstallations.id, id));
  return result || null;
}

export async function getAppBlockInstallationsByConsumer(consumerAppBlockId: string): Promise<AppBlockInstallation[]> {
  const db = getDb();
  return db.select()
    .from(appBlockInstallations)
    .where(eq(appBlockInstallations.consumerAppBlockId, consumerAppBlockId));
}

export async function getAppBlockInstallationsByProvider(providerAppBlockId: string): Promise<AppBlockInstallation[]> {
  const db = getDb();
  return db.select()
    .from(appBlockInstallations)
    .where(eq(appBlockInstallations.providerAppBlockId, providerAppBlockId));
}

export async function updateAppBlockInstallationStatus(
  id: string,
  status: AppBlockInstallationStatus
): Promise<AppBlockInstallation | null> {
  const db = getDb();

  const updateData: Record<string, unknown> = { status };
  if (status === 'active') {
    updateData.approvedAt = new Date();
  }

  await db.update(appBlockInstallations)
    .set(updateData)
    .where(eq(appBlockInstallations.id, id));

  return getAppBlockInstallationById(id);
}

export async function updateAppBlockInstallationLastUsed(id: string): Promise<void> {
  const db = getDb();
  await db.update(appBlockInstallations)
    .set({ lastUsedAt: new Date() })
    .where(eq(appBlockInstallations.id, id));
}

export async function revokeAppBlockInstallation(id: string): Promise<boolean> {
  const db = getDb();
  const result = await db.update(appBlockInstallations)
    .set({ status: 'revoked' })
    .where(eq(appBlockInstallations.id, id));
  return result.rowsAffected > 0;
}

export async function deleteAppBlockInstallation(id: string): Promise<boolean> {
  const db = getDb();
  const result = await db.delete(appBlockInstallations)
    .where(eq(appBlockInstallations.id, id));
  return result.rowsAffected > 0;
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

export function parseAuthMethods(authMethodsJson: string): ('user' | 'service')[] {
  try {
    return JSON.parse(authMethodsJson);
  } catch {
    return ['user'];
  }
}

export function parseGrantedScopes(scopesJson: string): string[] {
  try {
    return JSON.parse(scopesJson);
  } catch {
    return [];
  }
}

// Get registry entry with app block details
export async function getRegistryEntryWithDetails(slug: string): Promise<{
  entry: AppBlockRegistryEntry;
  provider: AppBlockProvider | null;
  scopes: ProviderScope[];
} | null> {
  const entry = await getRegistryEntryBySlug(slug);
  if (!entry) return null;

  const provider = await getProviderByAppBlockId(entry.appBlockId);
  const scopes = provider ? await getProviderScopes(provider.id) : [];

  return { entry, provider, scopes };
}

// Get installations with provider details
export async function getInstallationsWithProviderDetails(consumerAppBlockId: string): Promise<Array<{
  installation: AppBlockInstallation;
  provider: AppBlockProvider | null;
  registryEntry: AppBlockRegistryEntry | null;
}>> {
  const installations = await getAppBlockInstallationsByConsumer(consumerAppBlockId);
  const results = [];

  for (const installation of installations) {
    const provider = await getProviderByAppBlockId(installation.providerAppBlockId);
    const registryEntry = await getRegistryEntryByAppBlockId(installation.providerAppBlockId);
    results.push({ installation, provider, registryEntry });
  }

  return results;
}
