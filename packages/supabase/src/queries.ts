/**
 * Database queries for Supabase
 */

import { getSupabase } from './client';
import type {
  Profile,
  Task,
  InsertTask,
  TimerSession,
  InsertTimerSession,
} from './types';

// ============================================================================
// PROFILE QUERIES
// ============================================================================

/**
 * Get or create user profile
 */
export async function getOrCreateProfile(
  userId: string
): Promise<Profile | null> {
  const supabase = getSupabase();

  // Try to get existing profile
  const { data: existing } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (existing) return existing as Profile;

  // Create new profile
  const { data: created, error } = await supabase
    .from('profiles')
    .insert({ id: userId })
    .select()
    .single();

  if (error) {
    console.error('Error creating profile:', error);
    return null;
  }

  return created as Profile;
}

/**
 * Update profile
 */
export async function updateProfile(
  userId: string,
  updates: Partial<Profile>
): Promise<Profile | null> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating profile:', error);
    return null;
  }

  return data as Profile;
}

/**
 * Update streak
 */
export async function updateStreak(
  userId: string,
  streakCount: number,
  lastDate: string,
  freezes: number
): Promise<void> {
  const supabase = getSupabase();

  await supabase
    .from('profiles')
    .update({
      streak_count: streakCount,
      streak_last_date: lastDate,
      streak_freezes: freezes,
    })
    .eq('id', userId);
}

// ============================================================================
// TASK QUERIES
// ============================================================================

/**
 * Get all active tasks for user
 */
export async function getTasks(userId: string): Promise<Task[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('position', { ascending: true });

  if (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }

  return (data || []) as Task[];
}

/**
 * Get all tasks (including completed) for user
 */
export async function getAllTasks(userId: string): Promise<Task[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }

  return (data || []) as Task[];
}

/**
 * Create a new task
 */
export async function createTask(task: InsertTask): Promise<Task | null> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('tasks')
    .insert(task)
    .select()
    .single();

  if (error) {
    console.error('Error creating task:', error);
    return null;
  }

  return data as Task;
}

/**
 * Update a task
 */
export async function updateTask(
  taskId: string,
  updates: Partial<Task>
): Promise<Task | null> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('tasks')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', taskId)
    .select()
    .single();

  if (error) {
    console.error('Error updating task:', error);
    return null;
  }

  return data as Task;
}

/**
 * Complete a task
 */
export async function completeTask(taskId: string): Promise<Task | null> {
  return updateTask(taskId, {
    status: 'completed',
    completed_at: new Date().toISOString(),
  });
}

/**
 * Abandon a task
 */
export async function abandonTask(taskId: string): Promise<Task | null> {
  return updateTask(taskId, {
    status: 'abandoned',
  });
}

/**
 * Delete a task
 */
export async function deleteTask(taskId: string): Promise<boolean> {
  const supabase = getSupabase();

  const { error } = await supabase.from('tasks').delete().eq('id', taskId);

  if (error) {
    console.error('Error deleting task:', error);
    return false;
  }

  return true;
}

/**
 * Add shrink history entry
 */
export async function addShrinkHistory(
  taskId: string,
  content: string,
  shrinkLevel: number
): Promise<void> {
  const supabase = getSupabase();

  await supabase.from('shrink_history').insert({
    task_id: taskId,
    content,
    shrink_level: shrinkLevel,
  });
}

/**
 * Sync multiple tasks (upsert)
 */
export async function syncTasks(tasks: InsertTask[]): Promise<Task[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('tasks')
    .upsert(tasks, { onConflict: 'id' })
    .select();

  if (error) {
    console.error('Error syncing tasks:', error);
    return [];
  }

  return (data || []) as Task[];
}

// ============================================================================
// TIMER QUERIES
// ============================================================================

/**
 * Start a timer session
 */
export async function startTimerSession(
  session: InsertTimerSession
): Promise<TimerSession | null> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('timer_sessions')
    .insert(session)
    .select()
    .single();

  if (error) {
    console.error('Error starting timer session:', error);
    return null;
  }

  return data as TimerSession;
}

/**
 * End a timer session
 */
export async function endTimerSession(
  sessionId: string,
  completed: boolean
): Promise<TimerSession | null> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('timer_sessions')
    .update({
      ended_at: new Date().toISOString(),
      completed,
    })
    .eq('id', sessionId)
    .select()
    .single();

  if (error) {
    console.error('Error ending timer session:', error);
    return null;
  }

  return data as TimerSession;
}

/**
 * Get timer sessions for user
 */
export async function getTimerSessions(
  userId: string,
  limit = 50
): Promise<TimerSession[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('timer_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('started_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching timer sessions:', error);
    return [];
  }

  return (data || []) as TimerSession[];
}

// ============================================================================
// AI USAGE QUERIES
// ============================================================================

interface AiUsageRow {
  id: string;
  shrink_count: number;
}

/**
 * Get today's AI usage count
 */
export async function getAiUsageToday(userId: string): Promise<number> {
  const supabase = getSupabase();
  const today = new Date().toISOString().split('T')[0];

  const { data } = await supabase
    .from('ai_usage')
    .select('shrink_count')
    .eq('user_id', userId)
    .eq('date', today)
    .single();

  return (data as AiUsageRow | null)?.shrink_count || 0;
}

/**
 * Increment AI usage for today
 */
export async function incrementAiUsage(userId: string): Promise<number> {
  const supabase = getSupabase();
  const today = new Date().toISOString().split('T')[0];

  // Try to update existing record
  const { data: existing } = await supabase
    .from('ai_usage')
    .select('id, shrink_count')
    .eq('user_id', userId)
    .eq('date', today)
    .single();

  const existingRow = existing as AiUsageRow | null;

  if (existingRow) {
    const newCount = existingRow.shrink_count + 1;
    await supabase
      .from('ai_usage')
      .update({ shrink_count: newCount })
      .eq('id', existingRow.id);
    return newCount;
  }

  // Create new record
  await supabase.from('ai_usage').insert({
    user_id: userId,
    date: today,
    shrink_count: 1,
  });

  return 1;
}

// ============================================================================
// ACHIEVEMENTS QUERIES
// ============================================================================

interface AchievementRow {
  achievement_key: string;
}

/**
 * Get user's achievements
 */
export async function getAchievements(userId: string): Promise<string[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('achievements')
    .select('achievement_key')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching achievements:', error);
    return [];
  }

  return ((data || []) as AchievementRow[]).map((a) => a.achievement_key);
}

/**
 * Award an achievement
 */
export async function awardAchievement(
  userId: string,
  achievementKey: string
): Promise<boolean> {
  const supabase = getSupabase();

  const { error } = await supabase.from('achievements').insert({
    user_id: userId,
    achievement_key: achievementKey,
  });

  // Ignore duplicate errors
  if (error && !error.message.includes('duplicate')) {
    console.error('Error awarding achievement:', error);
    return false;
  }

  return true;
}

// ============================================================================
// STATS QUERIES
// ============================================================================

interface ProfileStats {
  total_tasks_completed: number;
  streak_count: number;
}

interface SessionDuration {
  duration_seconds: number;
}

/**
 * Get user stats
 */
export async function getUserStats(userId: string): Promise<{
  totalTasksCompleted: number;
  totalFocusMinutes: number;
  currentStreak: number;
  longestStreak: number;
}> {
  const supabase = getSupabase();

  // Get profile for streak data
  const { data: profile } = await supabase
    .from('profiles')
    .select('total_tasks_completed, streak_count')
    .eq('id', userId)
    .single();

  const profileData = profile as ProfileStats | null;

  // Get total focus time
  const { data: sessions } = await supabase
    .from('timer_sessions')
    .select('duration_seconds')
    .eq('user_id', userId)
    .eq('completed', true);

  const sessionsData = (sessions || []) as SessionDuration[];
  const totalFocusMinutes = Math.floor(
    sessionsData.reduce((sum, s) => sum + s.duration_seconds, 0) / 60
  );

  return {
    totalTasksCompleted: profileData?.total_tasks_completed || 0,
    totalFocusMinutes,
    currentStreak: profileData?.streak_count || 0,
    longestStreak: profileData?.streak_count || 0, // TODO: track separately
  };
}
