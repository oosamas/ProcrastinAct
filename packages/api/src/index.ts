import type { Task, User, TimerState } from '@procrastinact/types';

// API Configuration
export interface ApiConfig {
  baseUrl: string;
  timeout?: number;
}

// API Client
export class ApiClient {
  private baseUrl: string;
  private timeout: number;

  constructor(config: ApiConfig) {
    this.baseUrl = config.baseUrl;
    this.timeout = config.timeout || 10000;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      return response.json();
    } finally {
      clearTimeout(timeoutId);
    }
  }

  // Task API
  async getTasks(): Promise<Task[]> {
    return this.request<Task[]>('/tasks');
  }

  async getTask(id: string): Promise<Task> {
    return this.request<Task>(`/tasks/${id}`);
  }

  async createTask(task: Omit<Task, 'id'>): Promise<Task> {
    return this.request<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    });
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    return this.request<Task>(`/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deleteTask(id: string): Promise<void> {
    await this.request(`/tasks/${id}`, { method: 'DELETE' });
  }

  // AI Task Shrinking
  async shrinkTask(taskTitle: string, currentLevel: number): Promise<string> {
    const response = await this.request<{ suggestion: string }>('/ai/shrink', {
      method: 'POST',
      body: JSON.stringify({ taskTitle, currentLevel }),
    });
    return response.suggestion;
  }

  // User API
  async getCurrentUser(): Promise<User> {
    return this.request<User>('/user');
  }

  async updateUserPreferences(
    preferences: Partial<User['preferences']>
  ): Promise<User> {
    return this.request<User>('/user/preferences', {
      method: 'PATCH',
      body: JSON.stringify(preferences),
    });
  }

  // Sync API
  async sync(
    changes: unknown[]
  ): Promise<{ synced: boolean; timestamp: Date }> {
    return this.request('/sync', {
      method: 'POST',
      body: JSON.stringify({ changes }),
    });
  }
}

// Export factory function
export function createApiClient(config: ApiConfig): ApiClient {
  return new ApiClient(config);
}
