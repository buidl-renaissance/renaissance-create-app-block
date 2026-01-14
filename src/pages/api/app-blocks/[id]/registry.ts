import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserById } from '@/db/user';
import { getAppBlockById } from '@/db/appBlock';
import { 
  publishToRegistry, 
  updateRegistryEntry, 
  getRegistryEntryByAppBlockId,
  getRegistryEntryBySlug,
  deleteRegistryEntry,
  parseTags,
} from '@/db/registry';
import { AppBlockRegistryEntry, RegistryCategory, RegistryVisibility } from '@/db/schema';

type ResponseData = {
  entry?: AppBlockRegistryEntry & { tags_parsed: string[] };
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
 * GET /api/app-blocks/[id]/registry - Get registry entry for an app block
 * POST /api/app-blocks/[id]/registry - Publish app block to registry
 * PATCH /api/app-blocks/[id]/registry - Update registry listing
 * DELETE /api/app-blocks/[id]/registry - Remove from registry
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
        const entry = await getRegistryEntryByAppBlockId(id);
        
        if (!entry) {
          return res.status(404).json({ error: 'App Block is not published to registry' });
        }

        return res.status(200).json({
          entry: {
            ...entry,
            tags_parsed: parseTags(entry.tags),
          },
        });
      }

      case 'POST': {
        // Check if already published
        const existing = await getRegistryEntryByAppBlockId(id);
        if (existing) {
          return res.status(400).json({ error: 'App Block is already published to registry' });
        }

        const {
          slug,
          display_name,
          description,
          icon_url,
          category,
          visibility,
          installable,
          requires_approval,
          contact_email,
          contact_url,
          tags,
        } = req.body as {
          slug?: string;
          display_name?: string;
          description?: string;
          icon_url?: string;
          category?: RegistryCategory;
          visibility?: RegistryVisibility;
          installable?: boolean;
          requires_approval?: boolean;
          contact_email?: string;
          contact_url?: string;
          tags?: string[];
        };

        if (!slug || typeof slug !== 'string' || slug.length < 2) {
          return res.status(400).json({ error: 'Slug is required (min 2 characters)' });
        }

        if (!display_name || typeof display_name !== 'string') {
          return res.status(400).json({ error: 'Display name is required' });
        }

        // Check if slug is already taken
        const slugExists = await getRegistryEntryBySlug(slug);
        if (slugExists) {
          return res.status(400).json({ error: 'Slug is already taken' });
        }

        const entry = await publishToRegistry({
          appBlockId: id,
          slug,
          displayName: display_name,
          description,
          iconUrl: icon_url || appBlock.iconUrl || undefined,
          category,
          visibility,
          installable,
          requiresApproval: requires_approval,
          contactEmail: contact_email,
          contactUrl: contact_url,
          tags,
        });

        console.log('✅ [POST /api/app-blocks/[id]/registry] Published to registry:', {
          appBlockId: id,
          slug: entry.slug,
        });

        return res.status(201).json({
          entry: {
            ...entry,
            tags_parsed: parseTags(entry.tags),
          },
        });
      }

      case 'PATCH': {
        const existing = await getRegistryEntryByAppBlockId(id);
        if (!existing) {
          return res.status(404).json({ error: 'App Block is not published to registry' });
        }

        const {
          slug,
          display_name,
          description,
          icon_url,
          category,
          visibility,
          installable,
          requires_approval,
          contact_email,
          contact_url,
          tags,
        } = req.body as {
          slug?: string;
          display_name?: string;
          description?: string;
          icon_url?: string;
          category?: RegistryCategory;
          visibility?: RegistryVisibility;
          installable?: boolean;
          requires_approval?: boolean;
          contact_email?: string;
          contact_url?: string;
          tags?: string[];
        };

        // Check if new slug is already taken by another entry
        if (slug && slug !== existing.slug) {
          const slugExists = await getRegistryEntryBySlug(slug);
          if (slugExists && slugExists.id !== existing.id) {
            return res.status(400).json({ error: 'Slug is already taken' });
          }
        }

        const updated = await updateRegistryEntry(id, {
          slug,
          displayName: display_name,
          description,
          iconUrl: icon_url,
          category,
          visibility,
          installable,
          requiresApproval: requires_approval,
          contactEmail: contact_email,
          contactUrl: contact_url,
          tags,
        });

        if (!updated) {
          return res.status(500).json({ error: 'Failed to update registry entry' });
        }

        console.log('✅ [PATCH /api/app-blocks/[id]/registry] Updated registry entry:', {
          appBlockId: id,
        });

        return res.status(200).json({
          entry: {
            ...updated,
            tags_parsed: parseTags(updated.tags),
          },
        });
      }

      case 'DELETE': {
        const deleted = await deleteRegistryEntry(id);
        
        if (!deleted) {
          return res.status(404).json({ error: 'App Block is not published to registry' });
        }

        console.log('✅ [DELETE /api/app-blocks/[id]/registry] Removed from registry:', {
          appBlockId: id,
        });

        return res.status(200).json({});
      }

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('❌ [/api/app-blocks/[id]/registry] Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
