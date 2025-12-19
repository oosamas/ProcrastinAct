/**
 * Feature Flag Types
 */

// All feature flags in the app
export type FeatureFlagName =
  // Core features
  | 'task_shrinking'
  | 'voice_input'
  | 'permission_to_stop'
  | 'celebration_animations'
  // Timer features
  | 'ambient_timer'
  | 'break_reminders'
  | 'time_blocks'
  // Gamification
  | 'streaks'
  | 'achievements'
  | 'daily_challenges'
  | 'points_system'
  // Social
  | 'body_doubling'
  | 'accountability_partners'
  | 'share_achievements'
  // AI features
  | 'smart_suggestions'
  | 'encouragement_ai'
  | 'pattern_detection'
  // Platform features
  | 'widgets'
  | 'watch_app'
  | 'siri_shortcuts'
  // Monetization
  | 'donation_flow'
  | 'premium_features'
  // Experimental
  | 'new_onboarding'
  | 'redesigned_timer'
  | 'v2_navigation';

// Flag configuration
export interface FeatureFlag {
  name: FeatureFlagName;
  enabled: boolean;
  rolloutPercentage?: number;
  userSegments?: string[];
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// User context for targeting
export interface FeatureFlagUserContext {
  userId?: string;
  email?: string;
  platform: 'ios' | 'android' | 'web';
  appVersion: string;
  segments?: string[];
  properties?: Record<string, unknown>;
}

// Feature flag provider configuration
export interface FeatureFlagProviderConfig {
  posthog?: {
    apiKey: string;
    host?: string;
  };
  launchDarkly?: {
    sdkKey: string;
    mobileKey?: string;
  };
  local?: {
    flags: Record<FeatureFlagName, boolean | FeatureFlag>;
  };
}

// Service configuration
export interface FeatureFlagServiceConfig {
  provider: 'posthog' | 'launchdarkly' | 'local';
  providerConfig: FeatureFlagProviderConfig;
  defaultFlags?: Partial<Record<FeatureFlagName, boolean>>;
  refreshInterval?: number; // ms
  cacheEnabled?: boolean;
  cacheTTL?: number; // ms
  debug?: boolean;
}

// Provider interface
export interface FeatureFlagProvider {
  name: string;
  initialize(
    config: FeatureFlagProviderConfig,
    context: FeatureFlagUserContext
  ): Promise<void>;
  isEnabled(flag: FeatureFlagName): boolean;
  getFlag(flag: FeatureFlagName): FeatureFlag | null;
  getAllFlags(): Record<FeatureFlagName, boolean>;
  refresh(): Promise<void>;
  identify(context: FeatureFlagUserContext): void;
  reset(): void;
  isInitialized(): boolean;
}

// Override configuration for development
export interface FeatureFlagOverrides {
  overrides: Partial<Record<FeatureFlagName, boolean>>;
  persistOverrides: boolean;
}

// Flag evaluation result
export interface FlagEvaluationResult {
  value: boolean;
  source: 'provider' | 'override' | 'default' | 'cache';
  reason?: string;
}

// Default flag values (conservative defaults)
export const DEFAULT_FLAGS: Record<FeatureFlagName, boolean> = {
  // Core features - enabled by default
  task_shrinking: true,
  voice_input: true,
  permission_to_stop: true,
  celebration_animations: true,
  // Timer features
  ambient_timer: true,
  break_reminders: true,
  time_blocks: false,
  // Gamification
  streaks: true,
  achievements: true,
  daily_challenges: false,
  points_system: false,
  // Social
  body_doubling: false,
  accountability_partners: false,
  share_achievements: false,
  // AI features
  smart_suggestions: true,
  encouragement_ai: true,
  pattern_detection: false,
  // Platform features
  widgets: false,
  watch_app: false,
  siri_shortcuts: false,
  // Monetization
  donation_flow: true,
  premium_features: false,
  // Experimental
  new_onboarding: false,
  redesigned_timer: false,
  v2_navigation: false,
};
