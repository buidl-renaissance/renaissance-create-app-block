import type { NextApiRequest, NextApiResponse } from 'next';
import { getOrCreateUserByRenaissanceId, updateUserPeopleId, updateUserPublicAddress } from '@/db/user';
import { syncUserWithPeopleApi } from '@/lib/peopleApi';

const RENAISSANCE_API_URL = process.env.RENAISSANCE_API_URL || 'https://api.renaissance.city';

/**
 * Verify OTP and authenticate user
 * POST /api/auth/verify-otp
 * Body: { phone, code, isNewAccount?, userData?, publicAddress? }
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { phone, code, isNewAccount, userData, publicAddress } = req.body as {
      phone?: string;
      code?: string;
      isNewAccount?: boolean;
      userData?: {
        username: string;
        name: string;
        email?: string;
      };
      publicAddress?: string;
    };

    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    if (!code) {
      return res.status(400).json({ error: 'Verification code is required' });
    }

    if (!/^\d{6}$/.test(code)) {
      return res.status(400).json({ error: 'Invalid verification code format' });
    }

    console.log('🔐 [VERIFY-OTP] Verifying OTP for:', phone.slice(-4));

    // Proxy to Renaissance API
    const response = await fetch(`${RENAISSANCE_API_URL}/v1/auth/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phone, code }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ [VERIFY-OTP] Renaissance API error:', data);
      
      if (data.code === 'INVALID_CODE') {
        return res.status(400).json({ error: 'Invalid verification code' });
      }
      if (data.code === 'CODE_EXPIRED') {
        return res.status(400).json({ error: 'Verification code has expired. Please request a new one.' });
      }
      if (data.code === 'TOO_MANY_ATTEMPTS') {
        return res.status(429).json({ error: 'Too many failed attempts. Please request a new code.' });
      }
      
      return res.status(response.status).json({ 
        error: data.message || 'Failed to verify code' 
      });
    }

    console.log('✅ [VERIFY-OTP] OTP verified, Renaissance user:', data.user);

    // Extract Renaissance user data
    const renaissanceUser = data.user;
    
    // Use Renaissance user ID for linking
    const renaissanceUserId = String(renaissanceUser.id);
    
    const username = renaissanceUser.username || userData?.username;
    const displayName = renaissanceUser.displayName || userData?.name;
    const pfpUrl = renaissanceUser.pfpUrl;
    
    // Get or create local user
    const user = await getOrCreateUserByRenaissanceId(renaissanceUserId, {
      renaissanceUserId,
      username,
      displayName,
      pfpUrl,
      publicAddress,
    });

    // Update public address if provided and not already set
    if (publicAddress && !user.publicAddress) {
      await updateUserPublicAddress(user.id, publicAddress);
      user.publicAddress = publicAddress;
    }

    // Sync with Renaissance People API if we have a public address
    if (publicAddress || user.publicAddress) {
      const syncResult = await syncUserWithPeopleApi({
        publicAddress: (publicAddress || user.publicAddress)!,
        username: username || undefined,
        name: displayName || undefined,
        profilePicture: pfpUrl || undefined,
      });

      if (syncResult) {
        // Store the People API user ID locally
        await updateUserPeopleId(user.id, syncResult.user.id);
        user.peopleUserId = syncResult.user.id;
        console.log('✅ [VERIFY-OTP] User synced with People API:', {
          peopleUserId: syncResult.user.id,
          created: syncResult.created,
        });
      }
    }

    // Set session cookie
    res.setHeader('Set-Cookie', `user_session=${user.id}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`);

    console.log('✅ [VERIFY-OTP] User authenticated:', {
      userId: user.id,
      renaissanceUserId: user.renaissanceUserId,
      username: user.username,
      publicAddress: user.publicAddress,
      peopleUserId: user.peopleUserId,
    });

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        pfpUrl: user.pfpUrl,
        publicAddress: user.publicAddress,
        peopleUserId: user.peopleUserId,
      },
    });
  } catch (error) {
    console.error('❌ [VERIFY-OTP] Error verifying OTP:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
