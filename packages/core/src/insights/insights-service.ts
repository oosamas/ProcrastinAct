/**
 * Personal Insights Service - Issue #96 & #97
 * User-facing analytics showing patterns and progress
 * All insights are celebratory, never judgmental
 */

// ============================================================================
// TYPES
// ============================================================================

export interface DailyStats {
  date: string; // YYYY-MM-DD
  tasksCompleted: number;
  tasksStarted: number;
  tasksShrunk: number;
  tasksStopped: number;
  focusMinutes: number;
  sessionsCompleted: number;
  longestSession: number;
  categories: Record<string, number>;
  productiveHours: number[];
}

export interface WeeklyInsights {
  weekStart: Date;
  weekEnd: Date;
  totalTasksCompleted: number;
  totalFocusMinutes: number;
  streakDays: number;
  avgTasksPerDay: number;
  mostProductiveDay: { day: string; tasks: number } | null;
  mostProductiveHour: { hour: number; tasks: number } | null;
  topCategories: Array<{ category: string; count: number }>;
  wins: string[];
  patterns: string[];
  suggestions: string[];
  comparison: {
    tasksVsLastWeek: 'improved' | 'same' | 'none';
    focusVsLastWeek: 'improved' | 'same' | 'none';
  };
}

export interface MonthlyInsights {
  month: number;
  year: number;
  totalTasksCompleted: number;
  totalFocusMinutes: number;
  longestStreak: number;
  avgShrinkLevel: number;
  categoryBreakdown: Array<{
    category: string;
    percentage: number;
    count: number;
  }>;
  productiveTimePatterns: {
    preferredHours: number[];
    preferredDays: string[];
  };
  personalRecords: Array<{
    title: string;
    value: number;
    unit: string;
    isNew: boolean;
  }>;
}

export interface PersonalInsight {
  id: string;
  type: 'pattern' | 'win' | 'suggestion' | 'milestone';
  title: string;
  description: string;
  icon: string;
  value?: number;
  unit?: string;
  celebratory: boolean;
}

export interface InsightsDashboardData {
  overview: {
    totalTasksEver: number;
    totalFocusHours: number;
    currentStreak: number;
    longestStreak: number;
    memberSince: Date;
  };
  thisWeek: WeeklyInsights;
  thisMonth: MonthlyInsights;
  recentInsights: PersonalInsight[];
  productivityPatterns: {
    bestHours: number[];
    bestDays: string[];
    avgSessionLength: number;
  };
}

// ============================================================================
// INSIGHT GENERATORS
// ============================================================================

/**
 * Generate positive, celebratory wins based on data
 * NEVER uses negative language
 */
export function generateWins(stats: DailyStats[]): string[] {
  const wins: string[] = [];
  const totalTasks = stats.reduce((sum, d) => sum + d.tasksCompleted, 0);
  const totalFocus = stats.reduce((sum, d) => sum + d.focusMinutes, 0);
  const totalSessions = stats.reduce((sum, d) => sum + d.sessionsCompleted, 0);

  // Task wins
  if (totalTasks > 0) {
    wins.push(
      `You completed ${totalTasks} task${totalTasks !== 1 ? 's' : ''} this week!`
    );
  }

  if (totalTasks >= 10) {
    wins.push('Double-digit productivity! Amazing work!');
  }

  if (totalTasks >= 25) {
    wins.push('You crushed 25+ tasks! Incredible dedication!');
  }

  // Focus wins
  if (totalFocus >= 60) {
    const hours = Math.floor(totalFocus / 60);
    wins.push(
      `${hours}+ hour${hours !== 1 ? 's' : ''} of focused work. That takes real commitment!`
    );
  }

  if (totalSessions >= 5) {
    wins.push(
      `${totalSessions} focus sessions completed. You're building great habits!`
    );
  }

  // Shrink wins
  const totalShrunk = stats.reduce((sum, d) => sum + d.tasksShrunk, 0);
  if (totalShrunk >= 5) {
    wins.push(
      `You broke down ${totalShrunk} overwhelming tasks. Smart strategy!`
    );
  }

  // Self-care wins
  const totalStopped = stats.reduce((sum, d) => sum + d.tasksStopped, 0);
  if (totalStopped >= 3) {
    wins.push(
      `You knew when to take breaks ${totalStopped} times. Self-care matters!`
    );
  }

  // Consecutive days win
  const activeDays = stats.filter((d) => d.tasksCompleted > 0).length;
  if (activeDays >= 5) {
    wins.push(
      `${activeDays} active days this week. Consistency is your superpower!`
    );
  }

  return wins;
}

/**
 * Generate pattern observations (positive framing only)
 */
export function generatePatterns(stats: DailyStats[]): string[] {
  const patterns: string[] = [];

  // Find most productive hours
  const hourCounts: Record<number, number> = {};
  stats.forEach((d) => {
    d.productiveHours.forEach((hour) => {
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
  });

  const topHours = Object.entries(hourCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2)
    .map(([hour]) => parseInt(hour, 10));

  if (topHours.length > 0) {
    const formatHour = (h: number) => {
      if (h === 0) return '12 AM';
      if (h < 12) return `${h} AM`;
      if (h === 12) return '12 PM';
      return `${h - 12} PM`;
    };

    if (topHours[0]! < 10) {
      patterns.push(
        `You seem to thrive in the morning (around ${formatHour(topHours[0]!)}). Early bird energy!`
      );
    } else if (topHours[0]! >= 17) {
      patterns.push(
        `Evening hours (${formatHour(topHours[0]!)}) seem to be your sweet spot. Night owl power!`
      );
    } else {
      patterns.push(
        `You're most productive around ${formatHour(topHours[0]!)}. Great time to schedule important tasks!`
      );
    }
  }

  // Find most used categories
  const categoryCounts: Record<string, number> = {};
  stats.forEach((d) => {
    Object.entries(d.categories).forEach(([cat, count]) => {
      categoryCounts[cat] = (categoryCounts[cat] || 0) + count;
    });
  });

  const topCategory = Object.entries(categoryCounts).sort(
    ([, a], [, b]) => b - a
  )[0];
  if (topCategory && topCategory[1] >= 3) {
    patterns.push(
      `"${topCategory[0]}" is where you've focused most. You know your priorities!`
    );
  }

  // Focus session patterns
  const avgSession =
    stats.reduce((sum, d) => sum + d.longestSession, 0) /
    Math.max(stats.length, 1);
  if (avgSession >= 25) {
    patterns.push(
      'Your focus sessions are solid! Averaging 25+ minutes shows great concentration.'
    );
  } else if (avgSession >= 15) {
    patterns.push('Your 15+ minute sessions are building real focus muscle!');
  }

  return patterns;
}

/**
 * Generate helpful, encouraging suggestions
 */
export function generateSuggestions(
  stats: DailyStats[],
  weeklyInsights: WeeklyInsights
): string[] {
  const suggestions: string[] = [];

  // Suggest based on productive hours
  if (weeklyInsights.mostProductiveHour) {
    const hour = weeklyInsights.mostProductiveHour.hour;
    const formatHour = (h: number) =>
      h < 12 ? `${h || 12} AM` : `${h === 12 ? 12 : h - 12} PM`;
    suggestions.push(
      `Try scheduling your hardest tasks around ${formatHour(hour)} - that's when you shine!`
    );
  }

  // Suggest based on categories
  if (weeklyInsights.topCategories.length >= 2) {
    suggestions.push(
      `Balance tip: Mix in some "${weeklyInsights.topCategories[1]?.category}" tasks with your "${weeklyInsights.topCategories[0]?.category}" focus!`
    );
  }

  // Focus session suggestions
  const avgSessionMins =
    stats.reduce((sum, d) => sum + d.focusMinutes, 0) /
    Math.max(
      stats.reduce((sum, d) => sum + d.sessionsCompleted, 0),
      1
    );

  if (avgSessionMins < 15) {
    suggestions.push(
      'Try extending your focus sessions by just 5 minutes. Small increases add up!'
    );
  }

  // Self-care reminders
  const totalStopped = stats.reduce((sum, d) => sum + d.tasksStopped, 0);
  if (totalStopped === 0) {
    suggestions.push(
      "Remember: It's okay to stop and take breaks! Self-care is productive too."
    );
  }

  return suggestions.slice(0, 3); // Limit to 3 suggestions
}

// ============================================================================
// INSIGHTS SERVICE
// ============================================================================

const STORAGE_KEY = 'procrastinact_daily_stats';
const _INSIGHTS_CACHE_KEY = 'procrastinact_insights_cache';

export class InsightsService {
  private dailyStats: Map<string, DailyStats> = new Map();
  private storageAdapter: {
    get: (key: string) => Promise<string | null>;
    set: (key: string, value: string) => Promise<void>;
  } | null = null;

  /**
   * Initialize service
   */
  async initialize(storageAdapter?: {
    get: (key: string) => Promise<string | null>;
    set: (key: string, value: string) => Promise<void>;
  }): Promise<void> {
    this.storageAdapter = storageAdapter || null;
    await this.loadStats();
  }

  /**
   * Track a completed task
   */
  async trackTaskCompleted(categoryId?: string): Promise<void> {
    const today = this.getTodayKey();
    const stats = this.getOrCreateDayStats(today);
    stats.tasksCompleted++;
    if (categoryId) {
      stats.categories[categoryId] = (stats.categories[categoryId] || 0) + 1;
    }
    const hour = new Date().getHours();
    if (!stats.productiveHours.includes(hour)) {
      stats.productiveHours.push(hour);
    }
    await this.saveStats();
  }

  /**
   * Track a started task
   */
  async trackTaskStarted(): Promise<void> {
    const today = this.getTodayKey();
    const stats = this.getOrCreateDayStats(today);
    stats.tasksStarted++;
    await this.saveStats();
  }

  /**
   * Track a shrunk task
   */
  async trackTaskShrunk(): Promise<void> {
    const today = this.getTodayKey();
    const stats = this.getOrCreateDayStats(today);
    stats.tasksShrunk++;
    await this.saveStats();
  }

  /**
   * Track a stopped task
   */
  async trackTaskStopped(): Promise<void> {
    const today = this.getTodayKey();
    const stats = this.getOrCreateDayStats(today);
    stats.tasksStopped++;
    await this.saveStats();
  }

  /**
   * Track a focus session
   */
  async trackFocusSession(durationMinutes: number): Promise<void> {
    const today = this.getTodayKey();
    const stats = this.getOrCreateDayStats(today);
    stats.focusMinutes += durationMinutes;
    stats.sessionsCompleted++;
    if (durationMinutes > stats.longestSession) {
      stats.longestSession = durationMinutes;
    }
    const hour = new Date().getHours();
    if (!stats.productiveHours.includes(hour)) {
      stats.productiveHours.push(hour);
    }
    await this.saveStats();
  }

  /**
   * Get weekly insights
   */
  getWeeklyInsights(weekOffset: number = 0): WeeklyInsights {
    const { start, end } = this.getWeekRange(weekOffset);
    const weekStats = this.getStatsForRange(start, end);

    const totalTasks = weekStats.reduce((sum, d) => sum + d.tasksCompleted, 0);
    const totalFocus = weekStats.reduce((sum, d) => sum + d.focusMinutes, 0);
    const activeDays = weekStats.filter((d) => d.tasksCompleted > 0).length;

    // Most productive day
    const dayWithMostTasks = weekStats.reduce(
      (best, current) =>
        current.tasksCompleted > (best?.tasksCompleted || 0) ? current : best,
      null as DailyStats | null
    );

    // Most productive hour
    const hourCounts: Record<number, number> = {};
    weekStats.forEach((d) => {
      d.productiveHours.forEach((hour) => {
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      });
    });
    const topHourEntry = Object.entries(hourCounts).sort(
      ([, a], [, b]) => b - a
    )[0];

    // Category breakdown
    const categoryCounts: Record<string, number> = {};
    weekStats.forEach((d) => {
      Object.entries(d.categories).forEach(([cat, count]) => {
        categoryCounts[cat] = (categoryCounts[cat] || 0) + count;
      });
    });
    const topCategories = Object.entries(categoryCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([category, count]) => ({ category, count }));

    // Compare to last week
    const lastWeekStats = this.getStatsForRange(
      new Date(start.getTime() - 7 * 24 * 60 * 60 * 1000),
      new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000)
    );
    const lastWeekTasks = lastWeekStats.reduce(
      (sum, d) => sum + d.tasksCompleted,
      0
    );
    const lastWeekFocus = lastWeekStats.reduce(
      (sum, d) => sum + d.focusMinutes,
      0
    );

    return {
      weekStart: start,
      weekEnd: end,
      totalTasksCompleted: totalTasks,
      totalFocusMinutes: totalFocus,
      streakDays: activeDays,
      avgTasksPerDay:
        weekStats.length > 0 ? Math.round(totalTasks / weekStats.length) : 0,
      mostProductiveDay: dayWithMostTasks
        ? {
            day: this.getDayName(new Date(dayWithMostTasks.date)),
            tasks: dayWithMostTasks.tasksCompleted,
          }
        : null,
      mostProductiveHour: topHourEntry
        ? { hour: parseInt(topHourEntry[0], 10), tasks: topHourEntry[1] }
        : null,
      topCategories,
      wins: generateWins(weekStats),
      patterns: generatePatterns(weekStats),
      suggestions: generateSuggestions(weekStats, {} as WeeklyInsights),
      comparison: {
        tasksVsLastWeek:
          lastWeekTasks === 0
            ? 'none'
            : totalTasks >= lastWeekTasks
              ? 'improved'
              : 'same',
        focusVsLastWeek:
          lastWeekFocus === 0
            ? 'none'
            : totalFocus >= lastWeekFocus
              ? 'improved'
              : 'same',
      },
    };
  }

  /**
   * Get monthly insights
   */
  getMonthlyInsights(monthOffset: number = 0): MonthlyInsights {
    const today = new Date();
    const targetMonth = today.getMonth() - monthOffset;
    const targetYear = today.getFullYear() + Math.floor(targetMonth / 12);
    const normalizedMonth = ((targetMonth % 12) + 12) % 12;

    const start = new Date(targetYear, normalizedMonth, 1);
    const end = new Date(targetYear, normalizedMonth + 1, 0);
    const monthStats = this.getStatsForRange(start, end);

    const totalTasks = monthStats.reduce((sum, d) => sum + d.tasksCompleted, 0);
    const totalFocus = monthStats.reduce((sum, d) => sum + d.focusMinutes, 0);
    const totalShrunk = monthStats.reduce((sum, d) => sum + d.tasksShrunk, 0);

    // Category breakdown
    const categoryCounts: Record<string, number> = {};
    monthStats.forEach((d) => {
      Object.entries(d.categories).forEach(([cat, count]) => {
        categoryCounts[cat] = (categoryCounts[cat] || 0) + count;
      });
    });

    const totalCategoryTasks = Object.values(categoryCounts).reduce(
      (a, b) => a + b,
      0
    );
    const categoryBreakdown = Object.entries(categoryCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([category, count]) => ({
        category,
        count,
        percentage:
          totalCategoryTasks > 0
            ? Math.round((count / totalCategoryTasks) * 100)
            : 0,
      }));

    // Productive time patterns
    const hourCounts: Record<number, number> = {};
    const dayCounts: Record<number, number> = {};
    monthStats.forEach((d) => {
      const dayOfWeek = new Date(d.date).getDay();
      dayCounts[dayOfWeek] = (dayCounts[dayOfWeek] || 0) + d.tasksCompleted;
      d.productiveHours.forEach((hour) => {
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      });
    });

    const preferredHours = Object.entries(hourCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([h]) => parseInt(h, 10));

    const dayNames = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    const preferredDays = Object.entries(dayCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 2)
      .map(([d]) => dayNames[parseInt(d, 10)] || 'Unknown');

    return {
      month: normalizedMonth,
      year: targetYear,
      totalTasksCompleted: totalTasks,
      totalFocusMinutes: totalFocus,
      longestStreak: this.calculateLongestStreak(monthStats),
      avgShrinkLevel:
        totalShrunk > 0 ? Math.round((totalShrunk / totalTasks) * 100) : 0,
      categoryBreakdown,
      productiveTimePatterns: {
        preferredHours,
        preferredDays,
      },
      personalRecords: this.getPersonalRecords(monthStats),
    };
  }

  /**
   * Get full dashboard data
   */
  getDashboardData(): InsightsDashboardData {
    const allStats = [...this.dailyStats.values()];
    const weeklyInsights = this.getWeeklyInsights(0);
    const monthlyInsights = this.getMonthlyInsights(0);

    const totalTasks = allStats.reduce((sum, d) => sum + d.tasksCompleted, 0);
    const totalFocusMinutes = allStats.reduce(
      (sum, d) => sum + d.focusMinutes,
      0
    );

    return {
      overview: {
        totalTasksEver: totalTasks,
        totalFocusHours: Math.round(totalFocusMinutes / 60),
        currentStreak: weeklyInsights.streakDays,
        longestStreak: monthlyInsights.longestStreak,
        memberSince: new Date(allStats[0]?.date || new Date()),
      },
      thisWeek: weeklyInsights,
      thisMonth: monthlyInsights,
      recentInsights: this.generateRecentInsights(allStats),
      productivityPatterns: {
        bestHours: monthlyInsights.productiveTimePatterns.preferredHours,
        bestDays: monthlyInsights.productiveTimePatterns.preferredDays,
        avgSessionLength: this.getAverageSessionLength(allStats),
      },
    };
  }

  /**
   * Generate weekly summary report data
   */
  getWeeklySummaryReport(weekOffset: number = 0): {
    insights: WeeklyInsights;
    highlights: string[];
    nextWeekTips: string[];
    shouldSend: boolean;
  } {
    const insights = this.getWeeklyInsights(weekOffset);

    // Only send if there's activity
    const shouldSend =
      insights.totalTasksCompleted > 0 || insights.totalFocusMinutes > 0;

    return {
      insights,
      highlights: [
        ...insights.wins.slice(0, 3),
        ...insights.patterns.slice(0, 2),
      ],
      nextWeekTips: insights.suggestions,
      shouldSend,
    };
  }

  // Private methods

  private getTodayKey(): string {
    return new Date().toISOString().split('T')[0]!;
  }

  private getOrCreateDayStats(dateKey: string): DailyStats {
    if (!this.dailyStats.has(dateKey)) {
      this.dailyStats.set(dateKey, {
        date: dateKey,
        tasksCompleted: 0,
        tasksStarted: 0,
        tasksShrunk: 0,
        tasksStopped: 0,
        focusMinutes: 0,
        sessionsCompleted: 0,
        longestSession: 0,
        categories: {},
        productiveHours: [],
      });
    }
    return this.dailyStats.get(dateKey)!;
  }

  private getWeekRange(weekOffset: number): { start: Date; end: Date } {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const start = new Date(today);
    start.setDate(today.getDate() - dayOfWeek - weekOffset * 7);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    return { start, end };
  }

  private getStatsForRange(start: Date, end: Date): DailyStats[] {
    const results: DailyStats[] = [];
    const current = new Date(start);

    while (current <= end) {
      const key = current.toISOString().split('T')[0]!;
      const stats = this.dailyStats.get(key);
      if (stats) {
        results.push(stats);
      }
      current.setDate(current.getDate() + 1);
    }

    return results;
  }

  private getDayName(date: Date): string {
    const days = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    return days[date.getDay()] || 'Unknown';
  }

  private calculateLongestStreak(stats: DailyStats[]): number {
    if (stats.length === 0) return 0;

    let longestStreak = 0;
    let currentStreak = 0;

    const sortedStats = [...stats].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    for (let i = 0; i < sortedStats.length; i++) {
      if (sortedStats[i]!.tasksCompleted > 0) {
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }

    return longestStreak;
  }

  private getPersonalRecords(
    stats: DailyStats[]
  ): MonthlyInsights['personalRecords'] {
    const records: MonthlyInsights['personalRecords'] = [];

    // Most tasks in a day
    const maxTasks = Math.max(...stats.map((d) => d.tasksCompleted), 0);
    if (maxTasks > 0) {
      records.push({
        title: 'Most Tasks in a Day',
        value: maxTasks,
        unit: 'tasks',
        isNew: false,
      });
    }

    // Longest focus session
    const maxSession = Math.max(...stats.map((d) => d.longestSession), 0);
    if (maxSession > 0) {
      records.push({
        title: 'Longest Focus Session',
        value: maxSession,
        unit: 'minutes',
        isNew: false,
      });
    }

    // Total focus time
    const totalFocus = stats.reduce((sum, d) => sum + d.focusMinutes, 0);
    if (totalFocus > 0) {
      records.push({
        title: 'Total Focus Time',
        value: Math.round(totalFocus / 60),
        unit: 'hours',
        isNew: false,
      });
    }

    return records;
  }

  private getAverageSessionLength(stats: DailyStats[]): number {
    const totalMinutes = stats.reduce((sum, d) => sum + d.focusMinutes, 0);
    const totalSessions = stats.reduce(
      (sum, d) => sum + d.sessionsCompleted,
      0
    );
    return totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0;
  }

  private generateRecentInsights(stats: DailyStats[]): PersonalInsight[] {
    const insights: PersonalInsight[] = [];

    // Milestone insights
    const totalTasks = stats.reduce((sum, d) => sum + d.tasksCompleted, 0);
    if (totalTasks >= 100) {
      insights.push({
        id: 'milestone_100_tasks',
        type: 'milestone',
        title: 'Century Club',
        description: "You've completed 100+ tasks!",
        icon: '🎉',
        value: totalTasks,
        unit: 'tasks',
        celebratory: true,
      });
    }

    // Pattern insights
    const recentWeek = stats.slice(-7);
    if (recentWeek.length >= 5) {
      const activeDays = recentWeek.filter((d) => d.tasksCompleted > 0).length;
      if (activeDays >= 5) {
        insights.push({
          id: 'pattern_consistent',
          type: 'pattern',
          title: 'Consistency Champion',
          description: "You've been active 5+ days this week!",
          icon: '🔥',
          celebratory: true,
        });
      }
    }

    // Win insights
    const thisWeek = this.getWeeklyInsights(0);
    if (thisWeek.comparison.tasksVsLastWeek === 'improved') {
      insights.push({
        id: 'win_improved',
        type: 'win',
        title: 'Leveling Up',
        description: 'You completed more tasks than last week!',
        icon: '📈',
        celebratory: true,
      });
    }

    return insights.slice(0, 5);
  }

  private async loadStats(): Promise<void> {
    if (!this.storageAdapter) return;

    try {
      const stored = await this.storageAdapter.get(STORAGE_KEY);
      if (stored) {
        const entries = JSON.parse(stored) as Array<[string, DailyStats]>;
        entries.forEach(([key, value]) => {
          this.dailyStats.set(key, value);
        });
      }
    } catch {
      // Use defaults on error
    }
  }

  private async saveStats(): Promise<void> {
    if (!this.storageAdapter) return;

    try {
      const entries = [...this.dailyStats.entries()];
      await this.storageAdapter.set(STORAGE_KEY, JSON.stringify(entries));
    } catch {
      // Ignore save errors
    }
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let insightsInstance: InsightsService | null = null;

export function getInsightsService(): InsightsService {
  if (!insightsInstance) {
    insightsInstance = new InsightsService();
  }
  return insightsInstance;
}
