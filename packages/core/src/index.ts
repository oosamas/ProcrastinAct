// Re-export all types from @procrastinact/types (source of truth for shared types)
export * from '@procrastinact/types';

// Export business logic modules
export * from './task';
export * from './timer';

// Encouragement - export all except UserContext (conflicts with queue)
export {
  getRandomMessage,
  getMessage,
  getAllMessages,
  getMessageById,
  getFavorites,
  addFavorite,
  removeFavorite,
  isFavorite,
  getRandomFavorite,
  getSessionMessage,
  resetSession,
  detectContext,
  getTotalMessageCount,
  getMessageCountByContext,
} from './encouragement';
export type { FavoriteMessage } from './encouragement';
// Export UserContext from encouragement with alias to avoid conflict
export type { UserContext as EncouragementUserContext } from './encouragement';

// Queue - export all except isWeekend (also in preferences)
export {
  createQueue,
  getTimeOfDay,
  isWeekend,
  calculatePriorityScore,
  addToQueue,
  removeFromQueue,
  deferCurrentTask,
  getNextTask,
  completeAndGetNext,
  reorderQueue,
  getQueueStats,
  canAddMore,
  getCurrentTask,
  serializeQueue,
  deserializeQueue,
  DEFAULT_QUEUE_CONFIG,
} from './queue';
export type {
  QueuedTask,
  TimeOfDay,
  EnergyLevel,
  UserContext as QueueUserContext,
  QueueConfig,
  TaskQueue,
  SerializedQueue,
} from './queue';

export * from './categories';
export * from './notes';
export * from './errors';
export * from './streaks';

// Preferences - exclude types already in @procrastinact/types
export {
  DEFAULT_PREFERENCES,
  ONBOARDING_QUESTIONS,
  getPreferences,
  savePreferences,
  updatePreferences,
  resetPreferences,
  hasCompletedPreferences,
  completePreferencesOnboarding,
  getCelebrationIntensity,
  shouldShowNotification,
  getEffectiveNotificationSettings,
  getSuggestedDuration,
  checkOptimalFocusTime,
  PREFERENCE_PROFILES,
  applyPreferenceProfile,
  exportPreferences,
  importPreferences,
} from './preferences';
export type {
  FocusTime,
  NotificationStyle,
  UserGoal,
  GamificationLevel,
  ThemePreference,
  TaskDifficulty,
  PreferenceProfile,
} from './preferences';
// Note: UserPreferences, OnboardingQuestion, OnboardingOption come from @procrastinact/types

// Export storage layer
export * from './storage';

// Export AI service layer
export * from './ai';

// Export analytics
export * from './analytics';

// Export feature flags
export * from './feature-flags';

// Notifications - rename DEFAULT_PREFERENCES to avoid conflict
export {
  NotificationService,
  NotificationScheduler,
  applyTemplate,
  getNotificationMessage,
  getTemplatesForType,
  NotificationActions,
  getActionsForNotificationType,
  parseActionId,
  NotificationActionHandler,
  parseVoiceCommand,
  getActionFeedbackMessage,
  getActionCategory,
  LocalNotificationProvider,
  DEFAULT_CHANNELS,
  DEFAULT_PREFERENCES as DEFAULT_NOTIFICATION_PREFERENCES,
} from './notifications';
export type {
  NotificationChannel,
  NotificationChannelConfig,
  NotificationPreferences,
  QuietHoursConfig,
  NotificationFrequency,
  NotificationTonality,
  ScheduledNotification,
  NotificationRepeat,
  PendingNotification,
  NotificationAction,
  NotificationProvider,
  NotificationPermissionStatus,
  NotificationTrigger,
  NotificationServiceConfig,
  NotificationTemplate,
  NotificationTemplateVariant,
  NotificationActionType,
  NotificationActionResult,
  SnoozeDuration,
  VoiceReplyResult,
  NotificationActionHandlers,
  ActionCategory,
} from './notifications';

// Export offline support
export * from './offline';

// Export privacy and trust
export * from './privacy';

// Achievements - exclude types already in @procrastinact/types
export {
  ACHIEVEMENTS,
  getAchievementById,
  getAchievementsByCategory,
  getVisibleAchievements,
  getHiddenAchievements,
  getAchievementsByRarity,
  getCategoryInfo,
  getRarityColor,
  AchievementTracker,
  getAchievementTracker,
} from './achievements';
export type {
  AchievementRarity,
  AchievementCriteria,
  AchievementCriteriaType,
  UnlockedAchievement,
  AchievementProgress,
  AchievementStats,
  AchievementEvent,
} from './achievements';
// Note: Achievement, AchievementCategory come from @procrastinact/types

// Insights - exclude DailyStats (already in @procrastinact/types)
export {
  generateWins,
  generatePatterns,
  generateSuggestions,
  InsightsService,
  getInsightsService,
} from './insights';
export type {
  WeeklyInsights,
  MonthlyInsights,
  PersonalInsight,
  InsightsDashboardData,
} from './insights';
// Note: DailyStats comes from @procrastinact/types

// Export settings
export * from './settings';

// Export social sharing
export * from './social';

// Export backup/export
export * from './export';

// Export app store features
export * from './app-store';
