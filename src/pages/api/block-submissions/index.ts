import type { NextApiRequest, NextApiResponse } from 'next';
import sharp from 'sharp';
import {
  createBlockSubmission,
  getAllBlockSubmissions,
  hasExistingSubmission,
} from '@/db/blockSubmission';
import type { BlockSubmission } from '@/db/schema';

const REQUIRED_ICON_SIZE = 512;

type ResponseData = {
  success?: boolean;
  submission?: BlockSubmission;
  submissions?: BlockSubmission[];
  error?: string;
};

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate URL format
 */
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate icon image dimensions (must be 512x512 square)
 */
async function validateIconDimensions(iconUrl: string): Promise<{ valid: boolean; error?: string }> {
  try {
    // Fetch the image with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(iconUrl, { 
      signal: controller.signal,
      headers: {
        'Accept': 'image/*',
      },
    });
    clearTimeout(timeout);
    
    if (!response.ok) {
      return { valid: false, error: 'Unable to fetch icon image' };
    }
    
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.startsWith('image/')) {
      return { valid: false, error: 'Icon URL must point to an image file' };
    }
    
    const buffer = Buffer.from(await response.arrayBuffer());
    const metadata = await sharp(buffer).metadata();
    
    if (!metadata.width || !metadata.height) {
      return { valid: false, error: 'Unable to determine icon dimensions' };
    }
    
    if (metadata.width !== metadata.height) {
      return { 
        valid: false, 
        error: `Icon must be square. Got ${metadata.width}x${metadata.height}` 
      };
    }
    
    if (metadata.width !== REQUIRED_ICON_SIZE) {
      return { 
        valid: false, 
        error: `Icon must be ${REQUIRED_ICON_SIZE}x${REQUIRED_ICON_SIZE} pixels. Got ${metadata.width}x${metadata.height}` 
      };
    }
    
    return { valid: true };
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return { valid: false, error: 'Icon image fetch timed out' };
    }
    console.error('Icon validation error:', error);
    return { valid: false, error: 'Unable to validate icon image' };
  }
}

/**
 * POST /api/block-submissions - Submit a new block (public endpoint)
 * GET /api/block-submissions - List all submissions (for admin)
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  try {
    switch (req.method) {
      case 'GET': {
        // List all submissions (could add admin auth later)
        const submissions = await getAllBlockSubmissions();
        return res.status(200).json({ submissions });
      }

      case 'POST': {
        const { blockName, submitterName, email, projectDescription, projectUrl, iconUrl } = req.body as {
          blockName?: string;
          submitterName?: string;
          email?: string;
          projectDescription?: string;
          projectUrl?: string;
          iconUrl?: string;
        };

        // Validate block name
        if (!blockName || typeof blockName !== 'string' || blockName.trim().length === 0) {
          return res.status(400).json({ error: 'Block name is required' });
        }

        if (blockName.length > 100) {
          return res.status(400).json({ error: 'Block name must be 100 characters or less' });
        }

        // Validate submitter name
        if (!submitterName || typeof submitterName !== 'string' || submitterName.trim().length === 0) {
          return res.status(400).json({ error: 'Your name is required' });
        }

        if (submitterName.length > 100) {
          return res.status(400).json({ error: 'Name must be 100 characters or less' });
        }

        // Validate email
        if (!email || typeof email !== 'string' || email.trim().length === 0) {
          return res.status(400).json({ error: 'Email is required' });
        }

        if (!isValidEmail(email.trim())) {
          return res.status(400).json({ error: 'Please provide a valid email address' });
        }

        // Validate project description
        if (!projectDescription || typeof projectDescription !== 'string' || projectDescription.trim().length === 0) {
          return res.status(400).json({ error: 'Project description is required' });
        }

        if (projectDescription.length > 5000) {
          return res.status(400).json({ error: 'Project description must be 5000 characters or less' });
        }

        // Validate project URL
        if (!projectUrl || typeof projectUrl !== 'string' || projectUrl.trim().length === 0) {
          return res.status(400).json({ error: 'Project URL is required' });
        }

        if (!isValidUrl(projectUrl.trim())) {
          return res.status(400).json({ error: 'Please provide a valid project URL' });
        }

        // Validate icon URL (optional)
        if (iconUrl && typeof iconUrl === 'string' && iconUrl.trim().length > 0) {
          if (!isValidUrl(iconUrl.trim())) {
            return res.status(400).json({ error: 'Please provide a valid icon URL' });
          }
          
          // Validate icon dimensions (must be 512x512)
          const iconValidation = await validateIconDimensions(iconUrl.trim());
          if (!iconValidation.valid) {
            return res.status(400).json({ error: iconValidation.error });
          }
        }

        // Check for duplicate submission
        const hasDuplicate = await hasExistingSubmission(email.trim(), blockName.trim());
        if (hasDuplicate) {
          return res.status(409).json({ 
            error: 'You already have a pending submission with this block name' 
          });
        }

        // Create the submission
        const submission = await createBlockSubmission({
          blockName: blockName.trim(),
          submitterName: submitterName.trim(),
          email: email.trim().toLowerCase(),
          projectDescription: projectDescription.trim(),
          projectUrl: projectUrl.trim(),
          iconUrl: iconUrl?.trim() || null,
        });

        console.log('✅ [POST /api/block-submissions] New submission:', {
          id: submission.id,
          blockName: submission.blockName,
          email: submission.email,
        });

        return res.status(201).json({
          success: true,
          submission,
        });
      }

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('❌ [/api/block-submissions] Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
