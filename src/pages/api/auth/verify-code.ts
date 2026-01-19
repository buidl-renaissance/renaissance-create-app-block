import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserByEmail, isUserLocked, isUserActive } from '@/db/user';
import { pendingCodes } from './send-code';

/**
 * Verify email code and authenticate user
 * POST /api/auth/verify-code
 * Body: { email, code }
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, code } = req.body as {
      email?: string;
      code?: string;
    };

    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Email is required' });
    }

    if (!code || !code.trim()) {
      return res.status(400).json({ error: 'Verification code is required' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    console.log('🔐 [VERIFY-CODE] Verifying code for:', normalizedEmail);

    // Check code
    const storedCode = pendingCodes.get(normalizedEmail);
    
    if (!storedCode) {
      return res.status(400).json({ error: 'No verification code found. Please request a new one.' });
    }

    if (Date.now() > storedCode.expiresAt) {
      pendingCodes.delete(normalizedEmail);
      return res.status(400).json({ error: 'Verification code has expired. Please request a new one.' });
    }

    if (storedCode.code !== code.trim()) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }

    // Clear the code after successful verification
    pendingCodes.delete(normalizedEmail);

    // Get user by email
    const user = await getUserByEmail(normalizedEmail);
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    // Check if user is locked or inactive
    if (isUserLocked(user)) {
      return res.status(403).json({ error: 'Account is locked. Please contact support.' });
    }

    if (!isUserActive(user)) {
      return res.status(403).json({ error: 'Account is not active.' });
    }

    console.log('✅ [VERIFY-CODE] Code verified for user:', user.username);

    // Set session cookie
    res.setHeader('Set-Cookie', `user_session=${user.id}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`);

    console.log('✅ [VERIFY-CODE] User authenticated:', {
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    });

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        email: user.email,
        phone: user.phone,
        pfpUrl: user.pfpUrl,
        accountAddress: user.accountAddress,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('❌ [VERIFY-CODE] Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
