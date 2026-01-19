import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserById, updateUserProfile } from '@/db/user';
import { uploadProfileImageToDO } from '@/utils/digitalOceanUpload';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb', // Allow larger payloads for image uploads
    },
  },
};

type ResponseData = {
  user?: {
    id: string;
    username: string | null;
    displayName: string | null;
    profilePicture: string | null;
  };
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'PUT' && req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get user ID from session cookie
    const cookies = req.headers.cookie || '';
    const sessionMatch = cookies.match(/user_session=([^;]+)/);
    
    if (!sessionMatch || !sessionMatch[1]) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const userId = sessionMatch[1];
    const user = await getUserById(userId);

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    const { displayName, profilePicture } = req.body;

    const updateData: {
      displayName?: string;
      profilePicture?: string | null;
    } = {};

    // Handle display name update
    if (displayName !== undefined) {
      updateData.displayName = displayName === '' ? undefined : displayName;
    }

    // Handle profile picture upload
    if (profilePicture !== undefined) {
      if (profilePicture === null || profilePicture === '') {
        // Clear profile picture
        updateData.profilePicture = null;
      } else {
        // Upload new profile picture to Digital Ocean Spaces
        try {
          const imageUrl = await uploadProfileImageToDO(profilePicture, userId);
          updateData.profilePicture = imageUrl;
        } catch (error) {
          console.error('Image upload failed:', error);
          return res.status(400).json({
            error: error instanceof Error ? error.message : 'Failed to upload image',
          });
        }
      }
    }

    // Update user in database
    const updatedUser = await updateUserProfile(userId, updateData);

    if (!updatedUser) {
      return res.status(500).json({ error: 'Failed to update user' });
    }

    return res.status(200).json({
      user: {
        id: updatedUser.id,
        username: updatedUser.username ?? null,
        displayName: updatedUser.displayName ?? null,
        profilePicture: updatedUser.profilePicture ?? null,
      },
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
