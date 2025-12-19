/**
 * Ollama local AI provider implementation
 * For running local models (Llama, Mistral, etc.)
 */

import type {
  AIProviderInterface,
  TaskShrinkRequest,
  TaskShrinkResponse,
  EncouragementRequest,
  EncouragementResponse,
  ShrunkTask,
} from '../types';

const DEFAULT_BASE_URL = 'http://localhost:11434';
const DEFAULT_MODEL = 'llama3.2';

export interface OllamaProviderConfig {
  baseUrl?: string;
  model?: string;
}

interface OllamaGenerateResponse {
  model: string;
  response: string;
  done: boolean;
}

export class OllamaProvider implements AIProviderInterface {
  name = 'ollama' as const;
  private baseUrl: string;
  private model: string;

  constructor(config: OllamaProviderConfig = {}) {
    this.baseUrl = config.baseUrl ?? DEFAULT_BASE_URL;
    this.model = config.model ?? DEFAULT_MODEL;
  }

  async shrinkTask(request: TaskShrinkRequest): Promise<TaskShrinkResponse> {
    const prompt = this.buildShrinkPrompt(request);
    const response = await this.generate(prompt);
    return this.parseShrinkResponse(request.taskTitle, response);
  }

  async streamShrinkTask(
    request: TaskShrinkRequest,
    onChunk: (chunk: string) => void
  ): Promise<TaskShrinkResponse> {
    const prompt = this.buildShrinkPrompt(request);
    const response = await this.generateStream(prompt, onChunk);
    return this.parseShrinkResponse(request.taskTitle, response);
  }

  async generateEncouragement(
    request: EncouragementRequest
  ): Promise<EncouragementResponse> {
    const prompt = this.buildEncouragementPrompt(request);
    const response = await this.generate(prompt);
    return this.parseEncouragementResponse(response);
  }

  estimateCost(): number {
    // Ollama is free (local)
    return 0;
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        method: 'GET',
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  private async generate(prompt: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        prompt,
        stream: false,
        options: {
          temperature: 0.7,
          num_predict: 1024,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama request failed: ${response.statusText}`);
    }

    const data = (await response.json()) as OllamaGenerateResponse;
    return data.response;
  }

  private async generateStream(
    prompt: string,
    onChunk: (chunk: string) => void
  ): Promise<string> {
    const response = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        prompt,
        stream: true,
        options: {
          temperature: 0.7,
          num_predict: 1024,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama request failed: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    const decoder = new TextDecoder();
    let fullResponse = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter((line) => line.trim());

      for (const line of lines) {
        try {
          const data = JSON.parse(line) as OllamaGenerateResponse;
          fullResponse += data.response;
          onChunk(data.response);
        } catch {
          // Ignore parsing errors for incomplete chunks
        }
      }
    }

    return fullResponse;
  }

  private buildShrinkPrompt(request: TaskShrinkRequest): string {
    const parts = [
      'You are a supportive assistant helping neurodivergent individuals break down tasks.',
      '',
      `Task: "${request.taskTitle}"`,
    ];

    if (request.taskDescription) {
      parts.push(`Description: ${request.taskDescription}`);
    }

    if (request.currentMood) {
      parts.push(`Mood: ${request.currentMood}`);
    }

    if (request.availableTime) {
      parts.push(`Available time: ${request.availableTime} minutes`);
    }

    parts.push('');
    parts.push('Break this into 2-3 small steps (5-10 min each).');
    parts.push('');
    parts.push('JSON response only:');
    parts.push(
      '{"shrunkTasks":[{"title":"step","estimatedMinutes":5,"difficulty":"easy"}],"encouragement":"message"}'
    );

    return parts.join('\n');
  }

  private buildEncouragementPrompt(request: EncouragementRequest): string {
    const parts = [
      'Generate a brief encouragement (1 sentence) for someone with ADHD.',
      `Context: ${request.context}`,
    ];

    if (request.taskTitle) {
      parts.push(`Task: ${request.taskTitle}`);
    }

    parts.push('');
    parts.push('JSON response: {"message":"encouragement","tone":"gentle"}');

    return parts.join('\n');
  }

  private parseShrinkResponse(
    originalTask: string,
    text: string
  ): TaskShrinkResponse {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      return {
        originalTask,
        shrunkTasks: (parsed.shrunkTasks || []).map(
          (task: Partial<ShrunkTask>) => ({
            title: task.title || 'Small step',
            description: task.description,
            estimatedMinutes: task.estimatedMinutes || 5,
            difficulty: task.difficulty || 'easy',
            motivation: task.motivation,
          })
        ),
        reasoning: parsed.reasoning,
        encouragement: parsed.encouragement,
      };
    } catch {
      return {
        originalTask,
        shrunkTasks: [
          {
            title: `Just start: ${originalTask}`,
            estimatedMinutes: 5,
            difficulty: 'trivial',
          },
        ],
        encouragement: 'You can do this!',
      };
    }
  }

  private parseEncouragementResponse(text: string): EncouragementResponse {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      return {
        message: parsed.message || "You've got this!",
        tone: parsed.tone || 'gentle',
        emoji: parsed.emoji,
      };
    } catch {
      return {
        message: 'One step at a time.',
        tone: 'gentle',
      };
    }
  }
}
