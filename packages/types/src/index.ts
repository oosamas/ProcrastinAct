// Task Types
export interface Task {
  id: string;
  title: string;
  description?: string;
  category?: TaskCategory;
  status: TaskStatus;
  priority: number;
  shrinkLevel: number;
  parentTaskId?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'stopped';

export interface TaskCategory {
  id: string;
  name: string;
  color: string;
  emoji?: string;
}

// Timer Types
export interface TimerState {
  isRunning: boolean;
  duration: number; // in seconds
  remaining: number; // in seconds
  startedAt?: Date;
  taskId?: string;
}

export type TimerPreset = 5 | 15 | 25 | 45;

// User Types
export interface User {
  id: string;
  email?: string;
  displayName?: string;
  preferences: UserPreferences;
  createdAt: Date;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  hapticIntensity: 'off' | 'light' | 'normal' | 'strong';
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  quietHoursStart?: string; // HH:mm format
  quietHoursEnd?: string;
  preferredFocusTime: 'morning' | 'afternoon' | 'evening' | 'varies';
  gamificationLevel: 'full' | 'minimal' | 'none';
}

// Streak Types
export interface Streak {
  currentStreak: number;
  longestStreak: number;
  freezesAvailable: number;
  lastActiveDate: Date;
}

// Achievement Types
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
  category: AchievementCategory;
}

export type AchievementCategory =
  | 'tasks'
  | 'timer'
  | 'streaks'
  | 'self-care'
  | 'social'
  | 'hidden';

// Sync Types
export interface SyncState {
  lastSyncedAt?: Date;
  pendingChanges: number;
  isOnline: boolean;
  isSyncing: boolean;
}

// Encouragement Types
export interface EncouragementMessage {
  id: string;
  text: string;
  context: EncouragementContext;
}

export type EncouragementContext =
  | 'starting'
  | 'struggling'
  | 'completing'
  | 'stopping'
  | 'returning'
  | 'low_energy'
  | 'high_achievement';

// Focus Session Types
export interface FocusSession {
  id: string;
  taskId?: string;
  startedAt: Date;
  endedAt?: Date;
  plannedDuration: number; // in seconds
  actualDuration: number; // in seconds
  wasCompleted: boolean;
  interruptions: number;
  notes?: string;
}

export interface DailyStats {
  date: string; // YYYY-MM-DD format
  tasksCompleted: number;
  tasksStarted: number;
  focusTime: number; // in seconds
  sessionsCompleted: number;
  longestSession: number; // in seconds
  shrinkUsages: number;
  stopUsages: number;
}

// Notification Types
export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  createdAt: Date;
  readAt?: Date;
  scheduledFor?: Date;
}

export type NotificationType =
  | 'reminder'
  | 'encouragement'
  | 'achievement'
  | 'streak'
  | 'time_awareness'
  | 'gentle_nudge';

// Task Shrink Suggestion Types
export interface ShrinkSuggestion {
  originalTask: string;
  suggestions: string[];
  shrinkLevel: number;
}

// Ambient Time Visualization Types
export interface TimeVisualization {
  type: 'ambient' | 'traditional' | 'minimal';
  showProgress: boolean;
  showTimeRemaining: boolean;
  useColors: boolean;
  colorScheme: 'warm' | 'cool' | 'neutral';
}

// Body Doubling Types
export interface BodyDoublingSession {
  id: string;
  hostUserId: string;
  participantIds: string[];
  startedAt: Date;
  endedAt?: Date;
  maxParticipants: number;
  isPublic: boolean;
  focusType: string;
}

// Donation Types
export interface DonationOption {
  id: string;
  name: string;
  amount: number;
  currency: string;
  isRecurring: boolean;
  charityId?: string;
}

export interface Charity {
  id: string;
  name: string;
  description: string;
  category: CharityCategory;
  website: string;
  logo?: string;
}

export type CharityCategory =
  | 'mental_health'
  | 'adhd_research'
  | 'neurodiversity'
  | 'education'
  | 'general';

// Onboarding Types
export interface OnboardingState {
  completedSteps: string[];
  currentStep: string;
  skippedSteps: string[];
  startedAt: Date;
  completedAt?: Date;
}

export interface OnboardingQuestion {
  id: string;
  question: string;
  options: OnboardingOption[];
  multiSelect: boolean;
  category: 'adhd_traits' | 'time_management' | 'motivation' | 'environment';
}

export interface OnboardingOption {
  id: string;
  label: string;
  value: string;
  description?: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: {
    pagination?: Pagination;
    timestamp: string;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface Pagination {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

// Event Types for Analytics
export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, unknown>;
  timestamp: Date;
  sessionId: string;
  userId?: string;
}

export type AnalyticsEventName =
  | 'task_created'
  | 'task_completed'
  | 'task_shrunk'
  | 'task_stopped'
  | 'timer_started'
  | 'timer_completed'
  | 'timer_paused'
  | 'session_started'
  | 'session_ended'
  | 'achievement_unlocked'
  | 'streak_milestone'
  | 'onboarding_step'
  | 'app_opened'
  | 'app_backgrounded';
