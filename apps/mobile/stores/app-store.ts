/**
 * Main Zustand store for ProcrastinAct mobile app
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Task, TimerState, Streak } from '@procrastinact/types';
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
  streak: Streak;

  // Preferences
  darkMode: boolean;

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
const initialStreak: Streak = {
  currentStreak: 0,
  longestStreak: 0,
  freezesAvailable: 1,
  lastActiveDate: new Date(),
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

        // Update streak
        const today = new Date().toDateString();
        const lastActive = new Date(streak.lastActiveDate).toDateString();
        const newStreak =
          today !== lastActive
            ? streak.currentStreak + 1
            : streak.currentStreak;

        const updatedTasks = [...tasks];
        updatedTasks[taskIndex] = updatedTask;

        // Find next pending task
        const nextTask = updatedTasks.find(
          (t) => t.status === 'pending' && t.id !== currentTaskId
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
            lastActiveDate: new Date(),
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

        // Find next pending task
        const nextTask = updatedTasks.find(
          (t) => t.status === 'pending' && t.id !== currentTaskId
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

        // Move current task to end, find next
        const currentIndex = tasks.findIndex((t) => t.id === currentTaskId);
        if (currentIndex === -1) return;

        const pendingTasks = tasks.filter((t) => t.status === 'pending');
        const nextTask = pendingTasks.find((t) => t.id !== currentTaskId);

        set({
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

        // Create new task from suggestion
        const taskData = createTask(suggestion.title);
        const id = generateId();
        const newTask = serializeTask({
          ...taskData,
          id,
          parentTaskId: currentTaskId,
          shrinkLevel: 1,
        });

        // Update current task's shrink level
        const taskIndex = tasks.findIndex((t) => t.id === currentTaskId);
        if (taskIndex === -1) return;

        const currentTask = tasks[taskIndex];
        if (!currentTask) return;

        const updatedTask: SerializableTask = {
          ...currentTask,
          shrinkLevel: currentTask.shrinkLevel + 1,
          updatedAt: new Date().toISOString(),
        };

        const updatedTasks = [...tasks];
        updatedTasks[taskIndex] = updatedTask;

        set({
          tasks: [...updatedTasks, newTask],
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
        const { currentTaskId } = get();
        const timer = createTimer(minutes);
        const startedTimer = startTimer(timer, currentTaskId ?? undefined);

        set({
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
        set({ timer: null });
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
        streak: state.streak,
        darkMode: state.darkMode,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
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
  return tasks.filter((t) => t.status === 'pending').map(deserializeTask);
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
