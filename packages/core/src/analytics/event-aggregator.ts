/**
 * Event Aggregator - Aggregates analytics events into daily/weekly stats
 */

import type { DailyStats, AnalyticsEventName } from '@procrastinact/types';
import type { TrackedEvent, WeeklyStats } from './types';

export class EventAggregator {
  private dailyStats: Map<string, DailyStats> = new Map();
  private sessionEvents: TrackedEvent[] = [];

  /**
   * Process an event and update aggregations
   */
  processEvent(event: TrackedEvent): void {
    this.sessionEvents.push(event);
    const dateKey = this.getDateKey(event.timestamp);
    const stats = this.getOrCreateDailyStats(dateKey);

    switch (event.name as AnalyticsEventName) {
      case 'task_created':
        stats.tasksStarted += 1;
        break;

      case 'task_completed':
        stats.tasksCompleted += 1;
        if (event.properties?.timeToComplete) {
          stats.focusTime += Math.round(
            (event.properties.timeToComplete as number) / 1000
          );
        }
        break;

      case 'task_shrunk':
        stats.shrinkUsages += 1;
        break;

      case 'task_stopped':
        stats.stopUsages += 1;
        break;

      case 'timer_completed':
        stats.sessionsCompleted += 1;
        const duration = (event.properties?.duration as number) || 0;
        stats.focusTime += duration;
        if (duration > stats.longestSession) {
          stats.longestSession = duration;
        }
        break;

      default:
        // Other events don't affect daily stats
        break;
    }

    this.dailyStats.set(dateKey, stats);
  }

  /**
   * Get stats for a specific date
   */
  getDailyStats(date: Date): DailyStats | undefined {
    return this.dailyStats.get(this.getDateKey(date));
  }

  /**
   * Get stats for today
   */
  getTodayStats(): DailyStats {
    return this.getOrCreateDailyStats(this.getDateKey(new Date()));
  }

  /**
   * Get stats for the past N days
   */
  getRecentStats(days: number): DailyStats[] {
    const stats: DailyStats[] = [];
    const now = new Date();

    for (let i = 0; i < days; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateKey = this.getDateKey(date);
      stats.push(this.getOrCreateDailyStats(dateKey));
    }

    return stats;
  }

  /**
   * Calculate weekly stats
   */
  getWeeklyStats(weekStartDate: Date): WeeklyStats {
    const stats: DailyStats[] = [];
    let mostProductiveDay = '';
    let maxTasksCompleted = 0;

    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStartDate);
      date.setDate(date.getDate() + i);
      const dayStats = this.getOrCreateDailyStats(this.getDateKey(date));
      stats.push(dayStats);

      if (dayStats.tasksCompleted > maxTasksCompleted) {
        maxTasksCompleted = dayStats.tasksCompleted;
        mostProductiveDay = this.getDayName(date);
      }
    }

    const totalTasksCompleted = stats.reduce(
      (sum, s) => sum + s.tasksCompleted,
      0
    );
    const totalFocusTime = stats.reduce((sum, s) => sum + s.focusTime, 0);
    const totalSessions = stats.reduce(
      (sum, s) => sum + s.sessionsCompleted,
      0
    );
    const streakDays = this.calculateStreakDays(stats);

    // Calculate improvement from last week
    const lastWeekStart = new Date(weekStartDate);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    const lastWeekStats = this.getWeeklyStatsInternal(lastWeekStart);
    const improvementFromLastWeek =
      lastWeekStats.totalTasksCompleted > 0
        ? Math.round(
            ((totalTasksCompleted - lastWeekStats.totalTasksCompleted) /
              lastWeekStats.totalTasksCompleted) *
              100
          )
        : 0;

    return {
      weekStartDate: this.getDateKey(weekStartDate),
      totalTasksCompleted,
      totalFocusTime,
      averageSessionLength:
        totalSessions > 0 ? Math.round(totalFocusTime / totalSessions) : 0,
      mostProductiveDay,
      streakDays,
      improvementFromLastWeek,
    };
  }

  /**
   * Import stored stats (for persistence)
   */
  importStats(stats: DailyStats[]): void {
    for (const stat of stats) {
      this.dailyStats.set(stat.date, stat);
    }
  }

  /**
   * Export all stats (for persistence)
   */
  exportStats(): DailyStats[] {
    return Array.from(this.dailyStats.values());
  }

  /**
   * Clear all aggregated data
   */
  clear(): void {
    this.dailyStats.clear();
    this.sessionEvents = [];
  }

  /**
   * Get session events (for debugging/export)
   */
  getSessionEvents(): TrackedEvent[] {
    return [...this.sessionEvents];
  }

  private getOrCreateDailyStats(dateKey: string): DailyStats {
    let stats = this.dailyStats.get(dateKey);
    if (!stats) {
      stats = {
        date: dateKey,
        tasksCompleted: 0,
        tasksStarted: 0,
        focusTime: 0,
        sessionsCompleted: 0,
        longestSession: 0,
        shrinkUsages: 0,
        stopUsages: 0,
      };
      this.dailyStats.set(dateKey, stats);
    }
    return stats;
  }

  private getWeeklyStatsInternal(weekStartDate: Date): {
    totalTasksCompleted: number;
  } {
    let totalTasksCompleted = 0;
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStartDate);
      date.setDate(date.getDate() + i);
      const stats = this.dailyStats.get(this.getDateKey(date));
      if (stats) {
        totalTasksCompleted += stats.tasksCompleted;
      }
    }
    return { totalTasksCompleted };
  }

  private calculateStreakDays(stats: DailyStats[]): number {
    let streak = 0;
    for (const stat of stats) {
      if (stat.tasksCompleted > 0 || stat.sessionsCompleted > 0) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }

  private getDateKey(date: Date): string {
    return date.toISOString().split('T')[0] ?? '';
  }

  private getDayName(date: Date): string {
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  }
}
