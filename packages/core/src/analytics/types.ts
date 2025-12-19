/**
 * Analytics module types - extends core types with implementation details
 */

import type {
  AnalyticsEvent,
  AnalyticsEventName,
  DailyStats,
} from '@procrastinact/types';

// Re-export core types
export type { AnalyticsEvent, AnalyticsEventName, DailyStats };

// Extended event with additional metadata
export interface TrackedEvent extends AnalyticsEvent {
  name: AnalyticsEventName;
  deviceId?: string;
  platform: 'ios' | 'android' | 'web';
  appVersion: string;
  screenName?: string;
  referrer?: string;
}

// Analytics provider configuration
export interface AnalyticsProviderConfig {
  posthog?: {
    apiKey: string;
    host?: string;
  };
  sentry?: {
    dsn: string;
    environment?: string;
    tracesSampleRate?: number;
  };
}

// User consent state
export interface ConsentState {
  analyticsEnabled: boolean;
  crashReportingEnabled: boolean;
  personalizedAdsEnabled: boolean; // Always false for this app
  consentTimestamp?: Date;
  consentVersion: string;
}

// Analytics service configuration
export interface AnalyticsServiceConfig {
  providers: AnalyticsProviderConfig;
  defaultConsent: ConsentState;
  flushInterval?: number; // ms
  maxBatchSize?: number;
  debug?: boolean;
  platform: 'ios' | 'android' | 'web';
  appVersion: string;
}

// Event properties for specific event types
export interface TaskEventProperties {
  taskId: string;
  taskTitle?: string;
  category?: string;
  shrinkLevel?: number;
  parentTaskId?: string;
  timeToComplete?: number; // ms
}

export interface TimerEventProperties {
  taskId?: string;
  duration: number; // seconds
  preset?: number;
  completed?: boolean;
  pauseCount?: number;
}

export interface SessionEventProperties {
  sessionDuration?: number; // ms
  tasksCompleted?: number;
  focusTime?: number; // seconds
  screenPath?: string;
}

export interface OnboardingEventProperties {
  step: string;
  stepIndex: number;
  totalSteps: number;
  skipped?: boolean;
  selections?: Record<string, string>;
}

// Performance metrics
export interface PerformanceMetrics {
  appStartTime?: number; // ms
  screenLoadTime?: number; // ms
  apiLatency?: number; // ms
  memoryUsage?: number; // bytes
  batteryLevel?: number; // percentage
}

// Error tracking
export interface ErrorContext {
  error: Error;
  componentStack?: string;
  breadcrumbs?: Breadcrumb[];
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
  user?: {
    id?: string;
    email?: string;
  };
}

export interface Breadcrumb {
  type: 'navigation' | 'http' | 'ui' | 'error' | 'debug';
  category: string;
  message: string;
  timestamp: Date;
  data?: Record<string, unknown>;
}

// Analytics adapter interface (for different providers)
export interface AnalyticsAdapter {
  name: string;
  initialize(config: AnalyticsProviderConfig): Promise<void>;
  identify(userId: string, traits?: Record<string, unknown>): void;
  track(event: TrackedEvent): void;
  screen(name: string, properties?: Record<string, unknown>): void;
  setUserProperties(properties: Record<string, unknown>): void;
  reset(): void;
  flush(): Promise<void>;
  isInitialized(): boolean;
}

export interface ErrorTrackingAdapter {
  name: string;
  initialize(config: AnalyticsProviderConfig): Promise<void>;
  captureError(context: ErrorContext): void;
  captureMessage(message: string, level: 'info' | 'warning' | 'error'): void;
  addBreadcrumb(breadcrumb: Breadcrumb): void;
  setUser(user: { id?: string; email?: string } | null): void;
  setContext(name: string, context: Record<string, unknown>): void;
  isInitialized(): boolean;
}

// Aggregated stats for insights
export interface WeeklyStats {
  weekStartDate: string;
  totalTasksCompleted: number;
  totalFocusTime: number;
  averageSessionLength: number;
  mostProductiveDay: string;
  streakDays: number;
  improvementFromLastWeek: number; // percentage
}

// Session tracking
export interface AnalyticsSession {
  id: string;
  startedAt: Date;
  endedAt?: Date;
  events: TrackedEvent[];
  screens: string[];
  deviceId: string;
  userId?: string;
}
