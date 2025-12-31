/**
 * Sync service for syncing local data with Supabase
 * Uses a local-first approach where local data is the source of truth
 */

import {
  syncTasks as syncTasksToSupabase,
  getTasks as getTasksFromSupabase,
  updateStreak,
  getOrCreateProfile,
} from '@procrastinact/supabase';
import { getSupabaseClient, getCurrentUserId } from './supabase';
import type { Task, InsertTask } from '@procrastinact/supabase';

// Local task format from app store
interface LocalTask {
  id: string;
  content: string;
  originalContent?: string;
  shrinkLevel: number;
  completed: boolean;
  createdAt: string;
  updatedAt?: string;
}

// Streak format from app store
interface LocalStreak {
  currentStreak: number;
  longestStreak: number;
  lastTaskDate: string | null;
  streakFreezes: number;
}

/**
 * Convert local task to Supabase format
 */
function localToSupabaseTask(task: LocalTask, userId: string): InsertTask {
  const now = new Date().toISOString();
  return {
    id: task.id,
    user_id: userId,
    content: task.content,
    original_content: task.originalContent || null,
    shrink_level: task.shrinkLevel,
    status: task.completed ? 'completed' : 'active',
    created_at: task.createdAt,
    updated_at: task.updatedAt || now,
    completed_at: task.completed ? task.updatedAt || now : null,
  };
}

/**
 * Convert Supabase task to local format
 */
function supabaseToLocalTask(task: Task): LocalTask {
  return {
    id: task.id,
    content: task.content,
    originalContent: task.original_content || undefined,
    shrinkLevel: task.shrink_level,
    completed: task.status === 'completed',
    createdAt: task.created_at,
    updatedAt: task.updated_at,
  };
}

/**
 * Sync tasks to Supabase
 * Pushes local tasks to the server
 */
export async function pushTasksToCloud(tasks: LocalTask[]): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  const userId = await getCurrentUserId();
  if (!userId) return false;

  try {
    const supabaseTasks = tasks.map((t) => localToSupabaseTask(t, userId));
    await syncTasksToSupabase(supabaseTasks);
    return true;
  } catch (error) {
    console.error('Error pushing tasks to cloud:', error);
    return false;
  }
}

/**
 * Pull tasks from Supabase
 * Fetches server tasks that might be newer
 */
export async function pullTasksFromCloud(): Promise<LocalTask[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  const userId = await getCurrentUserId();
  if (!userId) return null;

  try {
    const tasks = await getTasksFromSupabase(userId);
    return tasks.map(supabaseToLocalTask);
  } catch (error) {
    console.error('Error pulling tasks from cloud:', error);
    return null;
  }
}

/**
 * Merge local and remote tasks
 * Local-first: local changes take precedence
 * For tasks that exist only on server, add them locally
 */
export function mergeTasks(
  localTasks: LocalTask[],
  remoteTasks: LocalTask[]
): LocalTask[] {
  const localMap = new Map(localTasks.map((t) => [t.id, t]));
  const merged = [...localTasks];

  // Add remote tasks that don't exist locally
  for (const remoteTask of remoteTasks) {
    if (!localMap.has(remoteTask.id)) {
      merged.push(remoteTask);
    }
  }

  return merged;
}

/**
 * Sync streak data to Supabase
 */
export async function syncStreak(streak: LocalStreak): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  const userId = await getCurrentUserId();
  if (!userId) return false;

  try {
    const today = new Date().toISOString().split('T')[0] ?? '';
    const lastDate = streak.lastTaskDate ?? today;
    await updateStreak(
      userId,
      streak.currentStreak,
      lastDate,
      streak.streakFreezes
    );
    return true;
  } catch (error) {
    console.error('Error syncing streak:', error);
    return false;
  }
}

/**
 * Initialize sync for a user
 * Creates profile if needed and pulls initial data
 */
export async function initializeSync(): Promise<{
  tasks: LocalTask[] | null;
  profile: { streakCount: number; streakFreezes: number } | null;
}> {
  const client = getSupabaseClient();
  if (!client) return { tasks: null, profile: null };

  const userId = await getCurrentUserId();
  if (!userId) return { tasks: null, profile: null };

  try {
    // Create or get profile
    const profile = await getOrCreateProfile(userId);

    // Get tasks
    const tasks = await pullTasksFromCloud();

    return {
      tasks,
      profile: profile
        ? {
            streakCount: profile.streak_count,
            streakFreezes: profile.streak_freezes,
          }
        : null,
    };
  } catch (error) {
    console.error('Error initializing sync:', error);
    return { tasks: null, profile: null };
  }
}

/**
 * Full sync operation
 * 1. Push local changes
 * 2. Pull remote changes
 * 3. Merge and return
 */
export async function fullSync(localTasks: LocalTask[]): Promise<{
  success: boolean;
  mergedTasks: LocalTask[];
}> {
  // Push local changes first
  await pushTasksToCloud(localTasks);

  // Pull remote changes
  const remoteTasks = await pullTasksFromCloud();

  if (!remoteTasks) {
    return { success: false, mergedTasks: localTasks };
  }

  // Merge (local-first)
  const mergedTasks = mergeTasks(localTasks, remoteTasks);

  return { success: true, mergedTasks };
}
