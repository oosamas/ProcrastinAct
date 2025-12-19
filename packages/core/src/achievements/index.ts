export {
  ACHIEVEMENTS,
  getAchievementById,
  getAchievementsByCategory,
  getVisibleAchievements,
  getHiddenAchievements,
  getAchievementsByRarity,
  getCategoryInfo,
  getRarityColor,
} from './achievement-definitions';

export type {
  Achievement,
  AchievementCategory,
  AchievementRarity,
  AchievementCriteria,
  AchievementCriteriaType,
} from './achievement-definitions';

export {
  AchievementTracker,
  getAchievementTracker,
} from './achievement-tracker';

export type {
  UnlockedAchievement,
  AchievementProgress,
  AchievementStats,
  AchievementEvent,
} from './achievement-tracker';
