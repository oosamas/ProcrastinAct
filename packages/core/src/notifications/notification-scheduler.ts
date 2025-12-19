/**
 * Notification Scheduler
 * Handles scheduling and quiet hours logic
 */

import type {
  QuietHoursConfig,
  NotificationTrigger,
  ScheduledNotification,
  NotificationChannel,
  NotificationChannelConfig,
} from './types';
import { DEFAULT_CHANNELS } from './types';

export class NotificationScheduler {
  private quietHours: QuietHoursConfig;
  private channels: Map<NotificationChannel, NotificationChannelConfig>;

  constructor(
    quietHours: QuietHoursConfig,
    channelConfigs: NotificationChannelConfig[] = DEFAULT_CHANNELS
  ) {
    this.quietHours = quietHours;
    this.channels = new Map(channelConfigs.map((c) => [c.id, c]));
  }

  /**
   * Update quiet hours configuration
   */
  setQuietHours(config: QuietHoursConfig): void {
    this.quietHours = config;
  }

  /**
   * Check if we're currently in quiet hours
   */
  isQuietHoursActive(): boolean {
    if (!this.quietHours.enabled) return false;

    const now = new Date();
    const currentDay = now.getDay();

    // Check if today is a quiet hours day
    if (!this.quietHours.daysOfWeek.includes(currentDay)) {
      return false;
    }

    return this.isTimeInQuietHours(now);
  }

  /**
   * Check if a specific time is within quiet hours
   */
  isTimeInQuietHours(time: Date): boolean {
    if (!this.quietHours.enabled) return false;

    const currentMinutes = time.getHours() * 60 + time.getMinutes();
    const startParts = this.quietHours.startTime.split(':').map(Number);
    const endParts = this.quietHours.endTime.split(':').map(Number);
    const startHour = startParts[0] ?? 22;
    const startMin = startParts[1] ?? 0;
    const endHour = endParts[0] ?? 8;
    const endMin = endParts[1] ?? 0;
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    // Handle overnight quiet hours (e.g., 22:00 - 08:00)
    if (startMinutes > endMinutes) {
      return currentMinutes >= startMinutes || currentMinutes < endMinutes;
    }

    return currentMinutes >= startMinutes && currentMinutes < endMinutes;
  }

  /**
   * Get the next available time after quiet hours
   */
  getNextAvailableTime(): Date {
    if (!this.isQuietHoursActive()) {
      return new Date();
    }

    const now = new Date();
    const endParts = this.quietHours.endTime.split(':').map(Number);
    const endHour = endParts[0] ?? 8;
    const endMin = endParts[1] ?? 0;

    const nextAvailable = new Date(now);
    nextAvailable.setHours(endHour, endMin, 0, 0);

    // If end time is before current time, it's tomorrow
    if (nextAvailable <= now) {
      nextAvailable.setDate(nextAvailable.getDate() + 1);
    }

    return nextAvailable;
  }

  /**
   * Adjust a trigger to respect quiet hours
   */
  adjustTriggerForQuietHours(
    trigger: NotificationTrigger,
    channel: NotificationChannel
  ): NotificationTrigger {
    const channelConfig = this.channels.get(channel);

    // If channel doesn't respect quiet hours, return as-is
    if (!channelConfig?.respectQuietHours) {
      return trigger;
    }

    const targetDate = this.getTriggerDate(trigger);

    // If target time is during quiet hours, delay to after quiet hours
    if (this.isTimeInQuietHours(targetDate)) {
      const nextAvailable = this.getNextAvailableTime();

      // Keep the original time but move to next available day if needed
      if (trigger.type === 'daily' || trigger.type === 'weekly') {
        return trigger; // These already have specific times, let them handle it
      }

      return {
        type: 'timestamp',
        date: nextAvailable,
      };
    }

    return trigger;
  }

  /**
   * Check if a notification should be sent now based on channel and quiet hours
   */
  shouldSendNow(channel: NotificationChannel): boolean {
    const channelConfig = this.channels.get(channel);

    if (!channelConfig) {
      return true; // Unknown channel, allow by default
    }

    if (channelConfig.respectQuietHours && this.isQuietHoursActive()) {
      return false;
    }

    return true;
  }

  /**
   * Get time until quiet hours end
   */
  getTimeUntilQuietHoursEnd(): number | null {
    if (!this.isQuietHoursActive()) {
      return null;
    }

    const nextAvailable = this.getNextAvailableTime();
    return nextAvailable.getTime() - Date.now();
  }

  /**
   * Get time until quiet hours start
   */
  getTimeUntilQuietHoursStart(): number | null {
    if (!this.quietHours.enabled || this.isQuietHoursActive()) {
      return null;
    }

    const now = new Date();
    const startParts = this.quietHours.startTime.split(':').map(Number);
    const startHour = startParts[0] ?? 22;
    const startMin = startParts[1] ?? 0;

    const quietHoursStart = new Date(now);
    quietHoursStart.setHours(startHour, startMin, 0, 0);

    if (quietHoursStart <= now) {
      quietHoursStart.setDate(quietHoursStart.getDate() + 1);
    }

    return quietHoursStart.getTime() - Date.now();
  }

  /**
   * Find the best time to send a notification within a time window
   */
  findBestTimeInWindow(
    startTime: Date,
    endTime: Date,
    channel: NotificationChannel
  ): Date | null {
    const channelConfig = this.channels.get(channel);

    // If channel doesn't respect quiet hours, just use start time
    if (!channelConfig?.respectQuietHours) {
      return startTime;
    }

    // Try to find a time that's not in quiet hours
    const candidate = new Date(startTime);

    while (candidate <= endTime) {
      if (!this.isTimeInQuietHours(candidate)) {
        return candidate;
      }

      // Move to end of quiet hours
      const nextAvailable = this.getNextAvailableTimeFrom(candidate);
      if (nextAvailable && nextAvailable <= endTime) {
        return nextAvailable;
      }

      // No valid time in window
      return null;
    }

    return null;
  }

  /**
   * Group notifications that should be bundled
   */
  groupNotifications(
    notifications: ScheduledNotification[]
  ): Map<string, ScheduledNotification[]> {
    const groups = new Map<string, ScheduledNotification[]>();

    for (const notification of notifications) {
      const channel = notification.notification.channel;
      const channelConfig = this.channels.get(channel);

      if (channelConfig?.groupable) {
        const groupKey = notification.notification.collapseKey || channel;
        const existing = groups.get(groupKey) || [];
        existing.push(notification);
        groups.set(groupKey, existing);
      } else {
        // Non-groupable notifications get their own group
        groups.set(notification.id, [notification]);
      }
    }

    return groups;
  }

  private getTriggerDate(trigger: NotificationTrigger): Date {
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

  private getNextAvailableTimeFrom(from: Date): Date | null {
    if (!this.quietHours.enabled) return from;

    const endParts = this.quietHours.endTime.split(':').map(Number);
    const endHour = endParts[0] ?? 8;
    const endMin = endParts[1] ?? 0;

    const nextAvailable = new Date(from);
    nextAvailable.setHours(endHour, endMin, 0, 0);

    if (nextAvailable <= from) {
      nextAvailable.setDate(nextAvailable.getDate() + 1);
    }

    return nextAvailable;
  }
}
