'use client';

import {
  type ReactNode,
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';

// ============================================================================
// HAPTIC PATTERNS
// ============================================================================

/**
 * Predefined haptic patterns for consistent tactile language
 */
export const HapticPatterns = {
  // Basic feedback
  light: 10, // Light tap
  medium: 20, // Medium tap
  heavy: 40, // Strong tap

  // UI interactions
  tap: 10, // Button tap
  selection: 15, // Item selection
  toggle: [10, 20, 10], // Toggle switch

  // Confirmations
  success: [30, 50, 100], // Task completion
  warning: [50, 50, 50], // Warning notification
  error: [100, 50, 100, 50, 100], // Error feedback

  // Timer
  timerStart: [20, 30, 20], // Timer started
  timerPause: 20, // Timer paused
  timerResume: [20, 30, 20], // Timer resumed
  timerComplete: [50, 50, 100, 50, 50], // Timer finished

  // Task management
  taskComplete: [50, 30, 100], // Task marked complete
  taskShrink: [20, 40, 20], // Task shrunk/simplified
  taskAdd: [15, 30], // Task added

  // Navigation
  tabChange: 10, // Tab switch
  swipe: 15, // Swipe gesture
  back: 10, // Back navigation

  // Special
  celebration: [50, 50, 100, 50, 50], // Celebration/achievement
  rest: [30, 50, 30], // Taking a break
  gentle: [10, 30, 10], // Gentle reminder
} as const;

export type HapticPattern = keyof typeof HapticPatterns;

// ============================================================================
// HAPTIC INTENSITY
// ============================================================================

export type HapticIntensity = 'off' | 'light' | 'normal' | 'strong';

// Intensity multipliers
const intensityMultipliers: Record<HapticIntensity, number> = {
  off: 0,
  light: 0.5,
  normal: 1,
  strong: 1.5,
};

// ============================================================================
// HAPTIC CONTEXT
// ============================================================================

interface HapticContextValue {
  /** Whether haptics are available */
  available: boolean;
  /** Whether haptics are enabled */
  enabled: boolean;
  /** Current intensity setting */
  intensity: HapticIntensity;
  /** Set intensity */
  setIntensity: (intensity: HapticIntensity) => void;
  /** Enable/disable haptics */
  setEnabled: (enabled: boolean) => void;
  /** Trigger a haptic pattern */
  trigger: (
    pattern: HapticPattern | number | number[] | readonly number[]
  ) => void;
}

const HapticContext = createContext<HapticContextValue>({
  available: false,
  enabled: true,
  intensity: 'normal',
  setIntensity: () => {},
  setEnabled: () => {},
  trigger: () => {},
});

// Storage keys
const ENABLED_KEY = 'procrastinact-haptics-enabled';
const INTENSITY_KEY = 'procrastinact-haptics-intensity';

interface HapticProviderProps {
  children: ReactNode;
  /** Default intensity */
  defaultIntensity?: HapticIntensity;
}

export function HapticProvider({
  children,
  defaultIntensity = 'normal',
}: HapticProviderProps) {
  const [available, setAvailable] = useState(false);
  const [enabled, setEnabledState] = useState(true);
  const [intensity, setIntensityState] =
    useState<HapticIntensity>(defaultIntensity);

  // Check for vibration API support
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      setAvailable(true);
    }
  }, []);

  // Load settings from storage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const storedEnabled = localStorage.getItem(ENABLED_KEY);
      if (storedEnabled !== null) {
        setEnabledState(storedEnabled === 'true');
      }

      const storedIntensity = localStorage.getItem(INTENSITY_KEY);
      if (
        storedIntensity === 'off' ||
        storedIntensity === 'light' ||
        storedIntensity === 'normal' ||
        storedIntensity === 'strong'
      ) {
        setIntensityState(storedIntensity);
      }
    } catch {
      // localStorage might not be available
    }
  }, []);

  // Set enabled
  const setEnabled = useCallback((value: boolean) => {
    setEnabledState(value);
    try {
      localStorage.setItem(ENABLED_KEY, String(value));
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Set intensity
  const setIntensity = useCallback((value: HapticIntensity) => {
    setIntensityState(value);
    try {
      localStorage.setItem(INTENSITY_KEY, value);
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Trigger haptic feedback
  const trigger = useCallback(
    (pattern: HapticPattern | number | number[] | readonly number[]) => {
      if (!available || !enabled || intensity === 'off') return;

      const multiplier = intensityMultipliers[intensity];
      if (multiplier === 0) return;

      // Get the pattern values
      let values: number | readonly number[];
      if (typeof pattern === 'string') {
        values = HapticPatterns[pattern];
      } else {
        values = pattern;
      }

      // Apply intensity multiplier
      let finalPattern: number | number[];
      if (typeof values === 'number') {
        finalPattern = Math.round(values * multiplier);
      } else {
        finalPattern = [...values].map((v) => Math.round(v * multiplier));
      }

      // Trigger vibration
      try {
        navigator.vibrate(finalPattern);
      } catch {
        // Vibration might fail on some devices
      }
    },
    [available, enabled, intensity]
  );

  const value = useMemo(
    () => ({
      available,
      enabled,
      intensity,
      setIntensity,
      setEnabled,
      trigger,
    }),
    [available, enabled, intensity, setIntensity, setEnabled, trigger]
  );

  return (
    <HapticContext.Provider value={value}>{children}</HapticContext.Provider>
  );
}

// Hook to use haptics
export function useHaptics(): HapticContextValue {
  return useContext(HapticContext);
}

// ============================================================================
// HAPTIC BUTTON WRAPPER
// ============================================================================

interface WithHapticProps {
  children: ReactNode;
  /** Pattern to trigger on interaction */
  pattern?: HapticPattern;
  /** Custom pattern (ms values) */
  customPattern?: number | number[];
  /** Disable haptic for this element */
  disabled?: boolean;
}

/**
 * HOC to add haptic feedback to children
 * Wraps onClick handlers with haptic trigger
 */
export function WithHaptic({
  children,
  pattern = 'tap',
  customPattern,
  disabled = false,
}: WithHapticProps) {
  const { trigger } = useHaptics();

  const handleInteraction = useCallback(() => {
    if (disabled) return;
    trigger(customPattern ?? pattern);
  }, [disabled, trigger, customPattern, pattern]);

  // Clone children and inject haptic handler
  // This is a simplified implementation - in production,
  // you'd want to handle this more robustly
  return (
    <span
      onClick={handleInteraction}
      onTouchStart={handleInteraction}
      style={{ display: 'contents' }}
    >
      {children}
    </span>
  );
}

// ============================================================================
// HAPTIC SETTINGS COMPONENT
// ============================================================================

interface HapticSettingsProps {
  darkMode?: boolean;
}

/**
 * Settings UI for haptic preferences
 */
export function HapticSettings({ darkMode = false }: HapticSettingsProps) {
  const { available, enabled, intensity, setEnabled, setIntensity, trigger } =
    useHaptics();

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 16,
    padding: 16,
  };

  const rowStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 0',
    borderBottom: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
  };

  const labelStyle = {
    fontSize: 16,
    fontWeight: 500,
    color: darkMode ? '#f1f5f9' : '#1f2937',
  };

  const descriptionStyle = {
    fontSize: 14,
    color: darkMode ? '#94a3b8' : '#6b7280',
    marginTop: 4,
  };

  const intensityOptions: { value: HapticIntensity; label: string }[] = [
    { value: 'off', label: 'Off' },
    { value: 'light', label: 'Light' },
    { value: 'normal', label: 'Normal' },
    { value: 'strong', label: 'Strong' },
  ];

  if (!available) {
    return (
      <div style={containerStyle}>
        <p style={{ color: darkMode ? '#94a3b8' : '#6b7280' }}>
          Haptic feedback is not available on this device.
        </p>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      {/* Enable/disable toggle */}
      <div style={rowStyle}>
        <div>
          <div style={labelStyle}>Haptic Feedback</div>
          <div style={descriptionStyle}>Tactile feedback for interactions</div>
        </div>
        <button
          onClick={() => {
            setEnabled(!enabled);
            if (!enabled) trigger('toggle');
          }}
          style={{
            padding: '8px 16px',
            backgroundColor: enabled
              ? '#6366f1'
              : darkMode
                ? '#374151'
                : '#e5e7eb',
            color: enabled ? 'white' : darkMode ? '#9ca3af' : '#6b7280',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
            fontWeight: 500,
          }}
          type="button"
        >
          {enabled ? 'On' : 'Off'}
        </button>
      </div>

      {/* Intensity selector */}
      {enabled && (
        <div style={rowStyle}>
          <div>
            <div style={labelStyle}>Intensity</div>
            <div style={descriptionStyle}>How strong the feedback feels</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {intensityOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setIntensity(option.value);
                  if (option.value !== 'off') trigger('selection');
                }}
                style={{
                  padding: '6px 12px',
                  backgroundColor:
                    intensity === option.value
                      ? '#6366f1'
                      : darkMode
                        ? '#374151'
                        : '#f3f4f6',
                  color:
                    intensity === option.value
                      ? 'white'
                      : darkMode
                        ? '#d1d5db'
                        : '#4b5563',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 500,
                }}
                type="button"
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Test button */}
      {enabled && intensity !== 'off' && (
        <button
          onClick={() => trigger('celebration')}
          style={{
            marginTop: 8,
            padding: '12px 24px',
            backgroundColor: darkMode ? '#374151' : '#f3f4f6',
            color: darkMode ? '#f1f5f9' : '#1f2937',
            border: `1px solid ${darkMode ? '#4b5563' : '#e5e7eb'}`,
            borderRadius: 8,
            cursor: 'pointer',
            fontWeight: 500,
          }}
          type="button"
        >
          Test Haptic Feedback
        </button>
      )}
    </div>
  );
}

// Export context
export { HapticContext };
