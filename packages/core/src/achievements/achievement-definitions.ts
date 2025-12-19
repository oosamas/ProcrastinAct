/**
 * Achievement Definitions - Issue #47
 * 30+ achievements across categories, including self-care wins
 * NOTE: No achievements for overwork - we celebrate healthy productivity
 */

// ============================================================================
// TYPES
// ============================================================================

export type AchievementCategory =
  | 'getting_started'
  | 'task_mastery'
  | 'focus'
  | 'self_care'
  | 'consistency'
  | 'exploration'
  | 'social'
  | 'hidden';

export type AchievementRarity =
  | 'common'
  | 'uncommon'
  | 'rare'
  | 'epic'
  | 'legendary';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  icon: string;
  hiddenUntilUnlocked: boolean;
  criteria: AchievementCriteria;
  rewardMessage: string;
  shareText?: string;
}

export interface AchievementCriteria {
  type: AchievementCriteriaType;
  value: number;
  timeframe?: 'day' | 'week' | 'month' | 'all_time';
  condition?: string;
}

export type AchievementCriteriaType =
  | 'tasks_completed'
  | 'tasks_shrunk'
  | 'tasks_stopped'
  | 'timer_sessions'
  | 'focus_minutes'
  | 'streak_days'
  | 'breaks_taken'
  | 'app_opens'
  | 'categories_used'
  | 'notes_added'
  | 'time_of_day'
  | 'custom';

// ============================================================================
// ACHIEVEMENT DEFINITIONS
// ============================================================================

export const ACHIEVEMENTS: Achievement[] = [
  // ============================================================================
  // GETTING STARTED (6 achievements)
  // ============================================================================
  {
    id: 'first_step',
    name: 'First Step',
    description: 'Complete your very first task',
    category: 'getting_started',
    rarity: 'common',
    icon: '👣',
    hiddenUntilUnlocked: false,
    criteria: { type: 'tasks_completed', value: 1 },
    rewardMessage:
      "You did it! The first step is always the hardest. You're on your way!",
    shareText: 'Just completed my first task in ProcrastinAct! 👣',
  },
  {
    id: 'getting_comfortable',
    name: 'Getting Comfortable',
    description: 'Complete 5 tasks',
    category: 'getting_started',
    rarity: 'common',
    icon: '🌱',
    hiddenUntilUnlocked: false,
    criteria: { type: 'tasks_completed', value: 5 },
    rewardMessage: "You're finding your rhythm!",
  },
  {
    id: 'on_a_roll',
    name: 'On a Roll',
    description: 'Complete 10 tasks',
    category: 'getting_started',
    rarity: 'common',
    icon: '🎯',
    hiddenUntilUnlocked: false,
    criteria: { type: 'tasks_completed', value: 10 },
    rewardMessage: 'Double digits! Look at you go!',
  },
  {
    id: 'timer_curious',
    name: 'Timer Curious',
    description: 'Use the focus timer for the first time',
    category: 'getting_started',
    rarity: 'common',
    icon: '⏱️',
    hiddenUntilUnlocked: false,
    criteria: { type: 'timer_sessions', value: 1 },
    rewardMessage: 'Welcome to focused work! You got this.',
  },
  {
    id: 'category_creator',
    name: 'Category Creator',
    description: 'Create and use your first custom category',
    category: 'getting_started',
    rarity: 'common',
    icon: '🏷️',
    hiddenUntilUnlocked: false,
    criteria: { type: 'categories_used', value: 1 },
    rewardMessage: 'Organizing like a pro!',
  },
  {
    id: 'note_taker',
    name: 'Note Taker',
    description: 'Add your first note to a task',
    category: 'getting_started',
    rarity: 'common',
    icon: '📝',
    hiddenUntilUnlocked: false,
    criteria: { type: 'notes_added', value: 1 },
    rewardMessage: 'Great way to capture your thoughts!',
  },

  // ============================================================================
  // TASK MASTERY (8 achievements)
  // ============================================================================
  {
    id: 'tiny_but_mighty',
    name: 'Tiny but Mighty',
    description: 'Shrink tasks 5 times - breaking things down works!',
    category: 'task_mastery',
    rarity: 'uncommon',
    icon: '🔬',
    hiddenUntilUnlocked: false,
    criteria: { type: 'tasks_shrunk', value: 5 },
    rewardMessage:
      "Small steps lead to big progress. You're mastering the art of breaking things down!",
    shareText: 'Breaking down big tasks into tiny wins! 🔬',
  },
  {
    id: 'shrink_master',
    name: 'Shrink Master',
    description: 'Shrink tasks 25 times',
    category: 'task_mastery',
    rarity: 'rare',
    icon: '⚛️',
    hiddenUntilUnlocked: false,
    criteria: { type: 'tasks_shrunk', value: 25 },
    rewardMessage:
      'You really get it - every big task is just small tasks in disguise!',
  },
  {
    id: 'task_crusher',
    name: 'Task Crusher',
    description: 'Complete 50 tasks',
    category: 'task_mastery',
    rarity: 'uncommon',
    icon: '💪',
    hiddenUntilUnlocked: false,
    criteria: { type: 'tasks_completed', value: 50 },
    rewardMessage: 'Fifty tasks down! You are unstoppable!',
  },
  {
    id: 'century_club',
    name: 'Century Club',
    description: 'Complete 100 tasks',
    category: 'task_mastery',
    rarity: 'rare',
    icon: '💯',
    hiddenUntilUnlocked: false,
    criteria: { type: 'tasks_completed', value: 100 },
    rewardMessage: 'ONE HUNDRED TASKS! This is a huge milestone!',
    shareText: 'Just hit 100 completed tasks! 💯',
  },
  {
    id: 'task_legend',
    name: 'Task Legend',
    description: 'Complete 500 tasks',
    category: 'task_mastery',
    rarity: 'epic',
    icon: '🏆',
    hiddenUntilUnlocked: false,
    criteria: { type: 'tasks_completed', value: 500 },
    rewardMessage: 'You are a productivity legend!',
  },
  {
    id: 'daily_champion',
    name: 'Daily Champion',
    description: 'Complete 10 tasks in one day',
    category: 'task_mastery',
    rarity: 'uncommon',
    icon: '🌟',
    hiddenUntilUnlocked: false,
    criteria: { type: 'tasks_completed', value: 10, timeframe: 'day' },
    rewardMessage: 'What a productive day! Remember to rest too!',
  },
  {
    id: 'weekly_warrior',
    name: 'Weekly Warrior',
    description: 'Complete 25 tasks in one week',
    category: 'task_mastery',
    rarity: 'rare',
    icon: '⚔️',
    hiddenUntilUnlocked: false,
    criteria: { type: 'tasks_completed', value: 25, timeframe: 'week' },
    rewardMessage: 'Incredible week! You should be proud!',
  },
  {
    id: 'variety_show',
    name: 'Variety Show',
    description: 'Complete tasks from 5 different categories',
    category: 'task_mastery',
    rarity: 'uncommon',
    icon: '🎨',
    hiddenUntilUnlocked: false,
    criteria: { type: 'categories_used', value: 5 },
    rewardMessage: 'So well-rounded! You handle all kinds of tasks!',
  },

  // ============================================================================
  // FOCUS (6 achievements)
  // ============================================================================
  {
    id: 'focus_apprentice',
    name: 'Focus Apprentice',
    description: 'Complete 10 focus timer sessions',
    category: 'focus',
    rarity: 'uncommon',
    icon: '🎓',
    hiddenUntilUnlocked: false,
    criteria: { type: 'timer_sessions', value: 10 },
    rewardMessage: "You're building focus as a superpower!",
  },
  {
    id: 'time_lord',
    name: 'Time Lord',
    description: 'Complete 50 focus timer sessions',
    category: 'focus',
    rarity: 'rare',
    icon: '⏰',
    hiddenUntilUnlocked: false,
    criteria: { type: 'timer_sessions', value: 50 },
    rewardMessage: 'You have truly mastered the art of focused time!',
    shareText: "50 focus sessions complete - I'm a Time Lord! ⏰",
  },
  {
    id: 'hour_hero',
    name: 'Hour Hero',
    description: 'Accumulate 60 minutes of focused time',
    category: 'focus',
    rarity: 'uncommon',
    icon: '⌛',
    hiddenUntilUnlocked: false,
    criteria: { type: 'focus_minutes', value: 60 },
    rewardMessage: 'One whole hour of focus! Amazing!',
  },
  {
    id: 'focus_marathon',
    name: 'Focus Marathon',
    description: 'Accumulate 10 hours of focused time',
    category: 'focus',
    rarity: 'rare',
    icon: '🏃',
    hiddenUntilUnlocked: false,
    criteria: { type: 'focus_minutes', value: 600 },
    rewardMessage: "Ten hours of focused work! That's incredible dedication!",
  },
  {
    id: 'focus_olympian',
    name: 'Focus Olympian',
    description: 'Accumulate 50 hours of focused time',
    category: 'focus',
    rarity: 'epic',
    icon: '🥇',
    hiddenUntilUnlocked: false,
    criteria: { type: 'focus_minutes', value: 3000 },
    rewardMessage: 'FIFTY HOURS! You have Olympic-level focus!',
  },
  {
    id: 'steady_pace',
    name: 'Steady Pace',
    description: 'Use the timer at least once for 5 days in a row',
    category: 'focus',
    rarity: 'uncommon',
    icon: '🐢',
    hiddenUntilUnlocked: false,
    criteria: {
      type: 'timer_sessions',
      value: 5,
      timeframe: 'day',
      condition: 'consecutive',
    },
    rewardMessage: 'Consistency is key, and you have it!',
  },

  // ============================================================================
  // SELF CARE (6 achievements) - These celebrate healthy habits!
  // ============================================================================
  {
    id: 'permission_granted',
    name: 'Permission Granted',
    description:
      'Stop a task guilt-free 10 times - knowing when to stop is wisdom!',
    category: 'self_care',
    rarity: 'uncommon',
    icon: '✋',
    hiddenUntilUnlocked: false,
    criteria: { type: 'tasks_stopped', value: 10 },
    rewardMessage:
      "You understand that rest is part of productivity. That's wisdom!",
    shareText: 'Learning to say "not today" without guilt! ✋',
  },
  {
    id: 'rest_champion',
    name: 'Rest Champion',
    description: 'Take breaks 5 days in a row',
    category: 'self_care',
    rarity: 'rare',
    icon: '🛋️',
    hiddenUntilUnlocked: false,
    criteria: { type: 'breaks_taken', value: 5, condition: 'consecutive' },
    rewardMessage: 'Rest is productive! You get it!',
    shareText: 'Taking care of myself with regular breaks! 🛋️',
  },
  {
    id: 'self_compassion',
    name: 'Self Compassion',
    description: 'Stop tasks 25 times - never push through burnout',
    category: 'self_care',
    rarity: 'rare',
    icon: '💝',
    hiddenUntilUnlocked: false,
    criteria: { type: 'tasks_stopped', value: 25 },
    rewardMessage: "Self-compassion is a superpower. You're using it well!",
  },
  {
    id: 'break_believer',
    name: 'Break Believer',
    description: 'Take 50 breaks',
    category: 'self_care',
    rarity: 'rare',
    icon: '☕',
    hiddenUntilUnlocked: false,
    criteria: { type: 'breaks_taken', value: 50 },
    rewardMessage: 'Fifty breaks! Your brain thanks you!',
  },
  {
    id: 'boundaries_badge',
    name: 'Boundaries Badge',
    description: 'Set quiet hours and keep them 7 days',
    category: 'self_care',
    rarity: 'uncommon',
    icon: '🌙',
    hiddenUntilUnlocked: false,
    criteria: { type: 'custom', value: 7, condition: 'quiet_hours_respected' },
    rewardMessage: 'Healthy boundaries make for a healthy mind!',
  },
  {
    id: 'weekend_warrior_rest',
    name: 'Weekend Relaxer',
    description: 'Take a full weekend off (no tasks completed)',
    category: 'self_care',
    rarity: 'rare',
    icon: '🏖️',
    hiddenUntilUnlocked: true,
    criteria: { type: 'custom', value: 1, condition: 'weekend_rest' },
    rewardMessage: "Taking weekends off? That's healthy! Enjoy your rest!",
  },

  // ============================================================================
  // CONSISTENCY (5 achievements)
  // ============================================================================
  {
    id: 'three_day_streak',
    name: 'Momentum',
    description: 'Maintain a 3-day streak',
    category: 'consistency',
    rarity: 'common',
    icon: '🔥',
    hiddenUntilUnlocked: false,
    criteria: { type: 'streak_days', value: 3 },
    rewardMessage: "Three days in a row! You're building momentum!",
  },
  {
    id: 'week_streak',
    name: 'Full Week',
    description: 'Maintain a 7-day streak',
    category: 'consistency',
    rarity: 'uncommon',
    icon: '📅',
    hiddenUntilUnlocked: false,
    criteria: { type: 'streak_days', value: 7 },
    rewardMessage: 'A whole week! Incredible consistency!',
    shareText: 'Just hit a 7-day streak! 📅🔥',
  },
  {
    id: 'two_week_streak',
    name: 'Fortnight Focus',
    description: 'Maintain a 14-day streak',
    category: 'consistency',
    rarity: 'rare',
    icon: '🌟',
    hiddenUntilUnlocked: false,
    criteria: { type: 'streak_days', value: 14 },
    rewardMessage: 'Two weeks of showing up! You are amazing!',
  },
  {
    id: 'month_streak',
    name: 'Monthly Master',
    description: 'Maintain a 30-day streak',
    category: 'consistency',
    rarity: 'epic',
    icon: '🏅',
    hiddenUntilUnlocked: false,
    criteria: { type: 'streak_days', value: 30 },
    rewardMessage: 'THIRTY DAYS! You have true dedication!',
    shareText: "30-day streak! I'm on fire! 🏅🔥",
  },
  {
    id: 'quarterly_champion',
    name: 'Quarterly Champion',
    description: 'Maintain a 90-day streak',
    category: 'consistency',
    rarity: 'legendary',
    icon: '👑',
    hiddenUntilUnlocked: false,
    criteria: { type: 'streak_days', value: 90 },
    rewardMessage: 'NINETY DAYS! You are absolutely legendary!',
    shareText: 'Just hit a 90-day streak! 👑',
  },

  // ============================================================================
  // EXPLORATION (3 achievements)
  // ============================================================================
  {
    id: 'curious_explorer',
    name: 'Curious Explorer',
    description: 'Open the app 30 times',
    category: 'exploration',
    rarity: 'common',
    icon: '🔍',
    hiddenUntilUnlocked: false,
    criteria: { type: 'app_opens', value: 30 },
    rewardMessage: "You're really getting to know the app!",
  },
  {
    id: 'power_user',
    name: 'Power User',
    description: 'Open the app 100 times',
    category: 'exploration',
    rarity: 'uncommon',
    icon: '⚡',
    hiddenUntilUnlocked: false,
    criteria: { type: 'app_opens', value: 100 },
    rewardMessage: "You're a true power user!",
  },
  {
    id: 'devoted',
    name: 'Devoted',
    description: 'Open the app 365 times',
    category: 'exploration',
    rarity: 'rare',
    icon: '💎',
    hiddenUntilUnlocked: false,
    criteria: { type: 'app_opens', value: 365 },
    rewardMessage: "A year's worth of check-ins! Thank you for being here!",
  },

  // ============================================================================
  // HIDDEN (6 achievements) - Fun surprises!
  // ============================================================================
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Complete a task before 6 AM',
    category: 'hidden',
    rarity: 'rare',
    icon: '🐦',
    hiddenUntilUnlocked: true,
    criteria: { type: 'time_of_day', value: 6, condition: 'before' },
    rewardMessage: "Up and productive before dawn? You're an early bird!",
    shareText: 'I completed a task before 6 AM! 🐦',
  },
  {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Complete a task after midnight',
    category: 'hidden',
    rarity: 'rare',
    icon: '🦉',
    hiddenUntilUnlocked: true,
    criteria: { type: 'time_of_day', value: 0, condition: 'after_midnight' },
    rewardMessage: "Burning the midnight oil? You're a night owl!",
    shareText: 'Getting things done after midnight! 🦉',
  },
  {
    id: 'perfectionist_recovery',
    name: 'Perfectionist Recovery',
    description: 'Shrink a task 3 times in a row',
    category: 'hidden',
    rarity: 'uncommon',
    icon: '🎭',
    hiddenUntilUnlocked: true,
    criteria: { type: 'custom', value: 3, condition: 'consecutive_shrinks' },
    rewardMessage:
      'Breaking free from perfectionism! Done is better than perfect!',
  },
  {
    id: 'bounce_back',
    name: 'Bounce Back',
    description: 'Complete a task after stopping one',
    category: 'hidden',
    rarity: 'uncommon',
    icon: '🔄',
    hiddenUntilUnlocked: true,
    criteria: { type: 'custom', value: 1, condition: 'complete_after_stop' },
    rewardMessage:
      'Sometimes we need to stop before we can go. Great comeback!',
  },
  {
    id: 'comeback_kid',
    name: 'Comeback Kid',
    description: 'Return to the app after 7+ days away',
    category: 'hidden',
    rarity: 'rare',
    icon: '🦸',
    hiddenUntilUnlocked: true,
    criteria: { type: 'custom', value: 7, condition: 'days_away_return' },
    rewardMessage: "Welcome back! We're so glad you're here!",
    shareText: 'Back after a break and feeling good! 🦸',
  },
  {
    id: 'secret_supporter',
    name: 'Secret Supporter',
    description: 'Make a donation to support the app',
    category: 'hidden',
    rarity: 'legendary',
    icon: '❤️',
    hiddenUntilUnlocked: true,
    criteria: { type: 'custom', value: 1, condition: 'donated' },
    rewardMessage:
      'Thank you for supporting ProcrastinAct! You help us stay ad-free!',
    shareText: 'Proud supporter of ProcrastinAct! ❤️',
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get all achievements in a category
 */
export function getAchievementsByCategory(
  category: AchievementCategory
): Achievement[] {
  return ACHIEVEMENTS.filter((a) => a.category === category);
}

/**
 * Get all visible (non-hidden) achievements
 */
export function getVisibleAchievements(): Achievement[] {
  return ACHIEVEMENTS.filter((a) => !a.hiddenUntilUnlocked);
}

/**
 * Get all hidden achievements
 */
export function getHiddenAchievements(): Achievement[] {
  return ACHIEVEMENTS.filter((a) => a.hiddenUntilUnlocked);
}

/**
 * Get achievement by ID
 */
export function getAchievementById(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}

/**
 * Get achievements by rarity
 */
export function getAchievementsByRarity(
  rarity: AchievementRarity
): Achievement[] {
  return ACHIEVEMENTS.filter((a) => a.rarity === rarity);
}

/**
 * Get category display info
 */
export function getCategoryInfo(category: AchievementCategory): {
  name: string;
  emoji: string;
  description: string;
} {
  const categoryInfo: Record<
    AchievementCategory,
    { name: string; emoji: string; description: string }
  > = {
    getting_started: {
      name: 'Getting Started',
      emoji: '🚀',
      description: 'Your first steps on this journey',
    },
    task_mastery: {
      name: 'Task Mastery',
      emoji: '✅',
      description: 'Becoming a task-completing machine',
    },
    focus: {
      name: 'Focus',
      emoji: '🎯',
      description: 'Building your focus superpower',
    },
    self_care: {
      name: 'Self Care',
      emoji: '💝',
      description: 'Taking care of yourself matters',
    },
    consistency: {
      name: 'Consistency',
      emoji: '🔥',
      description: 'Showing up day after day',
    },
    exploration: {
      name: 'Exploration',
      emoji: '🔍',
      description: 'Discovering all the app has to offer',
    },
    social: {
      name: 'Social',
      emoji: '🤝',
      description: 'Connecting with others',
    },
    hidden: {
      name: 'Hidden',
      emoji: '🎁',
      description: 'Special surprises to discover',
    },
  };

  return categoryInfo[category];
}

/**
 * Get rarity color
 */
export function getRarityColor(rarity: AchievementRarity): string {
  const colors: Record<AchievementRarity, string> = {
    common: '#9CA3AF', // gray
    uncommon: '#10B981', // green
    rare: '#3B82F6', // blue
    epic: '#8B5CF6', // purple
    legendary: '#F59E0B', // gold
  };
  return colors[rarity];
}
