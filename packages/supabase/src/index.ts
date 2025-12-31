/**
 * @procrastinact/supabase
 *
 * Supabase client, auth, and database queries
 */

// Client
export {
  initSupabase,
  getSupabase,
  isSupabaseInitialized,
  getSupabaseUrl,
} from './client';

// Auth
export {
  signUp,
  signIn,
  signInWithOAuth,
  signOut,
  getSession,
  getUser,
  resetPassword,
  updatePassword,
  onAuthStateChange,
  refreshSession,
  type AuthResult,
} from './auth';

// Queries
export {
  // Profile
  getOrCreateProfile,
  updateProfile,
  updateStreak,
  // Tasks
  getTasks,
  getAllTasks,
  createTask,
  updateTask,
  completeTask,
  abandonTask,
  deleteTask,
  addShrinkHistory,
  syncTasks,
  // Timer
  startTimerSession,
  endTimerSession,
  getTimerSessions,
  // AI Usage
  getAiUsageToday,
  incrementAiUsage,
  // Achievements
  getAchievements,
  awardAchievement,
  // Stats
  getUserStats,
} from './queries';

// Types
export type {
  Database,
  Profile,
  Task,
  ShrinkHistory,
  TimerSession,
  AiUsage,
  Achievement,
  InsertProfile,
  InsertTask,
  InsertTimerSession,
  SubscriptionTier,
  TaskStatus,
} from './types';

// Constants
export const SUPABASE_URL = 'https://wulcoeqlhgaptbhxfzoe.supabase.co';
