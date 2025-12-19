// Task Types
export interface Task {
  id: string;
  title: string;
  description?: string;
  category?: TaskCategory;
  status: TaskStatus;
  priority: number;
  shrinkLevel: number;
  parentTaskId?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'stopped';

export interface TaskCategory {
  id: string;
  name: string;
  color: string;
  emoji?: string;
}

// Timer Types
export interface TimerState {
  isRunning: boolean;
  duration: number; // in seconds
  remaining: number; // in seconds
  startedAt?: Date;
  taskId?: string;
}

export type TimerPreset = 5 | 15 | 25 | 45;

// User Types
export interface User {
  id: string;
  email?: string;
  displayName?: string;
  preferences: UserPreferences;
  createdAt: Date;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  hapticIntensity: 'off' | 'light' | 'normal' | 'strong';
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  quietHoursStart?: string; // HH:mm format
  quietHoursEnd?: string;
  preferredFocusTime: 'morning' | 'afternoon' | 'evening' | 'varies';
  gamificationLevel: 'full' | 'minimal' | 'none';
}

// Streak Types
export interface Streak {
  currentStreak: number;
  longestStreak: number;
  freezesAvailable: number;
  lastActiveDate: Date;
}

// Achievement Types
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
  category: AchievementCategory;
}

export type AchievementCategory =
  | 'tasks'
  | 'timer'
  | 'streaks'
  | 'self-care'
  | 'social'
  | 'hidden';

// Sync Types
export interface SyncState {
  lastSyncedAt?: Date;
  pendingChanges: number;
  isOnline: boolean;
  isSyncing: boolean;
}

// Encouragement Types
export interface EncouragementMessage {
  id: string;
  text: string;
  context: EncouragementContext;
}

export type EncouragementContext =
  | 'starting'
  | 'struggling'
  | 'completing'
  | 'stopping'
  | 'returning'
  | 'low_energy'
  | 'high_achievement';
