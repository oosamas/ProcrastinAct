/**
 * Offline fallback patterns for task shrinking
 * Used when AI is unavailable
 */

import type { TaskShrinkResponse, ShrunkTask } from './types';

// Common task patterns with pre-generated shrink suggestions
const TASK_PATTERNS: Array<{
  pattern: RegExp;
  category: string;
  shrinkStrategies: Array<{
    condition?: (task: string) => boolean;
    tasks: ShrunkTask[];
    encouragement: string;
  }>;
}> = [
  {
    pattern: /\b(clean|tidy|organize)\b/i,
    category: 'cleaning',
    shrinkStrategies: [
      {
        tasks: [
          {
            title: 'Pick up one item and put it where it belongs',
            estimatedMinutes: 2,
            difficulty: 'trivial',
            motivation: "Just one thing. That's all.",
          },
          {
            title: 'Clear one small surface (desk corner, nightstand)',
            estimatedMinutes: 5,
            difficulty: 'easy',
            motivation: 'One clear space creates calm.',
          },
          {
            title: 'Set a 5-minute timer and stop when it rings',
            estimatedMinutes: 5,
            difficulty: 'easy',
            motivation: "You don't have to finish, just start.",
          },
        ],
        encouragement: "A clean space isn't the goal—starting is.",
      },
    ],
  },
  {
    pattern: /\b(write|draft|compose|essay|report|email)\b/i,
    category: 'writing',
    shrinkStrategies: [
      {
        tasks: [
          {
            title: 'Open the document or create a new one',
            estimatedMinutes: 1,
            difficulty: 'trivial',
            motivation: "Just open it. That's step one.",
          },
          {
            title: 'Write a terrible first sentence (on purpose)',
            estimatedMinutes: 2,
            difficulty: 'trivial',
            motivation:
              "Bad drafts become good drafts. Perfect drafts don't exist.",
          },
          {
            title: 'Brain dump 3 bullet points about the topic',
            estimatedMinutes: 5,
            difficulty: 'easy',
            motivation: "You don't need complete sentences yet.",
          },
        ],
        encouragement:
          "Every writer starts with a blank page. Now you're a writer.",
      },
    ],
  },
  {
    pattern: /\b(exercise|workout|gym|run|jog|walk)\b/i,
    category: 'exercise',
    shrinkStrategies: [
      {
        tasks: [
          {
            title: 'Put on your workout clothes',
            estimatedMinutes: 3,
            difficulty: 'trivial',
            motivation: "Once you're dressed, momentum kicks in.",
          },
          {
            title: 'Do 5 jumping jacks or stretches',
            estimatedMinutes: 1,
            difficulty: 'trivial',
            motivation: 'Any movement counts. Seriously.',
          },
          {
            title: 'Walk to the front door (or around your room)',
            estimatedMinutes: 1,
            difficulty: 'trivial',
            motivation: 'Motion creates motion.',
          },
        ],
        encouragement:
          "The hardest part is putting on the shoes. You've got this.",
      },
    ],
  },
  {
    pattern: /\b(call|phone|contact|reach out)\b/i,
    category: 'communication',
    shrinkStrategies: [
      {
        tasks: [
          {
            title: 'Find the phone number or contact info',
            estimatedMinutes: 2,
            difficulty: 'trivial',
            motivation: 'Just look it up. No calling yet.',
          },
          {
            title: 'Write down 1-2 things you need to say',
            estimatedMinutes: 3,
            difficulty: 'easy',
            motivation: 'A tiny script removes the pressure.',
          },
          {
            title: 'Dial the number (you can hang up if needed)',
            estimatedMinutes: 1,
            difficulty: 'easy',
            motivation:
              "You're allowed to hang up. But you probably won't need to.",
          },
        ],
        encouragement:
          "Phone calls are hard for a lot of people. You're not alone.",
      },
    ],
  },
  {
    pattern: /\b(study|learn|read|review)\b/i,
    category: 'learning',
    shrinkStrategies: [
      {
        tasks: [
          {
            title: 'Open your materials (book, notes, video)',
            estimatedMinutes: 1,
            difficulty: 'trivial',
            motivation: "Just open it. Don't read yet.",
          },
          {
            title: 'Read just the first paragraph or watch 2 minutes',
            estimatedMinutes: 3,
            difficulty: 'easy',
            motivation: 'Short bursts work better for our brains anyway.',
          },
          {
            title: 'Write one thing you learned (even if obvious)',
            estimatedMinutes: 2,
            difficulty: 'easy',
            motivation: 'Writing it cements it.',
          },
        ],
        encouragement:
          "Learning doesn't need to be a marathon. Sprints work too.",
      },
    ],
  },
  {
    pattern: /\b(cook|meal|food|dinner|lunch|breakfast)\b/i,
    category: 'cooking',
    shrinkStrategies: [
      {
        tasks: [
          {
            title: 'Decide on one simple thing to eat',
            estimatedMinutes: 2,
            difficulty: 'trivial',
            motivation: "It doesn't need to be fancy. Fuel is fuel.",
          },
          {
            title: 'Get out just the first ingredient',
            estimatedMinutes: 1,
            difficulty: 'trivial',
            motivation: "Don't think about the whole recipe.",
          },
          {
            title: 'If cooking feels like too much, find the easiest option',
            estimatedMinutes: 2,
            difficulty: 'trivial',
            motivation: 'Cereal is a valid dinner. So is toast.',
          },
        ],
        encouragement:
          'Nourishing yourself is an act of self-care, however you do it.',
      },
    ],
  },
];

// Generic fallback for unmatched tasks
const GENERIC_STRATEGIES: Array<{
  tasks: ShrunkTask[];
  encouragement: string;
}> = [
  {
    tasks: [
      {
        title: "Just look at the thing you need to do (don't start yet)",
        estimatedMinutes: 1,
        difficulty: 'trivial',
        motivation: "Seeing it makes it real, and that's enough for now.",
      },
      {
        title: 'Identify the very first physical action needed',
        estimatedMinutes: 2,
        difficulty: 'easy',
        motivation: 'What would you move first? What would you click?',
      },
      {
        title: 'Do that first physical action, then stop',
        estimatedMinutes: 3,
        difficulty: 'easy',
        motivation: 'You can stop after this. Or you might not want to.',
      },
    ],
    encouragement:
      "The task feels big because you're seeing all of it. Let's see just one piece.",
  },
  {
    tasks: [
      {
        title: 'Set a timer for just 2 minutes',
        estimatedMinutes: 2,
        difficulty: 'trivial',
        motivation: 'Anyone can do anything for 2 minutes.',
      },
      {
        title: 'Work on it until the timer rings (then you can stop)',
        estimatedMinutes: 2,
        difficulty: 'easy',
        motivation: 'Permission to stop is permission to start.',
      },
      {
        title: 'If you want to continue, set another short timer',
        estimatedMinutes: 5,
        difficulty: 'easy',
        motivation: 'Momentum is real. Ride the wave.',
      },
    ],
    encouragement:
      "You don't need motivation to start. Starting creates motivation.",
  },
];

/**
 * Find matching pattern for a task
 */
function findMatchingPattern(
  taskTitle: string
): (typeof TASK_PATTERNS)[0] | null {
  const lowerTask = taskTitle.toLowerCase();
  return (
    TASK_PATTERNS.find((pattern) => pattern.pattern.test(lowerTask)) ?? null
  );
}

/**
 * Get a random strategy from available options
 */
function getRandomStrategy<T>(strategies: T[]): T {
  return strategies[Math.floor(Math.random() * strategies.length)] as T;
}

/**
 * Generate offline shrink suggestions
 */
export function generateOfflineShrink(taskTitle: string): TaskShrinkResponse {
  const matchingPattern = findMatchingPattern(taskTitle);

  if (matchingPattern) {
    const strategy = getRandomStrategy(matchingPattern.shrinkStrategies);
    return {
      originalTask: taskTitle,
      shrunkTasks: strategy.tasks,
      encouragement: strategy.encouragement,
      reasoning: `Using ${matchingPattern.category} pattern`,
    };
  }

  // Use generic strategy
  const genericStrategy = getRandomStrategy(GENERIC_STRATEGIES);
  return {
    originalTask: taskTitle,
    shrunkTasks: genericStrategy.tasks,
    encouragement: genericStrategy.encouragement,
    reasoning: 'Using general task-breaking strategy',
  };
}

/**
 * Check if we have a specific pattern for a task
 */
export function hasOfflinePattern(taskTitle: string): boolean {
  return findMatchingPattern(taskTitle) !== null;
}

/**
 * Get available pattern categories
 */
export function getPatternCategories(): string[] {
  return TASK_PATTERNS.map((p) => p.category);
}
