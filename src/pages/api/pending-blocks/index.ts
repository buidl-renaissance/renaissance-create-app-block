import type { NextApiRequest, NextApiResponse } from 'next';
import { Resend } from 'resend';
import { getUserById } from '@/db/user';
import { 
  createDraftAppBlock, 
  updateOnboardingProgress,
  getDraftBlocksByUser,
  getAppBlockById,
  parseOnboardingData,
} from '@/db/appBlock';
import type { AppBlock, OnboardingStage } from '@/db/schema';

const resend = new Resend(process.env.RESEND_API_KEY);

const NOTIFICATION_EMAIL = 'john@dpop.tech';

interface SummaryData {
  name: string;
  tagline: string;
  description: string;
  targetAudience: string;
  coreFeatures: string[];
  nextSteps: string[];
}

interface ProcessedAnswer {
  question: string;
  answer: string;
  keyPoints: string[];
}

type ResponseData = {
  success?: boolean;
  appBlock?: AppBlock;
  appBlocks?: AppBlock[];
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
 * Send notification email about new block
 */
async function sendNotificationEmail(
  appBlock: AppBlock,
  summary: SummaryData,
  processedAnswers: ProcessedAnswer[],
  userName: string
): Promise<boolean> {
  try {
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #a78bfa 0%, #f5d764 150%); padding: 20px; border-radius: 12px 12px 0 0; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 24px; }
    .content { background: #f9fafb; padding: 24px; border-radius: 0 0 12px 12px; }
    .section { margin-bottom: 20px; }
    .section-title { font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: #6b7280; margin-bottom: 8px; }
    .feature { background: white; padding: 12px; border-radius: 8px; margin-bottom: 8px; border-left: 3px solid #a78bfa; }
    .feature-name { font-weight: 600; }
    .answer-card { background: white; padding: 12px; border-radius: 8px; margin-bottom: 8px; border: 1px solid #e5e7eb; }
    .answer-question { font-weight: 600; font-size: 13px; color: #374151; margin-bottom: 4px; }
    .answer-text { font-size: 14px; color: #4b5563; }
    .key-points { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 8px; }
    .key-point { font-size: 11px; padding: 2px 8px; background: #a78bfa22; color: #7c3aed; border-radius: 100px; }
    .meta { font-size: 14px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏗️ New App Block Created</h1>
    </div>
    <div class="content">
      <div class="section">
        <div class="section-title">Block Details</div>
        <p><strong>${summary.name}</strong></p>
        <p style="font-style: italic; color: #7c3aed;">${summary.tagline}</p>
        <p class="meta">Type: ${appBlock.blockType} • Submitted by: ${userName}</p>
      </div>

      <div class="section">
        <div class="section-title">Description</div>
        <p>${summary.description}</p>
      </div>

      <div class="section">
        <div class="section-title">Target Audience</div>
        <p>${summary.targetAudience}</p>
      </div>

      <div class="section">
        <div class="section-title">Core Features</div>
        ${summary.coreFeatures.map(f => `
          <div class="feature">
            <span class="feature-name">✦ ${f}</span>
          </div>
        `).join('')}
      </div>

      <div class="section">
        <div class="section-title">Next Steps</div>
        <ol style="margin: 0; padding-left: 20px;">
          ${summary.nextSteps.map(s => `<li>${s}</li>`).join('')}
        </ol>
      </div>

      ${processedAnswers.length > 0 ? `
      <div class="section">
        <div class="section-title">User's Answers</div>
        ${processedAnswers.map(a => `
          <div class="answer-card">
            <div class="answer-question">${a.question}</div>
            <div class="answer-text">${a.answer}</div>
            ${a.keyPoints.length > 0 ? `
              <div class="key-points">
                ${a.keyPoints.map(kp => `<span class="key-point">${kp}</span>`).join('')}
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>
      ` : ''}

      <div class="meta" style="text-align: center; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
        Block ID: ${appBlock.id}<br>
        Status: ${appBlock.status} (${appBlock.onboardingStage})<br>
        Created: ${new Date(appBlock.createdAt).toLocaleString()}
      </div>
    </div>
  </div>
</body>
</html>
    `;

    const { error } = await resend.emails.send({
      from: 'Renaissance City <noreply@builddetroit.xyz>',
      to: [NOTIFICATION_EMAIL],
      subject: `🏗️ New App Block: ${summary.name}`,
      html: emailHtml,
    });

    if (error) {
      console.error('Failed to send notification email:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Error sending notification email:', err);
    return false;
  }
}

/**
 * POST /api/pending-blocks - Create or update a draft app block
 * GET /api/pending-blocks - Get user's draft blocks
 * PATCH /api/pending-blocks - Update an existing draft block's progress
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  try {
    const user = await getCurrentUser(req);
    
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    switch (req.method) {
      case 'GET': {
        const appBlocks = await getDraftBlocksByUser(user.id);
        return res.status(200).json({ appBlocks });
      }

      case 'POST': {
        const { blockName, blockType, summary, processedAnswers } = req.body as {
          blockName: string;
          blockType: string;
          summary: SummaryData;
          processedAnswers?: ProcessedAnswer[];
        };

        // Validate required fields
        if (!blockName || typeof blockName !== 'string' || blockName.trim().length === 0) {
          return res.status(400).json({ error: 'Block name is required' });
        }

        if (!blockType || typeof blockType !== 'string') {
          return res.status(400).json({ error: 'Block type is required' });
        }

        if (!summary || typeof summary !== 'object') {
          return res.status(400).json({ error: 'Summary data is required' });
        }

        // Create the draft app block
        const appBlock = await createDraftAppBlock({
          name: blockName.trim(),
          ownerUserId: user.id,
          blockType,
          onboardingData: { 
            summary, 
            processedAnswers: processedAnswers || [] 
          },
        });

        // Update to followup stage since we have the summary
        await updateOnboardingProgress(appBlock.id, {
          onboardingStage: 'followup',
          onboardingData: { 
            summary, 
            processedAnswers: processedAnswers || [] 
          },
        });

        const updatedBlock = await getAppBlockById(appBlock.id);

        console.log('✅ [POST /api/pending-blocks] Created draft app block:', {
          id: appBlock.id,
          name: appBlock.name,
          userId: user.id,
        });

        // Send notification email
        const userName = user.displayName || user.username || 'Anonymous User';
        const emailSent = await sendNotificationEmail(
          updatedBlock || appBlock, 
          summary, 
          processedAnswers || [],
          userName
        );
        
        if (emailSent) {
          console.log('✅ [POST /api/pending-blocks] Notification email sent');
        } else {
          console.warn('⚠️ [POST /api/pending-blocks] Failed to send notification email');
        }

        return res.status(201).json({
          success: true,
          appBlock: updatedBlock || appBlock,
        });
      }

      case 'PATCH': {
        const { appBlockId, onboardingStage, onboardingData, name, description } = req.body as {
          appBlockId: string;
          onboardingStage?: OnboardingStage;
          onboardingData?: object;
          name?: string;
          description?: string;
        };

        if (!appBlockId) {
          return res.status(400).json({ error: 'App block ID is required' });
        }

        // Verify ownership
        const existingBlock = await getAppBlockById(appBlockId);
        if (!existingBlock) {
          return res.status(404).json({ error: 'App block not found' });
        }
        if (existingBlock.ownerUserId !== user.id) {
          return res.status(403).json({ error: 'Not authorized to update this block' });
        }

        // Update the block's progress
        const updatedBlock = await updateOnboardingProgress(appBlockId, {
          onboardingStage,
          onboardingData,
          name,
          description,
        });

        console.log('✅ [PATCH /api/pending-blocks] Updated app block:', {
          id: appBlockId,
          stage: onboardingStage,
        });

        return res.status(200).json({
          success: true,
          appBlock: updatedBlock || undefined,
        });
      }

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('❌ [/api/pending-blocks] Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
