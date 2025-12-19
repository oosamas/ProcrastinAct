export { AnalyticsService } from './analytics-service';
export { ConsentManager } from './consent-manager';
export { EventAggregator } from './event-aggregator';

export { PostHogAdapter, SentryAdapter } from './adapters';

export type {
  AnalyticsEvent,
  AnalyticsEventName,
  DailyStats,
  TrackedEvent,
  AnalyticsProviderConfig,
  ConsentState,
  AnalyticsServiceConfig,
  TaskEventProperties,
  TimerEventProperties,
  SessionEventProperties,
  OnboardingEventProperties,
  PerformanceMetrics,
  ErrorContext,
  Breadcrumb,
  AnalyticsAdapter,
  ErrorTrackingAdapter,
  WeeklyStats,
  AnalyticsSession,
} from './types';
