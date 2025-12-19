/**
 * PostHog Feature Flag Provider
 * Uses PostHog for feature flags and A/B testing
 */

import type {
  FeatureFlagProvider,
  FeatureFlagProviderConfig,
  FeatureFlagUserContext,
  FeatureFlagName,
  FeatureFlag,
} from '../types';
import { DEFAULT_FLAGS } from '../types';

export class PostHogFeatureFlagProvider implements FeatureFlagProvider {
  name = 'posthog' as const;
  private apiKey: string | null = null;
  private host: string = 'https://app.posthog.com';
  private initialized = false;
  private flags: Map<FeatureFlagName, boolean> = new Map();
  private distinctId: string | null = null;
  private refreshPromise: Promise<void> | null = null;

  async initialize(
    config: FeatureFlagProviderConfig,
    context: FeatureFlagUserContext
  ): Promise<void> {
    if (!config.posthog?.apiKey) {
      console.warn('[PostHog FeatureFlags] No API key provided');
      return;
    }

    this.apiKey = config.posthog.apiKey;
    this.host = config.posthog.host || this.host;
    this.distinctId = context.userId || this.generateAnonymousId();

    // Fetch initial flags
    await this.fetchFlags(context);
    this.initialized = true;
  }

  isEnabled(flag: FeatureFlagName): boolean {
    const value = this.flags.get(flag);
    if (value !== undefined) {
      return value;
    }
    return DEFAULT_FLAGS[flag] ?? false;
  }

  getFlag(flag: FeatureFlagName): FeatureFlag | null {
    const enabled = this.flags.get(flag);
    if (enabled === undefined) return null;

    return {
      name: flag,
      enabled,
    };
  }

  getAllFlags(): Record<FeatureFlagName, boolean> {
    const result: Record<string, boolean> = {};
    for (const [name] of Object.entries(DEFAULT_FLAGS)) {
      result[name] = this.isEnabled(name as FeatureFlagName);
    }
    return result as Record<FeatureFlagName, boolean>;
  }

  async refresh(): Promise<void> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.fetchFlags({
      userId: this.distinctId || undefined,
      platform: 'web', // Will be overridden on actual refresh
      appVersion: '1.0.0',
    });

    try {
      await this.refreshPromise;
    } finally {
      this.refreshPromise = null;
    }
  }

  identify(context: FeatureFlagUserContext): void {
    this.distinctId = context.userId || this.distinctId;
    // Trigger a refresh with new user context
    this.fetchFlags(context).catch((err) => {
      console.warn(
        '[PostHog FeatureFlags] Failed to refresh on identify:',
        err
      );
    });
  }

  reset(): void {
    this.flags.clear();
    this.distinctId = this.generateAnonymousId();
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  private async fetchFlags(context: FeatureFlagUserContext): Promise<void> {
    if (!this.apiKey) return;

    try {
      const response = await fetch(`${this.host}/decide/?v=3`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: this.apiKey,
          distinct_id: this.distinctId,
          person_properties: {
            platform: context.platform,
            app_version: context.appVersion,
            ...context.properties,
          },
          groups: context.segments?.reduce(
            (acc, seg) => ({ ...acc, [seg]: true }),
            {}
          ),
        }),
      });

      if (!response.ok) {
        throw new Error(`PostHog decide API error: ${response.status}`);
      }

      const data = await response.json();

      // Update flags from response
      if (data.featureFlags) {
        for (const [key, value] of Object.entries(data.featureFlags)) {
          if (key in DEFAULT_FLAGS) {
            this.flags.set(key as FeatureFlagName, Boolean(value));
          }
        }
      }
    } catch (error) {
      console.warn('[PostHog FeatureFlags] Failed to fetch flags:', error);
      // Keep existing flags on error
    }
  }

  private generateAnonymousId(): string {
    return `anon_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}
