export { NotificationService } from './notification-service';
export { NotificationScheduler } from './notification-scheduler';
export { LocalNotificationProvider } from './providers';
export {
  getNotificationMessage,
  getTemplatesForType,
  applyTemplate,
} from './notification-templates';

export type {
  NotificationType,
  AppNotification,
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
} from './types';

export { DEFAULT_CHANNELS, DEFAULT_PREFERENCES } from './types';
