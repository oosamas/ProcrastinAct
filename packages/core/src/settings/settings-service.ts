/**
 * Settings Service - Sprint 6
 * Centralized app settings management
 */

// ============================================================================
// TYPES
// ============================================================================

export interface AppSettings {
  // General
  version: string;
  firstLaunchDate: string;
  totalLaunches: number;

  // Task settings
  defaultTimerDuration: number; // minutes
  autoStartTimer: boolean;
  shrinkLevels: number; // How many times a task can be shrunk (default 3)
  showCompletedTasks: boolean;
  archiveCompletedAfterDays: number;

  // Timer settings
  timerSound: string;
  timerVibration: boolean;
  showTimerInStatusBar: boolean;
  pomodoroMode: boolean;
  breakDuration: number; // minutes
  longBreakDuration: number; // minutes
  sessionsBeforeLongBreak: number;

  // Notifications
  notificationsEnabled: boolean;
  reminderTime: string; // HH:mm format
  dailyReminderEnabled: boolean;
  streakReminderEnabled: boolean;
  quietHoursStart: string; // HH:mm format
  quietHoursEnd: string; // HH:mm format
  quietHoursEnabled: boolean;

  // Appearance
  theme: 'light' | 'dark' | 'system';
  reducedMotion: boolean;
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  hapticFeedback: boolean;

  // Privacy
  analyticsEnabled: boolean;
  crashReportsEnabled: boolean;
  shareUsageData: boolean;

  // Social
  showAchievementsPublicly: boolean;
  allowFriendRequests: boolean;
  showStreakPublicly: boolean;

  // Advanced
  debugMode: boolean;
  betaFeatures: boolean;
  dataRetentionDays: number;
}

export interface SettingsSection {
  id: string;
  title: string;
  icon: string;
  description: string;
}

export interface SettingItem {
  id: keyof AppSettings;
  label: string;
  description?: string;
  type: 'toggle' | 'select' | 'number' | 'time' | 'text';
  section: string;
  options?: Array<{ value: string | number; label: string }>;
  min?: number;
  max?: number;
  requiresRestart?: boolean;
  premium?: boolean;
}

// ============================================================================
// DEFAULT SETTINGS
// ============================================================================

export const DEFAULT_SETTINGS: AppSettings = {
  // General
  version: '1.0.0',
  firstLaunchDate: new Date().toISOString(),
  totalLaunches: 0,

  // Task settings
  defaultTimerDuration: 25,
  autoStartTimer: false,
  shrinkLevels: 3,
  showCompletedTasks: true,
  archiveCompletedAfterDays: 7,

  // Timer settings
  timerSound: 'gentle_chime',
  timerVibration: true,
  showTimerInStatusBar: true,
  pomodoroMode: true,
  breakDuration: 5,
  longBreakDuration: 15,
  sessionsBeforeLongBreak: 4,

  // Notifications
  notificationsEnabled: true,
  reminderTime: '09:00',
  dailyReminderEnabled: true,
  streakReminderEnabled: true,
  quietHoursStart: '22:00',
  quietHoursEnd: '08:00',
  quietHoursEnabled: true,

  // Appearance
  theme: 'system',
  reducedMotion: false,
  highContrast: false,
  fontSize: 'medium',
  hapticFeedback: true,

  // Privacy
  analyticsEnabled: false,
  crashReportsEnabled: true,
  shareUsageData: false,

  // Social
  showAchievementsPublicly: false,
  allowFriendRequests: true,
  showStreakPublicly: false,

  // Advanced
  debugMode: false,
  betaFeatures: false,
  dataRetentionDays: 365,
};

// ============================================================================
// SETTINGS SECTIONS
// ============================================================================

export const SETTINGS_SECTIONS: SettingsSection[] = [
  {
    id: 'general',
    title: 'General',
    icon: '⚙️',
    description: 'Basic app settings',
  },
  {
    id: 'tasks',
    title: 'Tasks',
    icon: '✓',
    description: 'Configure task behavior',
  },
  {
    id: 'timer',
    title: 'Timer',
    icon: '⏱',
    description: 'Focus timer settings',
  },
  {
    id: 'notifications',
    title: 'Notifications',
    icon: '🔔',
    description: 'Manage notifications',
  },
  {
    id: 'appearance',
    title: 'Appearance',
    icon: '🎨',
    description: 'Customize look and feel',
  },
  {
    id: 'privacy',
    title: 'Privacy',
    icon: '🔒',
    description: 'Privacy and data settings',
  },
  {
    id: 'social',
    title: 'Social',
    icon: '👥',
    description: 'Social and sharing',
  },
  {
    id: 'advanced',
    title: 'Advanced',
    icon: '🛠',
    description: 'Advanced options',
  },
];

// ============================================================================
// SETTING ITEMS
// ============================================================================

export const SETTING_ITEMS: SettingItem[] = [
  // Tasks
  {
    id: 'defaultTimerDuration',
    label: 'Default Timer Duration',
    description: 'Default focus session length in minutes',
    type: 'select',
    section: 'tasks',
    options: [
      { value: 5, label: '5 minutes' },
      { value: 10, label: '10 minutes' },
      { value: 15, label: '15 minutes' },
      { value: 20, label: '20 minutes' },
      { value: 25, label: '25 minutes' },
      { value: 30, label: '30 minutes' },
      { value: 45, label: '45 minutes' },
      { value: 60, label: '60 minutes' },
    ],
  },
  {
    id: 'autoStartTimer',
    label: 'Auto-start Timer',
    description: 'Start timer when opening a task',
    type: 'toggle',
    section: 'tasks',
  },
  {
    id: 'shrinkLevels',
    label: 'Shrink Levels',
    description: 'How many times you can break down a task',
    type: 'select',
    section: 'tasks',
    options: [
      { value: 2, label: '2 levels' },
      { value: 3, label: '3 levels' },
      { value: 4, label: '4 levels' },
      { value: 5, label: '5 levels' },
    ],
  },
  {
    id: 'showCompletedTasks',
    label: 'Show Completed Tasks',
    description: 'Display completed tasks in the list',
    type: 'toggle',
    section: 'tasks',
  },
  {
    id: 'archiveCompletedAfterDays',
    label: 'Auto-archive After',
    description: 'Archive completed tasks after this many days',
    type: 'select',
    section: 'tasks',
    options: [
      { value: 1, label: '1 day' },
      { value: 3, label: '3 days' },
      { value: 7, label: '1 week' },
      { value: 14, label: '2 weeks' },
      { value: 30, label: '1 month' },
      { value: 0, label: 'Never' },
    ],
  },

  // Timer
  {
    id: 'timerSound',
    label: 'Timer Sound',
    description: 'Sound when timer completes',
    type: 'select',
    section: 'timer',
    options: [
      { value: 'gentle_chime', label: 'Gentle Chime' },
      { value: 'soft_bell', label: 'Soft Bell' },
      { value: 'meditation', label: 'Meditation Bowl' },
      { value: 'birds', label: 'Birds Chirping' },
      { value: 'none', label: 'No Sound' },
    ],
  },
  {
    id: 'timerVibration',
    label: 'Vibration',
    description: 'Vibrate when timer completes',
    type: 'toggle',
    section: 'timer',
  },
  {
    id: 'showTimerInStatusBar',
    label: 'Status Bar Timer',
    description: 'Show timer countdown in status bar',
    type: 'toggle',
    section: 'timer',
  },
  {
    id: 'pomodoroMode',
    label: 'Pomodoro Mode',
    description: 'Enable break reminders after focus sessions',
    type: 'toggle',
    section: 'timer',
  },
  {
    id: 'breakDuration',
    label: 'Break Duration',
    description: 'Length of short breaks',
    type: 'select',
    section: 'timer',
    options: [
      { value: 3, label: '3 minutes' },
      { value: 5, label: '5 minutes' },
      { value: 10, label: '10 minutes' },
    ],
  },
  {
    id: 'longBreakDuration',
    label: 'Long Break Duration',
    description: 'Length of extended breaks',
    type: 'select',
    section: 'timer',
    options: [
      { value: 10, label: '10 minutes' },
      { value: 15, label: '15 minutes' },
      { value: 20, label: '20 minutes' },
      { value: 30, label: '30 minutes' },
    ],
  },

  // Notifications
  {
    id: 'notificationsEnabled',
    label: 'Enable Notifications',
    description: 'Allow the app to send notifications',
    type: 'toggle',
    section: 'notifications',
  },
  {
    id: 'dailyReminderEnabled',
    label: 'Daily Reminder',
    description: 'Get a daily reminder to check your tasks',
    type: 'toggle',
    section: 'notifications',
  },
  {
    id: 'reminderTime',
    label: 'Reminder Time',
    description: 'When to receive daily reminder',
    type: 'time',
    section: 'notifications',
  },
  {
    id: 'streakReminderEnabled',
    label: 'Streak Reminder',
    description: 'Get reminded to maintain your streak',
    type: 'toggle',
    section: 'notifications',
  },
  {
    id: 'quietHoursEnabled',
    label: 'Quiet Hours',
    description: 'Disable notifications during certain hours',
    type: 'toggle',
    section: 'notifications',
  },
  {
    id: 'quietHoursStart',
    label: 'Quiet Hours Start',
    description: 'When quiet hours begin',
    type: 'time',
    section: 'notifications',
  },
  {
    id: 'quietHoursEnd',
    label: 'Quiet Hours End',
    description: 'When quiet hours end',
    type: 'time',
    section: 'notifications',
  },

  // Appearance
  {
    id: 'theme',
    label: 'Theme',
    description: 'App color theme',
    type: 'select',
    section: 'appearance',
    options: [
      { value: 'system', label: 'System' },
      { value: 'light', label: 'Light' },
      { value: 'dark', label: 'Dark' },
    ],
  },
  {
    id: 'reducedMotion',
    label: 'Reduce Motion',
    description: 'Minimize animations',
    type: 'toggle',
    section: 'appearance',
  },
  {
    id: 'highContrast',
    label: 'High Contrast',
    description: 'Increase visual contrast for better readability',
    type: 'toggle',
    section: 'appearance',
  },
  {
    id: 'fontSize',
    label: 'Text Size',
    description: 'Adjust text size throughout the app',
    type: 'select',
    section: 'appearance',
    options: [
      { value: 'small', label: 'Small' },
      { value: 'medium', label: 'Medium' },
      { value: 'large', label: 'Large' },
      { value: 'extra-large', label: 'Extra Large' },
    ],
  },
  {
    id: 'hapticFeedback',
    label: 'Haptic Feedback',
    description: 'Feel vibrations for interactions',
    type: 'toggle',
    section: 'appearance',
  },

  // Privacy
  {
    id: 'analyticsEnabled',
    label: 'Analytics',
    description: 'Help improve the app with anonymous usage data',
    type: 'toggle',
    section: 'privacy',
  },
  {
    id: 'crashReportsEnabled',
    label: 'Crash Reports',
    description: 'Automatically send crash reports to help fix bugs',
    type: 'toggle',
    section: 'privacy',
  },

  // Social
  {
    id: 'showAchievementsPublicly',
    label: 'Public Achievements',
    description: 'Let others see your achievements',
    type: 'toggle',
    section: 'social',
  },
  {
    id: 'showStreakPublicly',
    label: 'Public Streak',
    description: 'Let others see your streak',
    type: 'toggle',
    section: 'social',
  },
  {
    id: 'allowFriendRequests',
    label: 'Friend Requests',
    description: 'Allow others to send you friend requests',
    type: 'toggle',
    section: 'social',
  },

  // Advanced
  {
    id: 'dataRetentionDays',
    label: 'Data Retention',
    description: 'How long to keep task history',
    type: 'select',
    section: 'advanced',
    options: [
      { value: 30, label: '30 days' },
      { value: 90, label: '90 days' },
      { value: 180, label: '6 months' },
      { value: 365, label: '1 year' },
      { value: 0, label: 'Forever' },
    ],
  },
  {
    id: 'betaFeatures',
    label: 'Beta Features',
    description: 'Enable experimental features',
    type: 'toggle',
    section: 'advanced',
  },
  {
    id: 'debugMode',
    label: 'Debug Mode',
    description: 'Show debug information (for developers)',
    type: 'toggle',
    section: 'advanced',
  },
];

// ============================================================================
// SETTINGS SERVICE
// ============================================================================

const STORAGE_KEY = 'procrastinact_settings';

export class SettingsService {
  private settings: AppSettings;
  private listeners: Set<(settings: AppSettings) => void> = new Set();
  private storageAdapter: {
    get: (key: string) => Promise<string | null>;
    set: (key: string, value: string) => Promise<void>;
  } | null = null;

  constructor() {
    this.settings = { ...DEFAULT_SETTINGS };
  }

  /**
   * Initialize with storage
   */
  async initialize(storageAdapter?: {
    get: (key: string) => Promise<string | null>;
    set: (key: string, value: string) => Promise<void>;
  }): Promise<void> {
    this.storageAdapter = storageAdapter || null;
    await this.load();

    // Track launch
    this.settings.totalLaunches++;
    await this.save();
  }

  /**
   * Get all settings
   */
  getAll(): AppSettings {
    return { ...this.settings };
  }

  /**
   * Get a specific setting
   */
  get<K extends keyof AppSettings>(key: K): AppSettings[K] {
    return this.settings[key];
  }

  /**
   * Update a setting
   */
  async set<K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ): Promise<void> {
    this.settings[key] = value;
    await this.save();
    this.notify();
  }

  /**
   * Update multiple settings
   */
  async setMultiple(updates: Partial<AppSettings>): Promise<void> {
    Object.assign(this.settings, updates);
    await this.save();
    this.notify();
  }

  /**
   * Reset to defaults
   */
  async reset(): Promise<void> {
    // Preserve some fields
    const preserveFields = {
      firstLaunchDate: this.settings.firstLaunchDate,
      totalLaunches: this.settings.totalLaunches,
    };

    this.settings = { ...DEFAULT_SETTINGS, ...preserveFields };
    await this.save();
    this.notify();
  }

  /**
   * Reset a specific section
   */
  async resetSection(sectionId: string): Promise<void> {
    const sectionItems = SETTING_ITEMS.filter(
      (item) => item.section === sectionId
    );
    const updates: Partial<AppSettings> = {};

    sectionItems.forEach((item) => {
      (updates as Record<string, unknown>)[item.id] = DEFAULT_SETTINGS[item.id];
    });

    await this.setMultiple(updates);
  }

  /**
   * Get settings for a section
   */
  getSectionSettings(sectionId: string): Array<{
    item: SettingItem;
    value: AppSettings[keyof AppSettings];
  }> {
    const sectionItems = SETTING_ITEMS.filter(
      (item) => item.section === sectionId
    );
    return sectionItems.map((item) => ({
      item,
      value: this.settings[item.id],
    }));
  }

  /**
   * Subscribe to changes
   */
  subscribe(listener: (settings: AppSettings) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Export settings as JSON
   */
  export(): string {
    return JSON.stringify(this.settings, null, 2);
  }

  /**
   * Import settings from JSON
   */
  async import(json: string): Promise<boolean> {
    try {
      const imported = JSON.parse(json) as Partial<AppSettings>;
      // Validate and merge
      const validKeys = Object.keys(DEFAULT_SETTINGS);
      const updates: Partial<AppSettings> = {};

      Object.entries(imported).forEach(([key, value]) => {
        if (validKeys.includes(key)) {
          (updates as Record<string, unknown>)[key] = value;
        }
      });

      await this.setMultiple(updates);
      return true;
    } catch {
      return false;
    }
  }

  // Private methods

  private async load(): Promise<void> {
    if (!this.storageAdapter) return;

    try {
      const stored = await this.storageAdapter.get(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.settings = { ...DEFAULT_SETTINGS, ...parsed };
      }
    } catch {
      // Use defaults
    }
  }

  private async save(): Promise<void> {
    if (!this.storageAdapter) return;

    try {
      await this.storageAdapter.set(STORAGE_KEY, JSON.stringify(this.settings));
    } catch {
      // Ignore
    }
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener(this.settings));
  }
}

// ============================================================================
// SINGLETON
// ============================================================================

let settingsInstance: SettingsService | null = null;

export function getSettingsService(): SettingsService {
  if (!settingsInstance) {
    settingsInstance = new SettingsService();
  }
  return settingsInstance;
}
