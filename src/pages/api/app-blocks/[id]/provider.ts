import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserById } from '@/db/user';
import { getAppBlockById } from '@/db/appBlock';
import { 
  createProvider, 
  updateProvider, 
  getProviderByAppBlockId,
  deleteProvider,
  getProviderScopes,
  updateProviderScopes,
  parseAuthMethods,
} from '@/db/registry';
import { AppBlockProvider, ProviderScope, ProviderStatus } from '@/db/schema';

type ProviderWithScopes = AppBlockProvider & {
  auth_methods_parsed: string[];
  scopes: Array<{
    id: string;
    scope_name: string;
    description: string | null;
    is_public_read: boolean;
    required_role: string | null;
  }>;
};

type ResponseData = {
  provider?: ProviderWithScopes;
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
 * GET /api/app-blocks/[id]/provider - Get provider config
 * POST /api/app-blocks/[id]/provider - Create provider interface
 * PATCH /api/app-blocks/[id]/provider - Update provider config
 * DELETE /api/app-blocks/[id]/provider - Remove provider interface
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

    // Get the App Block and verify ownership
    const appBlock = await getAppBlockById(id);

    if (!appBlock) {
      return res.status(404).json({ error: 'App Block not found' });
    }

    if (appBlock.ownerUserId !== user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    switch (req.method) {
      case 'GET': {
        const provider = await getProviderByAppBlockId(id);
        
        if (!provider) {
          return res.status(404).json({ error: 'App Block is not configured as a provider' });
        }

        const scopes = await getProviderScopes(provider.id);

        return res.status(200).json({
          provider: {
            ...provider,
            auth_methods_parsed: parseAuthMethods(provider.authMethods),
            scopes: scopes.map(s => ({
              id: s.id,
              scope_name: s.scopeName,
              description: s.description,
              is_public_read: s.isPublicRead,
              required_role: s.requiredRole,
            })),
          },
        });
      }

      case 'POST': {
        // Check if already a provider
        const existing = await getProviderByAppBlockId(id);
        if (existing) {
          return res.status(400).json({ error: 'App Block is already configured as a provider' });
        }

        const {
          base_api_url,
          api_version,
          auth_methods,
          rate_limit_per_minute,
          scopes,
        } = req.body as {
          base_api_url?: string;
          api_version?: string;
          auth_methods?: ('user' | 'service')[];
          rate_limit_per_minute?: number;
          scopes?: Array<{
            scope_name: string;
            description?: string;
            is_public_read?: boolean;
            required_role?: string;
          }>;
        };

        if (!base_api_url || typeof base_api_url !== 'string') {
          return res.status(400).json({ error: 'Base API URL is required' });
        }

        const provider = await createProvider({
          appBlockId: id,
          baseApiUrl: base_api_url,
          apiVersion: api_version,
          authMethods: auth_methods,
          rateLimitPerMinute: rate_limit_per_minute,
        });

        // Add scopes if provided
        let providerScopes: ProviderScope[] = [];
        if (scopes && scopes.length > 0) {
          providerScopes = await updateProviderScopes(
            provider.id,
            scopes.map(s => ({
              scopeName: s.scope_name,
              description: s.description,
              isPublicRead: s.is_public_read,
              requiredRole: s.required_role,
            }))
          );
        }

        console.log('✅ [POST /api/app-blocks/[id]/provider] Created provider:', {
          appBlockId: id,
          providerId: provider.id,
        });

        return res.status(201).json({
          provider: {
            ...provider,
            auth_methods_parsed: parseAuthMethods(provider.authMethods),
            scopes: providerScopes.map(s => ({
              id: s.id,
              scope_name: s.scopeName,
              description: s.description,
              is_public_read: s.isPublicRead,
              required_role: s.requiredRole,
            })),
          },
        });
      }

      case 'PATCH': {
        const provider = await getProviderByAppBlockId(id);
        if (!provider) {
          return res.status(404).json({ error: 'App Block is not configured as a provider' });
        }

        const {
          base_api_url,
          api_version,
          auth_methods,
          status,
          rate_limit_per_minute,
          scopes,
        } = req.body as {
          base_api_url?: string;
          api_version?: string;
          auth_methods?: ('user' | 'service')[];
          status?: ProviderStatus;
          rate_limit_per_minute?: number;
          scopes?: Array<{
            scope_name: string;
            description?: string;
            is_public_read?: boolean;
            required_role?: string;
          }>;
        };

        const updated = await updateProvider(id, {
          baseApiUrl: base_api_url,
          apiVersion: api_version,
          authMethods: auth_methods,
          status,
          rateLimitPerMinute: rate_limit_per_minute,
        });

        if (!updated) {
          return res.status(500).json({ error: 'Failed to update provider' });
        }

        // Update scopes if provided
        let providerScopes: ProviderScope[] = [];
        if (scopes !== undefined) {
          providerScopes = await updateProviderScopes(
            updated.id,
            scopes.map(s => ({
              scopeName: s.scope_name,
              description: s.description,
              isPublicRead: s.is_public_read,
              requiredRole: s.required_role,
            }))
          );
        } else {
          providerScopes = await getProviderScopes(updated.id);
        }

        console.log('✅ [PATCH /api/app-blocks/[id]/provider] Updated provider:', {
          appBlockId: id,
        });

        return res.status(200).json({
          provider: {
            ...updated,
            auth_methods_parsed: parseAuthMethods(updated.authMethods),
            scopes: providerScopes.map(s => ({
              id: s.id,
              scope_name: s.scopeName,
              description: s.description,
              is_public_read: s.isPublicRead,
              required_role: s.requiredRole,
            })),
          },
        });
      }

      case 'DELETE': {
        const deleted = await deleteProvider(id);
        
        if (!deleted) {
          return res.status(404).json({ error: 'App Block is not configured as a provider' });
        }

        console.log('✅ [DELETE /api/app-blocks/[id]/provider] Removed provider:', {
          appBlockId: id,
        });

        return res.status(200).json({});
      }

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('❌ [/api/app-blocks/[id]/provider] Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
