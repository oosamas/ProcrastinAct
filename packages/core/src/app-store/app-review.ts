/**
 * App Review Service - Sprint 7
 * Smart prompts for app store reviews
 * Non-intrusive, respects user experience
 */

// ============================================================================
// TYPES
// ============================================================================

export interface ReviewPromptConditions {
  minTasksCompleted: number;
  minDaysActive: number;
  minAppOpens: number;
  hasCompletedStreak: boolean;
  hasUnlockedAchievement: boolean;
  daysSinceLastPrompt: number;
  maxPromptsPerVersion: number;
}

export interface ReviewState {
  hasRated: boolean;
  lastPromptDate: Date | null;
  promptCount: number;
  dismissedForever: boolean;
  version: string;
  positiveInteractions: number;
}

export interface ReviewPromptResult {
  shouldShow: boolean;
  reason?: string;
}

// ============================================================================
// DEFAULT CONDITIONS
// ============================================================================

export const DEFAULT_REVIEW_CONDITIONS: ReviewPromptConditions = {
  minTasksCompleted: 10,
  minDaysActive: 3,
  minAppOpens: 5,
  hasCompletedStreak: true,
  hasUnlockedAchievement: false,
  daysSinceLastPrompt: 30,
  maxPromptsPerVersion: 2,
};

export const DEFAULT_REVIEW_STATE: ReviewState = {
  hasRated: false,
  lastPromptDate: null,
  promptCount: 0,
  dismissedForever: false,
  version: '1.0.0',
  positiveInteractions: 0,
};

// ============================================================================
// POSITIVE INTERACTION EVENTS
// ============================================================================

export type PositiveInteractionEvent =
  | 'task_completed'
  | 'achievement_unlocked'
  | 'streak_milestone'
  | 'timer_completed'
  | 'shared_progress'
  | 'first_task_today';

const INTERACTION_WEIGHTS: Record<PositiveInteractionEvent, number> = {
  task_completed: 1,
  achievement_unlocked: 5,
  streak_milestone: 3,
  timer_completed: 2,
  shared_progress: 3,
  first_task_today: 2,
};

// ============================================================================
// REVIEW SERVICE
// ============================================================================

const STORAGE_KEY = 'procrastinact_review_state';

export class AppReviewService {
  private state: ReviewState;
  private conditions: ReviewPromptConditions;
  private storageAdapter: {
    get: (key: string) => Promise<string | null>;
    set: (key: string, value: string) => Promise<void>;
  } | null = null;

  constructor(conditions: ReviewPromptConditions = DEFAULT_REVIEW_CONDITIONS) {
    this.state = { ...DEFAULT_REVIEW_STATE };
    this.conditions = conditions;
  }

  /**
   * Initialize with storage
   */
  async initialize(
    storageAdapter?: {
      get: (key: string) => Promise<string | null>;
      set: (key: string, value: string) => Promise<void>;
    },
    currentVersion?: string
  ): Promise<void> {
    this.storageAdapter = storageAdapter || null;
    await this.load();

    // Reset prompt count if version changed
    if (currentVersion && this.state.version !== currentVersion) {
      this.state.version = currentVersion;
      this.state.promptCount = 0;
      await this.save();
    }
  }

  /**
   * Record a positive interaction
   */
  async recordInteraction(event: PositiveInteractionEvent): Promise<void> {
    const weight = INTERACTION_WEIGHTS[event];
    this.state.positiveInteractions += weight;
    await this.save();
  }

  /**
   * Check if we should show a review prompt
   */
  shouldShowReviewPrompt(userStats: {
    tasksCompleted: number;
    daysActive: number;
    appOpens: number;
    hasStreak: boolean;
    hasAchievement: boolean;
  }): ReviewPromptResult {
    // Never show if already rated or dismissed forever
    if (this.state.hasRated) {
      return { shouldShow: false, reason: 'User has already rated' };
    }

    if (this.state.dismissedForever) {
      return { shouldShow: false, reason: 'User dismissed forever' };
    }

    // Check max prompts per version
    if (this.state.promptCount >= this.conditions.maxPromptsPerVersion) {
      return {
        shouldShow: false,
        reason: 'Max prompts reached for this version',
      };
    }

    // Check days since last prompt
    if (this.state.lastPromptDate) {
      const daysSince = Math.floor(
        (Date.now() - new Date(this.state.lastPromptDate).getTime()) /
          (1000 * 60 * 60 * 24)
      );
      if (daysSince < this.conditions.daysSinceLastPrompt) {
        return { shouldShow: false, reason: 'Too soon since last prompt' };
      }
    }

    // Check user engagement metrics
    if (userStats.tasksCompleted < this.conditions.minTasksCompleted) {
      return { shouldShow: false, reason: 'Not enough tasks completed' };
    }

    if (userStats.daysActive < this.conditions.minDaysActive) {
      return { shouldShow: false, reason: 'Not enough days active' };
    }

    if (userStats.appOpens < this.conditions.minAppOpens) {
      return { shouldShow: false, reason: 'Not enough app opens' };
    }

    // Check for positive engagement
    if (this.conditions.hasCompletedStreak && !userStats.hasStreak) {
      return { shouldShow: false, reason: 'Has not completed a streak yet' };
    }

    // All conditions met!
    return { shouldShow: true };
  }

  /**
   * Record that a prompt was shown
   */
  async recordPromptShown(): Promise<void> {
    this.state.lastPromptDate = new Date();
    this.state.promptCount++;
    await this.save();
  }

  /**
   * User rated the app
   */
  async recordRated(): Promise<void> {
    this.state.hasRated = true;
    await this.save();
  }

  /**
   * User dismissed prompt
   */
  async recordDismissed(forever: boolean = false): Promise<void> {
    if (forever) {
      this.state.dismissedForever = true;
    }
    await this.save();
  }

  /**
   * Get current state
   */
  getState(): ReviewState {
    return { ...this.state };
  }

  /**
   * Reset state (for testing)
   */
  async reset(): Promise<void> {
    this.state = { ...DEFAULT_REVIEW_STATE };
    await this.save();
  }

  // Private methods

  private async load(): Promise<void> {
    if (!this.storageAdapter) return;

    try {
      const stored = await this.storageAdapter.get(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.state = {
          ...DEFAULT_REVIEW_STATE,
          ...parsed,
          lastPromptDate: parsed.lastPromptDate
            ? new Date(parsed.lastPromptDate)
            : null,
        };
      }
    } catch {
      // Use defaults
    }
  }

  private async save(): Promise<void> {
    if (!this.storageAdapter) return;

    try {
      await this.storageAdapter.set(STORAGE_KEY, JSON.stringify(this.state));
    } catch {
      // Ignore
    }
  }
}

// ============================================================================
// SINGLETON
// ============================================================================

let reviewInstance: AppReviewService | null = null;

export function getAppReviewService(): AppReviewService {
  if (!reviewInstance) {
    reviewInstance = new AppReviewService();
  }
  return reviewInstance;
}

// ============================================================================
// REVIEW PROMPT MESSAGES
// ============================================================================

export interface ReviewPromptContent {
  title: string;
  message: string;
  positiveButton: string;
  negativeButton: string;
  laterButton: string;
}

export const REVIEW_PROMPT_VARIANTS: ReviewPromptContent[] = [
  {
    title: 'Enjoying ProcrastinAct?',
    message:
      "If you're finding the app helpful, would you mind leaving a review? It helps others discover the app!",
    positiveButton: 'Rate Now',
    negativeButton: 'No Thanks',
    laterButton: 'Maybe Later',
  },
  {
    title: "You're doing great!",
    message:
      'Your productivity has been impressive! Would you share your experience with others by leaving a review?',
    positiveButton: 'Leave Review',
    negativeButton: 'Not Now',
    laterButton: 'Remind Me Later',
  },
  {
    title: 'A moment of your time?',
    message:
      "We'd love to hear your thoughts! A quick review helps us improve and helps others find the app.",
    positiveButton: 'Sure!',
    negativeButton: 'No Thanks',
    laterButton: 'Later',
  },
];

export function getReviewPromptContent(
  variant: number = 0
): ReviewPromptContent {
  return REVIEW_PROMPT_VARIANTS[variant % REVIEW_PROMPT_VARIANTS.length]!;
}
