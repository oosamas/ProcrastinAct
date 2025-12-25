/**
 * Task Queue System
 *
 * A smart queue that surfaces one task at a time to reduce overwhelm.
 * The queue is never shown as a list - only one task is visible.
 * Behind the scenes, tasks are prioritized based on:
 * - Time of day
 * - User energy patterns
 * - Task variety (don't repeat same type twice)
 * - Urgency/aging
 */

import type { Task } from '@procrastinact/types';

// ============================================================================
// TYPES
// ============================================================================

export interface QueuedTask {
  task: Task;
  /** When this task was added to queue */
  queuedAt: Date;
  /** Computed priority score (higher = more urgent) */
  priorityScore: number;
  /** Whether this was snoozed/deferred */
  deferCount: number;
  /** Last time this task was deferred */
  lastDeferredAt?: Date;
  /** Preferred time of day for this task */
  preferredTime?: TimeOfDay;
  /** Energy level required */
  energyRequired?: EnergyLevel;
}

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';
export type EnergyLevel = 'low' | 'medium' | 'high';

export interface UserContext {
  /** Current time of day */
  timeOfDay: TimeOfDay;
  /** User's current energy level */
  energyLevel: EnergyLevel;
  /** User's preferred focus time */
  preferredFocusTime?: TimeOfDay | 'varies';
  /** Category of last completed task (for variety) */
  lastCompletedCategory?: string;
  /** Category of last 3 completed tasks (for variety) */
  recentCategories: string[];
  /** Is user in "morning person" mode */
  isMorningPerson: boolean;
  /** Day of week (0-6, Sunday = 0) */
  dayOfWeek: number;
  /** Is it a weekend */
  isWeekend: boolean;
}

export interface QueueConfig {
  /** Maximum number of tasks in queue */
  maxSize: number;
  /** How long before a deferred task comes back (ms) */
  deferDuration: number;
  /** Maximum number of times a task can be deferred */
  maxDeferCount: number;
  /** Weight for aging in priority calculation */
  agingWeight: number;
  /** Weight for time-of-day match */
  timeMatchWeight: number;
  /** Weight for energy level match */
  energyMatchWeight: number;
  /** Weight for variety (avoiding same category) */
  varietyWeight: number;
  /** Weight for user preference match */
  preferenceWeight: number;
}

export interface TaskQueue {
  /** All queued tasks */
  items: QueuedTask[];
  /** Currently surfaced task ID */
  currentTaskId: string | null;
  /** Configuration */
  config: QueueConfig;
  /** When queue was last updated */
  updatedAt: Date;
}

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

export const DEFAULT_QUEUE_CONFIG: QueueConfig = {
  maxSize: 20,
  deferDuration: 30 * 60 * 1000, // 30 minutes
  maxDeferCount: 3,
  agingWeight: 2,
  timeMatchWeight: 3,
  energyMatchWeight: 2.5,
  varietyWeight: 2,
  preferenceWeight: 1.5,
};

// ============================================================================
// QUEUE FACTORY
// ============================================================================

export function createQueue(config?: Partial<QueueConfig>): TaskQueue {
  return {
    items: [],
    currentTaskId: null,
    config: { ...DEFAULT_QUEUE_CONFIG, ...config },
    updatedAt: new Date(),
  };
}

// ============================================================================
// TIME OF DAY HELPERS
// ============================================================================

export function getTimeOfDay(date: Date = new Date()): TimeOfDay {
  const hour = date.getHours();

  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

export function isWeekend(date: Date = new Date()): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

// ============================================================================
// PRIORITY SCORING
// ============================================================================

/**
 * Calculate priority score for a queued task
 * Higher score = should be surfaced sooner
 */
export function calculatePriorityScore(
  queuedTask: QueuedTask,
  context: UserContext,
  config: QueueConfig
): number {
  let score = queuedTask.task.priority * 10; // Base priority (0-100)

  // 1. Aging bonus: Tasks waiting longer get higher priority
  const hoursInQueue =
    (Date.now() - queuedTask.queuedAt.getTime()) / (1000 * 60 * 60);
  const agingBonus = Math.min(hoursInQueue * config.agingWeight, 20);
  score += agingBonus;

  // 2. Time of day match
  if (queuedTask.preferredTime) {
    if (queuedTask.preferredTime === context.timeOfDay) {
      score += config.timeMatchWeight * 10;
    } else {
      // Slight penalty for wrong time
      score -= config.timeMatchWeight * 2;
    }
  }

  // 3. Energy level match
  if (queuedTask.energyRequired) {
    const energyMatch = getEnergyMatch(
      queuedTask.energyRequired,
      context.energyLevel
    );
    score += energyMatch * config.energyMatchWeight * 10;
  }

  // 4. Variety bonus: Avoid same category as recently completed
  const taskCategory = queuedTask.task.category?.id;
  if (taskCategory) {
    // Significant penalty for matching last completed
    if (taskCategory === context.lastCompletedCategory) {
      score -= config.varietyWeight * 15;
    }
    // Smaller penalty for matching any of last 3
    if (context.recentCategories.includes(taskCategory)) {
      score -= config.varietyWeight * 5;
    }
  }

  // 5. User preference match
  if (context.preferredFocusTime && context.preferredFocusTime !== 'varies') {
    if (context.timeOfDay === context.preferredFocusTime) {
      // During preferred focus time, boost important tasks
      score += (queuedTask.task.priority / 10) * config.preferenceWeight * 5;
    }
  }

  // 6. Morning person adjustments
  if (context.isMorningPerson && context.timeOfDay === 'morning') {
    // Morning person in the morning: boost high-energy tasks
    if (queuedTask.energyRequired === 'high') {
      score += 10;
    }
  } else if (!context.isMorningPerson && context.timeOfDay === 'evening') {
    // Night owl in the evening: boost high-energy tasks
    if (queuedTask.energyRequired === 'high') {
      score += 10;
    }
  }

  // 7. Weekend adjustments
  if (context.isWeekend) {
    // On weekends, slightly boost lower-energy tasks
    if (queuedTask.energyRequired === 'low') {
      score += 5;
    }
  }

  // 8. Defer penalty: Tasks that were deferred lose priority temporarily
  if (queuedTask.deferCount > 0 && queuedTask.lastDeferredAt) {
    const hoursSinceDefer =
      (Date.now() - queuedTask.lastDeferredAt.getTime()) / (1000 * 60 * 60);
    // Penalty decreases over time
    const deferPenalty = Math.max(
      0,
      queuedTask.deferCount * 10 - hoursSinceDefer * 2
    );
    score -= deferPenalty;
  }

  // 9. Created date: Very old pending tasks get a boost
  const daysSinceCreated = Math.floor(
    (Date.now() - queuedTask.task.createdAt.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (daysSinceCreated > 7) {
    score += Math.min((daysSinceCreated - 7) * 0.5, 10);
  }

  return Math.max(0, score); // Never negative
}

/**
 * Get how well the user's energy matches the task requirement
 * Returns -1 to 1 (negative = bad match, positive = good match)
 */
function getEnergyMatch(required: EnergyLevel, current: EnergyLevel): number {
  const levels: EnergyLevel[] = ['low', 'medium', 'high'];
  const requiredIndex = levels.indexOf(required);
  const currentIndex = levels.indexOf(current);

  // Perfect match
  if (requiredIndex === currentIndex) return 1;

  // One level off
  if (Math.abs(requiredIndex - currentIndex) === 1) return 0;

  // User has more energy than needed: slight positive
  if (currentIndex > requiredIndex) return 0.3;

  // User has less energy than needed: negative
  return -0.5;
}

// ============================================================================
// QUEUE OPERATIONS
// ============================================================================

/**
 * Add a task to the queue
 */
export function addToQueue(
  queue: TaskQueue,
  task: Task,
  options?: {
    preferredTime?: TimeOfDay;
    energyRequired?: EnergyLevel;
  }
): TaskQueue {
  // Check if already in queue
  if (queue.items.some((item) => item.task.id === task.id)) {
    return queue;
  }

  // Check max size
  if (queue.items.length >= queue.config.maxSize) {
    // Remove oldest, lowest-priority item
    const sortedItems = [...queue.items].sort(
      (a, b) => a.priorityScore - b.priorityScore
    );
    queue.items = sortedItems.slice(1);
  }

  const queuedTask: QueuedTask = {
    task,
    queuedAt: new Date(),
    priorityScore: task.priority * 10, // Initial score
    deferCount: 0,
    preferredTime: options?.preferredTime,
    energyRequired: options?.energyRequired,
  };

  return {
    ...queue,
    items: [...queue.items, queuedTask],
    updatedAt: new Date(),
  };
}

/**
 * Remove a task from the queue
 */
export function removeFromQueue(queue: TaskQueue, taskId: string): TaskQueue {
  return {
    ...queue,
    items: queue.items.filter((item) => item.task.id !== taskId),
    currentTaskId: queue.currentTaskId === taskId ? null : queue.currentTaskId,
    updatedAt: new Date(),
  };
}

/**
 * Defer the current task (put it back in queue for later)
 */
export function deferCurrentTask(queue: TaskQueue): TaskQueue {
  if (!queue.currentTaskId) return queue;

  const currentIndex = queue.items.findIndex(
    (item) => item.task.id === queue.currentTaskId
  );

  if (currentIndex === -1) return queue;

  const currentItem = queue.items[currentIndex];

  // Safety check
  if (!currentItem) {
    return queue;
  }

  // Check if max defers reached
  if (currentItem.deferCount >= queue.config.maxDeferCount) {
    // Can't defer anymore, task stays current
    return queue;
  }

  const updatedItem: QueuedTask = {
    task: currentItem.task,
    queuedAt: currentItem.queuedAt,
    preferredTime: currentItem.preferredTime,
    energyRequired: currentItem.energyRequired,
    deferCount: currentItem.deferCount + 1,
    lastDeferredAt: new Date(),
    priorityScore: currentItem.priorityScore * 0.7, // Temporary penalty
  };

  const newItems = [...queue.items];
  newItems[currentIndex] = updatedItem;

  return {
    ...queue,
    items: newItems,
    currentTaskId: null, // Will be re-surfaced by getNextTask
    updatedAt: new Date(),
  };
}

/**
 * Get the next task to surface
 * Recalculates all priorities and returns the highest scoring task
 */
export function getNextTask(
  queue: TaskQueue,
  context: UserContext
): { queue: TaskQueue; task: Task | null } {
  if (queue.items.length === 0) {
    return { queue, task: null };
  }

  // Skip currently deferred tasks (within defer duration)
  const eligibleItems = queue.items.filter((item) => {
    if (!item.lastDeferredAt) return true;
    const timeSinceDefer = Date.now() - item.lastDeferredAt.getTime();
    return timeSinceDefer >= queue.config.deferDuration;
  });

  if (eligibleItems.length === 0) {
    // All tasks are deferred, find the one that will be available soonest
    const sortedByDefer = [...queue.items].sort((a, b) => {
      const aTime = a.lastDeferredAt?.getTime() ?? 0;
      const bTime = b.lastDeferredAt?.getTime() ?? 0;
      return aTime - bTime;
    });
    const nextAvailable = sortedByDefer[0];
    if (!nextAvailable) {
      return { queue, task: null };
    }
    return {
      queue: {
        ...queue,
        currentTaskId: nextAvailable.task.id,
      },
      task: nextAvailable.task,
    };
  }

  // Recalculate priorities for eligible tasks
  const scoredItems = eligibleItems.map((item) => ({
    ...item,
    priorityScore: calculatePriorityScore(item, context, queue.config),
  }));

  // Sort by priority (highest first)
  scoredItems.sort((a, b) => b.priorityScore - a.priorityScore);

  // Take the highest priority task
  const nextTask = scoredItems[0];

  if (!nextTask) {
    return { queue, task: null };
  }

  // Update queue with new scores
  const updatedItems = queue.items.map((item) => {
    const scored = scoredItems.find((s) => s.task.id === item.task.id);
    return scored ?? item;
  });

  return {
    queue: {
      ...queue,
      items: updatedItems,
      currentTaskId: nextTask.task.id,
      updatedAt: new Date(),
    },
    task: nextTask.task,
  };
}

/**
 * Complete the current task and get the next one
 */
export function completeAndGetNext(
  queue: TaskQueue,
  context: UserContext
): { queue: TaskQueue; task: Task | null } {
  if (!queue.currentTaskId) {
    return getNextTask(queue, context);
  }

  // Remove the completed task
  const updatedQueue = removeFromQueue(queue, queue.currentTaskId);

  // Update context with the completed task's category
  const completedTask = queue.items.find(
    (item) => item.task.id === queue.currentTaskId
  );

  const updatedContext: UserContext = {
    ...context,
    lastCompletedCategory: completedTask?.task.category?.id,
    recentCategories: [
      completedTask?.task.category?.id ?? '',
      ...context.recentCategories.slice(0, 2),
    ].filter(Boolean),
  };

  // Get the next task
  return getNextTask(updatedQueue, updatedContext);
}

/**
 * Reorder queue based on current context
 * Call this when context changes (time of day, energy level, etc.)
 */
export function reorderQueue(
  queue: TaskQueue,
  context: UserContext
): TaskQueue {
  if (queue.items.length === 0) return queue;

  const updatedItems = queue.items.map((item) => ({
    ...item,
    priorityScore: calculatePriorityScore(item, context, queue.config),
  }));

  // Sort by priority
  updatedItems.sort((a, b) => b.priorityScore - a.priorityScore);

  return {
    ...queue,
    items: updatedItems,
    updatedAt: new Date(),
  };
}

/**
 * Get queue statistics
 */
export function getQueueStats(queue: TaskQueue): {
  total: number;
  deferred: number;
  highPriority: number;
  averageAge: number;
  oldestTaskDays: number;
} {
  const now = Date.now();
  const deferred = queue.items.filter(
    (item) =>
      item.lastDeferredAt &&
      now - item.lastDeferredAt.getTime() < queue.config.deferDuration
  ).length;

  const highPriority = queue.items.filter(
    (item) => item.priorityScore >= 50
  ).length;

  const ages = queue.items.map(
    (item) => (now - item.queuedAt.getTime()) / (1000 * 60 * 60 * 24)
  );

  const averageAge =
    ages.length > 0 ? ages.reduce((a, b) => a + b, 0) / ages.length : 0;
  const oldestTaskDays = ages.length > 0 ? Math.max(...ages) : 0;

  return {
    total: queue.items.length,
    deferred,
    highPriority,
    averageAge: Math.round(averageAge * 10) / 10,
    oldestTaskDays: Math.round(oldestTaskDays),
  };
}

/**
 * Check if adding more tasks is possible
 */
export function canAddMore(queue: TaskQueue): boolean {
  return queue.items.length < queue.config.maxSize;
}

/**
 * Get the current task from the queue
 */
export function getCurrentTask(queue: TaskQueue): Task | null {
  if (!queue.currentTaskId) return null;
  const item = queue.items.find((item) => item.task.id === queue.currentTaskId);
  return item?.task ?? null;
}

// ============================================================================
// SERIALIZATION (for persistence)
// ============================================================================

export interface SerializedQueue {
  items: Array<{
    task: Task;
    queuedAt: string;
    priorityScore: number;
    deferCount: number;
    lastDeferredAt?: string;
    preferredTime?: TimeOfDay;
    energyRequired?: EnergyLevel;
  }>;
  currentTaskId: string | null;
  config: QueueConfig;
  updatedAt: string;
}

export function serializeQueue(queue: TaskQueue): SerializedQueue {
  return {
    ...queue,
    items: queue.items.map((item) => ({
      ...item,
      task: {
        ...item.task,
        createdAt: item.task.createdAt,
        updatedAt: item.task.updatedAt,
      },
      queuedAt: item.queuedAt.toISOString(),
      lastDeferredAt: item.lastDeferredAt?.toISOString(),
    })),
    updatedAt: queue.updatedAt.toISOString(),
  };
}

export function deserializeQueue(data: SerializedQueue): TaskQueue {
  return {
    ...data,
    items: data.items.map((item) => ({
      ...item,
      task: {
        ...item.task,
        createdAt: new Date(item.task.createdAt),
        updatedAt: new Date(item.task.updatedAt),
        completedAt: item.task.completedAt
          ? new Date(item.task.completedAt)
          : undefined,
      },
      queuedAt: new Date(item.queuedAt),
      lastDeferredAt: item.lastDeferredAt
        ? new Date(item.lastDeferredAt)
        : undefined,
    })),
    updatedAt: new Date(data.updatedAt),
  };
}
