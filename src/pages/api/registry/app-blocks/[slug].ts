import type { NextApiRequest, NextApiResponse } from 'next';
import { getRegistryEntryWithDetails, parseTags, parseAuthMethods } from '@/db/registry';
import { AppBlockRegistryEntry, AppBlockProvider, ProviderScope } from '@/db/schema';

type RegistryEntryDetail = AppBlockRegistryEntry & {
  tags_parsed: string[];
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
};

type ResponseData = {
  entry?: RegistryEntryDetail;
  error?: string;
};

/**
 * GET /api/registry/app-blocks/[slug]
 * Get a single registry entry by slug with provider details
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { slug } = req.query;

    if (!slug || typeof slug !== 'string') {
      return res.status(400).json({ error: 'Slug is required' });
    }

    const result = await getRegistryEntryWithDetails(slug);

    if (!result) {
      return res.status(404).json({ error: 'Registry entry not found' });
    }

    // Check visibility - only public and unlisted are accessible
    if (result.entry.visibility === 'private') {
      return res.status(404).json({ error: 'Registry entry not found' });
    }

    // Format response
    const entryDetail: RegistryEntryDetail = {
      ...result.entry,
      tags_parsed: parseTags(result.entry.tags),
      provider: result.provider ? {
        api_version: result.provider.apiVersion,
        base_api_url: result.provider.baseApiUrl,
        auth_methods: parseAuthMethods(result.provider.authMethods),
        rate_limit_per_minute: result.provider.rateLimitPerMinute || 120,
        status: result.provider.status,
        scopes: result.scopes.map(s => ({
          name: s.scopeName,
          description: s.description,
          is_public_read: s.isPublicRead,
          required_role: s.requiredRole,
        })),
      } : null,
    };

    return res.status(200).json({ entry: entryDetail });
  } catch (error) {
    console.error('❌ [GET /api/registry/app-blocks/[slug]] Error:', error);
    return res.status(500).json({ error: 'Failed to fetch registry entry' });
  }
}
