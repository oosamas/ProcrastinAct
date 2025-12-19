/**
 * Sentry Error Tracking Adapter
 * Performance monitoring and crash reporting
 */

import type {
  ErrorTrackingAdapter,
  AnalyticsProviderConfig,
  ErrorContext,
  Breadcrumb,
} from '../types';

export class SentryAdapter implements ErrorTrackingAdapter {
  name = 'sentry' as const;
  private dsn: string | null = null;
  private environment: string = 'production';
  private initialized = false;
  private breadcrumbs: Breadcrumb[] = [];
  private maxBreadcrumbs = 100;
  private user: { id?: string; email?: string } | null = null;
  private contexts: Map<string, Record<string, unknown>> = new Map();

  async initialize(config: AnalyticsProviderConfig): Promise<void> {
    if (!config.sentry?.dsn) {
      console.warn('[Sentry] No DSN provided, error tracking disabled');
      return;
    }

    this.dsn = config.sentry.dsn;
    this.environment = config.sentry.environment || 'production';
    this.initialized = true;

    // In production, this would initialize the actual Sentry SDK
    // For now, we implement a lightweight version
  }

  captureError(context: ErrorContext): void {
    if (!this.initialized || !this.dsn) {
      console.error(
        '[Sentry] Error captured but not initialized:',
        context.error
      );
      return;
    }

    const payload = this.buildErrorPayload(context);
    this.sendToSentry('error', payload);
  }

  captureMessage(message: string, level: 'info' | 'warning' | 'error'): void {
    if (!this.initialized || !this.dsn) return;

    const payload = {
      message,
      level,
      timestamp: new Date().toISOString(),
      breadcrumbs: this.breadcrumbs.slice(-20),
      user: this.user,
      contexts: Object.fromEntries(this.contexts),
    };

    this.sendToSentry('message', payload);
  }

  addBreadcrumb(breadcrumb: Breadcrumb): void {
    this.breadcrumbs.push(breadcrumb);

    // Keep only the last N breadcrumbs
    if (this.breadcrumbs.length > this.maxBreadcrumbs) {
      this.breadcrumbs = this.breadcrumbs.slice(-this.maxBreadcrumbs);
    }
  }

  setUser(user: { id?: string; email?: string } | null): void {
    this.user = user;
  }

  setContext(name: string, context: Record<string, unknown>): void {
    this.contexts.set(name, context);
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  private buildErrorPayload(context: ErrorContext) {
    return {
      exception: {
        type: context.error.name,
        value: context.error.message,
        stacktrace: context.error.stack,
      },
      componentStack: context.componentStack,
      breadcrumbs: context.breadcrumbs || this.breadcrumbs.slice(-20),
      tags: context.tags,
      extra: context.extra,
      user: context.user || this.user,
      contexts: Object.fromEntries(this.contexts),
      environment: this.environment,
      timestamp: new Date().toISOString(),
    };
  }

  private sendToSentry(
    type: 'error' | 'message',
    payload: Record<string, unknown>
  ): void {
    if (!this.dsn) return;

    // Parse DSN to get project info
    const dsnMatch = this.dsn.match(
      /https:\/\/(.+)@(.+)\.ingest\.sentry\.io\/(.+)/
    );
    if (!dsnMatch) {
      console.warn('[Sentry] Invalid DSN format');
      return;
    }

    const [, publicKey, , projectId] = dsnMatch;
    const endpoint = `https://sentry.io/api/${projectId}/store/`;

    fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Sentry-Auth': `Sentry sentry_version=7, sentry_key=${publicKey}`,
      },
      body: JSON.stringify({
        ...payload,
        platform: 'javascript',
        sdk: {
          name: 'procrastinact-sentry',
          version: '1.0.0',
        },
      }),
    }).catch((error) => {
      console.warn('[Sentry] Failed to send event:', error);
    });
  }
}
