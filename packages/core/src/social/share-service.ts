/**
 * Social Sharing Service - Sprint 6
 * Share achievements, progress, and milestones
 */

// ============================================================================
// TYPES
// ============================================================================

export type ShareContentType =
  | 'achievement'
  | 'streak'
  | 'milestone'
  | 'weekly_summary'
  | 'task_completed'
  | 'custom';

export interface ShareContent {
  type: ShareContentType;
  title: string;
  message: string;
  imageUrl?: string;
  url?: string;
  hashtags?: string[];
  metadata?: Record<string, unknown>;
}

export interface ShareResult {
  success: boolean;
  platform?: string;
  error?: string;
}

export interface ShareableAchievement {
  id: string;
  name: string;
  description: string;
  emoji: string;
  rarity: string;
  unlockedAt: Date;
}

export interface ShareableStreak {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: Date;
}

export interface ShareableMilestone {
  type: 'tasks' | 'focus' | 'streak' | 'custom';
  value: number;
  label: string;
  achievedAt: Date;
}

export interface ShareableWeeklySummary {
  tasksCompleted: number;
  focusMinutes: number;
  streakDays: number;
  topCategory?: string;
  weekStart: Date;
  weekEnd: Date;
}

// ============================================================================
// SHARE TEMPLATES
// ============================================================================

export const SHARE_TEMPLATES = {
  achievement: (achievement: ShareableAchievement) => ({
    title: `I unlocked "${achievement.name}"!`,
    message: `${achievement.emoji} Just unlocked the "${achievement.name}" achievement in ProcrastinAct! ${achievement.description}`,
    hashtags: ['ProcrastinAct', 'Productivity', 'Achievement', 'ADHD'],
  }),

  streak: (streak: ShareableStreak) => ({
    title: `${streak.currentStreak} Day Streak!`,
    message: `🔥 I've been productive for ${streak.currentStreak} day${streak.currentStreak !== 1 ? 's' : ''} in a row with ProcrastinAct! My best streak is ${streak.longestStreak} days.`,
    hashtags: ['ProcrastinAct', 'Streak', 'Productivity', 'Consistency'],
  }),

  milestone: (milestone: ShareableMilestone) => ({
    title: `Milestone: ${milestone.label}`,
    message: `🎉 I just hit a milestone in ProcrastinAct: ${milestone.label}! ${getMilestoneMessage(milestone)}`,
    hashtags: ['ProcrastinAct', 'Milestone', 'Progress', 'Productivity'],
  }),

  weeklySummary: (summary: ShareableWeeklySummary) => ({
    title: 'My Week in Review',
    message: `📊 My productivity this week:\n✅ ${summary.tasksCompleted} tasks completed\n⏱ ${Math.round(summary.focusMinutes / 60)}h focused\n🔥 ${summary.streakDays} day streak${summary.topCategory ? `\n📁 Top focus: ${summary.topCategory}` : ''}\n\nTracked with ProcrastinAct!`,
    hashtags: ['ProcrastinAct', 'WeeklyReview', 'Productivity', 'Progress'],
  }),

  taskCompleted: (taskName: string, shrinkLevel: number) => ({
    title: 'Task Completed!',
    message:
      shrinkLevel > 0
        ? `✅ Completed a task that I broke down ${shrinkLevel} time${shrinkLevel !== 1 ? 's' : ''} to make it manageable! Small steps lead to big progress. #ProcrastinAct`
        : `✅ Just checked off "${taskName}" from my list! Every task matters. #ProcrastinAct`,
    hashtags: ['ProcrastinAct', 'TaskDone', 'SmallWins', 'Progress'],
  }),
};

function getMilestoneMessage(milestone: ShareableMilestone): string {
  switch (milestone.type) {
    case 'tasks':
      return `I've completed ${milestone.value} tasks total!`;
    case 'focus':
      return `I've focused for ${milestone.value} hours total!`;
    case 'streak':
      return `I hit a ${milestone.value} day streak!`;
    default:
      return '';
  }
}

// ============================================================================
// SHARE IMAGE GENERATOR
// ============================================================================

export interface ShareImageOptions {
  width?: number;
  height?: number;
  backgroundColor?: string;
  textColor?: string;
  accentColor?: string;
}

/**
 * Generate share card data for rendering
 * Actual image generation would be platform-specific
 */
export function generateShareCardData(
  content: ShareContent,
  options: ShareImageOptions = {}
): {
  width: number;
  height: number;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  title: string;
  message: string;
  branding: string;
} {
  return {
    width: options.width || 1200,
    height: options.height || 630,
    backgroundColor: options.backgroundColor || '#6366f1',
    textColor: options.textColor || '#ffffff',
    accentColor: options.accentColor || '#fbbf24',
    title: content.title,
    message: content.message,
    branding: 'ProcrastinAct',
  };
}

// ============================================================================
// SHARE SERVICE
// ============================================================================

export class ShareService {
  private shareHistory: Array<{
    content: ShareContent;
    sharedAt: Date;
    platform?: string;
  }> = [];

  /**
   * Create shareable content from an achievement
   */
  createAchievementShare(achievement: ShareableAchievement): ShareContent {
    const template = SHARE_TEMPLATES.achievement(achievement);
    return {
      type: 'achievement',
      title: template.title,
      message: template.message,
      hashtags: template.hashtags,
      metadata: { achievementId: achievement.id },
    };
  }

  /**
   * Create shareable content from a streak
   */
  createStreakShare(streak: ShareableStreak): ShareContent {
    const template = SHARE_TEMPLATES.streak(streak);
    return {
      type: 'streak',
      title: template.title,
      message: template.message,
      hashtags: template.hashtags,
      metadata: { streakDays: streak.currentStreak },
    };
  }

  /**
   * Create shareable content from a milestone
   */
  createMilestoneShare(milestone: ShareableMilestone): ShareContent {
    const template = SHARE_TEMPLATES.milestone(milestone);
    return {
      type: 'milestone',
      title: template.title,
      message: template.message,
      hashtags: template.hashtags,
      metadata: { milestoneType: milestone.type, value: milestone.value },
    };
  }

  /**
   * Create shareable content from a weekly summary
   */
  createWeeklySummaryShare(summary: ShareableWeeklySummary): ShareContent {
    const template = SHARE_TEMPLATES.weeklySummary(summary);
    return {
      type: 'weekly_summary',
      title: template.title,
      message: template.message,
      hashtags: template.hashtags,
      metadata: {
        tasksCompleted: summary.tasksCompleted,
        focusMinutes: summary.focusMinutes,
      },
    };
  }

  /**
   * Create shareable content for a completed task
   */
  createTaskShare(taskName: string, shrinkLevel: number = 0): ShareContent {
    const template = SHARE_TEMPLATES.taskCompleted(taskName, shrinkLevel);
    return {
      type: 'task_completed',
      title: template.title,
      message: template.message,
      hashtags: template.hashtags,
    };
  }

  /**
   * Create custom shareable content
   */
  createCustomShare(
    title: string,
    message: string,
    hashtags?: string[]
  ): ShareContent {
    return {
      type: 'custom',
      title,
      message,
      hashtags: hashtags || ['ProcrastinAct'],
    };
  }

  /**
   * Format content for a specific platform
   */
  formatForPlatform(
    content: ShareContent,
    platform: 'twitter' | 'facebook' | 'linkedin' | 'clipboard'
  ): string {
    const hashtags = content.hashtags?.map((t) => `#${t}`).join(' ') || '';

    switch (platform) {
      case 'twitter': {
        // Twitter has 280 char limit
        const twitterMessage = `${content.message}\n\n${hashtags}`;
        return twitterMessage.length > 280
          ? twitterMessage.substring(0, 277) + '...'
          : twitterMessage;
      }

      case 'facebook':
        return `${content.message}\n\n${hashtags}`;

      case 'linkedin':
        return `${content.title}\n\n${content.message}\n\n${hashtags}`;

      case 'clipboard':
      default:
        return `${content.title}\n\n${content.message}\n\n${hashtags}`;
    }
  }

  /**
   * Get share URL for a platform
   */
  getShareUrl(
    content: ShareContent,
    platform: 'twitter' | 'facebook' | 'linkedin'
  ): string {
    const text = encodeURIComponent(this.formatForPlatform(content, platform));
    const url = content.url ? encodeURIComponent(content.url) : '';

    switch (platform) {
      case 'twitter':
        return `https://twitter.com/intent/tweet?text=${text}${url ? `&url=${url}` : ''}`;

      case 'facebook':
        return `https://www.facebook.com/sharer/sharer.php?quote=${text}${url ? `&u=${url}` : ''}`;

      case 'linkedin':
        return `https://www.linkedin.com/sharing/share-offsite/?url=${url || 'https://procrastinact.app'}`;

      default:
        return '';
    }
  }

  /**
   * Record a share
   */
  recordShare(content: ShareContent, platform?: string): void {
    this.shareHistory.push({
      content,
      sharedAt: new Date(),
      platform,
    });
  }

  /**
   * Get share history
   */
  getShareHistory(): Array<{
    content: ShareContent;
    sharedAt: Date;
    platform?: string;
  }> {
    return [...this.shareHistory];
  }

  /**
   * Check if user can share (e.g., rate limiting)
   */
  canShare(): { allowed: boolean; reason?: string } {
    // Could implement rate limiting here
    return { allowed: true };
  }
}

// ============================================================================
// SINGLETON
// ============================================================================

let shareInstance: ShareService | null = null;

export function getShareService(): ShareService {
  if (!shareInstance) {
    shareInstance = new ShareService();
  }
  return shareInstance;
}
