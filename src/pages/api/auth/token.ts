import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserById } from '@/db/user';
import { 
  createAccessToken,
  validateAccessToken,
  revokeAccessToken,
  validateServiceAccountKey,
  getAppBlockById,
  getInstallationsByAppBlock,
  parseScopes,
} from '@/db/appBlock';
import { AccessToken } from '@/db/schema';

type TokenResponse = {
  access_token?: string;
  token_type?: string;
  expires_in?: number;
  scope?: string;
};

type ValidateResponse = {
  valid: boolean;
  subject_type?: string;
  subject_id?: string;
  scopes?: string[];
  expires_at?: string;
};

type ResponseData = TokenResponse | ValidateResponse | {
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
 * POST /api/auth/token - Token exchange
 * 
 * Supports two grant types:
 * 1. user_session - Exchange user session for access token
 * 2. service_account - Exchange API key for access token
 * 
 * Also supports:
 * - action=validate - Validate an existing token
 * - action=revoke - Revoke an existing token
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      grant_type, 
      app_block_id, 
      scopes: requestedScopes,
      api_key,
      token,
      action,
      expires_in_minutes,
    } = req.body as {
      grant_type?: 'user_session' | 'service_account';
      app_block_id?: string;
      scopes?: string[];
      api_key?: string;
      token?: string;
      action?: 'validate' | 'revoke';
      expires_in_minutes?: number;
    };

    // Handle token validation
    if (action === 'validate') {
      if (!token) {
        return res.status(400).json({ error: 'Token is required for validation' });
      }

      const result = await validateAccessToken(token);
      
      if (!result.valid || !result.accessToken) {
        return res.status(200).json({ valid: false });
      }

      return res.status(200).json({
        valid: true,
        subject_type: result.accessToken.subjectType,
        subject_id: result.accessToken.subjectId,
        scopes: result.scopes,
        expires_at: result.accessToken.expiresAt.toISOString(),
      });
    }

    // Handle token revocation
    if (action === 'revoke') {
      if (!token) {
        return res.status(400).json({ error: 'Token is required for revocation' });
      }

      const revoked = await revokeAccessToken(token);
      
      return res.status(200).json({ success: revoked });
    }

    // Handle token exchange
    if (!grant_type) {
      return res.status(400).json({ error: 'grant_type is required' });
    }

    // User session grant type
    if (grant_type === 'user_session') {
      const user = await getCurrentUser(req);
      
      if (!user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      if (!app_block_id) {
        return res.status(400).json({ error: 'app_block_id is required' });
      }

      // Verify user owns the app block
      const appBlock = await getAppBlockById(app_block_id);
      if (!appBlock || appBlock.ownerUserId !== user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Get available scopes from installations
      const installations = await getInstallationsByAppBlock(app_block_id);
      const availableScopes: string[] = [];
      
      for (const installation of installations) {
        if (installation.status === 'active') {
          availableScopes.push(...parseScopes(installation.grantedScopes));
        }
      }

      // Determine final scopes
      let finalScopes = availableScopes;
      if (requestedScopes && requestedScopes.length > 0) {
        // Filter to only requested scopes that are available
        finalScopes = requestedScopes.filter(s => availableScopes.includes(s));
        
        if (finalScopes.length === 0) {
          return res.status(400).json({ error: 'None of the requested scopes are available' });
        }
      }

      // Create the access token
      const accessToken = await createAccessToken({
        subjectType: 'user',
        subjectId: user.id,
        appBlockId: app_block_id,
        scopes: finalScopes,
        expiresInMinutes: expires_in_minutes,
      });

      console.log('✅ [POST /api/auth/token] Created user access token:', {
        userId: user.id,
        appBlockId: app_block_id,
        scopes: finalScopes,
      });

      const expiresIn = Math.floor((accessToken.expiresAt.getTime() - Date.now()) / 1000);

      return res.status(200).json({
        access_token: accessToken.token,
        token_type: 'Bearer',
        expires_in: expiresIn,
        scope: finalScopes.join(' '),
      });
    }

    // Service account grant type
    if (grant_type === 'service_account') {
      if (!api_key) {
        return res.status(400).json({ error: 'api_key is required for service_account grant' });
      }

      // Validate the API key
      const serviceAccount = await validateServiceAccountKey(api_key);
      
      if (!serviceAccount) {
        return res.status(401).json({ error: 'Invalid API key' });
      }

      // Get available scopes from installations
      const installations = await getInstallationsByAppBlock(serviceAccount.appBlockId);
      const availableScopes: string[] = [];
      
      for (const installation of installations) {
        if (installation.status === 'active' && installation.authType === 'service') {
          availableScopes.push(...parseScopes(installation.grantedScopes));
        }
      }

      // Determine final scopes
      let finalScopes = availableScopes;
      if (requestedScopes && requestedScopes.length > 0) {
        finalScopes = requestedScopes.filter(s => availableScopes.includes(s));
        
        if (finalScopes.length === 0) {
          return res.status(400).json({ error: 'None of the requested scopes are available for service access' });
        }
      }

      // Create the access token
      const accessToken = await createAccessToken({
        subjectType: 'service',
        subjectId: serviceAccount.id,
        appBlockId: serviceAccount.appBlockId,
        scopes: finalScopes,
        expiresInMinutes: expires_in_minutes,
      });

      console.log('✅ [POST /api/auth/token] Created service access token:', {
        serviceAccountId: serviceAccount.id,
        appBlockId: serviceAccount.appBlockId,
        scopes: finalScopes,
      });

      const expiresIn = Math.floor((accessToken.expiresAt.getTime() - Date.now()) / 1000);

      return res.status(200).json({
        access_token: accessToken.token,
        token_type: 'Bearer',
        expires_in: expiresIn,
        scope: finalScopes.join(' '),
      });
    }

    return res.status(400).json({ error: 'Invalid grant_type' });
  } catch (error) {
    console.error('❌ [POST /api/auth/token] Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
