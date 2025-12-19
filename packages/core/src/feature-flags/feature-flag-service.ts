/**
 * Feature Flag Service - unified interface for feature flags
 */

import type {
  FeatureFlagServiceConfig,
  FeatureFlagProvider,
  FeatureFlagUserContext,
  FeatureFlagName,
  FeatureFlag,
  FeatureFlagOverrides,
  FlagEvaluationResult,
} from './types';
import { DEFAULT_FLAGS } from './types';
import { LocalFeatureFlagProvider } from './providers/local-provider';
import { PostHogFeatureFlagProvider } from './providers/posthog-provider';

const OVERRIDES_STORAGE_KEY = 'procrastinact_feature_flag_overrides';

export class FeatureFlagService {
  private provider: FeatureFlagProvider;
  private config: FeatureFlagServiceConfig;
  private overrides: Partial<Record<FeatureFlagName, boolean>> = {};
  private cache: Map<FeatureFlagName, { value: boolean; timestamp: number }> =
    new Map();
  private refreshTimer: ReturnType<typeof setInterval> | null = null;
  private isInitialized = false;
  private listeners: Set<(flags: Record<FeatureFlagName, boolean>) => void> =
    new Set();
  private storageAdapter: {
    get: (key: string) => Promise<string | null>;
    set: (key: string, value: string) => Promise<void>;
  } | null = null;

  constructor(config: FeatureFlagServiceConfig) {
    this.config = config;

    // Initialize appropriate provider
    switch (config.provider) {
      case 'posthog':
        this.provider = new PostHogFeatureFlagProvider();
        break;
      case 'local':
      default:
        this.provider = new LocalFeatureFlagProvider();
        break;
    }
  }

  /**
   * Initialize the feature flag service
   */
  async initialize(
    context: FeatureFlagUserContext,
    storageAdapter?: {
      get: (key: string) => Promise<string | null>;
      set: (key: string, value: string) => Promise<void>;
    }
  ): Promise<void> {
    if (this.isInitialized) return;

    this.storageAdapter = storageAdapter || null;

    // Load overrides from storage
    if (this.storageAdapter) {
      await this.loadOverrides();
    }

    // Initialize provider
    await this.provider.initialize(this.config.providerConfig, context);

    // Set up refresh interval
    if (this.config.refreshInterval && this.config.refreshInterval > 0) {
      this.refreshTimer = setInterval(() => {
        this.refresh();
      }, this.config.refreshInterval);
    }

    this.isInitialized = true;

    if (this.config.debug) {
      console.log(
        '[FeatureFlags] Initialized with provider:',
        this.provider.name
      );
      console.log('[FeatureFlags] Current flags:', this.getAllFlags());
    }
  }

  /**
   * Check if a feature is enabled
   */
  isEnabled(flag: FeatureFlagName): boolean {
    return this.evaluate(flag).value;
  }

  /**
   * Evaluate a flag with detailed result
   */
  evaluate(flag: FeatureFlagName): FlagEvaluationResult {
    // Check overrides first
    if (flag in this.overrides) {
      return {
        value: this.overrides[flag]!,
        source: 'override',
        reason: 'Developer override active',
      };
    }

    // Check cache
    if (this.config.cacheEnabled) {
      const cached = this.cache.get(flag);
      const cacheTTL = this.config.cacheTTL || 60000;
      if (cached && Date.now() - cached.timestamp < cacheTTL) {
        return {
          value: cached.value,
          source: 'cache',
        };
      }
    }

    // Check provider
    if (this.provider.isInitialized()) {
      const value = this.provider.isEnabled(flag);

      // Update cache
      if (this.config.cacheEnabled) {
        this.cache.set(flag, { value, timestamp: Date.now() });
      }

      return {
        value,
        source: 'provider',
      };
    }

    // Fall back to defaults
    const defaultValue =
      this.config.defaultFlags?.[flag] ?? DEFAULT_FLAGS[flag] ?? false;
    return {
      value: defaultValue,
      source: 'default',
      reason: 'Provider not initialized, using default',
    };
  }

  /**
   * Get a specific flag configuration
   */
  getFlag(flag: FeatureFlagName): FeatureFlag | null {
    return this.provider.getFlag(flag);
  }

  /**
   * Get all flags
   */
  getAllFlags(): Record<FeatureFlagName, boolean> {
    const providerFlags = this.provider.getAllFlags();

    // Apply overrides
    return {
      ...providerFlags,
      ...this.overrides,
    } as Record<FeatureFlagName, boolean>;
  }

  /**
   * Set an override (for development)
   */
  async setOverride(flag: FeatureFlagName, value: boolean): Promise<void> {
    this.overrides[flag] = value;
    await this.saveOverrides();
    this.notifyListeners();

    if (this.config.debug) {
      console.log(`[FeatureFlags] Override set: ${flag} = ${value}`);
    }
  }

  /**
   * Remove an override
   */
  async removeOverride(flag: FeatureFlagName): Promise<void> {
    delete this.overrides[flag];
    await this.saveOverrides();
    this.notifyListeners();
  }

  /**
   * Clear all overrides
   */
  async clearOverrides(): Promise<void> {
    this.overrides = {};
    await this.saveOverrides();
    this.notifyListeners();
  }

  /**
   * Get current overrides
   */
  getOverrides(): FeatureFlagOverrides {
    return {
      overrides: { ...this.overrides },
      persistOverrides: true,
    };
  }

  /**
   * Identify a user for targeting
   */
  identify(context: FeatureFlagUserContext): void {
    this.provider.identify(context);
    this.cache.clear(); // Clear cache on user change
  }

  /**
   * Refresh flags from provider
   */
  async refresh(): Promise<void> {
    await this.provider.refresh();
    this.cache.clear();
    this.notifyListeners();

    if (this.config.debug) {
      console.log('[FeatureFlags] Refreshed flags:', this.getAllFlags());
    }
  }

  /**
   * Reset to defaults
   */
  reset(): void {
    this.provider.reset();
    this.cache.clear();
    this.notifyListeners();
  }

  /**
   * Subscribe to flag changes
   */
  subscribe(
    listener: (flags: Record<FeatureFlagName, boolean>) => void
  ): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Shutdown the service
   */
  shutdown(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
    this.listeners.clear();
    this.cache.clear();
    this.isInitialized = false;
  }

  /**
   * Check if service is ready
   */
  isReady(): boolean {
    return this.isInitialized && this.provider.isInitialized();
  }

  private async loadOverrides(): Promise<void> {
    if (!this.storageAdapter) return;

    try {
      const stored = await this.storageAdapter.get(OVERRIDES_STORAGE_KEY);
      if (stored) {
        this.overrides = JSON.parse(stored);
      }
    } catch {
      // Ignore errors
    }
  }

  private async saveOverrides(): Promise<void> {
    if (!this.storageAdapter) return;

    try {
      await this.storageAdapter.set(
        OVERRIDES_STORAGE_KEY,
        JSON.stringify(this.overrides)
      );
    } catch {
      // Ignore errors
    }
  }

  private notifyListeners(): void {
    const flags = this.getAllFlags();
    this.listeners.forEach((listener) => listener(flags));
  }
}
