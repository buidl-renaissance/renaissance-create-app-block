import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { useUser } from './UserContext';

// Types matching the schema
export interface AppBlock {
  id: string;
  name: string;
  ownerUserId: string;
  serviceAccountId: string | null;
  description: string | null;
  iconUrl: string | null;
  status: string;
  blockType: string | null;
  onboardingStage: string | null;
  onboardingData: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Connector {
  id: string;
  name: string;
  description: string | null;
  iconUrl: string | null;
  isActive: boolean;
  createdAt: Date;
}

export interface Scope {
  id: string;
  connectorId: string;
  name: string;
  description: string | null;
  requiredRole: string | null;
  createdAt: Date;
}

export interface ConnectorInstallation {
  id: string;
  appBlockId: string;
  connectorId: string;
  grantedScopes: string;
  authType: 'user' | 'service';
  status: 'active' | 'expired' | 'revoked' | 'error';
  lastUsedAt: Date | null;
  createdAt: Date;
}

export interface ConnectorRecipe {
  id: string;
  connectorId: string;
  name: string;
  description: string | null;
  scopes: string;
  uiModules: string | null;
  createdAt: Date;
}

export interface ConnectorWithDetails extends Connector {
  scopes: Scope[];
  recipes: ConnectorRecipe[];
}

export interface InstallationWithConnector {
  installation: ConnectorInstallation;
  connector: Connector;
}

export interface AppBlockWithInstallations extends AppBlock {
  installations: InstallationWithConnector[];
  hasServiceAccount: boolean;
  // Explicitly include registration fields (inherited from AppBlock but needed for TypeScript)
  gitHubUrl?: string | null;
  appUrl?: string | null;
  tags?: string | null;
}

// Registry Types
export type RegistryCategory = 'events' | 'tools' | 'music' | 'games' | 'community' | 'other';
export type RegistryVisibility = 'public' | 'unlisted' | 'private';

export interface RegistryEntry {
  id: string;
  appBlockId: string;
  slug: string;
  displayName: string;
  description: string | null;
  iconUrl: string | null;
  category: RegistryCategory;
  visibility: RegistryVisibility;
  installable: boolean;
  requiresApproval: boolean;
  contactEmail: string | null;
  contactUrl: string | null;
  tags: string | null;
  tags_parsed: string[];
  featuredAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface RegistryEntryWithProvider extends RegistryEntry {
  provider: {
    api_version: string;
    base_api_url: string;
    auth_methods: string[];
    rate_limit_per_minute: number;
    status: string;
    scopes: Array<{
      name: string;
      description: string | null;
      is_public_read: boolean;
      required_role: string | null;
    }>;
  } | null;
}

export interface ProviderConfig {
  id: string;
  appBlockId: string;
  baseApiUrl: string;
  apiVersion: string;
  authMethods: string;
  auth_methods_parsed: string[];
  status: string;
  rateLimitPerMinute: number;
  scopes: Array<{
    id: string;
    scope_name: string;
    description: string | null;
    is_public_read: boolean;
    required_role: string | null;
  }>;
}

export interface AppBlockInstallation {
  id: string;
  consumerAppBlockId: string;
  providerAppBlockId: string;
  grantedScopes: string;
  granted_scopes_parsed: string[];
  authType: 'user' | 'service';
  status: 'pending' | 'active' | 'expired' | 'revoked' | 'error';
  approvedAt: Date | null;
  lastUsedAt: Date | null;
  createdAt: Date;
  provider?: {
    registry?: {
      slug: string;
      display_name: string;
      description: string | null;
      icon_url: string | null;
      category: string;
    } | null;
    api_version: string;
    base_api_url: string;
  } | null;
}

export interface BrowseRegistryOptions {
  category?: RegistryCategory;
  query?: string;
  tags?: string[];
  visibility?: RegistryVisibility;
  installable?: boolean;
  page?: number;
  limit?: number;
}

interface AppBlockContextType {
  // App Blocks state
  appBlocks: AppBlock[];
  currentAppBlock: AppBlockWithInstallations | null;
  isLoading: boolean;
  error: string | null;
  
  // Connectors state
  connectors: ConnectorWithDetails[];
  connectorsLoading: boolean;
  
  // Registry state
  registryEntries: RegistryEntry[];
  registryLoading: boolean;
  registryTotal: number;
  
  // Actions
  fetchAppBlocks: (showLoading?: boolean) => Promise<void>;
  fetchAppBlock: (id: string) => Promise<AppBlockWithInstallations | null>;
  createAppBlock: (data: { name: string; description?: string; iconUrl?: string }) => Promise<AppBlock | null>;
  updateAppBlock: (id: string, data: { name?: string; description?: string; iconUrl?: string }) => Promise<AppBlock | null>;
  deleteAppBlock: (id: string) => Promise<boolean>;
  setCurrentAppBlock: (appBlock: AppBlockWithInstallations | null) => void;
  
  // Connector actions
  fetchConnectors: () => Promise<void>;
  fetchConnector: (id: string) => Promise<ConnectorWithDetails | null>;
  installConnector: (appBlockId: string, connectorId: string, scopes: string[], authType?: 'user' | 'service') => Promise<ConnectorInstallation | null>;
  revokeConnector: (installationId: string) => Promise<boolean>;
  
  // Token actions
  getAccessToken: (appBlockId: string, scopes?: string[]) => Promise<string | null>;
  
  // Registry actions
  browseRegistry: (options?: BrowseRegistryOptions) => Promise<void>;
  getRegistryEntry: (slug: string) => Promise<RegistryEntryWithProvider | null>;
  publishToRegistry: (appBlockId: string, data: {
    slug: string;
    display_name: string;
    description?: string;
    icon_url?: string;
    category?: RegistryCategory;
    visibility?: RegistryVisibility;
    installable?: boolean;
    requires_approval?: boolean;
    contact_email?: string;
    contact_url?: string;
    tags?: string[];
  }) => Promise<RegistryEntry | null>;
  updateRegistryEntry: (appBlockId: string, data: Partial<{
    slug: string;
    display_name: string;
    description: string;
    icon_url: string;
    category: RegistryCategory;
    visibility: RegistryVisibility;
    installable: boolean;
    requires_approval: boolean;
    contact_email: string;
    contact_url: string;
    tags: string[];
  }>) => Promise<RegistryEntry | null>;
  unpublishFromRegistry: (appBlockId: string) => Promise<boolean>;
  
  // Provider actions
  getProvider: (appBlockId: string) => Promise<ProviderConfig | null>;
  createProvider: (appBlockId: string, data: {
    base_api_url: string;
    api_version?: string;
    auth_methods?: ('user' | 'service')[];
    rate_limit_per_minute?: number;
    scopes?: Array<{
      scope_name: string;
      description?: string;
      is_public_read?: boolean;
      required_role?: string;
    }>;
  }) => Promise<ProviderConfig | null>;
  updateProvider: (appBlockId: string, data: Partial<{
    base_api_url: string;
    api_version: string;
    auth_methods: ('user' | 'service')[];
    status: string;
    rate_limit_per_minute: number;
    scopes: Array<{
      scope_name: string;
      description?: string;
      is_public_read?: boolean;
      required_role?: string;
    }>;
  }>) => Promise<ProviderConfig | null>;
  deleteProvider: (appBlockId: string) => Promise<boolean>;
  getProviderManifest: (appBlockId: string) => Promise<unknown>;
  
  // App-to-App installation actions
  getAppBlockInstallations: (appBlockId: string) => Promise<AppBlockInstallation[]>;
  installAppBlock: (consumerAppBlockId: string, providerAppBlockId: string, scopes: string[], authType?: 'user' | 'service') => Promise<AppBlockInstallation | null>;
  revokeAppBlockInstallation: (installationId: string) => Promise<boolean>;
  
  // Helpers
  parseScopes: (scopesJson: string) => string[];
  parseUiModules: (uiModulesJson: string | null) => string[];
}

const AppBlockContext = createContext<AppBlockContextType | undefined>(undefined);

export const AppBlockProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading: isUserLoading } = useUser();
  const userRef = useRef(user);
  const [appBlocks, setAppBlocks] = useState<AppBlock[]>([]);
  const [currentAppBlock, setCurrentAppBlock] = useState<AppBlockWithInstallations | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start true until first fetch completes
  const [error, setError] = useState<string | null>(null);
  const [hasFetchedOnce, setHasFetchedOnce] = useState(false);
  
  const [connectors, setConnectors] = useState<ConnectorWithDetails[]>([]);
  const [connectorsLoading, setConnectorsLoading] = useState(false);
  const hasFetchedRef = useRef(false);
  
  // Registry state
  const [registryEntries, setRegistryEntries] = useState<RegistryEntry[]>([]);
  const [registryLoading, setRegistryLoading] = useState(false);
  const [registryTotal, setRegistryTotal] = useState(0);
  
  // Keep userRef in sync
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // Helper functions
  const parseScopes = useCallback((scopesJson: string): string[] => {
    try {
      return JSON.parse(scopesJson);
    } catch {
      return [];
    }
  }, []);

  const parseUiModules = useCallback((uiModulesJson: string | null): string[] => {
    if (!uiModulesJson) return [];
    try {
      return JSON.parse(uiModulesJson);
    } catch {
      return [];
    }
  }, []);

  // Fetch all app blocks for current user
  const fetchAppBlocks = useCallback(async (showLoading = false) => {
    if (!userRef.current) return;
    
    // Only set loading true on initial fetch or when explicitly requested
    // This prevents loading flash on refetches
    if (showLoading) {
      setIsLoading(true);
    }
    setError(null);
    
    try {
      const response = await fetch('/api/app-blocks');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch app blocks');
      }
      
      setAppBlocks(data.appBlocks || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch app blocks';
      setError(message);
      console.error('❌ Error fetching app blocks:', err);
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Fetch a single app block with details
  const fetchAppBlock = useCallback(async (id: string): Promise<AppBlockWithInstallations | null> => {
    try {
      const response = await fetch(`/api/app-blocks/${id}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch app block');
      }
      
      return data.appBlock;
    } catch (err) {
      console.error('❌ Error fetching app block:', err);
      return null;
    }
  }, []);

  // Create a new app block
  const createAppBlock = useCallback(async (data: { 
    name: string; 
    description?: string; 
    iconUrl?: string 
  }): Promise<AppBlock | null> => {
    try {
      const response = await fetch('/api/app-blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create app block');
      }
      
      // Refresh the list
      await fetchAppBlocks();
      
      return result.appBlock;
    } catch (err) {
      console.error('❌ Error creating app block:', err);
      setError(err instanceof Error ? err.message : 'Failed to create app block');
      return null;
    }
  }, [fetchAppBlocks]);

  // Update an app block
  const updateAppBlock = useCallback(async (
    id: string,
    data: { name?: string; description?: string; iconUrl?: string }
  ): Promise<AppBlock | null> => {
    try {
      const response = await fetch(`/api/app-blocks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update app block');
      }
      
      // Refresh the list
      await fetchAppBlocks();
      
      return result.appBlock;
    } catch (err) {
      console.error('❌ Error updating app block:', err);
      setError(err instanceof Error ? err.message : 'Failed to update app block');
      return null;
    }
  }, [fetchAppBlocks]);

  // Delete an app block
  const deleteAppBlock = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/app-blocks/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to delete app block');
      }
      
      // Clear current if it was deleted
      if (currentAppBlock?.id === id) {
        setCurrentAppBlock(null);
      }
      
      // Refresh the list
      await fetchAppBlocks();
      
      return true;
    } catch (err) {
      console.error('❌ Error deleting app block:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete app block');
      return false;
    }
  }, [currentAppBlock, fetchAppBlocks]);

  // Fetch all connectors
  const fetchConnectors = useCallback(async () => {
    setConnectorsLoading(true);
    
    try {
      const response = await fetch('/api/connectors');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch connectors');
      }
      
      setConnectors(data.connectors || []);
    } catch (err) {
      console.error('❌ Error fetching connectors:', err);
    } finally {
      setConnectorsLoading(false);
    }
  }, []);

  // Fetch a single connector
  const fetchConnector = useCallback(async (id: string): Promise<ConnectorWithDetails | null> => {
    try {
      const response = await fetch(`/api/connectors/${id}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch connector');
      }
      
      return data.connector;
    } catch (err) {
      console.error('❌ Error fetching connector:', err);
      return null;
    }
  }, []);

  // Install a connector
  const installConnector = useCallback(async (
    appBlockId: string,
    connectorId: string,
    scopes: string[],
    authType: 'user' | 'service' = 'user'
  ): Promise<ConnectorInstallation | null> => {
    try {
      const response = await fetch(`/api/app-blocks/${appBlockId}/connectors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          connector_id: connectorId,
          scopes,
          auth_type: authType,
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to install connector');
      }
      
      // Refresh current app block if it's the one being updated
      if (currentAppBlock?.id === appBlockId) {
        const updated = await fetchAppBlock(appBlockId);
        if (updated) {
          setCurrentAppBlock(updated);
        }
      }
      
      return result.installation;
    } catch (err) {
      console.error('❌ Error installing connector:', err);
      setError(err instanceof Error ? err.message : 'Failed to install connector');
      return null;
    }
  }, [currentAppBlock, fetchAppBlock]);

  // Revoke a connector installation
  const revokeConnector = useCallback(async (installationId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/connector-installations/${installationId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to revoke connector');
      }
      
      // Refresh current app block
      if (currentAppBlock) {
        const updated = await fetchAppBlock(currentAppBlock.id);
        if (updated) {
          setCurrentAppBlock(updated);
        }
      }
      
      return true;
    } catch (err) {
      console.error('❌ Error revoking connector:', err);
      setError(err instanceof Error ? err.message : 'Failed to revoke connector');
      return false;
    }
  }, [currentAppBlock, fetchAppBlock]);

  // Get an access token for an app block
  const getAccessToken = useCallback(async (
    appBlockId: string,
    scopes?: string[]
  ): Promise<string | null> => {
    try {
      const response = await fetch('/api/auth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grant_type: 'user_session',
          app_block_id: appBlockId,
          scopes,
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to get access token');
      }
      
      return result.access_token;
    } catch (err) {
      console.error('❌ Error getting access token:', err);
      return null;
    }
  }, []);

  // ============================================
  // Registry Methods
  // ============================================

  // Browse registry entries
  const browseRegistry = useCallback(async (options: BrowseRegistryOptions = {}) => {
    setRegistryLoading(true);
    
    try {
      const params = new URLSearchParams();
      if (options.category) params.set('category', options.category);
      if (options.query) params.set('query', options.query);
      if (options.tags) params.set('tags', options.tags.join(','));
      if (options.visibility) params.set('visibility', options.visibility);
      if (options.installable) params.set('installable', 'true');
      if (options.page) params.set('page', options.page.toString());
      if (options.limit) params.set('limit', options.limit.toString());
      
      const response = await fetch(`/api/registry/app-blocks?${params}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to browse registry');
      }
      
      setRegistryEntries(data.entries || []);
      setRegistryTotal(data.total || 0);
    } catch (err) {
      console.error('❌ Error browsing registry:', err);
    } finally {
      setRegistryLoading(false);
    }
  }, []);

  // Get a single registry entry
  const getRegistryEntry = useCallback(async (slug: string): Promise<RegistryEntryWithProvider | null> => {
    try {
      const response = await fetch(`/api/registry/app-blocks/${slug}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch registry entry');
      }
      
      return data.entry;
    } catch (err) {
      console.error('❌ Error fetching registry entry:', err);
      return null;
    }
  }, []);

  // Publish to registry
  const publishToRegistry = useCallback(async (
    appBlockId: string,
    data: {
      slug: string;
      display_name: string;
      description?: string;
      icon_url?: string;
      category?: RegistryCategory;
      visibility?: RegistryVisibility;
      installable?: boolean;
      requires_approval?: boolean;
      contact_email?: string;
      contact_url?: string;
      tags?: string[];
    }
  ): Promise<RegistryEntry | null> => {
    try {
      const response = await fetch(`/api/app-blocks/${appBlockId}/registry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to publish to registry');
      }
      
      return result.entry;
    } catch (err) {
      console.error('❌ Error publishing to registry:', err);
      setError(err instanceof Error ? err.message : 'Failed to publish to registry');
      return null;
    }
  }, []);

  // Update registry entry
  const updateRegistryEntry = useCallback(async (
    appBlockId: string,
    data: Partial<{
      slug: string;
      display_name: string;
      description: string;
      icon_url: string;
      category: RegistryCategory;
      visibility: RegistryVisibility;
      installable: boolean;
      requires_approval: boolean;
      contact_email: string;
      contact_url: string;
      tags: string[];
    }>
  ): Promise<RegistryEntry | null> => {
    try {
      const response = await fetch(`/api/app-blocks/${appBlockId}/registry`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update registry entry');
      }
      
      return result.entry;
    } catch (err) {
      console.error('❌ Error updating registry entry:', err);
      setError(err instanceof Error ? err.message : 'Failed to update registry entry');
      return null;
    }
  }, []);

  // Unpublish from registry
  const unpublishFromRegistry = useCallback(async (appBlockId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/app-blocks/${appBlockId}/registry`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to unpublish from registry');
      }
      
      return true;
    } catch (err) {
      console.error('❌ Error unpublishing from registry:', err);
      setError(err instanceof Error ? err.message : 'Failed to unpublish from registry');
      return false;
    }
  }, []);

  // ============================================
  // Provider Methods
  // ============================================

  // Get provider config
  const getProvider = useCallback(async (appBlockId: string): Promise<ProviderConfig | null> => {
    try {
      const response = await fetch(`/api/app-blocks/${appBlockId}/provider`);
      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(data.error || 'Failed to fetch provider');
      }
      
      return data.provider;
    } catch (err) {
      console.error('❌ Error fetching provider:', err);
      return null;
    }
  }, []);

  // Create provider
  const createProvider = useCallback(async (
    appBlockId: string,
    data: {
      base_api_url: string;
      api_version?: string;
      auth_methods?: ('user' | 'service')[];
      rate_limit_per_minute?: number;
      scopes?: Array<{
        scope_name: string;
        description?: string;
        is_public_read?: boolean;
        required_role?: string;
      }>;
    }
  ): Promise<ProviderConfig | null> => {
    try {
      const response = await fetch(`/api/app-blocks/${appBlockId}/provider`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create provider');
      }
      
      return result.provider;
    } catch (err) {
      console.error('❌ Error creating provider:', err);
      setError(err instanceof Error ? err.message : 'Failed to create provider');
      return null;
    }
  }, []);

  // Update provider
  const updateProvider = useCallback(async (
    appBlockId: string,
    data: Partial<{
      base_api_url: string;
      api_version: string;
      auth_methods: ('user' | 'service')[];
      status: string;
      rate_limit_per_minute: number;
      scopes: Array<{
        scope_name: string;
        description?: string;
        is_public_read?: boolean;
        required_role?: string;
      }>;
    }>
  ): Promise<ProviderConfig | null> => {
    try {
      const response = await fetch(`/api/app-blocks/${appBlockId}/provider`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update provider');
      }
      
      return result.provider;
    } catch (err) {
      console.error('❌ Error updating provider:', err);
      setError(err instanceof Error ? err.message : 'Failed to update provider');
      return null;
    }
  }, []);

  // Delete provider
  const deleteProvider = useCallback(async (appBlockId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/app-blocks/${appBlockId}/provider`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to delete provider');
      }
      
      return true;
    } catch (err) {
      console.error('❌ Error deleting provider:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete provider');
      return false;
    }
  }, []);

  // Get provider manifest (public)
  const getProviderManifest = useCallback(async (appBlockId: string): Promise<unknown> => {
    try {
      const response = await fetch(`/api/app-blocks/${appBlockId}/provider-manifest`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch provider manifest');
      }
      
      return data;
    } catch (err) {
      console.error('❌ Error fetching provider manifest:', err);
      return null;
    }
  }, []);

  // ============================================
  // App-to-App Installation Methods
  // ============================================

  // Get app block installations
  const getAppBlockInstallations = useCallback(async (appBlockId: string): Promise<AppBlockInstallation[]> => {
    try {
      const response = await fetch(`/api/app-blocks/${appBlockId}/installations`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch installations');
      }
      
      return data.installations || [];
    } catch (err) {
      console.error('❌ Error fetching installations:', err);
      return [];
    }
  }, []);

  // Install an app block
  const installAppBlock = useCallback(async (
    consumerAppBlockId: string,
    providerAppBlockId: string,
    scopes: string[],
    authType: 'user' | 'service' = 'user'
  ): Promise<AppBlockInstallation | null> => {
    try {
      const response = await fetch(`/api/app-blocks/${consumerAppBlockId}/installations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider_app_block_id: providerAppBlockId,
          scopes,
          auth_type: authType,
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to install app block');
      }
      
      return result.installation;
    } catch (err) {
      console.error('❌ Error installing app block:', err);
      setError(err instanceof Error ? err.message : 'Failed to install app block');
      return null;
    }
  }, []);

  // Revoke app block installation
  const revokeAppBlockInstallation = useCallback(async (installationId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/app-block-installations/${installationId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to revoke installation');
      }
      
      return true;
    } catch (err) {
      console.error('❌ Error revoking installation:', err);
      setError(err instanceof Error ? err.message : 'Failed to revoke installation');
      return false;
    }
  }, []);

  // Fetch app blocks when user changes
  useEffect(() => {
    if (isUserLoading) return; // Wait for user context to finish loading
    
    if (user) {
      // Show loading only on initial fetch (when hasFetchedRef is false)
      const showLoading = !hasFetchedRef.current;
      fetchAppBlocks(showLoading).finally(() => {
        hasFetchedRef.current = true;
        setHasFetchedOnce(true);
      });
    } else {
      // User logged out - reset state
      setAppBlocks([]);
      setCurrentAppBlock(null);
      setIsLoading(false);
      hasFetchedRef.current = false;
      setHasFetchedOnce(false);
    }
  }, [user, isUserLoading, fetchAppBlocks]);

  const value: AppBlockContextType = {
    // State
    appBlocks,
    currentAppBlock,
    isLoading,
    error,
    connectors,
    connectorsLoading,
    registryEntries,
    registryLoading,
    registryTotal,
    
    // App Block actions
    fetchAppBlocks,
    fetchAppBlock,
    createAppBlock,
    updateAppBlock,
    deleteAppBlock,
    setCurrentAppBlock,
    
    // Connector actions
    fetchConnectors,
    fetchConnector,
    installConnector,
    revokeConnector,
    
    // Token actions
    getAccessToken,
    
    // Registry actions
    browseRegistry,
    getRegistryEntry,
    publishToRegistry,
    updateRegistryEntry,
    unpublishFromRegistry,
    
    // Provider actions
    getProvider,
    createProvider,
    updateProvider,
    deleteProvider,
    getProviderManifest,
    
    // App-to-App installation actions
    getAppBlockInstallations,
    installAppBlock,
    revokeAppBlockInstallation,
    
    // Helpers
    parseScopes,
    parseUiModules,
  };

  return (
    <AppBlockContext.Provider value={value}>
      {children}
    </AppBlockContext.Provider>
  );
};

export const useAppBlock = () => {
  const context = useContext(AppBlockContext);
  if (context === undefined) {
    throw new Error('useAppBlock must be used within an AppBlockProvider');
  }
  return context;
};
