import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserById } from '@/db/user';
import { 
  getAppBlockById,
  getInstallationsWithConnectors,
  installConnector,
  getConnectorById,
  getScopesByConnector,
} from '@/db/appBlock';
import { ConnectorInstallation, Connector, AuthType } from '@/db/schema';

type InstallationWithConnector = {
  installation: ConnectorInstallation;
  connector: Connector;
};

type ResponseData = {
  installations?: InstallationWithConnector[];
  installation?: ConnectorInstallation;
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
 * GET /api/app-blocks/[id]/connectors - List installed connectors
 * POST /api/app-blocks/[id]/connectors - Install a connector
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
        const installations = await getInstallationsWithConnectors(id);
        return res.status(200).json({ installations });
      }

      case 'POST': {
        const { connector_id, scopes, auth_type } = req.body as {
          connector_id?: string;
          scopes?: string[];
          auth_type?: AuthType;
        };

        if (!connector_id || typeof connector_id !== 'string') {
          return res.status(400).json({ error: 'Connector ID is required' });
        }

        // Verify connector exists
        const connector = await getConnectorById(connector_id);
        if (!connector) {
          return res.status(404).json({ error: 'Connector not found' });
        }

        // Validate scopes
        if (!scopes || !Array.isArray(scopes) || scopes.length === 0) {
          return res.status(400).json({ error: 'At least one scope is required' });
        }

        // Verify all requested scopes exist for this connector
        const availableScopes = await getScopesByConnector(connector_id);
        const availableScopeNames = availableScopes.map(s => s.name);
        const invalidScopes = scopes.filter(s => !availableScopeNames.includes(s));
        
        if (invalidScopes.length > 0) {
          return res.status(400).json({ 
            error: `Invalid scopes: ${invalidScopes.join(', ')}` 
          });
        }

        // Validate auth type
        const authType: AuthType = auth_type === 'service' ? 'service' : 'user';

        // Install the connector
        const installation = await installConnector({
          appBlockId: id,
          connectorId: connector_id,
          grantedScopes: scopes,
          authType,
        });

        console.log('✅ [POST /api/app-blocks/[id]/connectors] Installed connector:', {
          appBlockId: id,
          connectorId: connector_id,
          scopes,
          authType,
        });

        return res.status(201).json({ installation });
      }

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('❌ [/api/app-blocks/[id]/connectors] Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
