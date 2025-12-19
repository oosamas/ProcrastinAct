/**
 * AI Service types for task shrinking and encouragement generation
 */

export type AIProvider = 'claude' | 'openai' | 'ollama';

export interface AIConfig {
  provider: AIProvider;
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface AIProviderConfig {
  claude?: {
    apiKey: string;
    model?: string;
  };
  openai?: {
    apiKey: string;
    model?: string;
  };
  ollama?: {
    baseUrl?: string;
    model?: string;
  };
}

export interface TaskShrinkRequest {
  taskTitle: string;
  taskDescription?: string;
  currentMood?: 'low' | 'medium' | 'high';
  energyLevel?: 'low' | 'medium' | 'high';
  availableTime?: number; // minutes
  previousAttempts?: number;
  userContext?: string;
}

export interface ShrunkTask {
  title: string;
  description?: string;
  estimatedMinutes: number;
  difficulty: 'trivial' | 'easy' | 'medium';
  motivation?: string;
}

export interface TaskShrinkResponse {
  originalTask: string;
  shrunkTasks: ShrunkTask[];
  reasoning?: string;
  encouragement?: string;
}

export interface EncouragementRequest {
  context: 'start' | 'progress' | 'complete' | 'struggle' | 'return';
  taskTitle?: string;
  userName?: string;
  streakDays?: number;
  completedToday?: number;
  previousMessages?: string[];
  mood?: 'low' | 'medium' | 'high';
}

export interface EncouragementResponse {
  message: string;
  tone: 'gentle' | 'celebratory' | 'understanding' | 'motivating';
  emoji?: string;
}

export interface AIServiceStats {
  totalRequests: number;
  cachedResponses: number;
  failedRequests: number;
  totalTokensUsed: number;
  estimatedCost: number;
  requestsByProvider: Record<AIProvider, number>;
}

export interface CostLimits {
  dailyLimit?: number;
  monthlyLimit?: number;
  perRequestLimit?: number;
}

export interface QueuedRequest<T> {
  id: string;
  request: T;
  priority: number;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
  hitCount: number;
}

export interface AIServiceOptions {
  providers: AIProviderConfig;
  primaryProvider: AIProvider;
  fallbackOrder?: AIProvider[];
  costLimits?: CostLimits;
  cacheEnabled?: boolean;
  cacheTTL?: number; // milliseconds
  maxRetries?: number;
  retryDelay?: number; // milliseconds
  queueConcurrency?: number;
}

export interface AIProviderInterface {
  name: AIProvider;
  shrinkTask(request: TaskShrinkRequest): Promise<TaskShrinkResponse>;
  generateEncouragement(
    request: EncouragementRequest
  ): Promise<EncouragementResponse>;
  streamShrinkTask?(
    request: TaskShrinkRequest,
    onChunk: (chunk: string) => void
  ): Promise<TaskShrinkResponse>;
  estimateCost(inputTokens: number, outputTokens: number): number;
  isAvailable(): Promise<boolean>;
}
