/**
 * Main Zustand store for ProcrastinAct mobile app
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Task, TimerState } from '@procrastinact/types';
import type { TaskShrinkResponse, ShrunkTask } from '@procrastinact/core';
import {
  createTask,
  completeTask,
  stopTask,
  createTimer,
  startTimer,
  pauseTimer,
  extendTimer,
  generateOfflineShrink,
} from '@procrastinact/core';
import { zustandStorage } from '../lib/storage';
import { generateId } from '../lib/utils';
import { fullSync, syncStreak } from '../lib/sync';

// Serializable task type for persistence
interface SerializableTask extends Omit<
  Task,
  'createdAt' | 'updatedAt' | 'completedAt'
> {
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

// Serializable timer state
interface SerializableTimerState extends Omit<TimerState, 'startedAt'> {
  startedAt?: string;
}

// Serializable streak state (lastActiveDate as string for persistence)
interface SerializableStreak {
  currentStreak: number;
  longestStreak: number;
  freezesAvailable: number;
  lastActiveDate: string | null;
}

// Store state
interface AppState {
  // Tasks
  tasks: SerializableTask[];
  currentTaskId: string | null;

  // Timer
  timer: SerializableTimerState | null;

  // Shrink suggestions
  shrinkSuggestions: TaskShrinkResponse | null;
  isShrinking: boolean;

  // Celebration
  showCelebration: boolean;
  completedTaskTitle: string | null;

  // Streak
  streak: SerializableStreak;

  // Preferences
  darkMode: boolean;

  // Sync
  isSyncing: boolean;
  lastSyncTime: string | null;
  syncError: string | null;

  // Hydration
  _hasHydrated: boolean;
}

// Store actions
interface AppActions {
  // Task actions
  addTask: (title: string) => void;
  completeCurrentTask: () => void;
  stopCurrentTask: () => void;
  deferTask: () => void;

  // Shrink actions
  shrinkCurrentTask: () => void;
  selectShrinkSuggestion: (suggestion: ShrunkTask) => void;
  cancelShrink: () => void;

  // Timer actions
  startFocusTimer: (minutes: number) => void;
  pauseFocusTimer: () => void;
  resumeFocusTimer: () => void;
  extendFocusTimer: (minutes?: number) => void;
  endTimerEarly: () => void;
  updateTimerRemaining: (remaining: number) => void;

  // UI actions
  dismissCelebration: () => void;
  toggleDarkMode: () => void;

  // Sync actions
  syncToCloud: () => Promise<void>;

  // Hydration
  setHasHydrated: (state: boolean) => void;
}

type AppStore = AppState & AppActions;

// Helper to serialize task
function serializeTask(
  task: Omit<Task, 'id'> & { id: string }
): SerializableTask {
  return {
    ...task,
    createdAt:
      task.createdAt instanceof Date
        ? task.createdAt.toISOString()
        : task.createdAt,
    updatedAt:
      task.updatedAt instanceof Date
        ? task.updatedAt.toISOString()
        : task.updatedAt,
    completedAt:
      task.completedAt instanceof Date
        ? task.completedAt.toISOString()
        : task.completedAt,
  };
}

// Helper to deserialize task
function deserializeTask(task: SerializableTask): Task {
  return {
    ...task,
    createdAt: new Date(task.createdAt),
    updatedAt: new Date(task.updatedAt),
    completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
  };
}

// Initial streak state
const initialStreak: SerializableStreak = {
  currentStreak: 0,
  longestStreak: 0,
  freezesAvailable: 1,
  lastActiveDate: null,
};

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // Initial state
      tasks: [],
      currentTaskId: null,
      timer: null,
      shrinkSuggestions: null,
      isShrinking: false,
      showCelebration: false,
      completedTaskTitle: null,
      streak: initialStreak,
      darkMode: false,
      isSyncing: false,
      lastSyncTime: null,
      syncError: null,
      _hasHydrated: false,

      // Task actions
      addTask: (title: string) => {
        const taskData = createTask(title);
        const id = generateId();
        const task = serializeTask({ ...taskData, id });

        set((state) => ({
          tasks: [...state.tasks, task],
          currentTaskId: state.currentTaskId ?? id,
        }));
      },

      completeCurrentTask: () => {
        const { currentTaskId, tasks, streak } = get();
        if (!currentTaskId) return;

        const taskIndex = tasks.findIndex((t) => t.id === currentTaskId);
        if (taskIndex === -1) return;

        const task = tasks[taskIndex];
        if (!task) return;

        const completedTaskData = completeTask(deserializeTask(task));
        const updatedTask = serializeTask(completedTaskData);

        // Update streak with proper date handling (using local timezone)
        const now = new Date();
        const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        const lastActiveStr = streak.lastActiveDate;

        let newStreak = streak.currentStreak;
        if (!lastActiveStr) {
          // First activity ever
          newStreak = 1;
        } else if (lastActiveStr === todayStr) {
          // Already recorded today, keep same streak
          newStreak = streak.currentStreak;
        } else {
          // Check if it was yesterday (parse as local dates)
          const [lastYear, lastMonth, lastDay] = lastActiveStr
            .split('-')
            .map(Number);
          const lastActiveDate = new Date(lastYear!, lastMonth! - 1, lastDay!);
          const today = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
          );
          const diffDays = Math.floor(
            (today.getTime() - lastActiveDate.getTime()) / (1000 * 60 * 60 * 24)
          );

          if (diffDays === 1) {
            // Consecutive day, increment streak
            newStreak = streak.currentStreak + 1;
          } else {
            // Streak broken, start fresh
            newStreak = 1;
          }
        }

        const updatedTasks = [...tasks];
        updatedTasks[taskIndex] = updatedTask;

        // Find next pending task (pending or in_progress)
        const nextTask = updatedTasks.find(
          (t) =>
            (t.status === 'pending' || t.status === 'in_progress') &&
            t.id !== currentTaskId
        );

        set({
          tasks: updatedTasks,
          currentTaskId: nextTask?.id ?? null,
          showCelebration: true,
          completedTaskTitle: task.title,
          timer: null,
          streak: {
            ...streak,
            currentStreak: newStreak,
            longestStreak: Math.max(streak.longestStreak, newStreak),
            lastActiveDate: todayStr,
          },
        });
      },

      stopCurrentTask: () => {
        const { currentTaskId, tasks } = get();
        if (!currentTaskId) return;

        const taskIndex = tasks.findIndex((t) => t.id === currentTaskId);
        if (taskIndex === -1) return;

        const task = tasks[taskIndex];
        if (!task) return;

        const stoppedTaskData = stopTask(deserializeTask(task));
        const updatedTask = serializeTask(stoppedTaskData);

        const updatedTasks = [...tasks];
        updatedTasks[taskIndex] = updatedTask;

        // Find next pending task (pending or in_progress)
        const nextTask = updatedTasks.find(
          (t) =>
            (t.status === 'pending' || t.status === 'in_progress') &&
            t.id !== currentTaskId
        );

        set({
          tasks: updatedTasks,
          currentTaskId: nextTask?.id ?? null,
          timer: null,
        });
      },

      deferTask: () => {
        const { currentTaskId, tasks } = get();
        if (!currentTaskId) return;

        // Move current task to end of the array, find next
        const currentIndex = tasks.findIndex((t) => t.id === currentTaskId);
        if (currentIndex === -1) return;

        const currentTask = tasks[currentIndex];
        if (!currentTask) return;

        // Create new array with current task moved to end
        const updatedTasks = [
          ...tasks.slice(0, currentIndex),
          ...tasks.slice(currentIndex + 1),
          currentTask, // Add to end
        ];

        // Find next pending task (now the first pending task in the reordered array)
        const nextTask = updatedTasks.find(
          (t) =>
            (t.status === 'pending' || t.status === 'in_progress') &&
            t.id !== currentTaskId
        );

        set({
          tasks: updatedTasks,
          currentTaskId: nextTask?.id ?? currentTaskId,
          timer: null,
        });
      },

      // Shrink actions
      shrinkCurrentTask: () => {
        const { currentTaskId, tasks } = get();
        if (!currentTaskId) return;

        const task = tasks.find((t) => t.id === currentTaskId);
        if (!task) return;

        set({ isShrinking: true });

        // Use offline shrink (synchronous)
        const suggestions = generateOfflineShrink(task.title);

        set({
          shrinkSuggestions: suggestions,
          isShrinking: false,
        });
      },

      selectShrinkSuggestion: (suggestion: ShrunkTask) => {
        const { currentTaskId, tasks } = get();
        if (!currentTaskId) return;

        // Find the parent task to inherit its shrink level
        const parentTaskIndex = tasks.findIndex((t) => t.id === currentTaskId);
        if (parentTaskIndex === -1) return;

        const parentTask = tasks[parentTaskIndex];
        if (!parentTask) return;

        // Create new shrunk task with inherited shrink level + 1
        const taskData = createTask(suggestion.title);
        const id = generateId();
        const newTask = serializeTask({
          ...taskData,
          id,
          parentTaskId: currentTaskId,
          // New task gets parent's shrinkLevel + 1 to track how many times it's been shrunk
          shrinkLevel: parentTask.shrinkLevel + 1,
        });

        // Parent task is not modified - the child task carries the shrink history
        // Just add the new task and switch to it
        set({
          tasks: [...tasks, newTask],
          currentTaskId: id,
          shrinkSuggestions: null,
          timer: null,
        });
      },

      cancelShrink: () => {
        set({
          shrinkSuggestions: null,
          isShrinking: false,
        });
      },

      // Timer actions
      startFocusTimer: (minutes: number) => {
        const { currentTaskId, tasks } = get();
        const timer = createTimer(minutes);
        const startedTimer = startTimer(timer, currentTaskId ?? undefined);

        // Update current task status to 'in_progress'
        let updatedTasks = tasks;
        if (currentTaskId) {
          const taskIndex = tasks.findIndex((t) => t.id === currentTaskId);
          if (taskIndex !== -1) {
            const task = tasks[taskIndex];
            if (task && task.status === 'pending') {
              updatedTasks = [...tasks];
              updatedTasks[taskIndex] = {
                ...task,
                status: 'in_progress',
                updatedAt: new Date().toISOString(),
              };
            }
          }
        }

        set({
          tasks: updatedTasks,
          timer: {
            ...startedTimer,
            startedAt: startedTimer.startedAt?.toISOString(),
          },
        });
      },

      pauseFocusTimer: () => {
        const { timer } = get();
        if (!timer) return;

        const deserializedTimer: TimerState = {
          ...timer,
          startedAt: timer.startedAt ? new Date(timer.startedAt) : undefined,
        };
        const pausedTimer = pauseTimer(deserializedTimer);

        set({
          timer: {
            ...pausedTimer,
            startedAt: pausedTimer.startedAt?.toISOString(),
          },
        });
      },

      resumeFocusTimer: () => {
        const { timer, currentTaskId } = get();
        if (!timer) return;

        const deserializedTimer: TimerState = {
          ...timer,
          startedAt: timer.startedAt ? new Date(timer.startedAt) : undefined,
        };
        const resumedTimer = startTimer(
          deserializedTimer,
          currentTaskId ?? undefined
        );

        set({
          timer: {
            ...resumedTimer,
            startedAt: resumedTimer.startedAt?.toISOString(),
          },
        });
      },

      extendFocusTimer: (minutes = 5) => {
        const { timer } = get();
        if (!timer) return;

        const deserializedTimer: TimerState = {
          ...timer,
          startedAt: timer.startedAt ? new Date(timer.startedAt) : undefined,
        };
        const extendedTimer = extendTimer(deserializedTimer, minutes);

        set({
          timer: {
            ...extendedTimer,
            startedAt: extendedTimer.startedAt?.toISOString(),
          },
        });
      },

      endTimerEarly: () => {
        const { currentTaskId, tasks } = get();

        // Revert task from 'in_progress' back to 'pending' if timer ends early
        let updatedTasks = tasks;
        if (currentTaskId) {
          const taskIndex = tasks.findIndex((t) => t.id === currentTaskId);
          if (taskIndex !== -1) {
            const task = tasks[taskIndex];
            if (task && task.status === 'in_progress') {
              updatedTasks = [...tasks];
              updatedTasks[taskIndex] = {
                ...task,
                status: 'pending',
                updatedAt: new Date().toISOString(),
              };
            }
          }
        }

        set({ tasks: updatedTasks, timer: null });
      },

      updateTimerRemaining: (remaining: number) => {
        const { timer } = get();
        if (!timer) return;

        set({
          timer: {
            ...timer,
            remaining,
          },
        });
      },

      // UI actions
      dismissCelebration: () => {
        set({
          showCelebration: false,
          completedTaskTitle: null,
        });
      },

      toggleDarkMode: () => {
        set((state) => ({ darkMode: !state.darkMode }));
      },

      // Sync action
      syncToCloud: async () => {
        const { tasks, streak, isSyncing } = get();
        if (isSyncing) return;

        set({ isSyncing: true, syncError: null });

        try {
          // Convert serializable tasks to sync format
          const localTasks = tasks.map((t) => ({
            id: t.id,
            content: t.title,
            originalContent: undefined, // Tasks don't store originalContent locally
            shrinkLevel: t.shrinkLevel,
            completed: t.status === 'completed',
            createdAt: t.createdAt,
            updatedAt: t.updatedAt,
          }));

          // Sync tasks
          const { success, mergedTasks } = await fullSync(localTasks);

          if (success) {
            // Sync streak
            await syncStreak({
              currentStreak: streak.currentStreak,
              longestStreak: streak.longestStreak,
              lastTaskDate: streak.lastActiveDate,
              streakFreezes: streak.freezesAvailable,
            });

            // Update local state with merged tasks if new ones were added
            const existingIds = new Set(tasks.map((t) => t.id));
            const newTasks = mergedTasks.filter((t) => !existingIds.has(t.id));

            if (newTasks.length > 0) {
              const convertedNewTasks: SerializableTask[] = newTasks.map(
                (t) => ({
                  id: t.id,
                  title: t.content,
                  shrinkLevel: t.shrinkLevel,
                  status: t.completed
                    ? ('completed' as const)
                    : ('pending' as const),
                  priority: 0,
                  createdAt: t.createdAt,
                  updatedAt: t.updatedAt || t.createdAt,
                })
              );

              set((state) => ({
                tasks: [...state.tasks, ...convertedNewTasks],
              }));
            }

            set({
              isSyncing: false,
              lastSyncTime: new Date().toISOString(),
              syncError: null,
            });
          } else {
            set({
              isSyncing: false,
              syncError: 'Sync failed',
            });
          }
        } catch (error) {
          set({
            isSyncing: false,
            syncError: error instanceof Error ? error.message : 'Sync failed',
          });
        }
      },

      // Hydration
      setHasHydrated: (state: boolean) => {
        set({ _hasHydrated: state });
      },
    }),
    {
      name: 'procrastinact-app-store',
      storage: createJSONStorage(() => zustandStorage),
      partialize: (state) => ({
        tasks: state.tasks,
        currentTaskId: state.currentTaskId,
        timer: state.timer,
        streak: state.streak,
        darkMode: state.darkMode,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Handle stale timer on rehydration
          if (state.timer && state.timer.isRunning && state.timer.startedAt) {
            const startedAt = new Date(state.timer.startedAt);
            const elapsed = Math.floor(
              (Date.now() - startedAt.getTime()) / 1000
            );
            const remaining = state.timer.remaining - elapsed;

            if (remaining <= 0) {
              // Timer has elapsed while app was closed, clear it
              state.timer = null;
            } else {
              // Update remaining time to account for time passed
              state.timer = {
                ...state.timer,
                remaining,
              };
            }
          }
          state.setHasHydrated(true);
        }
      },
    }
  )
);

// Selector hooks for common derived state
export const useCurrentTask = () => {
  const tasks = useAppStore((state) => state.tasks);
  const currentTaskId = useAppStore((state) => state.currentTaskId);
  if (!currentTaskId) return null;
  const task = tasks.find((t) => t.id === currentTaskId);
  return task ? deserializeTask(task) : null;
};

export const usePendingTasks = () => {
  const tasks = useAppStore((state) => state.tasks);
  // Include both 'pending' and 'in_progress' as active tasks
  return tasks
    .filter((t) => t.status === 'pending' || t.status === 'in_progress')
    .map(deserializeTask);
};

export const useCompletedTasksCount = () => {
  const tasks = useAppStore((state) => state.tasks);
  return tasks.filter((t) => t.status === 'completed').length;
};

export const useTimer = () => {
  const timer = useAppStore((state) => state.timer);
  if (!timer) return null;
  return {
    ...timer,
    startedAt: timer.startedAt ? new Date(timer.startedAt) : undefined,
  } as TimerState;
};
