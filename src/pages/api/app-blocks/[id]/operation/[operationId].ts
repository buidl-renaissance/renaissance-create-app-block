import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserById } from '@/db/user';
import { getAppBlockById } from '@/db/appBlock';
import { 
  getRenAIClient, 
  Operation, 
  Question, 
  AgentLog, 
  AgentLogSummary 
} from '@/lib/renaiClient';

interface EnhancedOperationStatusResponse {
  success: boolean;
  data?: {
    operation: Operation;
    questions?: Question[];
    sessionId?: string;
    // Enhanced agent log data
    agentLogs?: AgentLog[];
    logSummary?: AgentLogSummary;
    streamUrl?: string;
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
 * GET /api/app-blocks/[id]/operation/[operationId] - Get operation status from Ren.AI API
 * 
 * Enhanced to include agent logs, cost summary, and stream URL for real-time updates.
 * 
 * Query params:
 * - includeLogs: boolean (default true) - include recent agent logs
 * - logLimit: number (default 50) - max logs to return
 * - sinceTimestamp: number - only return logs after this timestamp (for incremental updates)
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<EnhancedOperationStatusResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const user = await getCurrentUser(req);
    
    if (!user) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const { id, operationId, includeLogs, logLimit, sinceTimestamp } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ success: false, error: 'App Block ID is required' });
    }

    if (!operationId || typeof operationId !== 'string') {
      return res.status(400).json({ success: false, error: 'Operation ID is required' });
    }

    // Get the App Block and verify ownership
    const appBlock = await getAppBlockById(id);

    if (!appBlock) {
      return res.status(404).json({ success: false, error: 'App Block not found' });
    }

    if (appBlock.ownerUserId !== user.id) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    // Get operation status from Ren.AI API
    const client = getRenAIClient();
    
    try {
      // Fetch operation status
      const result = await client.getOperationStatus(operationId);

      if (!result.success || !result.data) {
        console.error('❌ [Operation Status] Ren.AI API error:', result.error);
        return res.status(404).json({ 
          success: false, 
          error: result.error || 'Operation not found' 
        });
      }

      const { operation, session } = result.data;

      // Prepare enhanced response
      let agentLogs: AgentLog[] | undefined;
      let logSummary: AgentLogSummary | undefined;

      // Fetch agent logs if requested (default true)
      const shouldIncludeLogs = includeLogs !== 'false';
      
      if (shouldIncludeLogs && (operation.status === 'processing' || operation.status === 'completed' || operation.status === 'failed')) {
        try {
          const logsResult = await client.getAgentLogs(operationId, {
            limit: logLimit ? parseInt(logLimit as string, 10) : 50,
            sinceTimestamp: sinceTimestamp ? parseInt(sinceTimestamp as string, 10) : undefined,
          });
          
          if (logsResult.success && logsResult.data) {
            agentLogs = logsResult.data.logs;
            logSummary = logsResult.data.summary;
          }
        } catch (logError) {
          // Log error but don't fail the request - logs are supplementary
          console.warn('⚠️ [Operation Status] Failed to fetch agent logs:', logError);
        }
      }

      // Get stream URL for real-time updates
      const streamUrl = client.getStreamUrl(operationId);

      console.log('📊 [Operation Status]:', {
        appBlockId: id,
        operationId,
        status: operation.status,
        hasResult: !!operation.result,
        resultKeys: operation.result ? Object.keys(operation.result) : [],
        hasCost: !!operation.result?.cost,
        hasTokenUsage: !!operation.result?.tokenUsage,
        step: operation.result?.step,
        iterations: operation.result?.iterations || operation.result?.currentIteration,
        hasQuestions: !!(session?.questions?.length),
        logCount: agentLogs?.length || 0,
        hasLogSummary: !!logSummary,
      });

      return res.status(200).json({
        success: true,
        data: {
          operation,
          questions: session?.questions,
          sessionId: session?.id,
          agentLogs,
          logSummary,
          streamUrl,
        },
      });

    } catch (apiError) {
      console.error('❌ [Operation Status] Ren.AI API request failed:', apiError);
      return res.status(500).json({ 
        success: false, 
        error: apiError instanceof Error ? apiError.message : 'Failed to connect to Ren.AI API' 
      });
    }

  } catch (error) {
    console.error('❌ [/api/app-blocks/[id]/operation/[operationId]] Error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
