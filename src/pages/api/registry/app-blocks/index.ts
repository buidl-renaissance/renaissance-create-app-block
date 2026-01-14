import type { NextApiRequest, NextApiResponse } from 'next';
import { browseRegistry, BrowseRegistryOptions, parseTags } from '@/db/registry';
import { AppBlockRegistryEntry, RegistryCategory, RegistryVisibility } from '@/db/schema';

type ResponseData = {
  entries?: AppBlockRegistryEntry[];
  total?: number;
  page?: number;
  limit?: number;
  error?: string;
};

/**
 * GET /api/registry/app-blocks
 * Browse the App Block registry with filters
 * 
 * Query params:
 * - category: events, tools, music, games, community, other
 * - query: search term
 * - tags: comma-separated tags
 * - visibility: public, unlisted (default: public)
 * - installable: true/false (filter only installable blocks)
 * - page: page number (default: 1)
 * - limit: items per page (default: 20, max: 100)
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      category,
      query,
      tags,
      visibility,
      installable,
      page = '1',
      limit = '20',
    } = req.query;

    // Parse pagination
    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 20));
    const offset = (pageNum - 1) * limitNum;

    // Build options
    const options: BrowseRegistryOptions = {
      limit: limitNum,
      offset,
    };

    // Category filter
    if (category && typeof category === 'string') {
      const validCategories: RegistryCategory[] = ['events', 'tools', 'music', 'games', 'community', 'other'];
      if (validCategories.includes(category as RegistryCategory)) {
        options.category = category as RegistryCategory;
      }
    }

    // Search query
    if (query && typeof query === 'string') {
      options.query = query;
    }

    // Tags filter
    if (tags && typeof tags === 'string') {
      options.tags = tags.split(',').map(t => t.trim()).filter(Boolean);
    }

    // Visibility filter (allow public and unlisted for browsing)
    if (visibility && typeof visibility === 'string') {
      const validVisibilities: RegistryVisibility[] = ['public', 'unlisted'];
      if (validVisibilities.includes(visibility as RegistryVisibility)) {
        options.visibility = visibility as RegistryVisibility;
      }
    } else {
      // Default to public only
      options.visibility = 'public';
    }

    // Installable filter
    if (installable === 'true') {
      options.installableOnly = true;
    }

    // Execute query
    const result = await browseRegistry(options);

    return res.status(200).json({
      entries: result.entries,
      total: result.total,
      page: pageNum,
      limit: limitNum,
    });
  } catch (error) {
    console.error('❌ [GET /api/registry/app-blocks] Error:', error);
    return res.status(500).json({ error: 'Failed to browse registry' });
  }
}
