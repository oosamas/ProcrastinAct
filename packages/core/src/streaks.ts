/**
 * Streak System
 *
 * Non-punishing streak system that motivates without creating anxiety.
 * Traditional streaks punish breaks. Ours should be forgiving.
 * Missing a day disappoints; it should not devastate.
 */

// ============================================================================
// TYPES
// ============================================================================

export interface StreakData {
  /** Current consecutive day streak */
  currentStreak: number;
  /** Longest streak ever achieved */
  longestStreak: number;
  /** Available streak freezes */
  freezesAvailable: number;
  /** Days streak has been frozen */
  freezesUsed: number;
  /** Last date with activity (YYYY-MM-DD) */
  lastActiveDate: string | null;
  /** Is streak currently paused (vacation/illness) */
  isPaused: boolean;
  /** When pause started */
  pauseStartDate?: string;
  /** When pause ends (if scheduled) */
  pauseEndDate?: string;
  /** Weekly activity (bitmask, Sunday=0) */
  weeklyActivity: number;
  /** Total days with activity */
  totalActiveDays: number;
  /** Date streak started */
  streakStartDate?: string;
  /** History of streak milestones */
  milestones: StreakMilestone[];
}

export interface StreakMilestone {
  type: 'started' | 'milestone' | 'broken' | 'recovered' | 'longest';
  streak: number;
  date: string;
  message: string;
}

export interface StreakConfig {
  /** Days of inactivity before streak breaks */
  gracePeriodDays: number;
  /** How many freezes to start with */
  initialFreezes: number;
  /** Days of activity needed to earn a freeze */
  daysPerFreeze: number;
  /** Maximum freezes you can hold */
  maxFreezes: number;
  /** Weekly target (days per week) */
  weeklyTarget: number;
  /** Max pause duration in days */
  maxPauseDays: number;
}

// ============================================================================
// DEFAULT CONFIG
// ============================================================================

export const DEFAULT_STREAK_CONFIG: StreakConfig = {
  gracePeriodDays: 1, // 1 day grace before freeze is auto-used
  initialFreezes: 2,
  daysPerFreeze: 7, // Earn a freeze every 7 days
  maxFreezes: 5,
  weeklyTarget: 5, // 5 out of 7 days
  maxPauseDays: 30,
};

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Create a new streak data object
 */
export function createStreakData(
  config: StreakConfig = DEFAULT_STREAK_CONFIG
): StreakData {
  return {
    currentStreak: 0,
    longestStreak: 0,
    freezesAvailable: config.initialFreezes,
    freezesUsed: 0,
    lastActiveDate: null,
    isPaused: false,
    weeklyActivity: 0,
    totalActiveDays: 0,
    milestones: [],
  };
}

// ============================================================================
// DATE HELPERS
// ============================================================================

/**
 * Get today's date string (YYYY-MM-DD)
 */
export function getDateString(date: Date = new Date()): string {
  return date.toISOString().split('T')[0];
}

/**
 * Parse date string to Date
 */
export function parseDate(dateStr: string): Date {
  return new Date(dateStr + 'T00:00:00');
}

/**
 * Get day of week (0 = Sunday)
 */
export function getDayOfWeek(dateStr: string): number {
  return parseDate(dateStr).getDay();
}

/**
 * Get difference in days between two dates
 */
export function daysBetween(dateStr1: string, dateStr2: string): number {
  const d1 = parseDate(dateStr1);
  const d2 = parseDate(dateStr2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Check if a date is yesterday
 */
export function isYesterday(
  dateStr: string,
  today: string = getDateString()
): boolean {
  return daysBetween(dateStr, today) === 1;
}

/**
 * Check if a date is today
 */
export function isToday(
  dateStr: string,
  today: string = getDateString()
): boolean {
  return dateStr === today;
}

// ============================================================================
// STREAK LOGIC
// ============================================================================

export interface StreakUpdate {
  streakData: StreakData;
  events: StreakEvent[];
}

export type StreakEvent =
  | { type: 'activity_recorded' }
  | { type: 'streak_started' }
  | { type: 'streak_continued'; streak: number }
  | { type: 'freeze_used'; remaining: number }
  | { type: 'freeze_earned'; total: number }
  | { type: 'streak_broken'; previousStreak: number }
  | { type: 'streak_recovered' }
  | { type: 'milestone_reached'; milestone: number }
  | { type: 'new_record'; streak: number }
  | { type: 'weekly_goal_met' }
  | { type: 'pause_started' }
  | { type: 'pause_ended' };

/**
 * Record activity for today
 */
export function recordActivity(
  data: StreakData,
  config: StreakConfig = DEFAULT_STREAK_CONFIG,
  today: string = getDateString()
): StreakUpdate {
  const events: StreakEvent[] = [];
  let newData = { ...data };

  // Already recorded today
  if (newData.lastActiveDate === today) {
    return { streakData: newData, events };
  }

  events.push({ type: 'activity_recorded' });

  // Handle paused state
  if (newData.isPaused) {
    newData = endPause(newData);
    events.push({ type: 'pause_ended' });
  }

  // Update weekly activity
  const dayOfWeek = getDayOfWeek(today);
  newData.weeklyActivity |= 1 << dayOfWeek;

  // Update total active days
  newData.totalActiveDays++;

  // Check if we should earn a freeze
  if (
    newData.totalActiveDays % config.daysPerFreeze === 0 &&
    newData.freezesAvailable < config.maxFreezes
  ) {
    newData.freezesAvailable++;
    events.push({ type: 'freeze_earned', total: newData.freezesAvailable });
  }

  // Calculate streak
  if (!newData.lastActiveDate) {
    // First activity ever
    newData.currentStreak = 1;
    newData.streakStartDate = today;
    events.push({ type: 'streak_started' });
  } else if (isToday(newData.lastActiveDate, today)) {
    // Already recorded (shouldn't get here)
  } else if (isYesterday(newData.lastActiveDate, today)) {
    // Consecutive day!
    newData.currentStreak++;
    events.push({ type: 'streak_continued', streak: newData.currentStreak });
  } else {
    // Gap in activity
    const gap = daysBetween(newData.lastActiveDate, today);

    if (gap <= config.gracePeriodDays + 1) {
      // Within grace period, try to use freezes
      const freezesNeeded = gap - 1;
      if (newData.freezesAvailable >= freezesNeeded) {
        newData.freezesAvailable -= freezesNeeded;
        newData.freezesUsed += freezesNeeded;
        newData.currentStreak++;
        events.push({
          type: 'freeze_used',
          remaining: newData.freezesAvailable,
        });
        events.push({
          type: 'streak_continued',
          streak: newData.currentStreak,
        });
      } else {
        // Not enough freezes, streak breaks
        const previousStreak = newData.currentStreak;
        newData.currentStreak = 1;
        newData.streakStartDate = today;
        newData.milestones.push({
          type: 'broken',
          streak: previousStreak,
          date: today,
          message: `Streak of ${previousStreak} days ended`,
        });
        events.push({ type: 'streak_broken', previousStreak });

        // If had a decent streak, this is a "comeback"
        if (previousStreak >= 3) {
          events.push({ type: 'streak_recovered' });
        }
      }
    } else {
      // Too long, streak breaks
      const previousStreak = newData.currentStreak;
      newData.currentStreak = 1;
      newData.streakStartDate = today;
      if (previousStreak > 0) {
        newData.milestones.push({
          type: 'broken',
          streak: previousStreak,
          date: today,
          message: `Streak of ${previousStreak} days ended`,
        });
        events.push({ type: 'streak_broken', previousStreak });
      } else {
        events.push({ type: 'streak_started' });
      }
    }
  }

  // Check for new record
  if (newData.currentStreak > newData.longestStreak) {
    newData.longestStreak = newData.currentStreak;
    events.push({ type: 'new_record', streak: newData.longestStreak });
    newData.milestones.push({
      type: 'longest',
      streak: newData.longestStreak,
      date: today,
      message: `New record: ${newData.longestStreak} days!`,
    });
  }

  // Check for milestones (7, 14, 30, 60, 90, 100, 365...)
  const milestones = [7, 14, 21, 30, 60, 90, 100, 150, 200, 365, 500, 1000];
  for (const milestone of milestones) {
    if (
      newData.currentStreak === milestone &&
      !newData.milestones.some(
        (m) => m.type === 'milestone' && m.streak === milestone
      )
    ) {
      events.push({ type: 'milestone_reached', milestone });
      newData.milestones.push({
        type: 'milestone',
        streak: milestone,
        date: today,
        message: getMilestoneMessage(milestone),
      });
    }
  }

  // Check weekly goal
  const activeDaysThisWeek = countWeeklyActiveDays(newData.weeklyActivity);
  if (activeDaysThisWeek === config.weeklyTarget) {
    events.push({ type: 'weekly_goal_met' });
  }

  newData.lastActiveDate = today;

  return { streakData: newData, events };
}

/**
 * Count active days in weekly bitmask
 */
function countWeeklyActiveDays(bitmask: number): number {
  let count = 0;
  for (let i = 0; i < 7; i++) {
    if (bitmask & (1 << i)) count++;
  }
  return count;
}

/**
 * Get milestone message
 */
function getMilestoneMessage(days: number): string {
  const messages: Record<number, string> = {
    7: "One whole week! You're building momentum.",
    14: 'Two weeks strong! This is becoming a habit.',
    21: 'Three weeks! They say it takes 21 days to form a habit.',
    30: "A full month! You're doing amazing.",
    60: 'Two months of consistency. Incredible.',
    90: "Three months! You've made this part of your life.",
    100: '100 days! Triple digits. Legendary.',
    150: '150 days. More than a third of a year!',
    200: '200 days. Just... wow.',
    365: 'A WHOLE YEAR! This is who you are now.',
    500: '500 days. You inspire us.',
    1000: '1000 days. You are a ProcrastinAct legend.',
  };

  return messages[days] || `${days} days! Amazing!`;
}

// ============================================================================
// PAUSE FUNCTIONALITY
// ============================================================================

/**
 * Start a pause (vacation, illness, etc.)
 */
export function startPause(
  data: StreakData,
  endDate?: string,
  config: StreakConfig = DEFAULT_STREAK_CONFIG
): StreakData {
  const today = getDateString();

  // Limit pause duration
  let pauseEnd = endDate;
  if (pauseEnd) {
    const pauseDuration = daysBetween(today, pauseEnd);
    if (pauseDuration > config.maxPauseDays) {
      const maxEnd = new Date();
      maxEnd.setDate(maxEnd.getDate() + config.maxPauseDays);
      pauseEnd = getDateString(maxEnd);
    }
  }

  return {
    ...data,
    isPaused: true,
    pauseStartDate: today,
    pauseEndDate: pauseEnd,
  };
}

/**
 * End a pause
 */
export function endPause(data: StreakData): StreakData {
  return {
    ...data,
    isPaused: false,
    pauseStartDate: undefined,
    pauseEndDate: undefined,
  };
}

/**
 * Check if streak is at risk (needs activity soon)
 */
export function isStreakAtRisk(
  data: StreakData,
  config: StreakConfig = DEFAULT_STREAK_CONFIG,
  today: string = getDateString()
): boolean {
  if (data.isPaused || !data.lastActiveDate || data.currentStreak === 0) {
    return false;
  }

  const daysSinceActive = daysBetween(data.lastActiveDate, today);

  // At risk if we've used grace period and don't have freezes
  return (
    daysSinceActive >= config.gracePeriodDays && data.freezesAvailable === 0
  );
}

// ============================================================================
// STREAK STATUS
// ============================================================================

export interface StreakStatus {
  /** Current streak length */
  streak: number;
  /** Status message */
  message: string;
  /** Days until streak breaks (null if active today) */
  daysUntilBreak: number | null;
  /** Whether we're at risk of losing streak */
  atRisk: boolean;
  /** Whether active today */
  activeToday: boolean;
  /** Available freezes */
  freezes: number;
  /** Progress to weekly goal (0-1) */
  weeklyProgress: number;
  /** Is paused */
  isPaused: boolean;
}

/**
 * Get current streak status
 */
export function getStreakStatus(
  data: StreakData,
  config: StreakConfig = DEFAULT_STREAK_CONFIG,
  today: string = getDateString()
): StreakStatus {
  const activeToday = data.lastActiveDate === today;
  const atRisk = isStreakAtRisk(data, config, today);

  let daysUntilBreak: number | null = null;
  if (data.lastActiveDate && !activeToday && data.currentStreak > 0) {
    const daysSince = daysBetween(data.lastActiveDate, today);
    const graceDays = config.gracePeriodDays + data.freezesAvailable;
    daysUntilBreak = Math.max(0, graceDays - daysSince + 1);
  }

  const weeklyProgress =
    countWeeklyActiveDays(data.weeklyActivity) / config.weeklyTarget;

  let message = '';
  if (data.isPaused) {
    message = 'Streak paused. Take care!';
  } else if (activeToday) {
    message = "You're on fire! Come back tomorrow.";
  } else if (data.currentStreak === 0) {
    message = 'Start your streak today!';
  } else if (atRisk) {
    message = "Quick! Don't lose your streak!";
  } else if (daysUntilBreak !== null && daysUntilBreak <= 1) {
    message = 'Check in to keep your streak!';
  } else {
    message = `${data.currentStreak} day streak. Keep going!`;
  }

  return {
    streak: data.currentStreak,
    message,
    daysUntilBreak,
    atRisk,
    activeToday,
    freezes: data.freezesAvailable,
    weeklyProgress: Math.min(1, weeklyProgress),
    isPaused: data.isPaused,
  };
}

// ============================================================================
// CELEBRATION MESSAGES
// ============================================================================

export function getStreakCelebration(events: StreakEvent[]): string | null {
  // Priority order of celebrations
  for (const event of events) {
    if (event.type === 'new_record') {
      return `New personal best! ${event.streak} days! 🎉`;
    }
    if (event.type === 'milestone_reached') {
      return getMilestoneMessage(event.milestone);
    }
    if (event.type === 'weekly_goal_met') {
      return 'Weekly goal crushed! 🙌';
    }
    if (event.type === 'streak_recovered') {
      return "Welcome back! Let's build it up again. 💪";
    }
    if (event.type === 'streak_started') {
      return 'Day 1! Every journey starts with a single step.';
    }
    if (event.type === 'freeze_earned') {
      return `Earned a streak freeze! You now have ${event.total}. ❄️`;
    }
  }

  return null;
}

// ============================================================================
// SERIALIZATION
// ============================================================================

export function serializeStreakData(data: StreakData): string {
  return JSON.stringify(data);
}

export function deserializeStreakData(json: string): StreakData {
  return JSON.parse(json) as StreakData;
}
