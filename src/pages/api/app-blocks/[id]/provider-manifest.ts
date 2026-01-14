import type { NextApiRequest, NextApiResponse } from 'next';
import { getAppBlockById } from '@/db/appBlock';
import { getProviderManifest, ProviderManifest } from '@/db/registry';

type ResponseData = ProviderManifest | {
  error: string;
};

/**
 * GET /api/app-blocks/[id]/provider-manifest
 * Get the public provider manifest for an App Block
 * This endpoint is public and doesn't require authentication
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'App Block ID is required' });
    }

    // Verify app block exists
    const appBlock = await getAppBlockById(id);
    if (!appBlock) {
      return res.status(404).json({ error: 'App Block not found' });
    }

    // Get manifest
    const manifest = await getProviderManifest(id);

    if (!manifest) {
      return res.status(404).json({ error: 'App Block is not configured as a provider' });
    }

    // Don't return manifest for disabled providers
    if (manifest.status === 'disabled') {
      return res.status(404).json({ error: 'Provider is not available' });
    }

    return res.status(200).json(manifest);
  } catch (error) {
    console.error('❌ [GET /api/app-blocks/[id]/provider-manifest] Error:', error);
    return res.status(500).json({ error: 'Failed to fetch provider manifest' });
  }
}
