import type { NextApiRequest, NextApiResponse } from 'next';
import { getConnectorWithScopes, getRecipesByConnector } from '@/db/appBlock';
import { Connector, Scope, ConnectorRecipe } from '@/db/schema';

type ConnectorDetail = Connector & {
  scopes: Scope[];
  recipes: ConnectorRecipe[];
};

type ResponseData = {
  connector: ConnectorDetail;
} | {
  error: string;
};

/**
 * GET /api/connectors/[id]
 * Get a single connector with its scopes and recipes
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
      return res.status(400).json({ error: 'Connector ID is required' });
    }

    const result = await getConnectorWithScopes(id);

    if (!result) {
      return res.status(404).json({ error: 'Connector not found' });
    }

    const recipes = await getRecipesByConnector(id);

    const connectorDetail: ConnectorDetail = {
      ...result.connector,
      scopes: result.scopes,
      recipes,
    };

    return res.status(200).json({ connector: connectorDetail });
  } catch (error) {
    console.error('❌ [GET /api/connectors/[id]] Error:', error);
    return res.status(500).json({ error: 'Failed to fetch connector' });
  }
}
