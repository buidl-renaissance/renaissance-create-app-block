import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserByEmail } from '@/db/user';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// In-memory store for verification codes (in production, use Redis or database)
// Map of email -> { code, expiresAt }
const pendingCodes = new Map<string, { code: string; expiresAt: number }>();

// Export for use in verify-code
export { pendingCodes };

/**
 * Send verification code to email for sign-in
 * POST /api/auth/send-code
 * Body: { email }
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.body as { email?: string };

    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    console.log('📧 [SEND-CODE] Looking up user for email:', normalizedEmail);

    // Check if user exists with this email
    const user = await getUserByEmail(normalizedEmail);
    if (!user) {
      return res.status(404).json({ 
        error: 'No account found with this email. Please create an account.' 
      });
    }

    // Generate 6-digit verification code
    const isDev = process.env.NODE_ENV === 'development';
    const code = isDev ? '123456' : Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store code with 10 minute expiry
    pendingCodes.set(normalizedEmail, {
      code,
      expiresAt: Date.now() + 10 * 60 * 1000,
    });

    console.log('✅ [SEND-CODE] Code generated for user:', user.username);
    
    // In development, just log the code
    if (isDev) {
      console.log('🔐 [SEND-CODE] Development verification code:', code);
      return res.status(200).json({
        success: true,
        message: `Verification code: ${code}`,
      });
    }

    // Send email with verification code
    try {
      const { error: emailError } = await resend.emails.send({
        from: 'Renaissance City <noreply@builddetroit.xyz>',
        to: [normalizedEmail],
        subject: 'Your Renaissance City Verification Code',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 480px; margin: 0 auto; padding: 40px 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .header h1 { color: #7c3aed; margin: 0; font-size: 28px; }
              .code-box { background: #f5f3ff; border: 2px solid #7c3aed; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0; }
              .code { font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #7c3aed; font-family: monospace; }
              .message { color: #666; font-size: 14px; text-align: center; }
              .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #999; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🏛️ Renaissance City</h1>
              </div>
              <p>Hi ${user.displayName || user.username || 'there'},</p>
              <p>Here's your verification code to sign in:</p>
              <div class="code-box">
                <div class="code">${code}</div>
              </div>
              <p class="message">This code will expire in 10 minutes.</p>
              <p class="message">If you didn't request this code, you can safely ignore this email.</p>
              <div class="footer">
                Renaissance City • Detroit, MI
              </div>
            </div>
          </body>
          </html>
        `,
      });

      if (emailError) {
        console.error('❌ [SEND-CODE] Failed to send email:', emailError);
        return res.status(500).json({ error: 'Failed to send verification email' });
      }

      console.log('✅ [SEND-CODE] Verification email sent');
    } catch (emailErr) {
      console.error('❌ [SEND-CODE] Email error:', emailErr);
      return res.status(500).json({ error: 'Failed to send verification email' });
    }

    return res.status(200).json({
      success: true,
      message: 'Verification code sent to your email',
    });
  } catch (error) {
    console.error('❌ [SEND-CODE] Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
