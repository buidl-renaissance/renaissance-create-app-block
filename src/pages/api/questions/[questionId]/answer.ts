import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserById } from '@/db/user';
import { getRenAIClient } from '@/lib/renaiClient';

interface AnswerQuestionRequest {
  answer: string;
}

interface AnswerQuestionResponse {
  success: boolean;
  data?: {
    question: {
      id: string;
      status: 'answered';
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
 * POST /api/questions/[questionId]/answer - Answer a follow-up question from Claude
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AnswerQuestionResponse>
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

    const { answer } = req.body as AnswerQuestionRequest;

    if (!answer || typeof answer !== 'string' || answer.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Answer is required' });
    }

    // Call Ren.AI API to answer the question
    const client = getRenAIClient();
    
    try {
      const result = await client.answerQuestion(questionId, answer.trim());

      if (!result.success || !result.data) {
        console.error('❌ [Answer Question] Ren.AI API error:', result.error);
        return res.status(500).json({ 
          success: false, 
          error: result.error || 'Failed to submit answer' 
        });
      }

      console.log('✅ [Answer Question] Answer submitted:', {
        questionId,
        answerLength: answer.length,
      });

      return res.status(200).json({
        success: true,
        data: result.data,
      });

    } catch (apiError) {
      console.error('❌ [Answer Question] Ren.AI API request failed:', apiError);
      return res.status(500).json({ 
        success: false, 
        error: apiError instanceof Error ? apiError.message : 'Failed to connect to Ren.AI API' 
      });
    }

  } catch (error) {
    console.error('❌ [/api/questions/[questionId]/answer] Error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
