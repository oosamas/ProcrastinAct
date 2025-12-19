/**
 * Storage abstraction types for cross-platform data persistence
 */

export interface StorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
  getAllKeys(): Promise<string[]>;
  clear(): Promise<void>;
  multiGet(keys: string[]): Promise<[string, string | null][]>;
  multiSet(entries: [string, string][]): Promise<void>;
  multiRemove(keys: string[]): Promise<void>;
}

export interface TypedStorage<T> {
  get(): Promise<T | null>;
  set(value: T): Promise<void>;
  remove(): Promise<void>;
  update(updater: (current: T | null) => T): Promise<void>;
}

export interface StorageOptions {
  adapter: StorageAdapter;
  prefix?: string;
  serialize?: (value: unknown) => string;
  deserialize?: (value: string) => unknown;
}

export const STORAGE_KEYS = {
  // User data
  USER: 'user',
  USER_PREFERENCES: 'user_preferences',

  // Tasks
  TASKS: 'tasks',
  TASK_CATEGORIES: 'task_categories',

  // Timer & Sessions
  TIMER_STATE: 'timer_state',
  FOCUS_SESSIONS: 'focus_sessions',

  // Gamification
  STREAK: 'streak',
  ACHIEVEMENTS: 'achievements',
  DAILY_STATS: 'daily_stats',

  // Sync
  SYNC_STATE: 'sync_state',
  PENDING_CHANGES: 'pending_changes',

  // Onboarding
  ONBOARDING_STATE: 'onboarding_state',

  // App state
  LAST_ACTIVE: 'last_active',
  APP_VERSION: 'app_version',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
