import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserById } from '@/db/user';
import { getAppBlockById, buildRepositoryPath } from '@/db/appBlock';
import { buildPromptForIntent } from '@/lib/promptBuilder';
import { WorkflowIntent } from '@/db/schema';
import { getRenAIClient } from '@/lib/renaiClient';

interface DispatchRequest {
  intent: WorkflowIntent;
  prompt?: string;
  customIntent?: string;
  autoCommit?: boolean;
}

interface DispatchResponse {
  success: boolean;
  message?: string;
  operationId?: string;
  sessionId?: string;
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
 * POST /api/app-blocks/[id]/dispatch - Trigger code changes via Ren.AI API
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DispatchResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const user = await getCurrentUser(req);
    
    if (!user) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ success: false, error: 'App Block ID is required' });
    }

    // Get the App Block and verify ownership
    const appBlock = await getAppBlockById(id);

    if (!appBlock) {
      return res.status(404).json({ success: false, error: 'App Block not found' });
    }

    if (appBlock.ownerUserId !== user.id) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    // Parse request body
    const { intent, prompt, customIntent, autoCommit = true } = req.body as DispatchRequest;

    if (!intent) {
      return res.status(400).json({ success: false, error: 'Intent is required' });
    }

    const validIntents: WorkflowIntent[] = ['branding', 'features', 'config', 'full_build', 'custom'];
    if (!validIntents.includes(intent)) {
      return res.status(400).json({ 
        success: false, 
        error: `Invalid intent. Must be one of: ${validIntents.join(', ')}` 
      });
    }

    if (intent === 'custom' && !customIntent) {
      return res.status(400).json({ 
        success: false, 
        error: 'customIntent is required when intent is "custom"' 
      });
    }

    // Check Ren.AI configuration
    const { githubRepoOwner, githubRepoName, githubBranch } = appBlock;

    if (!githubRepoOwner || !githubRepoName) {
      return res.status(400).json({ 
        success: false, 
        error: 'Repository not configured for this App Block. Please configure Ren.AI settings first.' 
      });
    }

    const repositoryPath = buildRepositoryPath({
      repoOwner: githubRepoOwner,
      repoName: githubRepoName,
      workflowFile: appBlock.githubWorkflowFile,
      branch: githubBranch,
    });

    const repoUrl = `https://github.com/${githubRepoOwner}/${githubRepoName}`;

    // Build the prompt from PRD data
    const builtPrompt = buildPromptForIntent({
      intent,
      customIntent,
      userPrompt: prompt,
      onboardingData: appBlock.onboardingData,
      blockName: appBlock.name,
      blockType: appBlock.blockType,
    });

    // Build commit message
    const intentLabel = intent === 'custom' ? customIntent : intent;
    const commitMessage = `[${intentLabel}] ${appBlock.name} - automated changes`;

    console.log('🚀 [Dispatch] Calling Ren.AI API:', {
      id,
      intent: intentLabel,
      repositoryPath,
      repoUrl,
      branch: githubBranch,
      autoCommit,
      promptLength: builtPrompt.length,
    });

    // Call Ren.AI API to apply code changes
    const client = getRenAIClient();
    
    try {
      const result = await client.applyCodeChanges({
        prompt: builtPrompt,
        repositoryPath: repositoryPath!,
        repoUrl,
        branch: githubBranch || 'main',
        autoCommit,
        commitMessage,
      });

      if (!result.success || !result.data) {
        console.error('❌ [Dispatch] Ren.AI API error:', result.error);
        return res.status(500).json({ 
          success: false, 
          error: result.error || 'Failed to initiate code changes' 
        });
      }

      console.log('✅ [Dispatch] Code changes initiated:', {
        id,
        intent: intentLabel,
        operationId: result.data.operationId,
        sessionId: result.data.sessionId,
      });

      return res.status(200).json({
        success: true,
        message: 'Code changes initiated. Use the operation ID to track progress.',
        operationId: result.data.operationId,
        sessionId: result.data.sessionId,
      });

    } catch (apiError) {
      console.error('❌ [Dispatch] Ren.AI API request failed:', apiError);
      return res.status(500).json({ 
        success: false, 
        error: apiError instanceof Error ? apiError.message : 'Failed to connect to Ren.AI API' 
      });
    }

  } catch (error) {
    console.error('❌ [/api/app-blocks/[id]/dispatch] Error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
