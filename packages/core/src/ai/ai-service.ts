/**
 * Main AI Service - unified interface for task shrinking and encouragement
 */

import type {
  AIProvider,
  AIProviderInterface,
  AIServiceOptions,
  AIServiceStats,
  TaskShrinkRequest,
  TaskShrinkResponse,
  EncouragementRequest,
  EncouragementResponse,
} from './types';
import { ClaudeProvider } from './providers/claude';
import { OpenAIProvider } from './providers/openai';
import { OllamaProvider } from './providers/ollama';
import { RequestQueue } from './queue';
import { ResponseCache } from './cache';
import { CostTracker } from './cost-tracker';

const DEFAULT_OPTIONS: Partial<AIServiceOptions> = {
  primaryProvider: 'claude',
  fallbackOrder: ['openai', 'ollama'],
  cacheEnabled: true,
  cacheTTL: 1000 * 60 * 60, // 1 hour
  maxRetries: 3,
  retryDelay: 1000,
  queueConcurrency: 2,
};

export class AIService {
  private providers: Map<AIProvider, AIProviderInterface> = new Map();
  private primaryProvider: AIProvider;
  private fallbackOrder: AIProvider[];
  private queue: RequestQueue;
  private shrinkCache: ResponseCache<TaskShrinkResponse>;
  private encouragementCache: ResponseCache<EncouragementResponse>;
  private costTracker: CostTracker;
  private cacheEnabled: boolean;

  constructor(options: AIServiceOptions) {
    const opts = { ...DEFAULT_OPTIONS, ...options };

    this.primaryProvider = opts.primaryProvider;
    this.fallbackOrder = opts.fallbackOrder ?? [];
    this.cacheEnabled = opts.cacheEnabled ?? true;

    // Initialize providers
    this.initializeProviders(opts.providers);

    // Initialize queue
    this.queue = new RequestQueue({
      concurrency: opts.queueConcurrency,
      maxRetries: opts.maxRetries,
      retryDelay: opts.retryDelay,
    });

    // Initialize caches
    this.shrinkCache = new ResponseCache<TaskShrinkResponse>({
      ttl: opts.cacheTTL,
      maxSize: 200,
      similarityThreshold: 0.85,
    });

    this.encouragementCache = new ResponseCache<EncouragementResponse>({
      ttl: opts.cacheTTL,
      maxSize: 50,
    });

    // Initialize cost tracker
    this.costTracker = new CostTracker({
      limits: opts.costLimits,
    });
  }

  /**
   * Shrink a task into smaller, manageable subtasks
   */
  async shrinkTask(request: TaskShrinkRequest): Promise<TaskShrinkResponse> {
    // Check cache first
    if (this.cacheEnabled) {
      const cached = this.shrinkCache.getSimilar(request.taskTitle);
      if (cached) {
        return cached;
      }
    }

    // Queue the request
    const response = await this.queue.enqueue(
      request,
      async (req) => this.executeShrinkTask(req),
      this.getPriority(request)
    );

    // Cache the response
    if (this.cacheEnabled) {
      this.shrinkCache.set(request.taskTitle, response);
    }

    return response;
  }

  /**
   * Shrink a task with streaming response
   */
  async shrinkTaskStream(
    request: TaskShrinkRequest,
    onChunk: (chunk: string) => void
  ): Promise<TaskShrinkResponse> {
    // Check cache first (no streaming for cached responses)
    if (this.cacheEnabled) {
      const cached = this.shrinkCache.getSimilar(request.taskTitle);
      if (cached) {
        return cached;
      }
    }

    const provider = await this.getAvailableProvider();
    if (!provider.streamShrinkTask) {
      // Fallback to non-streaming
      return this.shrinkTask(request);
    }

    const response = await provider.streamShrinkTask(request, onChunk);

    // Cache the response
    if (this.cacheEnabled) {
      this.shrinkCache.set(request.taskTitle, response);
    }

    // Track cost (estimate based on response)
    const estimatedTokens = JSON.stringify(response).length / 4;
    this.costTracker.recordUsage(
      provider.name,
      request.taskTitle.length / 4,
      estimatedTokens,
      provider.estimateCost(request.taskTitle.length / 4, estimatedTokens)
    );

    return response;
  }

  /**
   * Generate an encouragement message
   */
  async generateEncouragement(
    request: EncouragementRequest
  ): Promise<EncouragementResponse> {
    // Create cache key from request context
    const cacheKey = this.getEncouragementCacheKey(request);

    // Check cache first
    if (this.cacheEnabled) {
      const cached = this.encouragementCache.get(cacheKey);
      if (cached) {
        return cached;
      }
    }

    // Queue the request
    const response = await this.queue.enqueue(
      request,
      async (req) => this.executeEncouragement(req),
      0 // Lower priority than task shrinking
    );

    // Cache the response
    if (this.cacheEnabled) {
      this.encouragementCache.set(cacheKey, response);
    }

    return response;
  }

  /**
   * Check if the service is available
   */
  async isAvailable(): Promise<boolean> {
    for (const provider of this.getProviderOrder()) {
      const p = this.providers.get(provider);
      if (p && (await p.isAvailable())) {
        return true;
      }
    }
    return false;
  }

  /**
   * Get service statistics
   */
  getStats(): AIServiceStats & {
    cacheStats: { shrink: object; encouragement: object };
  } {
    return {
      ...this.costTracker.getStats(),
      cacheStats: {
        shrink: this.shrinkCache.getStats(),
        encouragement: this.encouragementCache.getStats(),
      },
    };
  }

  /**
   * Get remaining budget
   */
  getRemainingBudget() {
    return this.costTracker.getRemainingBudget();
  }

  /**
   * Clear all caches
   */
  clearCaches(): void {
    this.shrinkCache.clear();
    this.encouragementCache.clear();
  }

  /**
   * Pause request processing
   */
  pause(): void {
    this.queue.pause();
  }

  /**
   * Resume request processing
   */
  resume(): void {
    this.queue.resume();
  }

  private initializeProviders(config: AIServiceOptions['providers']): void {
    if (config.claude?.apiKey) {
      this.providers.set(
        'claude',
        new ClaudeProvider({
          apiKey: config.claude.apiKey,
          model: config.claude.model,
        })
      );
    }

    if (config.openai?.apiKey) {
      this.providers.set(
        'openai',
        new OpenAIProvider({
          apiKey: config.openai.apiKey,
          model: config.openai.model,
        })
      );
    }

    if (config.ollama) {
      this.providers.set(
        'ollama',
        new OllamaProvider({
          baseUrl: config.ollama.baseUrl,
          model: config.ollama.model,
        })
      );
    }
  }

  private async executeShrinkTask(
    request: TaskShrinkRequest
  ): Promise<TaskShrinkResponse> {
    const provider = await this.getAvailableProvider();

    // Check cost limits
    const estimatedCost = provider.estimateCost(500, 1000); // Rough estimate
    if (!this.costTracker.canProceed(estimatedCost)) {
      throw new Error('Cost limit exceeded');
    }

    const response = await provider.shrinkTask(request);

    // Track actual cost (estimate based on response)
    const inputTokens = request.taskTitle.length / 4;
    const outputTokens = JSON.stringify(response).length / 4;
    this.costTracker.recordUsage(
      provider.name,
      inputTokens,
      outputTokens,
      provider.estimateCost(inputTokens, outputTokens)
    );

    return response;
  }

  private async executeEncouragement(
    request: EncouragementRequest
  ): Promise<EncouragementResponse> {
    const provider = await this.getAvailableProvider();

    // Check cost limits
    const estimatedCost = provider.estimateCost(200, 100); // Rough estimate
    if (!this.costTracker.canProceed(estimatedCost)) {
      throw new Error('Cost limit exceeded');
    }

    const response = await provider.generateEncouragement(request);

    // Track actual cost
    const inputTokens = 200;
    const outputTokens = response.message.length / 4;
    this.costTracker.recordUsage(
      provider.name,
      inputTokens,
      outputTokens,
      provider.estimateCost(inputTokens, outputTokens)
    );

    return response;
  }

  private async getAvailableProvider(): Promise<AIProviderInterface> {
    for (const providerName of this.getProviderOrder()) {
      const provider = this.providers.get(providerName);
      if (provider && (await provider.isAvailable())) {
        return provider;
      }
    }

    throw new Error('No AI provider available');
  }

  private getProviderOrder(): AIProvider[] {
    return [
      this.primaryProvider,
      ...this.fallbackOrder.filter((p) => p !== this.primaryProvider),
    ];
  }

  private getPriority(request: TaskShrinkRequest): number {
    // Higher priority for users with low mood/energy
    let priority = 0;
    if (request.currentMood === 'low') priority += 2;
    if (request.energyLevel === 'low') priority += 2;
    if (request.previousAttempts && request.previousAttempts > 0) priority += 1;
    return priority;
  }

  private getEncouragementCacheKey(request: EncouragementRequest): string {
    return `${request.context}:${request.taskTitle || ''}:${request.mood || ''}`;
  }
}
