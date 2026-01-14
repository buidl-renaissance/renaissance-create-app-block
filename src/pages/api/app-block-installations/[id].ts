import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserById } from '@/db/user';
import { getAppBlockById } from '@/db/appBlock';
import { 
  getAppBlockInstallationById,
  updateAppBlockInstallationStatus,
  revokeAppBlockInstallation,
  deleteAppBlockInstallation,
  parseGrantedScopes,
} from '@/db/registry';
import { AppBlockInstallation, AppBlockInstallationStatus } from '@/db/schema';

type ResponseData = {
  installation?: AppBlockInstallation & { granted_scopes_parsed: string[] };
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
 * GET /api/app-block-installations/[id] - Get installation details
 * PATCH /api/app-block-installations/[id] - Update installation (approve/revoke)
 * DELETE /api/app-block-installations/[id] - Delete installation
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
    const installation = await getAppBlockInstallationById(id);

    if (!installation) {
      return res.status(404).json({ error: 'Installation not found' });
    }

    // Verify ownership - user must own either consumer or provider block
    const consumerBlock = await getAppBlockById(installation.consumerAppBlockId);
    const providerBlock = await getAppBlockById(installation.providerAppBlockId);

    const isConsumerOwner = consumerBlock?.ownerUserId === user.id;
    const isProviderOwner = providerBlock?.ownerUserId === user.id;

    if (!isConsumerOwner && !isProviderOwner) {
      return res.status(403).json({ error: 'Access denied' });
    }

    switch (req.method) {
      case 'GET': {
        return res.status(200).json({
          installation: {
            ...installation,
            granted_scopes_parsed: parseGrantedScopes(installation.grantedScopes),
          },
        });
      }

      case 'PATCH': {
        const { status, action } = req.body as { 
          status?: AppBlockInstallationStatus;
          action?: 'approve' | 'revoke';
        };

        // Handle action shortcuts
        let newStatus = status;
        if (action === 'approve') {
          // Only provider owner can approve
          if (!isProviderOwner) {
            return res.status(403).json({ error: 'Only provider owner can approve installations' });
          }
          newStatus = 'active';
        } else if (action === 'revoke') {
          newStatus = 'revoked';
        }

        if (!newStatus || !['pending', 'active', 'expired', 'revoked', 'error'].includes(newStatus)) {
          return res.status(400).json({ error: 'Valid status is required' });
        }

        // Validate permissions for status changes
        if (newStatus === 'active' && !isProviderOwner) {
          return res.status(403).json({ error: 'Only provider owner can activate installations' });
        }

        const updated = await updateAppBlockInstallationStatus(id, newStatus);

        if (!updated) {
          return res.status(500).json({ error: 'Failed to update installation' });
        }

        console.log('✅ [PATCH /api/app-block-installations/[id]] Updated status:', {
          installationId: id,
          status: newStatus,
        });

        return res.status(200).json({
          installation: {
            ...updated,
            granted_scopes_parsed: parseGrantedScopes(updated.grantedScopes),
          },
        });
      }

      case 'DELETE': {
        const { permanent } = req.query;

        if (permanent === 'true') {
          // Permanently delete
          await deleteAppBlockInstallation(id);
          console.log('✅ [DELETE /api/app-block-installations/[id]] Permanently deleted:', id);
        } else {
          // Soft revoke
          await revokeAppBlockInstallation(id);
          console.log('✅ [DELETE /api/app-block-installations/[id]] Revoked:', id);
        }

        return res.status(200).json({ success: true });
      }

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('❌ [/api/app-block-installations/[id]] Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
