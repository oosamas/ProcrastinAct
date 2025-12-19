/**
 * Local Feature Flag Provider
 * For development and offline scenarios
 */

import type {
  FeatureFlagProvider,
  FeatureFlagProviderConfig,
  FeatureFlagUserContext,
  FeatureFlagName,
  FeatureFlag,
} from '../types';
import { DEFAULT_FLAGS } from '../types';

export class LocalFeatureFlagProvider implements FeatureFlagProvider {
  name = 'local' as const;
  private flags: Map<FeatureFlagName, FeatureFlag> = new Map();
  private initialized = false;

  async initialize(
    config: FeatureFlagProviderConfig,
    _context: FeatureFlagUserContext
  ): Promise<void> {
    // Initialize with local config or defaults
    const localFlags = config.local?.flags;

    for (const [name, value] of Object.entries(DEFAULT_FLAGS)) {
      const flagName = name as FeatureFlagName;
      const configValue = localFlags?.[flagName];

      if (typeof configValue === 'boolean') {
        this.flags.set(flagName, {
          name: flagName,
          enabled: configValue,
        });
      } else if (configValue && typeof configValue === 'object') {
        this.flags.set(flagName, configValue as FeatureFlag);
      } else {
        this.flags.set(flagName, {
          name: flagName,
          enabled: value,
        });
      }
    }

    this.initialized = true;
  }

  isEnabled(flag: FeatureFlagName): boolean {
    const flagConfig = this.flags.get(flag);
    if (!flagConfig) {
      return DEFAULT_FLAGS[flag] ?? false;
    }

    // Check rollout percentage if configured
    if (
      flagConfig.rolloutPercentage !== undefined &&
      flagConfig.rolloutPercentage < 100
    ) {
      // Use consistent hashing based on flag name for stability
      const hash = this.hashString(flag);
      const percentage = hash % 100;
      return percentage < flagConfig.rolloutPercentage;
    }

    return flagConfig.enabled;
  }

  getFlag(flag: FeatureFlagName): FeatureFlag | null {
    return this.flags.get(flag) || null;
  }

  getAllFlags(): Record<FeatureFlagName, boolean> {
    const result: Record<string, boolean> = {};
    for (const [name] of Object.entries(DEFAULT_FLAGS)) {
      result[name] = this.isEnabled(name as FeatureFlagName);
    }
    return result as Record<FeatureFlagName, boolean>;
  }

  async refresh(): Promise<void> {
    // Local provider doesn't need refresh
  }

  identify(_context: FeatureFlagUserContext): void {
    // Local provider doesn't need user identification
  }

  reset(): void {
    // Reset to defaults
    for (const [name, value] of Object.entries(DEFAULT_FLAGS)) {
      this.flags.set(name as FeatureFlagName, {
        name: name as FeatureFlagName,
        enabled: value,
      });
    }
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  // Local-only methods for development
  setFlag(flag: FeatureFlagName, enabled: boolean): void {
    this.flags.set(flag, {
      name: flag,
      enabled,
      updatedAt: new Date(),
    });
  }

  setRolloutPercentage(flag: FeatureFlagName, percentage: number): void {
    const existing = this.flags.get(flag);
    this.flags.set(flag, {
      ...existing,
      name: flag,
      enabled: existing?.enabled ?? DEFAULT_FLAGS[flag],
      rolloutPercentage: Math.min(100, Math.max(0, percentage)),
      updatedAt: new Date(),
    });
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }
}
