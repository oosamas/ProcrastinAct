/**
 * PostHog Analytics Adapter
 * Privacy-first analytics provider
 */

import type {
  AnalyticsAdapter,
  AnalyticsProviderConfig,
  TrackedEvent,
} from '../types';

export class PostHogAdapter implements AnalyticsAdapter {
  name = 'posthog' as const;
  private apiKey: string | null = null;
  private host: string = 'https://app.posthog.com';
  private initialized = false;
  private queue: TrackedEvent[] = [];
  private distinctId: string | null = null;

  async initialize(config: AnalyticsProviderConfig): Promise<void> {
    if (!config.posthog?.apiKey) {
      console.warn('[PostHog] No API key provided, analytics disabled');
      return;
    }

    this.apiKey = config.posthog.apiKey;
    this.host = config.posthog.host || this.host;
    this.initialized = true;

    // Flush any queued events
    await this.flush();
  }

  identify(userId: string, traits?: Record<string, unknown>): void {
    this.distinctId = userId;

    if (!this.initialized || !this.apiKey) return;

    this.sendToPostHog('$identify', {
      $set: traits,
      distinct_id: userId,
    });
  }

  track(event: TrackedEvent): void {
    if (!this.initialized || !this.apiKey) {
      this.queue.push(event);
      return;
    }

    this.sendToPostHog(event.name, {
      ...event.properties,
      timestamp: event.timestamp.toISOString(),
      platform: event.platform,
      app_version: event.appVersion,
      screen_name: event.screenName,
    });
  }

  screen(name: string, properties?: Record<string, unknown>): void {
    if (!this.initialized || !this.apiKey) return;

    this.sendToPostHog('$screen', {
      $screen_name: name,
      ...properties,
    });
  }

  setUserProperties(properties: Record<string, unknown>): void {
    if (!this.initialized || !this.apiKey) return;

    this.sendToPostHog('$set', {
      $set: properties,
    });
  }

  reset(): void {
    this.distinctId = null;
    // Generate new anonymous ID on next identify
  }

  async flush(): Promise<void> {
    if (!this.initialized || !this.apiKey || this.queue.length === 0) return;

    const events = [...this.queue];
    this.queue = [];

    for (const event of events) {
      this.track(event);
    }
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  private sendToPostHog(
    eventName: string,
    properties: Record<string, unknown>
  ): void {
    if (!this.apiKey) return;

    const payload = {
      api_key: this.apiKey,
      event: eventName,
      properties: {
        distinct_id: this.distinctId || 'anonymous',
        ...properties,
      },
      timestamp: new Date().toISOString(),
    };

    // Use fetch for both web and React Native
    fetch(`${this.host}/capture/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }).catch((error) => {
      console.warn('[PostHog] Failed to send event:', error);
    });
  }
}
