/**
 * Ren.AI API Client
 * 
 * Remote automation of code changes via Claude API with git operations
 */

// ============================================
// Types
// ============================================

export interface ApplyCodeChangesParams {
  prompt: string;
  repositoryPath: string;
  repoUrl?: string;
  branch?: string;
  autoCommit?: boolean;
  commitMessage?: string;
  systemPrompt?: string;
}

export interface ApplyCodeChangesResponse {
  success: boolean;
  data?: {
    operationId: string;
    sessionId: string;
    status: 'pending';
    message: string;
  };
  error?: string;
}

export interface OperationResult {
  applied: number;
  files: string[];
  commit?: string;
  // Enhanced result fields from ren.ai agent
  step?: OperationStep;
  summary?: string;
  filesChanged?: string[];
  iterations?: number;
  currentIteration?: number;
  lastTool?: string;
  toolCallCount?: number;
  runningCostUsd?: number;
  tokenUsage?: TokenUsage;
  cost?: CostBreakdown;
  toolCallLog?: ToolCallLog[];
  commitSummary?: string;
  commitError?: string;
  error?: string;
  message?: string;
}

// ============================================
// Agent Log Types
// ============================================

export type AgentLogType = 
  | 'started'
  | 'tool_call'
  | 'tool_result'
  | 'thinking'
  | 'message'
  | 'error'
  | 'completed';

export type OperationStep = 
  | 'repo_cloned'
  | 'repo_initialized'
  | 'branch_checkout'
  | 'agent_started'
  | 'agent_running'
  | 'agent_failed'
  | 'committed'
  | 'completed'
  | 'completed_commit_failed';

export interface AgentLog {
  id: string;
  operation_id: string;
  type: AgentLogType;
  tool_name?: string;
  tool_input?: Record<string, unknown>;
  tool_output?: string;
  message?: string;
  iteration: number;
  input_tokens?: number;
  output_tokens?: number;
  cost_usd?: number;
  duration_ms?: number;
  is_error: boolean;
  created_at: number;
}

export interface AgentLogSummary {
  operationId: string;
  totalLogs: number;
  toolCalls: number;
  errors: number;
  iterations: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  totalCostUsd: number;
  totalCostFormatted?: string;
  totalDurationMs: number;
  status: 'running' | 'completed' | 'failed';
  startedAt?: number;
  completedAt?: number;
}

export interface ToolCallLog {
  tool: string;
  input: Record<string, unknown>;
  output: string;
}

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
}

export interface CostBreakdown {
  inputCost: number;
  outputCost: number;
  totalCost: number;
  currency: string;
}

export interface AgentLogsResponse {
  success: boolean;
  data?: {
    logs: AgentLog[];
    summary?: AgentLogSummary;
  };
  error?: string;
}

// SSE Stream Event Types
export interface StreamEventBase {
  type: string;
  timestamp?: number;
}

export interface StreamConnectedEvent extends StreamEventBase {
  type: 'connected';
  operationId: string;
}

export interface StreamToolCallEvent extends StreamEventBase {
  type: 'tool_call';
  iteration: number;
  tool: string;
  input: Record<string, unknown>;
  output?: string;
  tokens?: {
    input: number;
    output: number;
  };
  costUsd?: number;
  costFormatted?: string;
  durationMs?: number;
  isError?: boolean;
}

export interface StreamThinkingEvent extends StreamEventBase {
  type: 'thinking';
  message: string;
  iteration: number;
}

export interface StreamCompleteEvent extends StreamEventBase {
  type: 'complete';
  success: boolean;
  summary?: AgentLogSummary;
}

export interface StreamErrorEvent extends StreamEventBase {
  type: 'error';
  message: string;
}

export type StreamEvent = 
  | StreamConnectedEvent 
  | StreamToolCallEvent 
  | StreamThinkingEvent 
  | StreamCompleteEvent 
  | StreamErrorEvent;

export interface Question {
  id: string;
  text: string;
  type: 'choice' | 'text' | 'confirm';
  status: 'pending' | 'answered' | 'skipped';
  options?: string[];
}

export interface Operation {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: OperationResult;
  error?: string;
}

export interface OperationStatusResponse {
  success: boolean;
  data?: {
    operation: Operation;
    session?: {
      id: string;
      status: string;
      questions?: Question[];
    };
  };
  error?: string;
}

export interface ClaudePromptParams {
  prompt: string;
  systemPrompt?: string;
  sessionId?: string;
}

export interface ClaudePromptResponse {
  success: boolean;
  data?: {
    sessionId: string;
    messageId: string;
    responseId: string;
    response: string;
    questions: Question[];
  };
  error?: string;
}

export interface SessionQuestionsResponse {
  success: boolean;
  data?: {
    questions: Question[];
  };
  error?: string;
}

export interface AnswerQuestionResponse {
  success: boolean;
  data?: {
    question: {
      id: string;
      status: 'answered';
    };
  };
  error?: string;
}

export interface SkipQuestionResponse {
  success: boolean;
  data?: {
    question: {
      id: string;
      status: 'skipped';
    };
  };
  error?: string;
}

export interface Repository {
  name: string;
  path: string;
  relativePath: string;
  isGitRepo: boolean;
  branch?: string;
  modified?: number;
  untracked?: number;
}

export interface RepositoriesResponse {
  success: boolean;
  data?: {
    repositories: Repository[];
  };
  error?: string;
}

export interface GitCommitParams {
  repositoryPath: string;
  message: string;
  files?: string[];
}

export interface GitPushParams {
  repositoryPath: string;
  remote?: string;
  branch?: string;
  force?: boolean;
}

export interface GitBranchParams {
  repositoryPath: string;
  branchName: string;
  checkout?: boolean;
}

export interface GitOperationResponse {
  success: boolean;
  data?: {
    operationId: string;
    status: 'pending';
  };
  error?: string;
}

export interface HealthResponse {
  success: boolean;
  data?: {
    status: 'healthy';
    uptime: number;
  };
}

// ============================================
// Client Class
// ============================================

export class RenAIClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(baseUrl?: string, apiKey?: string) {
    this.baseUrl = baseUrl || process.env.RENAI_API_URL || 'http://localhost:3000';
    this.apiKey = apiKey || process.env.RENAI_API_KEY || '';
    
    // Remove trailing slash if present
    if (this.baseUrl.endsWith('/')) {
      this.baseUrl = this.baseUrl.slice(0, -1);
    }
  }

  private async request<T>(
    method: 'GET' | 'POST',
    endpoint: string,
    body?: Record<string, unknown>
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (this.apiKey) {
      headers['X-API-Key'] = this.apiKey;
    }

    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || data.message || `Request failed with status ${response.status}`);
    }

    return data;
  }

  // ============================================
  // Health & Status
  // ============================================

  async healthCheck(): Promise<HealthResponse> {
    return this.request<HealthResponse>('GET', '/api/health');
  }

  // ============================================
  // Code Changes
  // ============================================

  /**
   * Submit a prompt to Claude and automatically apply code changes
   */
  async applyCodeChanges(params: ApplyCodeChangesParams): Promise<ApplyCodeChangesResponse> {
    return this.request<ApplyCodeChangesResponse>('POST', '/api/v1/code-changes/apply', {
      prompt: params.prompt,
      repositoryPath: params.repositoryPath,
      repoUrl: params.repoUrl,
      branch: params.branch,
      autoCommit: params.autoCommit ?? true,
      commitMessage: params.commitMessage,
      systemPrompt: params.systemPrompt,
    });
  }

  /**
   * Get the status of a code changes operation
   */
  async getOperationStatus(operationId: string): Promise<OperationStatusResponse> {
    return this.request<OperationStatusResponse>('GET', `/api/v1/code-changes/operations/${operationId}`);
  }

  // ============================================
  // Claude API
  // ============================================

  /**
   * Submit a prompt to Claude without auto-applying changes
   */
  async promptClaude(params: ClaudePromptParams): Promise<ClaudePromptResponse> {
    return this.request<ClaudePromptResponse>('POST', '/api/v1/claude/prompt', {
      prompt: params.prompt,
      systemPrompt: params.systemPrompt,
      sessionId: params.sessionId,
    });
  }

  // ============================================
  // Questions
  // ============================================

  /**
   * Get all questions for a session
   */
  async getSessionQuestions(sessionId: string, status?: 'pending' | 'answered' | 'skipped'): Promise<SessionQuestionsResponse> {
    let endpoint = `/api/v1/sessions/${sessionId}/questions`;
    if (status) {
      endpoint += `?status=${status}`;
    }
    return this.request<SessionQuestionsResponse>('GET', endpoint);
  }

  /**
   * Answer a follow-up question
   */
  async answerQuestion(questionId: string, answer: string): Promise<AnswerQuestionResponse> {
    return this.request<AnswerQuestionResponse>('POST', `/api/v1/questions/${questionId}/answer`, {
      answer,
    });
  }

  /**
   * Skip a question
   */
  async skipQuestion(questionId: string): Promise<SkipQuestionResponse> {
    return this.request<SkipQuestionResponse>('POST', `/api/v1/questions/${questionId}/skip`, {});
  }

  // ============================================
  // Repositories
  // ============================================

  /**
   * List all available repositories in the Ren.AI workspace
   */
  async listRepositories(): Promise<RepositoriesResponse> {
    return this.request<RepositoriesResponse>('GET', '/api/v1/repositories');
  }

  // ============================================
  // Git Operations
  // ============================================

  /**
   * Create a git commit
   */
  async gitCommit(params: GitCommitParams): Promise<GitOperationResponse> {
    return this.request<GitOperationResponse>('POST', '/api/v1/git/commit', {
      repositoryPath: params.repositoryPath,
      message: params.message,
      files: params.files,
    });
  }

  /**
   * Push to remote repository
   */
  async gitPush(params: GitPushParams): Promise<GitOperationResponse> {
    return this.request<GitOperationResponse>('POST', '/api/v1/git/push', {
      repositoryPath: params.repositoryPath,
      remote: params.remote || 'origin',
      branch: params.branch,
      force: params.force || false,
    });
  }

  /**
   * Create a new branch
   */
  async gitBranch(params: GitBranchParams): Promise<GitOperationResponse> {
    return this.request<GitOperationResponse>('POST', '/api/v1/git/branch', {
      repositoryPath: params.repositoryPath,
      branchName: params.branchName,
      checkout: params.checkout ?? true,
    });
  }

  // ============================================
  // Operations (generic)
  // ============================================

  /**
   * Get any operation status by ID
   */
  async getOperation(operationId: string): Promise<{ success: boolean; data?: { operation: Operation }; error?: string }> {
    return this.request('GET', `/api/v1/operations/${operationId}`);
  }

  // ============================================
  // Agent Logs
  // ============================================

  /**
   * Get agent logs for an operation
   */
  async getAgentLogs(
    operationId: string,
    options?: {
      limit?: number;
      offset?: number;
      types?: AgentLogType[];
      sinceTimestamp?: number;
    }
  ): Promise<AgentLogsResponse> {
    let endpoint = `/api/v1/agent/operations/${operationId}/logs`;
    const params = new URLSearchParams();
    
    if (options?.limit) params.set('limit', options.limit.toString());
    if (options?.offset) params.set('offset', options.offset.toString());
    if (options?.types?.length) params.set('types', options.types.join(','));
    if (options?.sinceTimestamp) params.set('since', options.sinceTimestamp.toString());
    
    const queryString = params.toString();
    if (queryString) {
      endpoint += `?${queryString}`;
    }
    
    return this.request<AgentLogsResponse>('GET', endpoint);
  }

  /**
   * Get the SSE stream URL for real-time operation logs
   * This returns the URL that can be used with EventSource
   */
  getStreamUrl(operationId: string): string {
    const url = new URL(`${this.baseUrl}/api/v1/agent/operations/${operationId}/stream`);
    if (this.apiKey) {
      url.searchParams.set('apiKey', this.apiKey);
    }
    return url.toString();
  }

  /**
   * Get the base URL (useful for constructing stream URLs on client-side)
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Get the API key (useful for constructing authenticated requests)
   */
  getApiKey(): string {
    return this.apiKey;
  }
}

// ============================================
// Singleton Instance
// ============================================

let clientInstance: RenAIClient | null = null;

/**
 * Get the default Ren.AI client instance
 */
export function getRenAIClient(): RenAIClient {
  if (!clientInstance) {
    clientInstance = new RenAIClient();
  }
  return clientInstance;
}

/**
 * Create a new Ren.AI client with custom configuration
 */
export function createRenAIClient(baseUrl?: string, apiKey?: string): RenAIClient {
  return new RenAIClient(baseUrl, apiKey);
}

export default RenAIClient;
