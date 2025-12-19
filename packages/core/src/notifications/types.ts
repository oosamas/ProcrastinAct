/**
 * Notification Types
 */

import type { NotificationType, AppNotification } from '@procrastinact/types';

// Re-export core types
export type { NotificationType, AppNotification };

// Notification channel types
export type NotificationChannel =
  | 'reminders'
  | 'encouragement'
  | 'achievements'
  | 'streaks'
  | 'time_awareness'
  | 'gentle_nudges'
  | 'system';

// Channel configuration
export interface NotificationChannelConfig {
  id: NotificationChannel;
  name: string;
  description: string;
  importance: 'min' | 'low' | 'default' | 'high';
  enabledByDefault: boolean;
  respectQuietHours: boolean;
  groupable: boolean;
}

// User notification preferences
export interface NotificationPreferences {
  enabled: boolean;
  channels: Record<NotificationChannel, boolean>;
  quietHours: QuietHoursConfig;
  frequency: NotificationFrequency;
  tonality: NotificationTonality;
}

// Quiet hours configuration
export interface QuietHoursConfig {
  enabled: boolean;
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  autoDetect: boolean;
  daysOfWeek: number[]; // 0-6, Sunday = 0
}

// How often we should send notifications
export type NotificationFrequency = 'minimal' | 'normal' | 'frequent';

// The tone of notification messages
export type NotificationTonality = 'supportive' | 'neutral' | 'playful';

// Scheduled notification
export interface ScheduledNotification {
  id: string;
  notification: PendingNotification;
  scheduledFor: Date;
  repeat?: NotificationRepeat;
  createdAt: Date;
}

// Repeat configuration
export interface NotificationRepeat {
  type: 'daily' | 'weekly' | 'custom';
  interval?: number; // for custom, in minutes
  daysOfWeek?: number[]; // for weekly
  endDate?: Date;
}

// Notification to be sent
export interface PendingNotification {
  title: string;
  body: string;
  type: NotificationType;
  channel: NotificationChannel;
  data?: Record<string, unknown>;
  // Rich notification options
  image?: string;
  actions?: NotificationAction[];
  badge?: number;
  sound?: string | boolean;
  // Delivery options
  priority?: 'min' | 'low' | 'default' | 'high';
  ttl?: number; // Time to live in seconds
  collapseKey?: string; // For grouping/replacing
}

// Notification action button
export interface NotificationAction {
  id: string;
  title: string;
  icon?: string;
  options?: {
    opensApp?: boolean;
    destructive?: boolean;
    authenticationRequired?: boolean;
  };
}

// Notification provider interface
export interface NotificationProvider {
  name: string;
  initialize(): Promise<void>;
  requestPermission(): Promise<NotificationPermissionStatus>;
  getPermissionStatus(): Promise<NotificationPermissionStatus>;
  scheduleNotification(
    notification: PendingNotification,
    trigger: NotificationTrigger
  ): Promise<string>;
  cancelNotification(id: string): Promise<void>;
  cancelAllNotifications(): Promise<void>;
  getScheduledNotifications(): Promise<ScheduledNotification[]>;
  getPushToken(): Promise<string | null>;
  setBadgeCount(count: number): Promise<void>;
  isInitialized(): boolean;
}

// Permission status
export type NotificationPermissionStatus =
  | 'granted'
  | 'denied'
  | 'undetermined';

// Trigger for scheduled notifications
export type NotificationTrigger =
  | { type: 'immediate' }
  | { type: 'timestamp'; date: Date }
  | { type: 'interval'; seconds: number; repeats?: boolean }
  | { type: 'daily'; hour: number; minute: number }
  | { type: 'weekly'; weekday: number; hour: number; minute: number };

// Service configuration
export interface NotificationServiceConfig {
  defaultChannel: NotificationChannel;
  defaultPreferences: Partial<NotificationPreferences>;
  enabledChannels: NotificationChannelConfig[];
  debug?: boolean;
}

// Notification templates
export interface NotificationTemplate {
  id: string;
  type: NotificationType;
  variants: NotificationTemplateVariant[];
}

export interface NotificationTemplateVariant {
  tonality: NotificationTonality;
  title: string;
  body: string;
  variables?: string[]; // e.g., ['taskName', 'streakCount']
}

// Default channel configurations
export const DEFAULT_CHANNELS: NotificationChannelConfig[] = [
  {
    id: 'reminders',
    name: 'Reminders',
    description: 'Task reminders you scheduled',
    importance: 'high',
    enabledByDefault: true,
    respectQuietHours: true,
    groupable: true,
  },
  {
    id: 'encouragement',
    name: 'Encouragement',
    description: 'Supportive messages to help you along',
    importance: 'low',
    enabledByDefault: true,
    respectQuietHours: true,
    groupable: false,
  },
  {
    id: 'achievements',
    name: 'Achievements',
    description: 'Celebrate your wins',
    importance: 'default',
    enabledByDefault: true,
    respectQuietHours: false,
    groupable: true,
  },
  {
    id: 'streaks',
    name: 'Streaks',
    description: 'Keep your streak alive',
    importance: 'default',
    enabledByDefault: true,
    respectQuietHours: true,
    groupable: false,
  },
  {
    id: 'time_awareness',
    name: 'Time Awareness',
    description: 'Gentle time reminders',
    importance: 'low',
    enabledByDefault: false,
    respectQuietHours: true,
    groupable: false,
  },
  {
    id: 'gentle_nudges',
    name: 'Gentle Nudges',
    description: 'Light check-ins (never guilt-inducing)',
    importance: 'min',
    enabledByDefault: false,
    respectQuietHours: true,
    groupable: false,
  },
  {
    id: 'system',
    name: 'System',
    description: 'Important app updates',
    importance: 'default',
    enabledByDefault: true,
    respectQuietHours: false,
    groupable: false,
  },
];

// Default preferences
export const DEFAULT_PREFERENCES: NotificationPreferences = {
  enabled: true,
  channels: {
    reminders: true,
    encouragement: true,
    achievements: true,
    streaks: true,
    time_awareness: false,
    gentle_nudges: false,
    system: true,
  },
  quietHours: {
    enabled: true,
    startTime: '22:00',
    endTime: '08:00',
    autoDetect: true,
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
  },
  frequency: 'minimal',
  tonality: 'supportive',
};
