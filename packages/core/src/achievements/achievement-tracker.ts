/**
 * Achievement Tracker - Issue #47
 * Tracks progress and unlocks achievements
 */

import {
  type Achievement,
  type AchievementCategory,
  type AchievementCriteriaType,
  ACHIEVEMENTS,
  getAchievementById,
} from './achievement-definitions';

// ============================================================================
// TYPES
// ============================================================================

export interface UnlockedAchievement {
  achievementId: string;
  unlockedAt: Date;
  seenByUser: boolean;
  shared: boolean;
}

export interface AchievementProgress {
  achievementId: string;
  currentValue: number;
  targetValue: number;
  percentComplete: number;
}

export interface AchievementStats {
  tasksCompleted: number;
  tasksShrunk: number;
  tasksStopped: number;
  timerSessions: number;
  focusMinutes: number;
  streakDays: number;
  longestStreak: number;
  breaksTaken: number;
  appOpens: number;
  categoriesUsed: Set<string>;
  notesAdded: number;
  lastActiveDate: Date | null;
  daysSinceLastActive: number;
  quietHoursRespectedDays: number;
  consecutiveShrinks: number;
  lastAction: 'complete' | 'stop' | 'shrink' | null;
  hasDonated: boolean;
  // Daily/weekly counters (reset periodically)
  tasksCompletedToday: number;
  tasksCompletedThisWeek: number;
  timerSessionsConsecutiveDays: number;
  breaksTakenConsecutiveDays: number;
}

export interface AchievementEvent {
  type: 'unlocked' | 'progress';
  achievement: Achievement;
  progress?: AchievementProgress;
  unlockedAchievement?: UnlockedAchievement;
}

// ============================================================================
// ACHIEVEMENT TRACKER
// ============================================================================

const STORAGE_KEY_UNLOCKED = 'procrastinact_achievements_unlocked';
const STORAGE_KEY_STATS = 'procrastinact_achievements_stats';

export class AchievementTracker {
  private unlockedAchievements: Map<string, UnlockedAchievement> = new Map();
  private stats: AchievementStats;
  private listeners: Set<(event: AchievementEvent) => void> = new Set();
  private storageAdapter: {
    get: (key: string) => Promise<string | null>;
    set: (key: string, value: string) => Promise<void>;
  } | null = null;

  constructor() {
    this.stats = this.getDefaultStats();
  }

  /**
   * Initialize tracker with storage
   */
  async initialize(storageAdapter?: {
    get: (key: string) => Promise<string | null>;
    set: (key: string, value: string) => Promise<void>;
  }): Promise<void> {
    this.storageAdapter = storageAdapter || null;
    await this.loadFromStorage();

    // Update days since last active
    this.updateDaysSinceLastActive();
  }

  /**
   * Track a task completion
   */
  async trackTaskCompleted(categoryId?: string): Promise<Achievement[]> {
    this.stats.tasksCompleted++;
    this.stats.tasksCompletedToday++;
    this.stats.tasksCompletedThisWeek++;
    this.stats.lastAction = 'complete';
    this.stats.consecutiveShrinks = 0;
    this.stats.lastActiveDate = new Date();
    this.stats.daysSinceLastActive = 0;

    if (categoryId) {
      this.stats.categoriesUsed.add(categoryId);
    }

    await this.saveStats();
    return this.checkAndUnlockAchievements();
  }

  /**
   * Track a task being shrunk
   */
  async trackTaskShrunk(): Promise<Achievement[]> {
    this.stats.tasksShrunk++;
    this.stats.consecutiveShrinks++;
    this.stats.lastAction = 'shrink';
    this.stats.lastActiveDate = new Date();

    await this.saveStats();
    return this.checkAndUnlockAchievements();
  }

  /**
   * Track a task being stopped
   */
  async trackTaskStopped(): Promise<Achievement[]> {
    this.stats.tasksStopped++;
    this.stats.lastAction = 'stop';
    this.stats.lastActiveDate = new Date();
    this.stats.consecutiveShrinks = 0;

    await this.saveStats();
    return this.checkAndUnlockAchievements();
  }

  /**
   * Track a timer session completion
   */
  async trackTimerSession(durationMinutes: number): Promise<Achievement[]> {
    this.stats.timerSessions++;
    this.stats.focusMinutes += durationMinutes;
    this.stats.lastActiveDate = new Date();

    await this.saveStats();
    return this.checkAndUnlockAchievements();
  }

  /**
   * Track a break being taken
   */
  async trackBreakTaken(): Promise<Achievement[]> {
    this.stats.breaksTaken++;
    this.stats.lastActiveDate = new Date();

    await this.saveStats();
    return this.checkAndUnlockAchievements();
  }

  /**
   * Track app open
   */
  async trackAppOpen(): Promise<Achievement[]> {
    this.stats.appOpens++;

    // Check for comeback achievement
    if (this.stats.daysSinceLastActive >= 7) {
      // Will trigger comeback_kid check
    }

    this.stats.lastActiveDate = new Date();
    this.updateDaysSinceLastActive();

    await this.saveStats();
    return this.checkAndUnlockAchievements();
  }

  /**
   * Track note added
   */
  async trackNoteAdded(): Promise<Achievement[]> {
    this.stats.notesAdded++;
    await this.saveStats();
    return this.checkAndUnlockAchievements();
  }

  /**
   * Track streak update
   */
  async trackStreakUpdate(currentStreak: number): Promise<Achievement[]> {
    this.stats.streakDays = currentStreak;
    if (currentStreak > this.stats.longestStreak) {
      this.stats.longestStreak = currentStreak;
    }

    await this.saveStats();
    return this.checkAndUnlockAchievements();
  }

  /**
   * Track donation
   */
  async trackDonation(): Promise<Achievement[]> {
    this.stats.hasDonated = true;
    await this.saveStats();
    return this.checkAndUnlockAchievements();
  }

  /**
   * Track quiet hours respected
   */
  async trackQuietHoursRespected(): Promise<Achievement[]> {
    this.stats.quietHoursRespectedDays++;
    await this.saveStats();
    return this.checkAndUnlockAchievements();
  }

  /**
   * Reset daily counters (call at midnight)
   */
  async resetDailyCounters(): Promise<void> {
    this.stats.tasksCompletedToday = 0;
    await this.saveStats();
  }

  /**
   * Reset weekly counters (call on Monday)
   */
  async resetWeeklyCounters(): Promise<void> {
    this.stats.tasksCompletedThisWeek = 0;
    await this.saveStats();
  }

  /**
   * Get all unlocked achievements
   */
  getUnlockedAchievements(): UnlockedAchievement[] {
    return [...this.unlockedAchievements.values()];
  }

  /**
   * Check if achievement is unlocked
   */
  isUnlocked(achievementId: string): boolean {
    return this.unlockedAchievements.has(achievementId);
  }

  /**
   * Get progress for an achievement
   */
  getProgress(achievementId: string): AchievementProgress | null {
    const achievement = getAchievementById(achievementId);
    if (!achievement) return null;

    const currentValue = this.getCurrentValueForCriteria(
      achievement.criteria.type,
      achievement.criteria.timeframe
    );

    return {
      achievementId,
      currentValue,
      targetValue: achievement.criteria.value,
      percentComplete: Math.min(
        100,
        Math.round((currentValue / achievement.criteria.value) * 100)
      ),
    };
  }

  /**
   * Get all progress
   */
  getAllProgress(): AchievementProgress[] {
    return ACHIEVEMENTS.map((a) => this.getProgress(a.id)).filter(
      (p): p is AchievementProgress => p !== null
    );
  }

  /**
   * Get progress by category
   */
  getProgressByCategory(category: AchievementCategory): {
    unlocked: number;
    total: number;
    percentage: number;
  } {
    const categoryAchievements = ACHIEVEMENTS.filter(
      (a) => a.category === category
    );
    const unlockedCount = categoryAchievements.filter((a) =>
      this.isUnlocked(a.id)
    ).length;

    return {
      unlocked: unlockedCount,
      total: categoryAchievements.length,
      percentage: Math.round(
        (unlockedCount / categoryAchievements.length) * 100
      ),
    };
  }

  /**
   * Get unseen achievements
   */
  getUnseenAchievements(): UnlockedAchievement[] {
    return [...this.unlockedAchievements.values()].filter((a) => !a.seenByUser);
  }

  /**
   * Mark achievement as seen
   */
  async markAsSeen(achievementId: string): Promise<void> {
    const unlocked = this.unlockedAchievements.get(achievementId);
    if (unlocked) {
      unlocked.seenByUser = true;
      await this.saveUnlocked();
    }
  }

  /**
   * Mark achievement as shared
   */
  async markAsShared(achievementId: string): Promise<void> {
    const unlocked = this.unlockedAchievements.get(achievementId);
    if (unlocked) {
      unlocked.shared = true;
      await this.saveUnlocked();
    }
  }

  /**
   * Get current stats
   */
  getStats(): AchievementStats {
    return { ...this.stats };
  }

  /**
   * Subscribe to achievement events
   */
  subscribe(listener: (event: AchievementEvent) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // Private methods

  private getDefaultStats(): AchievementStats {
    return {
      tasksCompleted: 0,
      tasksShrunk: 0,
      tasksStopped: 0,
      timerSessions: 0,
      focusMinutes: 0,
      streakDays: 0,
      longestStreak: 0,
      breaksTaken: 0,
      appOpens: 0,
      categoriesUsed: new Set(),
      notesAdded: 0,
      lastActiveDate: null,
      daysSinceLastActive: 0,
      quietHoursRespectedDays: 0,
      consecutiveShrinks: 0,
      lastAction: null,
      hasDonated: false,
      tasksCompletedToday: 0,
      tasksCompletedThisWeek: 0,
      timerSessionsConsecutiveDays: 0,
      breaksTakenConsecutiveDays: 0,
    };
  }

  private updateDaysSinceLastActive(): void {
    if (this.stats.lastActiveDate) {
      const now = new Date();
      const last = new Date(this.stats.lastActiveDate);
      const diffTime = Math.abs(now.getTime() - last.getTime());
      this.stats.daysSinceLastActive = Math.floor(
        diffTime / (1000 * 60 * 60 * 24)
      );
    }
  }

  private getCurrentValueForCriteria(
    type: AchievementCriteriaType,
    timeframe?: 'day' | 'week' | 'month' | 'all_time'
  ): number {
    switch (type) {
      case 'tasks_completed':
        if (timeframe === 'day') return this.stats.tasksCompletedToday;
        if (timeframe === 'week') return this.stats.tasksCompletedThisWeek;
        return this.stats.tasksCompleted;
      case 'tasks_shrunk':
        return this.stats.tasksShrunk;
      case 'tasks_stopped':
        return this.stats.tasksStopped;
      case 'timer_sessions':
        return this.stats.timerSessions;
      case 'focus_minutes':
        return this.stats.focusMinutes;
      case 'streak_days':
        return this.stats.streakDays;
      case 'breaks_taken':
        return this.stats.breaksTaken;
      case 'app_opens':
        return this.stats.appOpens;
      case 'categories_used':
        return this.stats.categoriesUsed.size;
      case 'notes_added':
        return this.stats.notesAdded;
      default:
        return 0;
    }
  }

  private checkCustomCriteria(achievement: Achievement): boolean {
    const condition = achievement.criteria.condition;

    switch (condition) {
      case 'consecutive_shrinks':
        return this.stats.consecutiveShrinks >= achievement.criteria.value;
      case 'complete_after_stop':
        return (
          this.stats.lastAction === 'complete' && this.stats.tasksStopped > 0
        );
      case 'days_away_return':
        return this.stats.daysSinceLastActive >= achievement.criteria.value;
      case 'donated':
        return this.stats.hasDonated;
      case 'quiet_hours_respected':
        return this.stats.quietHoursRespectedDays >= achievement.criteria.value;
      case 'weekend_rest':
        // This would need more complex logic based on weekend detection
        return false;
      case 'before': {
        const now = new Date();
        return now.getHours() < achievement.criteria.value;
      }
      case 'after_midnight': {
        const currentHour = new Date().getHours();
        return currentHour >= 0 && currentHour < 4;
      }
      case 'consecutive':
        // Handle consecutive day requirements
        return true; // Simplified - would need proper tracking
      default:
        return false;
    }
  }

  private checkAchievementCriteria(achievement: Achievement): boolean {
    if (
      achievement.criteria.type === 'custom' ||
      achievement.criteria.type === 'time_of_day'
    ) {
      return this.checkCustomCriteria(achievement);
    }

    const currentValue = this.getCurrentValueForCriteria(
      achievement.criteria.type,
      achievement.criteria.timeframe
    );

    return currentValue >= achievement.criteria.value;
  }

  private checkAndUnlockAchievements(): Achievement[] {
    const newlyUnlocked: Achievement[] = [];

    for (const achievement of ACHIEVEMENTS) {
      // Skip if already unlocked
      if (this.isUnlocked(achievement.id)) continue;

      // Check if criteria is met
      if (this.checkAchievementCriteria(achievement)) {
        const unlocked: UnlockedAchievement = {
          achievementId: achievement.id,
          unlockedAt: new Date(),
          seenByUser: false,
          shared: false,
        };

        this.unlockedAchievements.set(achievement.id, unlocked);
        newlyUnlocked.push(achievement);

        // Notify listeners
        this.notifyListeners({
          type: 'unlocked',
          achievement,
          unlockedAchievement: unlocked,
        });
      }
    }

    if (newlyUnlocked.length > 0) {
      this.saveUnlocked();
    }

    return newlyUnlocked;
  }

  private notifyListeners(event: AchievementEvent): void {
    this.listeners.forEach((listener) => listener(event));
  }

  private async loadFromStorage(): Promise<void> {
    if (!this.storageAdapter) return;

    try {
      // Load unlocked achievements
      const unlockedStr = await this.storageAdapter.get(STORAGE_KEY_UNLOCKED);
      if (unlockedStr) {
        const unlocked = JSON.parse(unlockedStr) as Array<
          [string, UnlockedAchievement]
        >;
        unlocked.forEach(([id, data]) => {
          data.unlockedAt = new Date(data.unlockedAt);
          this.unlockedAchievements.set(id, data);
        });
      }

      // Load stats
      const statsStr = await this.storageAdapter.get(STORAGE_KEY_STATS);
      if (statsStr) {
        const parsed = JSON.parse(statsStr);
        this.stats = {
          ...this.getDefaultStats(),
          ...parsed,
          categoriesUsed: new Set(parsed.categoriesUsed || []),
          lastActiveDate: parsed.lastActiveDate
            ? new Date(parsed.lastActiveDate)
            : null,
        };
      }
    } catch {
      // Use defaults on error
    }
  }

  private async saveUnlocked(): Promise<void> {
    if (!this.storageAdapter) return;

    try {
      const data = [...this.unlockedAchievements.entries()];
      await this.storageAdapter.set(STORAGE_KEY_UNLOCKED, JSON.stringify(data));
    } catch {
      // Ignore save errors
    }
  }

  private async saveStats(): Promise<void> {
    if (!this.storageAdapter) return;

    try {
      const statsToSave = {
        ...this.stats,
        categoriesUsed: [...this.stats.categoriesUsed],
      };
      await this.storageAdapter.set(
        STORAGE_KEY_STATS,
        JSON.stringify(statsToSave)
      );
    } catch {
      // Ignore save errors
    }
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let trackerInstance: AchievementTracker | null = null;

export function getAchievementTracker(): AchievementTracker {
  if (!trackerInstance) {
    trackerInstance = new AchievementTracker();
  }
  return trackerInstance;
}
