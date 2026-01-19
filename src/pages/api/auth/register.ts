import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserByEmail, getUserByUsername, createUserWithEmail } from '@/db/user';

interface PendingUserData {
  renaissanceId?: string;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
  accountAddress?: string;
}

/**
 * Register a new user with email and PIN
 * POST /api/auth/register
 * Body: { username, name, email, pin, phone?, pendingUserData? }
 * 
 * If pendingUserData is provided (from Renaissance app), links accountAddress to user
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, name, email, pin, phone, pendingUserData } = req.body as {
      username?: string;
      name?: string;
      email?: string;
      pin?: string;
      phone?: string;
      pendingUserData?: PendingUserData;
    };

    // Validate required fields
    if (!username || !username.trim()) {
      return res.status(400).json({ error: 'Username is required' });
    }

    // Validate username format: only letters (A-Za-z), numbers (0-9), and underscores
    const usernameRegex = /^[A-Za-z0-9_]+$/;
    if (!usernameRegex.test(username.trim())) {
      return res.status(400).json({ error: 'Username can only contain letters, numbers, and underscores' });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }

    // Email is required
    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Normalize phone number if provided
    let normalizedPhone: string | undefined;
    if (phone && phone.trim()) {
      normalizedPhone = phone.replace(/[\s\-\(\)]/g, '');
      // Basic phone validation if provided
      if (!/^\+?[\d]{10,15}$/.test(normalizedPhone)) {
        return res.status(400).json({ error: 'Invalid phone number format' });
      }
    }

    // Check if email already exists
    const existingEmail = await getUserByEmail(email.trim());
    if (existingEmail) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Check if username already exists
    const existingUsername = await getUserByUsername(username.trim());
    if (existingUsername) {
      return res.status(409).json({ error: 'Username already taken' });
    }

    // Create user (no PIN required on registration)
    const user = await createUserWithEmail({
      username: username.trim(),
      displayName: name.trim(),
      email: email.trim().toLowerCase(),
      phone: normalizedPhone,
      // Link Renaissance data if provided
      accountAddress: pendingUserData?.accountAddress,
      renaissanceId: pendingUserData?.renaissanceId,
      pfpUrl: pendingUserData?.pfpUrl,
    });

    // Set session cookie
    res.setHeader('Set-Cookie', `user_session=${user.id}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`);

    console.log('✅ [REGISTER] User registered successfully:', {
      userId: user.id,
      username: user.username,
      email: user.email,
      accountAddress: user.accountAddress,
      role: user.role,
    });

    return res.status(201).json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        email: user.email,
        phone: user.phone,
        accountAddress: user.accountAddress,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Error registering user:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
