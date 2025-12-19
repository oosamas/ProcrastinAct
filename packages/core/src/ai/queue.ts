/**
 * Request queue with retry logic and concurrency control
 */

import type { QueuedRequest } from './types';

export interface QueueOptions {
  concurrency?: number;
  maxRetries?: number;
  retryDelay?: number;
  retryBackoff?: 'linear' | 'exponential';
}

interface QueueTask<T, R> {
  request: QueuedRequest<T>;
  execute: (req: T) => Promise<R>;
  resolve: (result: R) => void;
  reject: (error: Error) => void;
}

export class RequestQueue {
  private queue: QueueTask<unknown, unknown>[] = [];
  private activeCount = 0;
  private concurrency: number;
  private maxRetries: number;
  private retryDelay: number;
  private retryBackoff: 'linear' | 'exponential';
  private paused = false;

  constructor(options: QueueOptions = {}) {
    this.concurrency = options.concurrency ?? 2;
    this.maxRetries = options.maxRetries ?? 3;
    this.retryDelay = options.retryDelay ?? 1000;
    this.retryBackoff = options.retryBackoff ?? 'exponential';
  }

  async enqueue<T, R>(
    request: T,
    execute: (req: T) => Promise<R>,
    priority: number = 0
  ): Promise<R> {
    return new Promise((resolve, reject) => {
      const queuedRequest: QueuedRequest<T> = {
        id: this.generateId(),
        request,
        priority,
        timestamp: Date.now(),
        retryCount: 0,
        maxRetries: this.maxRetries,
      };

      const task: QueueTask<T, R> = {
        request: queuedRequest,
        execute,
        resolve,
        reject,
      };

      // Insert by priority (higher priority first)
      const insertIndex = this.queue.findIndex(
        (t) => t.request.priority < priority
      );
      if (insertIndex === -1) {
        this.queue.push(task as QueueTask<unknown, unknown>);
      } else {
        this.queue.splice(insertIndex, 0, task as QueueTask<unknown, unknown>);
      }

      this.processQueue();
    });
  }

  pause(): void {
    this.paused = true;
  }

  resume(): void {
    this.paused = false;
    this.processQueue();
  }

  clear(): void {
    const pending = this.queue.splice(0);
    pending.forEach((task) => {
      task.reject(new Error('Queue cleared'));
    });
  }

  get pendingCount(): number {
    return this.queue.length;
  }

  get runningCount(): number {
    return this.activeCount;
  }

  get isPaused(): boolean {
    return this.paused;
  }

  private async processQueue(): Promise<void> {
    if (this.paused) return;

    while (this.activeCount < this.concurrency && this.queue.length > 0) {
      const task = this.queue.shift();
      if (!task) break;

      this.activeCount++;
      this.executeTask(task).finally(() => {
        this.activeCount--;
        this.processQueue();
      });
    }
  }

  private async executeTask<T, R>(task: QueueTask<T, R>): Promise<void> {
    try {
      const result = await task.execute(task.request.request as T);
      task.resolve(result);
    } catch (error) {
      const shouldRetry =
        task.request.retryCount < task.request.maxRetries &&
        this.isRetryableError(error);

      if (shouldRetry) {
        task.request.retryCount++;
        const delay = this.calculateRetryDelay(task.request.retryCount);

        await this.sleep(delay);

        // Re-add to queue with same priority
        this.queue.unshift(task as QueueTask<unknown, unknown>);
        this.processQueue();
      } else {
        task.reject(error instanceof Error ? error : new Error(String(error)));
      }
    }
  }

  private isRetryableError(error: unknown): boolean {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      // Retry on rate limits, network errors, and temporary failures
      return (
        message.includes('rate limit') ||
        message.includes('timeout') ||
        message.includes('network') ||
        message.includes('429') ||
        message.includes('503') ||
        message.includes('502')
      );
    }
    return false;
  }

  private calculateRetryDelay(attempt: number): number {
    if (this.retryBackoff === 'exponential') {
      return this.retryDelay * Math.pow(2, attempt - 1);
    }
    return this.retryDelay * attempt;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }
}
