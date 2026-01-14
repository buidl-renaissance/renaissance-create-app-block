import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserById } from '@/db/user';
import { 
  getInstallationById,
  getAppBlockById,
  revokeConnector,
  deleteConnectorInstallation,
  updateInstallationStatus,
} from '@/db/appBlock';
import { ConnectorInstallation, InstallationStatus } from '@/db/schema';

type ResponseData = {
  installation?: ConnectorInstallation;
  success?: boolean;
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
 * GET /api/connector-installations/[id] - Get installation details
 * PUT /api/connector-installations/[id] - Update installation status
 * DELETE /api/connector-installations/[id] - Revoke/delete connector installation
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
      return res.status(400).json({ error: 'Installation ID is required' });
    }

    // Get the installation
    const installation = await getInstallationById(id);

    if (!installation) {
      return res.status(404).json({ error: 'Installation not found' });
    }

    // Verify ownership through the App Block
    const appBlock = await getAppBlockById(installation.appBlockId);

    if (!appBlock || appBlock.ownerUserId !== user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    switch (req.method) {
      case 'GET': {
        return res.status(200).json({ installation });
      }

      case 'PUT': {
        const { status } = req.body as { status?: InstallationStatus };

        if (!status || !['active', 'expired', 'revoked', 'error'].includes(status)) {
          return res.status(400).json({ error: 'Valid status is required' });
        }

        const updated = await updateInstallationStatus(id, status);

        console.log('✅ [PUT /api/connector-installations/[id]] Updated status:', {
          installationId: id,
          status,
        });

        return res.status(200).json({ installation: updated! });
      }

      case 'DELETE': {
        const { permanent } = req.query;

        if (permanent === 'true') {
          // Permanently delete the installation
          await deleteConnectorInstallation(id);
          console.log('✅ [DELETE /api/connector-installations/[id]] Permanently deleted:', id);
        } else {
          // Soft revoke (set status to 'revoked')
          await revokeConnector(id);
          console.log('✅ [DELETE /api/connector-installations/[id]] Revoked:', id);
        }

        return res.status(200).json({ success: true });
      }

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('❌ [/api/connector-installations/[id]] Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
