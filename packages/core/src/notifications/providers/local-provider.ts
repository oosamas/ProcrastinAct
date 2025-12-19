/**
 * Local Notification Provider
 * For web and development testing
 */

import type {
  NotificationProvider,
  PendingNotification,
  NotificationTrigger,
  ScheduledNotification,
  NotificationPermissionStatus,
} from '../types';

export class LocalNotificationProvider implements NotificationProvider {
  name = 'local' as const;
  private initialized = false;
  private scheduledNotifications: Map<string, ScheduledNotification> =
    new Map();
  private timers: Map<string, ReturnType<typeof setTimeout>> = new Map();
  private permissionStatus: NotificationPermissionStatus = 'undetermined';

  async initialize(): Promise<void> {
    this.initialized = true;
  }

  async requestPermission(): Promise<NotificationPermissionStatus> {
    // Check if browser supports notifications
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const result = await Notification.requestPermission();
      this.permissionStatus =
        result === 'granted'
          ? 'granted'
          : result === 'denied'
            ? 'denied'
            : 'undetermined';
    } else {
      // For non-web or development
      this.permissionStatus = 'granted';
    }
    return this.permissionStatus;
  }

  async getPermissionStatus(): Promise<NotificationPermissionStatus> {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const permission = Notification.permission;
      return permission === 'granted'
        ? 'granted'
        : permission === 'denied'
          ? 'denied'
          : 'undetermined';
    }
    return this.permissionStatus;
  }

  async scheduleNotification(
    notification: PendingNotification,
    trigger: NotificationTrigger
  ): Promise<string> {
    const id = this.generateId();
    const scheduledFor = this.calculateTriggerDate(trigger);

    const scheduled: ScheduledNotification = {
      id,
      notification,
      scheduledFor,
      createdAt: new Date(),
    };

    this.scheduledNotifications.set(id, scheduled);

    // Set up timer
    const delay = scheduledFor.getTime() - Date.now();
    if (delay > 0) {
      const timer = setTimeout(() => {
        this.showNotification(notification);
        this.scheduledNotifications.delete(id);
        this.timers.delete(id);
      }, delay);
      this.timers.set(id, timer);
    } else if (trigger.type === 'immediate') {
      this.showNotification(notification);
    }

    return id;
  }

  async cancelNotification(id: string): Promise<void> {
    const timer = this.timers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(id);
    }
    this.scheduledNotifications.delete(id);
  }

  async cancelAllNotifications(): Promise<void> {
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    this.timers.clear();
    this.scheduledNotifications.clear();
  }

  async getScheduledNotifications(): Promise<ScheduledNotification[]> {
    return Array.from(this.scheduledNotifications.values());
  }

  async getPushToken(): Promise<string | null> {
    // Local provider doesn't support push tokens
    return null;
  }

  async setBadgeCount(count: number): Promise<void> {
    // Try to use Navigator Badge API if available
    if (typeof navigator !== 'undefined' && 'setAppBadge' in navigator) {
      try {
        if (count > 0) {
          await (
            navigator as Navigator & {
              setAppBadge: (count: number) => Promise<void>;
            }
          ).setAppBadge(count);
        } else {
          await (
            navigator as Navigator & { clearAppBadge: () => Promise<void> }
          ).clearAppBadge();
        }
      } catch {
        // Badge API not supported or permission denied
      }
    }
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  private showNotification(notification: PendingNotification): void {
    if (
      typeof window !== 'undefined' &&
      'Notification' in window &&
      Notification.permission === 'granted'
    ) {
      const options: NotificationOptions = {
        body: notification.body,
        icon: notification.image,
        badge: notification.image,
        data: notification.data,
        silent: notification.sound === false,
        tag: notification.collapseKey,
      };

      // Note: Web Notifications API has limited action support
      // Actions are only available for service worker notifications
      // For now, we include action data in the notification data
      if (notification.actions) {
        options.data = {
          ...options.data,
          actions: notification.actions,
        };
      }

      new Notification(notification.title, options);
    } else {
      // Fallback for development
      console.log('[Notification]', notification.title, notification.body);
    }
  }

  private calculateTriggerDate(trigger: NotificationTrigger): Date {
    const now = new Date();

    switch (trigger.type) {
      case 'immediate':
        return now;

      case 'timestamp':
        return trigger.date;

      case 'interval':
        return new Date(now.getTime() + trigger.seconds * 1000);

      case 'daily': {
        const date = new Date(now);
        date.setHours(trigger.hour, trigger.minute, 0, 0);
        if (date <= now) {
          date.setDate(date.getDate() + 1);
        }
        return date;
      }

      case 'weekly': {
        const date = new Date(now);
        const currentDay = date.getDay();
        const daysUntilTarget = (trigger.weekday - currentDay + 7) % 7 || 7;
        date.setDate(date.getDate() + daysUntilTarget);
        date.setHours(trigger.hour, trigger.minute, 0, 0);
        return date;
      }

      default:
        return now;
    }
  }

  private generateId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}
