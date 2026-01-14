import type { NextApiRequest, NextApiResponse } from 'next';
import { getAllConnectors, getScopesByConnector, getRecipesByConnector } from '@/db/appBlock';
import { Connector, Scope, ConnectorRecipe } from '@/db/schema';

type ConnectorWithDetails = Connector & {
  scopes: Scope[];
  recipes: ConnectorRecipe[];
};

type ResponseData = {
  connectors: ConnectorWithDetails[];
} | {
  error: string;
};

/**
 * GET /api/connectors
 * List all available connectors with their scopes and recipes
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const connectorList = await getAllConnectors();
    
    // Enrich each connector with its scopes and recipes
    const connectorsWithDetails: ConnectorWithDetails[] = await Promise.all(
      connectorList.map(async (connector) => {
        const [connectorScopes, connectorRecipes] = await Promise.all([
          getScopesByConnector(connector.id),
          getRecipesByConnector(connector.id),
        ]);
        
        return {
          ...connector,
          scopes: connectorScopes,
          recipes: connectorRecipes,
        };
      })
    );

    return res.status(200).json({ connectors: connectorsWithDetails });
  } catch (error) {
    console.error('❌ [GET /api/connectors] Error:', error);
    return res.status(500).json({ error: 'Failed to fetch connectors' });
  }
}
