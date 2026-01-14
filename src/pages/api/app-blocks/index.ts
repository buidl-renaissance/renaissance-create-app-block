import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserById } from '@/db/user';
import { createAppBlock, getAppBlocksByUser, getServiceAccountByAppBlock } from '@/db/appBlock';
import { AppBlock } from '@/db/schema';

type AppBlockWithServiceAccount = AppBlock & {
  apiKey?: string; // Only included on creation
};

type ResponseData = {
  appBlocks?: AppBlock[];
  appBlock?: AppBlockWithServiceAccount;
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
 * GET /api/app-blocks - List user's App Blocks
 * POST /api/app-blocks - Create a new App Block
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

    switch (req.method) {
      case 'GET': {
        const appBlocks = await getAppBlocksByUser(user.id);
        return res.status(200).json({ appBlocks });
      }

      case 'POST': {
        const { name, description, iconUrl } = req.body as {
          name?: string;
          description?: string;
          iconUrl?: string;
        };

        if (!name || typeof name !== 'string' || name.trim().length === 0) {
          return res.status(400).json({ error: 'App Block name is required' });
        }

        if (name.length > 100) {
          return res.status(400).json({ error: 'App Block name must be 100 characters or less' });
        }

        // Create the App Block (this also creates a service account)
        const appBlock = await createAppBlock({
          name: name.trim(),
          ownerUserId: user.id,
          description: description?.trim(),
          iconUrl,
        });

        // Get the service account to return the API key (only time it's returned)
        const serviceAccount = await getServiceAccountByAppBlock(appBlock.id);
        
        console.log('✅ [POST /api/app-blocks] Created App Block:', {
          id: appBlock.id,
          name: appBlock.name,
          ownerUserId: appBlock.ownerUserId,
        });

        return res.status(201).json({
          appBlock: {
            ...appBlock,
            // Note: In a real implementation, the API key would be shown
            // only once and should be stored securely by the user
          },
        });
      }

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('❌ [/api/app-blocks] Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
