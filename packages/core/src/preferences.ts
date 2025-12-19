/**
 * User Preferences System
 *
 * Collects and manages user preferences to personalize the app experience.
 * Preferences can be gathered during onboarding or modified later in settings.
 */

// ============================================================================
// TYPES
// ============================================================================

export type FocusTime = 'morning' | 'afternoon' | 'evening' | 'varies';
export type NotificationStyle = 'gentle' | 'firm' | 'minimal';
export type UserGoal = 'work' | 'school' | 'personal' | 'all';
export type GamificationLevel = 'full' | 'minimal' | 'none';
export type ThemePreference = 'light' | 'dark' | 'system';
export type TaskDifficulty = 'easy' | 'medium' | 'challenging';

export interface UserPreferences {
  // Onboarding preferences
  focusTime: FocusTime;
  notificationStyle: NotificationStyle;
  primaryGoal: UserGoal;
  gamificationLevel: GamificationLevel;

  // Visual preferences
  theme: ThemePreference;
  reducedMotion: boolean;
  highContrast: boolean;
  fontSize: 'normal' | 'large' | 'extra-large';

  // Task preferences
  defaultTaskDuration: number; // minutes
  defaultDifficulty: TaskDifficulty;
  autoShrinkSuggestions: boolean;
  showTimerByDefault: boolean;

  // Notification preferences
  notificationsEnabled: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string; // HH:mm
  quietHoursEnd: string; // HH:mm
  weekendSettings: 'same' | 'different' | 'off';

  // Wellness preferences
  dailyTaskLimit: number | null;
  breakReminders: boolean;
  breakInterval: number; // minutes
  celebrationIntensity: 'subtle' | 'normal' | 'enthusiastic';

  // Privacy preferences
  analyticsEnabled: boolean;
  crashReportingEnabled: boolean;

  // Meta
  onboardingCompleted: boolean;
  preferencesVersion: number;
  lastUpdated: string;
}

// ============================================================================
// DEFAULT PREFERENCES
// ============================================================================

export const DEFAULT_PREFERENCES: UserPreferences = {
  // Onboarding
  focusTime: 'varies',
  notificationStyle: 'gentle',
  primaryGoal: 'all',
  gamificationLevel: 'full',

  // Visual
  theme: 'system',
  reducedMotion: false,
  highContrast: false,
  fontSize: 'normal',

  // Tasks
  defaultTaskDuration: 25,
  defaultDifficulty: 'medium',
  autoShrinkSuggestions: true,
  showTimerByDefault: true,

  // Notifications
  notificationsEnabled: true,
  quietHoursEnabled: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '08:00',
  weekendSettings: 'same',

  // Wellness
  dailyTaskLimit: null,
  breakReminders: true,
  breakInterval: 25,
  celebrationIntensity: 'normal',

  // Privacy
  analyticsEnabled: true,
  crashReportingEnabled: true,

  // Meta
  onboardingCompleted: false,
  preferencesVersion: 1,
  lastUpdated: new Date().toISOString(),
};

// ============================================================================
// ONBOARDING QUESTIONS
// ============================================================================

export interface OnboardingQuestion {
  id: string;
  question: string;
  description?: string;
  type: 'single' | 'multi' | 'slider';
  options: OnboardingOption[];
  preferenceKey: keyof UserPreferences;
  skippable: boolean;
}

export interface OnboardingOption {
  value: string | number | boolean;
  label: string;
  description?: string;
  emoji?: string;
}

export const ONBOARDING_QUESTIONS: OnboardingQuestion[] = [
  {
    id: 'focus-time',
    question: 'When are you usually most focused?',
    description: "We'll suggest tasks during your peak focus times.",
    type: 'single',
    preferenceKey: 'focusTime',
    skippable: true,
    options: [
      {
        value: 'morning',
        label: 'Morning Person',
        description: 'I do my best work before noon',
        emoji: '🌅',
      },
      {
        value: 'afternoon',
        label: 'Afternoon',
        description: 'I hit my stride after lunch',
        emoji: '☀️',
      },
      {
        value: 'evening',
        label: 'Night Owl',
        description: 'I come alive after sunset',
        emoji: '🌙',
      },
      {
        value: 'varies',
        label: 'It Varies',
        description: 'Depends on the day',
        emoji: '🔄',
      },
    ],
  },
  {
    id: 'notification-style',
    question: 'How would you like to be reminded?',
    description: 'We can be gentle or give you a firm nudge.',
    type: 'single',
    preferenceKey: 'notificationStyle',
    skippable: true,
    options: [
      {
        value: 'gentle',
        label: 'Gentle',
        description: 'Soft reminders, no pressure',
        emoji: '🌸',
      },
      {
        value: 'firm',
        label: 'Firm',
        description: 'Keep me accountable',
        emoji: '💪',
      },
      {
        value: 'minimal',
        label: 'Minimal',
        description: 'Only when absolutely necessary',
        emoji: '🤫',
      },
    ],
  },
  {
    id: 'primary-goal',
    question: 'What brings you here?',
    description: "We'll tailor suggestions to your main use case.",
    type: 'single',
    preferenceKey: 'primaryGoal',
    skippable: true,
    options: [
      {
        value: 'work',
        label: 'Work',
        description: 'Professional tasks and projects',
        emoji: '💼',
      },
      {
        value: 'school',
        label: 'School',
        description: 'Academic assignments and studying',
        emoji: '📚',
      },
      {
        value: 'personal',
        label: 'Personal',
        description: 'Life stuff and self-improvement',
        emoji: '🏠',
      },
      {
        value: 'all',
        label: 'Everything',
        description: 'A mix of all the above',
        emoji: '🌈',
      },
    ],
  },
  {
    id: 'gamification',
    question: 'How do you feel about gamification?',
    description: 'Streaks, achievements, and celebrations.',
    type: 'single',
    preferenceKey: 'gamificationLevel',
    skippable: true,
    options: [
      {
        value: 'full',
        label: 'Love it!',
        description: 'Bring on the confetti!',
        emoji: '🎉',
      },
      {
        value: 'minimal',
        label: 'Just a little',
        description: 'Simple progress tracking',
        emoji: '📊',
      },
      {
        value: 'none',
        label: 'Not for me',
        description: 'Keep it clean and simple',
        emoji: '🧘',
      },
    ],
  },
];

// ============================================================================
// PREFERENCE STORAGE
// ============================================================================

const PREFERENCES_KEY = 'procrastinact-preferences';

/**
 * Get user preferences from storage
 */
export function getPreferences(): UserPreferences {
  if (typeof window === 'undefined') {
    return DEFAULT_PREFERENCES;
  }

  try {
    const stored = localStorage.getItem(PREFERENCES_KEY);
    if (!stored) return DEFAULT_PREFERENCES;

    const parsed = JSON.parse(stored) as Partial<UserPreferences>;

    // Merge with defaults to handle new preference keys
    return {
      ...DEFAULT_PREFERENCES,
      ...parsed,
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

/**
 * Save user preferences to storage
 */
export function savePreferences(preferences: UserPreferences): void {
  if (typeof window === 'undefined') return;

  try {
    const updated: UserPreferences = {
      ...preferences,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(updated));
  } catch {
    // Storage might be full
  }
}

/**
 * Update specific preferences
 */
export function updatePreferences(
  updates: Partial<UserPreferences>
): UserPreferences {
  const current = getPreferences();
  const updated = { ...current, ...updates };
  savePreferences(updated);
  return updated;
}

/**
 * Reset preferences to defaults
 */
export function resetPreferences(): UserPreferences {
  savePreferences(DEFAULT_PREFERENCES);
  return DEFAULT_PREFERENCES;
}

// ============================================================================
// PREFERENCE HELPERS
// ============================================================================

/**
 * Check if user has completed onboarding preferences
 */
export function hasCompletedPreferences(): boolean {
  return getPreferences().onboardingCompleted;
}

/**
 * Mark onboarding preferences as complete
 */
export function completePreferencesOnboarding(): void {
  updatePreferences({ onboardingCompleted: true });
}

/**
 * Get celebration intensity based on gamification level
 */
export function getCelebrationIntensity(
  prefs: UserPreferences
): 'subtle' | 'normal' | 'epic' {
  switch (prefs.gamificationLevel) {
    case 'full':
      return prefs.celebrationIntensity === 'enthusiastic' ? 'epic' : 'normal';
    case 'minimal':
      return 'subtle';
    case 'none':
      return 'subtle';
  }
}

/**
 * Check if notifications should be shown based on quiet hours
 */
export function shouldShowNotification(prefs: UserPreferences): boolean {
  if (!prefs.notificationsEnabled) return false;
  if (!prefs.quietHoursEnabled) return true;

  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  const { quietHoursStart, quietHoursEnd } = prefs;

  // Handle overnight quiet hours (e.g., 22:00 - 08:00)
  if (quietHoursStart > quietHoursEnd) {
    // Quiet if time is after start OR before end
    return !(currentTime >= quietHoursStart || currentTime < quietHoursEnd);
  }

  // Normal hours (e.g., 13:00 - 15:00)
  return !(currentTime >= quietHoursStart && currentTime < quietHoursEnd);
}

/**
 * Check if it's a weekend
 */
export function isWeekend(): boolean {
  const day = new Date().getDay();
  return day === 0 || day === 6;
}

/**
 * Apply weekend-specific settings
 */
export function getEffectiveNotificationSettings(
  prefs: UserPreferences
): Pick<UserPreferences, 'notificationsEnabled' | 'quietHoursEnabled'> {
  if (isWeekend() && prefs.weekendSettings === 'off') {
    return {
      notificationsEnabled: false,
      quietHoursEnabled: false,
    };
  }

  return {
    notificationsEnabled: prefs.notificationsEnabled,
    quietHoursEnabled: prefs.quietHoursEnabled,
  };
}

/**
 * Get suggested task duration based on focus time
 */
export function getSuggestedDuration(
  prefs: UserPreferences,
  currentHour: number = new Date().getHours()
): number {
  const isOptimalTime = checkOptimalFocusTime(prefs.focusTime, currentHour);

  if (isOptimalTime) {
    // Suggest longer durations during peak focus
    return Math.min(prefs.defaultTaskDuration + 10, 45);
  }

  // Shorter during non-peak
  return Math.max(prefs.defaultTaskDuration - 5, 10);
}

/**
 * Check if current time matches user's focus preference
 */
export function checkOptimalFocusTime(
  focusTime: FocusTime,
  hour: number = new Date().getHours()
): boolean {
  switch (focusTime) {
    case 'morning':
      return hour >= 6 && hour < 12;
    case 'afternoon':
      return hour >= 12 && hour < 17;
    case 'evening':
      return hour >= 17 || hour < 2;
    case 'varies':
      return true; // Always optimal for "varies"
  }
}

// ============================================================================
// PREFERENCE PROFILES
// ============================================================================

export interface PreferenceProfile {
  name: string;
  description: string;
  preferences: Partial<UserPreferences>;
}

export const PREFERENCE_PROFILES: PreferenceProfile[] = [
  {
    name: 'Gentle Start',
    description: 'Easy introduction with minimal pressure',
    preferences: {
      notificationStyle: 'gentle',
      gamificationLevel: 'minimal',
      celebrationIntensity: 'subtle',
      breakReminders: true,
      breakInterval: 20,
    },
  },
  {
    name: 'Productivity Focus',
    description: 'Optimized for getting things done',
    preferences: {
      notificationStyle: 'firm',
      gamificationLevel: 'full',
      celebrationIntensity: 'enthusiastic',
      showTimerByDefault: true,
      autoShrinkSuggestions: true,
    },
  },
  {
    name: 'Minimal Distraction',
    description: 'Clean, quiet experience',
    preferences: {
      notificationStyle: 'minimal',
      gamificationLevel: 'none',
      celebrationIntensity: 'subtle',
      reducedMotion: true,
      breakReminders: false,
    },
  },
  {
    name: 'ADHD-Friendly',
    description: 'Designed to reduce overwhelm',
    preferences: {
      notificationStyle: 'gentle',
      gamificationLevel: 'full',
      celebrationIntensity: 'normal',
      autoShrinkSuggestions: true,
      breakReminders: true,
      breakInterval: 15,
      dailyTaskLimit: 5,
    },
  },
];

/**
 * Apply a preference profile
 */
export function applyPreferenceProfile(profileName: string): UserPreferences {
  const profile = PREFERENCE_PROFILES.find((p) => p.name === profileName);
  if (!profile) return getPreferences();

  return updatePreferences(profile.preferences);
}

// ============================================================================
// PREFERENCE EXPORT/IMPORT
// ============================================================================

/**
 * Export preferences as JSON string
 */
export function exportPreferences(): string {
  const prefs = getPreferences();
  return JSON.stringify(prefs, null, 2);
}

/**
 * Import preferences from JSON string
 */
export function importPreferences(json: string): UserPreferences | null {
  try {
    const parsed = JSON.parse(json) as Partial<UserPreferences>;

    // Validate required fields
    if (typeof parsed !== 'object' || parsed === null) {
      return null;
    }

    const merged: UserPreferences = {
      ...DEFAULT_PREFERENCES,
      ...parsed,
      lastUpdated: new Date().toISOString(),
    };

    savePreferences(merged);
    return merged;
  } catch {
    return null;
  }
}
