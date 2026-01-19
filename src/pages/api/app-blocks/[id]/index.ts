import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserById } from '@/db/user';
import { 
  getAppBlockById, 
  updateAppBlock, 
  deleteAppBlock,
  getInstallationsWithConnectors,
  getServiceAccountByAppBlock,
  rotateServiceAccountKey,
} from '@/db/appBlock';
import { AppBlock, ConnectorInstallation, Connector } from '@/db/schema';

type AppBlockDetail = AppBlock & {
  installations: Array<{
    installation: ConnectorInstallation;
    connector: Connector;
  }>;
  hasServiceAccount: boolean;
};

type ResponseData = {
  appBlock?: AppBlockDetail | AppBlock;
  apiKey?: string; // Only returned when rotating service account key
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
 * GET /api/app-blocks/[id] - Get App Block details
 * PUT /api/app-blocks/[id] - Update App Block (name, description, iconUrl)
 * PATCH /api/app-blocks/[id] - Partial update App Block (gitHubUrl, appUrl, tags)
 * DELETE /api/app-blocks/[id] - Delete App Block
 * POST /api/app-blocks/[id] - Rotate service account key (action=rotate-key)
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
        // Get installations with connector details
        const installations = await getInstallationsWithConnectors(id);
        const serviceAccount = await getServiceAccountByAppBlock(id);

        const appBlockDetail: AppBlockDetail = {
          ...appBlock,
          installations,
          hasServiceAccount: !!serviceAccount,
        };

        return res.status(200).json({ appBlock: appBlockDetail });
      }

      case 'PUT': {
        const { name, description, iconUrl } = req.body as {
          name?: string;
          description?: string;
          iconUrl?: string;
        };

        const updateData: Partial<{ name: string; description: string; iconUrl: string }> = {};

        if (name !== undefined) {
          if (typeof name !== 'string' || name.trim().length === 0) {
            return res.status(400).json({ error: 'App Block name cannot be empty' });
          }
          if (name.length > 100) {
            return res.status(400).json({ error: 'App Block name must be 100 characters or less' });
          }
          updateData.name = name.trim();
        }

        if (description !== undefined) {
          updateData.description = description?.trim() || undefined;
        }

        if (iconUrl !== undefined) {
          updateData.iconUrl = iconUrl || undefined;
        }

        const updatedAppBlock = await updateAppBlock(id, updateData);

        console.log('✅ [PUT /api/app-blocks/[id]] Updated App Block:', {
          id,
          updates: updateData,
        });

        return res.status(200).json({ appBlock: updatedAppBlock! });
      }

      case 'POST': {
        // Handle special actions
        const { action } = req.body as { action?: string };

        if (action === 'rotate-key') {
          const result = await rotateServiceAccountKey(id);
          
          if (!result) {
            return res.status(500).json({ error: 'Failed to rotate service account key' });
          }

          console.log('✅ [POST /api/app-blocks/[id]] Rotated service account key for:', id);

          return res.status(200).json({ 
            appBlock,
            apiKey: result.apiKey,
          });
        }

        return res.status(400).json({ error: 'Invalid action' });
      }

      case 'PATCH': {
        // Update registration fields (gitHubUrl, appUrl, tags)
        const { gitHubUrl, appUrl, tags } = req.body as {
          gitHubUrl?: string;
          appUrl?: string;
          tags?: string[];
        };

        const patchData: Partial<{ gitHubUrl: string; appUrl: string; tags: string[] }> = {};

        // Both gitHubUrl and appUrl are required for registration
        if (gitHubUrl !== undefined || appUrl !== undefined) {
          if (!gitHubUrl || !appUrl) {
            return res.status(400).json({ error: 'Both GitHub URL and App URL are required' });
          }
          
          // Validate GitHub URL format
          try {
            const url = new URL(gitHubUrl);
            if (!url.hostname.includes('github.com')) {
              return res.status(400).json({ error: 'GitHub URL must be a valid GitHub URL' });
            }
            patchData.gitHubUrl = gitHubUrl.trim();
          } catch {
            return res.status(400).json({ error: 'Invalid GitHub URL format' });
          }
          
          // Validate App URL format
          try {
            new URL(appUrl);
            patchData.appUrl = appUrl.trim();
          } catch {
            return res.status(400).json({ error: 'Invalid App URL format' });
          }
        }

        if (tags !== undefined) {
          if (!Array.isArray(tags)) {
            return res.status(400).json({ error: 'Tags must be an array' });
          }
          patchData.tags = tags;
        }

        const updatedAppBlock = await updateAppBlock(id, patchData);

        console.log('✅ [PATCH /api/app-blocks/[id]] Updated App Block:', {
          id,
          updates: patchData,
        });

        return res.status(200).json({ appBlock: updatedAppBlock! });
      }

      case 'DELETE': {
        await deleteAppBlock(id);

        console.log('✅ [DELETE /api/app-blocks/[id]] Deleted App Block:', id);

        return res.status(200).json({ appBlock });
      }

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('❌ [/api/app-blocks/[id]] Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
