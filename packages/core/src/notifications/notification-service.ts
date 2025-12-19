/**
 * Notification Service - unified interface for notifications
 */

import type { NotificationType } from '@procrastinact/types';
import type {
  NotificationServiceConfig,
  NotificationProvider,
  NotificationPreferences,
  PendingNotification,
  NotificationTrigger,
  NotificationChannel,
  ScheduledNotification,
  NotificationPermissionStatus,
  NotificationTonality,
} from './types';
import { DEFAULT_PREFERENCES, DEFAULT_CHANNELS } from './types';
import { LocalNotificationProvider } from './providers/local-provider';
import { NotificationScheduler } from './notification-scheduler';
import { getNotificationMessage } from './notification-templates';

const PREFERENCES_STORAGE_KEY = 'procrastinact_notification_preferences';

export class NotificationService {
  private provider: NotificationProvider;
  private scheduler: NotificationScheduler;
  private preferences: NotificationPreferences;
  private config: NotificationServiceConfig;
  private isInitialized = false;
  private storageAdapter: {
    get: (key: string) => Promise<string | null>;
    set: (key: string, value: string) => Promise<void>;
  } | null = null;
  private listeners: Set<(prefs: NotificationPreferences) => void> = new Set();

  constructor(config: NotificationServiceConfig) {
    this.config = config;
    this.provider = new LocalNotificationProvider();
    this.preferences = { ...DEFAULT_PREFERENCES, ...config.defaultPreferences };
    this.scheduler = new NotificationScheduler(
      this.preferences.quietHours,
      config.enabledChannels || DEFAULT_CHANNELS
    );
  }

  /**
   * Initialize the notification service
   */
  async initialize(storageAdapter?: {
    get: (key: string) => Promise<string | null>;
    set: (key: string, value: string) => Promise<void>;
  }): Promise<void> {
    if (this.isInitialized) return;

    this.storageAdapter = storageAdapter || null;

    // Load preferences
    if (this.storageAdapter) {
      await this.loadPreferences();
    }

    // Initialize provider
    await this.provider.initialize();

    this.isInitialized = true;

    if (this.config.debug) {
      console.log('[Notifications] Initialized');
    }
  }

  /**
   * Request notification permission
   */
  async requestPermission(): Promise<NotificationPermissionStatus> {
    return this.provider.requestPermission();
  }

  /**
   * Get current permission status
   */
  async getPermissionStatus(): Promise<NotificationPermissionStatus> {
    return this.provider.getPermissionStatus();
  }

  /**
   * Send a notification immediately
   */
  async sendNotification(
    notification: PendingNotification
  ): Promise<string | null> {
    // Check if notifications are enabled
    if (!this.preferences.enabled) {
      if (this.config.debug) {
        console.log('[Notifications] Notifications disabled, skipping');
      }
      return null;
    }

    // Check if channel is enabled
    if (!this.preferences.channels[notification.channel]) {
      if (this.config.debug) {
        console.log(
          `[Notifications] Channel ${notification.channel} disabled, skipping`
        );
      }
      return null;
    }

    // Check quiet hours
    if (!this.scheduler.shouldSendNow(notification.channel)) {
      if (this.config.debug) {
        console.log('[Notifications] Quiet hours active, delaying');
      }
      // Schedule for after quiet hours
      return this.scheduleNotification(notification, {
        type: 'timestamp',
        date: this.scheduler.getNextAvailableTime(),
      });
    }

    return this.provider.scheduleNotification(notification, {
      type: 'immediate',
    });
  }

  /**
   * Schedule a notification
   */
  async scheduleNotification(
    notification: PendingNotification,
    trigger: NotificationTrigger
  ): Promise<string | null> {
    // Check if notifications are enabled
    if (!this.preferences.enabled) {
      return null;
    }

    // Check if channel is enabled
    if (!this.preferences.channels[notification.channel]) {
      return null;
    }

    // Adjust trigger for quiet hours
    const adjustedTrigger = this.scheduler.adjustTriggerForQuietHours(
      trigger,
      notification.channel
    );

    return this.provider.scheduleNotification(notification, adjustedTrigger);
  }

  /**
   * Send a templated notification
   */
  async sendTemplatedNotification(
    type: NotificationType,
    channel: NotificationChannel,
    variables: Record<string, string | number> = {},
    options: Partial<PendingNotification> = {}
  ): Promise<string | null> {
    const { title, body } = getNotificationMessage(
      type,
      this.preferences.tonality,
      variables
    );

    return this.sendNotification({
      title,
      body,
      type,
      channel,
      ...options,
    });
  }

  /**
   * Schedule a reminder notification
   */
  async scheduleReminder(
    taskName: string,
    scheduledFor: Date,
    taskId?: string
  ): Promise<string | null> {
    const { title, body } = getNotificationMessage(
      'reminder',
      this.preferences.tonality,
      {
        taskName,
      }
    );

    return this.scheduleNotification(
      {
        title,
        body,
        type: 'reminder',
        channel: 'reminders',
        data: { taskId },
        collapseKey: taskId ? `reminder_${taskId}` : undefined,
      },
      { type: 'timestamp', date: scheduledFor }
    );
  }

  /**
   * Send a streak notification
   */
  async sendStreakNotification(streakCount: number): Promise<string | null> {
    return this.sendTemplatedNotification('streak', 'streaks', { streakCount });
  }

  /**
   * Send an achievement notification
   */
  async sendAchievementNotification(
    achievementName: string
  ): Promise<string | null> {
    return this.sendTemplatedNotification('achievement', 'achievements', {
      achievementName,
    });
  }

  /**
   * Send an encouragement notification
   */
  async sendEncouragementNotification(): Promise<string | null> {
    return this.sendTemplatedNotification('encouragement', 'encouragement');
  }

  /**
   * Cancel a scheduled notification
   */
  async cancelNotification(id: string): Promise<void> {
    return this.provider.cancelNotification(id);
  }

  /**
   * Cancel all notifications
   */
  async cancelAllNotifications(): Promise<void> {
    return this.provider.cancelAllNotifications();
  }

  /**
   * Get all scheduled notifications
   */
  async getScheduledNotifications(): Promise<ScheduledNotification[]> {
    return this.provider.getScheduledNotifications();
  }

  /**
   * Get push token for remote notifications
   */
  async getPushToken(): Promise<string | null> {
    return this.provider.getPushToken();
  }

  /**
   * Set app badge count
   */
  async setBadgeCount(count: number): Promise<void> {
    return this.provider.setBadgeCount(count);
  }

  /**
   * Get current preferences
   */
  getPreferences(): NotificationPreferences {
    return { ...this.preferences };
  }

  /**
   * Update preferences
   */
  async updatePreferences(
    updates: Partial<NotificationPreferences>
  ): Promise<void> {
    this.preferences = { ...this.preferences, ...updates };

    // Update scheduler with new quiet hours
    if (updates.quietHours) {
      this.scheduler.setQuietHours(this.preferences.quietHours);
    }

    await this.savePreferences();
    this.notifyListeners();

    if (this.config.debug) {
      console.log('[Notifications] Preferences updated:', this.preferences);
    }
  }

  /**
   * Enable/disable a specific channel
   */
  async setChannelEnabled(
    channel: NotificationChannel,
    enabled: boolean
  ): Promise<void> {
    await this.updatePreferences({
      channels: {
        ...this.preferences.channels,
        [channel]: enabled,
      },
    });
  }

  /**
   * Set notification tonality
   */
  async setTonality(tonality: NotificationTonality): Promise<void> {
    await this.updatePreferences({ tonality });
  }

  /**
   * Check if quiet hours are active
   */
  isQuietHoursActive(): boolean {
    return this.scheduler.isQuietHoursActive();
  }

  /**
   * Get time until quiet hours end
   */
  getTimeUntilQuietHoursEnd(): number | null {
    return this.scheduler.getTimeUntilQuietHoursEnd();
  }

  /**
   * Subscribe to preference changes
   */
  subscribe(listener: (prefs: NotificationPreferences) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Check if service is ready
   */
  isReady(): boolean {
    return this.isInitialized && this.provider.isInitialized();
  }

  private async loadPreferences(): Promise<void> {
    if (!this.storageAdapter) return;

    try {
      const stored = await this.storageAdapter.get(PREFERENCES_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<NotificationPreferences>;
        this.preferences = { ...this.preferences, ...parsed };
        this.scheduler.setQuietHours(this.preferences.quietHours);
      }
    } catch {
      // Use defaults on error
    }
  }

  private async savePreferences(): Promise<void> {
    if (!this.storageAdapter) return;

    try {
      await this.storageAdapter.set(
        PREFERENCES_STORAGE_KEY,
        JSON.stringify(this.preferences)
      );
    } catch {
      // Ignore save errors
    }
  }

  private notifyListeners(): void {
    const prefs = this.getPreferences();
    this.listeners.forEach((listener) => listener(prefs));
  }
}
