/**
 * Main Analytics Service - unified interface for analytics and error tracking
 */

import type { AnalyticsEventName } from '@procrastinact/types';
import type {
  AnalyticsServiceConfig,
  AnalyticsAdapter,
  ErrorTrackingAdapter,
  TrackedEvent,
  TaskEventProperties,
  TimerEventProperties,
  SessionEventProperties,
  OnboardingEventProperties,
  PerformanceMetrics,
  ErrorContext,
  Breadcrumb,
  AnalyticsSession,
} from './types';
import { PostHogAdapter } from './adapters/posthog-adapter';
import { SentryAdapter } from './adapters/sentry-adapter';
import { ConsentManager } from './consent-manager';
import { EventAggregator } from './event-aggregator';

export class AnalyticsService {
  private analyticsAdapter: AnalyticsAdapter;
  private errorAdapter: ErrorTrackingAdapter;
  private consentManager: ConsentManager;
  private eventAggregator: EventAggregator;
  private config: AnalyticsServiceConfig;
  private session: AnalyticsSession | null = null;
  private eventQueue: TrackedEvent[] = [];
  private flushTimer: ReturnType<typeof setInterval> | null = null;
  private isInitialized = false;

  constructor(
    config: AnalyticsServiceConfig,
    storageAdapter: {
      get: (key: string) => Promise<string | null>;
      set: (key: string, value: string) => Promise<void>;
    }
  ) {
    this.config = config;
    this.analyticsAdapter = new PostHogAdapter();
    this.errorAdapter = new SentryAdapter();
    this.consentManager = new ConsentManager(
      storageAdapter,
      config.defaultConsent
    );
    this.eventAggregator = new EventAggregator();
  }

  /**
   * Initialize the analytics service
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    // Load consent state
    await this.consentManager.load();

    // Subscribe to consent changes
    this.consentManager.subscribe((consent) => {
      if (!consent.analyticsEnabled) {
        this.analyticsAdapter.reset();
      }
    });

    // Initialize adapters based on consent
    if (this.consentManager.isAnalyticsAllowed()) {
      await this.analyticsAdapter.initialize(this.config.providers);
    }

    if (this.consentManager.isCrashReportingAllowed()) {
      await this.errorAdapter.initialize(this.config.providers);
    }

    // Start session
    this.startSession();

    // Set up flush timer
    const flushInterval = this.config.flushInterval || 30000;
    this.flushTimer = setInterval(() => this.flush(), flushInterval);

    this.isInitialized = true;

    if (this.config.debug) {
      console.log('[Analytics] Initialized');
    }
  }

  /**
   * Identify the current user
   */
  identify(userId: string, traits?: Record<string, unknown>): void {
    if (this.session) {
      this.session.userId = userId;
    }

    if (this.consentManager.isAnalyticsAllowed()) {
      this.analyticsAdapter.identify(userId, traits);
    }

    if (this.consentManager.isCrashReportingAllowed()) {
      this.errorAdapter.setUser({ id: userId });
    }
  }

  /**
   * Track a generic event
   */
  track(name: AnalyticsEventName, properties?: Record<string, unknown>): void {
    const event = this.createEvent(name, properties);
    this.processEvent(event);
  }

  // Convenience methods for specific event types

  trackTaskCreated(properties: TaskEventProperties): void {
    this.track('task_created', { ...properties });
  }

  trackTaskCompleted(properties: TaskEventProperties): void {
    this.track('task_completed', { ...properties });
  }

  trackTaskShrunk(properties: TaskEventProperties): void {
    this.track('task_shrunk', { ...properties });
  }

  trackTaskStopped(properties: TaskEventProperties): void {
    this.track('task_stopped', { ...properties });
  }

  trackTimerStarted(properties: TimerEventProperties): void {
    this.track('timer_started', { ...properties });
  }

  trackTimerCompleted(properties: TimerEventProperties): void {
    this.track('timer_completed', { ...properties });
  }

  trackTimerPaused(properties: TimerEventProperties): void {
    this.track('timer_paused', { ...properties });
  }

  trackSessionStarted(properties?: SessionEventProperties): void {
    this.track('session_started', properties ? { ...properties } : undefined);
  }

  trackSessionEnded(properties?: SessionEventProperties): void {
    this.track('session_ended', properties ? { ...properties } : undefined);
  }

  trackOnboardingStep(properties: OnboardingEventProperties): void {
    this.track('onboarding_step', { ...properties });
  }

  trackAchievementUnlocked(
    achievementId: string,
    achievementName: string
  ): void {
    this.track('achievement_unlocked', { achievementId, achievementName });
  }

  trackStreakMilestone(streakDays: number): void {
    this.track('streak_milestone', { streakDays });
  }

  /**
   * Track screen view
   */
  screen(name: string, properties?: Record<string, unknown>): void {
    if (this.session) {
      this.session.screens.push(name);
    }

    this.addBreadcrumb({
      type: 'navigation',
      category: 'screen',
      message: `Navigated to ${name}`,
      timestamp: new Date(),
    });

    if (this.consentManager.isAnalyticsAllowed()) {
      this.analyticsAdapter.screen(name, properties);
    }
  }

  /**
   * Track performance metrics
   */
  trackPerformance(metrics: PerformanceMetrics): void {
    if (this.consentManager.isCrashReportingAllowed()) {
      this.errorAdapter.setContext(
        'performance',
        metrics as Record<string, unknown>
      );
    }

    this.track('app_opened', { ...metrics });
  }

  /**
   * Capture an error
   */
  captureError(error: Error, context?: Partial<ErrorContext>): void {
    if (this.consentManager.isCrashReportingAllowed()) {
      this.errorAdapter.captureError({
        error,
        ...context,
      });
    }

    if (this.config.debug) {
      console.error('[Analytics] Error captured:', error);
    }
  }

  /**
   * Capture a message
   */
  captureMessage(
    message: string,
    level: 'info' | 'warning' | 'error' = 'info'
  ): void {
    if (this.consentManager.isCrashReportingAllowed()) {
      this.errorAdapter.captureMessage(message, level);
    }
  }

  /**
   * Add a breadcrumb for debugging
   */
  addBreadcrumb(breadcrumb: Breadcrumb): void {
    if (this.consentManager.isCrashReportingAllowed()) {
      this.errorAdapter.addBreadcrumb(breadcrumb);
    }
  }

  /**
   * Set user properties
   */
  setUserProperties(properties: Record<string, unknown>): void {
    if (this.consentManager.isAnalyticsAllowed()) {
      this.analyticsAdapter.setUserProperties(properties);
    }
  }

  /**
   * Get the consent manager
   */
  getConsentManager(): ConsentManager {
    return this.consentManager;
  }

  /**
   * Get the event aggregator
   */
  getEventAggregator(): EventAggregator {
    return this.eventAggregator;
  }

  /**
   * Get current session info
   */
  getSession(): AnalyticsSession | null {
    return this.session ? { ...this.session } : null;
  }

  /**
   * Flush pending events
   */
  async flush(): Promise<void> {
    if (this.eventQueue.length === 0) return;

    const events = [...this.eventQueue];
    this.eventQueue = [];

    for (const event of events) {
      if (this.consentManager.isAnalyticsAllowed()) {
        this.analyticsAdapter.track(event);
      }
    }

    await this.analyticsAdapter.flush();
  }

  /**
   * Reset analytics (clear user data)
   */
  reset(): void {
    this.analyticsAdapter.reset();
    this.errorAdapter.setUser(null);
    this.session = null;
    this.eventQueue = [];
    this.startSession();
  }

  /**
   * Shutdown the analytics service
   */
  async shutdown(): Promise<void> {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }

    // Track session end
    if (this.session) {
      this.session.endedAt = new Date();
      this.track('session_ended', {
        sessionDuration:
          this.session.endedAt.getTime() - this.session.startedAt.getTime(),
      });
    }

    await this.flush();
    this.isInitialized = false;
  }

  private createEvent(
    name: AnalyticsEventName,
    properties?: Record<string, unknown>
  ): TrackedEvent {
    return {
      name,
      properties,
      timestamp: new Date(),
      sessionId: this.session?.id || this.generateId(),
      userId: this.session?.userId,
      platform: this.config.platform,
      appVersion: this.config.appVersion,
    };
  }

  private processEvent(event: TrackedEvent): void {
    // Add to session
    if (this.session) {
      this.session.events.push(event);
    }

    // Aggregate stats
    this.eventAggregator.processEvent(event);

    // Queue for sending
    this.eventQueue.push(event);

    // Check batch size
    const maxBatchSize = this.config.maxBatchSize || 10;
    if (this.eventQueue.length >= maxBatchSize) {
      this.flush();
    }

    if (this.config.debug) {
      console.log('[Analytics] Event tracked:', event.name, event.properties);
    }
  }

  private startSession(): void {
    this.session = {
      id: this.generateId(),
      startedAt: new Date(),
      events: [],
      screens: [],
      deviceId: this.generateId(), // In real app, persist this
    };
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}
