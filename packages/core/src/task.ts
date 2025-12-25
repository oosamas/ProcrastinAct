import type { Task, TaskStatus } from '@procrastinact/types';

export function createTask(
  title: string,
  _category?: string
): Omit<Task, 'id'> {
  return {
    title,
    status: 'pending' as TaskStatus,
    priority: 0,
    shrinkLevel: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export function completeTask(task: Task): Task {
  return {
    ...task,
    status: 'completed',
    completedAt: new Date(),
    updatedAt: new Date(),
  };
}

export function stopTask(task: Task): Task {
  return {
    ...task,
    status: 'stopped',
    updatedAt: new Date(),
  };
}

export function shrinkTask(task: Task): Task {
  return {
    ...task,
    shrinkLevel: task.shrinkLevel + 1,
    updatedAt: new Date(),
  };
}

export function calculateTaskPriority(
  task: Task,
  _timeOfDay: 'morning' | 'afternoon' | 'evening'
): number {
  let priority = task.priority;

  // Boost priority based on how long task has been pending
  const daysPending = Math.floor(
    (Date.now() - task.createdAt.getTime()) / (1000 * 60 * 60 * 24)
  );
  priority += Math.min(daysPending, 5);

  return priority;
}
