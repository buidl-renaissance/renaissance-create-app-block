import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserById } from '@/db/user';
import { createAppBlock } from '@/db/appBlock';
import { AppBlock } from '@/db/schema';

type ResponseData = {
  appBlock?: AppBlock;
  error?: string;
  errors?: Record<string, string>;
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
 * Validate URL format
 */
function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * Validate GitHub URL format
 */
function isValidGitHubUrl(url: string): boolean {
  if (!isValidUrl(url)) return false;
  try {
    const parsed = new URL(url);
    return parsed.hostname === 'github.com' || parsed.hostname === 'www.github.com';
  } catch {
    return false;
  }
}

/**
 * POST /api/app-blocks/register - Register a new App Block with URLs
 * 
 * Body:
 * - name: string (required) - App name
 * - description: string (optional) - Tagline/description
 * - iconUrl: string (optional) - Image URL for the app
 * - gitHubUrl: string (optional) - GitHub repository URL
 * - appUrl: string (optional) - Live application URL
 * - tags: string[] (optional) - Tags for filtering
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = await getCurrentUser(req);
    
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { name, description, iconUrl, gitHubUrl, appUrl, tags } = req.body as {
      name?: string;
      description?: string;
      iconUrl?: string;
      gitHubUrl?: string;
      appUrl?: string;
      tags?: string[];
    };

    // Validation
    const errors: Record<string, string> = {};

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      errors.name = 'App name is required';
    } else if (name.length > 100) {
      errors.name = 'App name must be 100 characters or less';
    }

    if (description && description.length > 500) {
      errors.description = 'Description must be 500 characters or less';
    }

    if (iconUrl && !isValidUrl(iconUrl)) {
      errors.iconUrl = 'Please enter a valid image URL';
    }

    if (gitHubUrl) {
      if (!isValidGitHubUrl(gitHubUrl)) {
        errors.gitHubUrl = 'Please enter a valid GitHub URL (e.g., https://github.com/username/repo)';
      }
    }

    if (appUrl && !isValidUrl(appUrl)) {
      errors.appUrl = 'Please enter a valid URL';
    }

    // Validate tags
    if (tags) {
      if (!Array.isArray(tags)) {
        errors.tags = 'Tags must be an array';
      } else if (tags.length > 10) {
        errors.tags = 'Maximum 10 tags allowed';
      } else if (tags.some(tag => typeof tag !== 'string' || tag.length > 30)) {
        errors.tags = 'Each tag must be a string of 30 characters or less';
      }
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ errors });
    }

    // Normalize tags: lowercase, trim whitespace, remove duplicates
    const normalizedTags = tags 
      ? [...new Set(tags.map(tag => tag.trim().toLowerCase()).filter(Boolean))]
      : undefined;

    // Create the App Block with active status (registered apps are ready to use)
    const appBlock = await createAppBlock({
      name: name!.trim(),
      ownerUserId: user.id,
      description: description?.trim(),
      iconUrl: iconUrl?.trim(),
      gitHubUrl: gitHubUrl?.trim(),
      appUrl: appUrl?.trim(),
      tags: normalizedTags,
      status: 'active',
      onboardingStage: 'complete',
    });

    console.log('✅ [POST /api/app-blocks/register] Registered App Block:', {
      id: appBlock.id,
      name: appBlock.name,
      ownerUserId: appBlock.ownerUserId,
      gitHubUrl: appBlock.gitHubUrl,
      appUrl: appBlock.appUrl,
      tags: normalizedTags,
    });

    return res.status(201).json({ appBlock });
  } catch (error) {
    console.error('❌ [/api/app-blocks/register] Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
