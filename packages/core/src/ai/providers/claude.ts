/**
 * Claude (Anthropic) AI provider implementation
 */

import { generateText, streamText } from 'ai';
import { createAnthropic } from '@ai-sdk/anthropic';
import type {
  AIProviderInterface,
  TaskShrinkRequest,
  TaskShrinkResponse,
  EncouragementRequest,
  EncouragementResponse,
  ShrunkTask,
} from '../types';

const DEFAULT_MODEL = 'claude-3-5-sonnet-20241022';

// Cost per 1M tokens (USD)
const PRICING = {
  'claude-3-5-sonnet-20241022': { input: 3, output: 15 },
  'claude-3-5-haiku-20241022': { input: 1, output: 5 },
  'claude-3-opus-20240229': { input: 15, output: 75 },
} as const;

export interface ClaudeProviderConfig {
  apiKey: string;
  model?: string;
}

export class ClaudeProvider implements AIProviderInterface {
  name = 'claude' as const;
  private anthropic;
  private model: string;

  constructor(config: ClaudeProviderConfig) {
    this.anthropic = createAnthropic({ apiKey: config.apiKey });
    this.model = config.model ?? DEFAULT_MODEL;
  }

  async shrinkTask(request: TaskShrinkRequest): Promise<TaskShrinkResponse> {
    const prompt = this.buildShrinkPrompt(request);

    const { text } = await generateText({
      model: this.anthropic(this.model),
      prompt,
      maxOutputTokens: 1024,
      temperature: 0.7,
    });

    return this.parseShrinkResponse(request.taskTitle, text);
  }

  async streamShrinkTask(
    request: TaskShrinkRequest,
    onChunk: (chunk: string) => void
  ): Promise<TaskShrinkResponse> {
    const prompt = this.buildShrinkPrompt(request);
    let fullText = '';

    const { textStream } = streamText({
      model: this.anthropic(this.model),
      prompt,
      maxOutputTokens: 1024,
      temperature: 0.7,
    });

    for await (const chunk of textStream) {
      fullText += chunk;
      onChunk(chunk);
    }

    return this.parseShrinkResponse(request.taskTitle, fullText);
  }

  async generateEncouragement(
    request: EncouragementRequest
  ): Promise<EncouragementResponse> {
    const prompt = this.buildEncouragementPrompt(request);

    const { text } = await generateText({
      model: this.anthropic(this.model),
      prompt,
      maxOutputTokens: 256,
      temperature: 0.8,
    });

    return this.parseEncouragementResponse(text);
  }

  estimateCost(inputTokens: number, outputTokens: number): number {
    const modelKey = this.model as keyof typeof PRICING;
    const pricing = PRICING[modelKey] ?? PRICING['claude-3-5-sonnet-20241022'];
    return (
      (inputTokens * pricing.input + outputTokens * pricing.output) / 1_000_000
    );
  }

  async isAvailable(): Promise<boolean> {
    try {
      // Simple ping to verify API key works
      await generateText({
        model: this.anthropic(this.model),
        prompt: 'Say "ok"',
        maxOutputTokens: 5,
      });
      return true;
    } catch {
      return false;
    }
  }

  private buildShrinkPrompt(request: TaskShrinkRequest): string {
    const parts = [
      'You are a supportive assistant helping neurodivergent individuals break down overwhelming tasks into smaller, manageable pieces.',
      '',
      `Task to shrink: "${request.taskTitle}"`,
    ];

    if (request.taskDescription) {
      parts.push(`Description: ${request.taskDescription}`);
    }

    if (request.currentMood) {
      parts.push(`User's current mood/energy: ${request.currentMood}`);
    }

    if (request.energyLevel) {
      parts.push(`Energy level: ${request.energyLevel}`);
    }

    if (request.availableTime) {
      parts.push(`Available time: ${request.availableTime} minutes`);
    }

    if (request.previousAttempts && request.previousAttempts > 0) {
      parts.push(
        `Previous attempts: ${request.previousAttempts} (they've struggled with this before)`
      );
    }

    if (request.userContext) {
      parts.push(`Additional context: ${request.userContext}`);
    }

    parts.push('');
    parts.push('Break this task into 2-4 smaller subtasks that:');
    parts.push('1. Are concrete and immediately actionable');
    parts.push('2. Take 5-15 minutes each');
    parts.push('3. Feel achievable even on low-energy days');
    parts.push('4. Build momentum through small wins');
    parts.push('');
    parts.push('Respond in JSON format:');
    parts.push('{');
    parts.push('  "shrunkTasks": [');
    parts.push('    {');
    parts.push('      "title": "First small step",');
    parts.push('      "description": "Brief explanation",');
    parts.push('      "estimatedMinutes": 5,');
    parts.push('      "difficulty": "trivial|easy|medium",');
    parts.push('      "motivation": "Why this step helps"');
    parts.push('    }');
    parts.push('  ],');
    parts.push('  "reasoning": "Why this breakdown works",');
    parts.push('  "encouragement": "A kind message for the user"');
    parts.push('}');

    return parts.join('\n');
  }

  private buildEncouragementPrompt(request: EncouragementRequest): string {
    const parts = [
      'You are a warm, understanding companion helping someone with ADHD or executive dysfunction.',
      'Generate a brief, genuine encouragement message.',
      '',
      `Context: ${request.context}`,
    ];

    if (request.taskTitle) {
      parts.push(`Task: ${request.taskTitle}`);
    }

    if (request.userName) {
      parts.push(`User's name: ${request.userName}`);
    }

    if (request.streakDays && request.streakDays > 0) {
      parts.push(`Current streak: ${request.streakDays} days`);
    }

    if (request.completedToday && request.completedToday > 0) {
      parts.push(`Tasks completed today: ${request.completedToday}`);
    }

    if (request.mood) {
      parts.push(`Current mood: ${request.mood}`);
    }

    parts.push('');
    parts.push('Guidelines:');
    parts.push('- Keep it brief (1-2 sentences)');
    parts.push('- Be genuine, not patronizing');
    parts.push('- Acknowledge their struggle without dwelling on it');
    parts.push('- Focus on the present moment');
    parts.push('');
    parts.push('Respond in JSON format:');
    parts.push('{');
    parts.push('  "message": "Your encouragement here",');
    parts.push('  "tone": "gentle|celebratory|understanding|motivating",');
    parts.push('  "emoji": "optional single emoji"');
    parts.push('}');

    return parts.join('\n');
  }

  private parseShrinkResponse(
    originalTask: string,
    text: string
  ): TaskShrinkResponse {
    try {
      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      return {
        originalTask,
        shrunkTasks: (parsed.shrunkTasks || []).map(
          (task: Partial<ShrunkTask>) => ({
            title: task.title || 'Untitled step',
            description: task.description,
            estimatedMinutes: task.estimatedMinutes || 10,
            difficulty: task.difficulty || 'easy',
            motivation: task.motivation,
          })
        ),
        reasoning: parsed.reasoning,
        encouragement: parsed.encouragement,
      };
    } catch {
      // Fallback: create a single simplified task
      return {
        originalTask,
        shrunkTasks: [
          {
            title: `Start with: ${originalTask}`,
            estimatedMinutes: 10,
            difficulty: 'easy',
            motivation: 'Just begin, you can do this!',
          },
        ],
        encouragement: 'Every small step counts.',
      };
    }
  }

  private parseEncouragementResponse(text: string): EncouragementResponse {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      return {
        message: parsed.message || "You've got this!",
        tone: parsed.tone || 'gentle',
        emoji: parsed.emoji,
      };
    } catch {
      return {
        message: "You're doing great. One step at a time.",
        tone: 'gentle',
      };
    }
  }
}
