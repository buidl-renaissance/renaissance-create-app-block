import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserById } from '@/db/user';
import { getRenAIClient } from '@/lib/renaiClient';

interface SkipQuestionResponse {
  success: boolean;
  data?: {
    question: {
      id: string;
      status: 'skipped';
    };
  };
  error?: string;
}

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
 * POST /api/questions/[questionId]/skip - Skip a follow-up question from Claude
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SkipQuestionResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const user = await getCurrentUser(req);
    
    if (!user) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const { questionId } = req.query;

    if (!questionId || typeof questionId !== 'string') {
      return res.status(400).json({ success: false, error: 'Question ID is required' });
    }

    // Call Ren.AI API to skip the question
    const client = getRenAIClient();
    
    try {
      const result = await client.skipQuestion(questionId);

      if (!result.success || !result.data) {
        console.error('❌ [Skip Question] Ren.AI API error:', result.error);
        return res.status(500).json({ 
          success: false, 
          error: result.error || 'Failed to skip question' 
        });
      }

      console.log('✅ [Skip Question] Question skipped:', {
        questionId,
      });

      return res.status(200).json({
        success: true,
        data: result.data,
      });

    } catch (apiError) {
      console.error('❌ [Skip Question] Ren.AI API request failed:', apiError);
      return res.status(500).json({ 
        success: false, 
        error: apiError instanceof Error ? apiError.message : 'Failed to connect to Ren.AI API' 
      });
    }

  } catch (error) {
    console.error('❌ [/api/questions/[questionId]/skip] Error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
