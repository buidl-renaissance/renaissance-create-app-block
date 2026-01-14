import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserById } from '@/db/user';
import { getAppBlockById } from '@/db/appBlock';
import { 
  installAppBlock,
  getAppBlockInstallationsByConsumer,
  getInstallationsWithProviderDetails,
  getProviderByAppBlockId,
  getProviderScopes,
  getRegistryEntryByAppBlockId,
  parseGrantedScopes,
  parseTags,
} from '@/db/registry';
import { AppBlockInstallation, AppBlockRegistryEntry, AppBlockProvider } from '@/db/schema';

type InstallationWithDetails = AppBlockInstallation & {
  granted_scopes_parsed: string[];
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
};

type ResponseData = {
  installations?: InstallationWithDetails[];
  installation?: InstallationWithDetails;
  error?: string;
};

/**
 * Helper to get current user from session
 */
async function getCurrentUser(req: NextApiRequest) {
  const cookies = req.headers.cookie || '';
  const sessionMatch = cookies.match(/user_session=([^;]+)/);
  
  if (sessionMatch && sessionMatch[1]) {
    return getUserById(sessionMatch[1]);
  }
  return null;
}

/**
 * GET /api/app-blocks/[id]/installations - List installed blocks
 * POST /api/app-blocks/[id]/installations - Install another block
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  try {
    const user = await getCurrentUser(req);
    
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'App Block ID is required' });
    }

    // Get the consumer App Block and verify ownership
    const appBlock = await getAppBlockById(id);

    if (!appBlock) {
      return res.status(404).json({ error: 'App Block not found' });
    }

    if (appBlock.ownerUserId !== user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    switch (req.method) {
      case 'GET': {
        const installationsWithDetails = await getInstallationsWithProviderDetails(id);

        const installations: InstallationWithDetails[] = installationsWithDetails.map(
          ({ installation, provider, registryEntry }) => ({
            ...installation,
            granted_scopes_parsed: parseGrantedScopes(installation.grantedScopes),
            provider: provider ? {
              registry: registryEntry ? {
                slug: registryEntry.slug,
                display_name: registryEntry.displayName,
                description: registryEntry.description,
                icon_url: registryEntry.iconUrl,
                category: registryEntry.category,
              } : null,
              api_version: provider.apiVersion,
              base_api_url: provider.baseApiUrl,
            } : null,
          })
        );

        return res.status(200).json({ installations });
      }

      case 'POST': {
        const {
          provider_app_block_id,
          scopes,
          auth_type,
        } = req.body as {
          provider_app_block_id?: string;
          scopes?: string[];
          auth_type?: 'user' | 'service';
        };

        if (!provider_app_block_id || typeof provider_app_block_id !== 'string') {
          return res.status(400).json({ error: 'Provider App Block ID is required' });
        }

        // Cannot install self
        if (provider_app_block_id === id) {
          return res.status(400).json({ error: 'Cannot install own block' });
        }

        // Verify provider exists
        const providerBlock = await getAppBlockById(provider_app_block_id);
        if (!providerBlock) {
          return res.status(404).json({ error: 'Provider App Block not found' });
        }

        // Verify provider is configured as a provider
        const provider = await getProviderByAppBlockId(provider_app_block_id);
        if (!provider) {
          return res.status(400).json({ error: 'Provider App Block is not configured as a provider' });
        }

        // Check if provider is installable (via registry)
        const registryEntry = await getRegistryEntryByAppBlockId(provider_app_block_id);
        if (registryEntry && !registryEntry.installable) {
          return res.status(400).json({ error: 'Provider is not installable' });
        }

        // Validate scopes
        if (!scopes || !Array.isArray(scopes) || scopes.length === 0) {
          return res.status(400).json({ error: 'At least one scope is required' });
        }

        // Verify all requested scopes exist for this provider
        const availableScopes = await getProviderScopes(provider.id);
        const availableScopeNames = availableScopes.map(s => s.scopeName);
        const invalidScopes = scopes.filter(s => !availableScopeNames.includes(s));
        
        if (invalidScopes.length > 0) {
          return res.status(400).json({ 
            error: `Invalid scopes: ${invalidScopes.join(', ')}` 
          });
        }

        // Create the installation
        const installation = await installAppBlock({
          consumerAppBlockId: id,
          providerAppBlockId: provider_app_block_id,
          grantedScopes: scopes,
          authType: auth_type,
        });

        console.log('✅ [POST /api/app-blocks/[id]/installations] Created installation:', {
          consumerId: id,
          providerId: provider_app_block_id,
          scopes,
          status: installation.status,
        });

        return res.status(201).json({
          installation: {
            ...installation,
            granted_scopes_parsed: parseGrantedScopes(installation.grantedScopes),
            provider: {
              registry: registryEntry ? {
                slug: registryEntry.slug,
                display_name: registryEntry.displayName,
                description: registryEntry.description,
                icon_url: registryEntry.iconUrl,
                category: registryEntry.category,
              } : null,
              api_version: provider.apiVersion,
              base_api_url: provider.baseApiUrl,
            },
          },
        });
      }

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('❌ [/api/app-blocks/[id]/installations] Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
