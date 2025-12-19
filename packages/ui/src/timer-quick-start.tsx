'use client';

import { type CSSProperties, useState, useCallback, useEffect } from 'react';
import {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
  shadowsDark,
  animation,
  touchTarget,
} from './tokens';

interface TimerQuickStartProps {
  /** Callback when timer is started */
  onStart: (minutes: number) => void;
  /** Last used duration in minutes */
  lastUsedMinutes?: number;
  /** Custom preset durations in minutes */
  presets?: number[];
  /** Whether dark mode is enabled */
  darkMode?: boolean;
  /** Enable haptic feedback */
  hapticFeedback?: boolean;
  /** Custom style overrides */
  style?: CSSProperties;
}

// Default preset durations (in minutes)
const DEFAULT_PRESETS = [5, 15, 25, 45];

// Custom duration picker options
const CUSTOM_DURATIONS = [
  { label: '10m', minutes: 10 },
  { label: '20m', minutes: 20 },
  { label: '30m', minutes: 30 },
  { label: '60m', minutes: 60 },
  { label: '90m', minutes: 90 },
];

export function TimerQuickStart({
  onStart,
  lastUsedMinutes,
  presets = DEFAULT_PRESETS,
  darkMode = false,
  hapticFeedback = true,
  style,
}: TimerQuickStartProps) {
  const [showCustom, setShowCustom] = useState(false);
  const [startedDuration, setStartedDuration] = useState<number | null>(null);

  // Show visual confirmation briefly
  useEffect(() => {
    if (startedDuration !== null) {
      const timer = setTimeout(() => {
        setStartedDuration(null);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [startedDuration]);

  const handleStart = useCallback(
    (minutes: number) => {
      // Haptic feedback
      if (
        hapticFeedback &&
        typeof navigator !== 'undefined' &&
        'vibrate' in navigator
      ) {
        navigator.vibrate([30, 50, 30]);
      }

      // Visual confirmation
      setStartedDuration(minutes);
      setShowCustom(false);

      // Start the timer
      onStart(minutes);
    },
    [hapticFeedback, onStart]
  );

  const handleToggleCustom = useCallback(() => {
    if (
      hapticFeedback &&
      typeof navigator !== 'undefined' &&
      'vibrate' in navigator
    ) {
      navigator.vibrate(10);
    }
    setShowCustom((prev) => !prev);
  }, [hapticFeedback]);

  const containerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing[4],
    padding: spacing[4],
    ...style,
  };

  const sectionTitleStyle: CSSProperties = {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    fontFamily: typography.fontFamily.sans,
    color: darkMode ? colors.text.secondary.dark : colors.text.secondary.light,
    marginBottom: spacing[2],
    textAlign: 'center',
  };

  const presetsContainerStyle: CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing[3],
  };

  const presetButtonStyle = (
    minutes: number,
    isLastUsed: boolean,
    isStarted: boolean
  ): CSSProperties => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: touchTarget.comfortable + spacing[4],
    height: touchTarget.comfortable + spacing[4],
    padding: spacing[3],
    backgroundColor: isStarted
      ? colors.success
      : isLastUsed
        ? colors.primary[500]
        : darkMode
          ? colors.neutral[700]
          : colors.neutral[100],
    color:
      isStarted || isLastUsed
        ? 'white'
        : darkMode
          ? colors.text.primary.dark
          : colors.text.primary.light,
    border: `2px solid ${
      isStarted
        ? colors.success
        : isLastUsed
          ? colors.primary[500]
          : darkMode
            ? colors.neutral[600]
            : colors.neutral[200]
    }`,
    borderRadius: borderRadius.xl,
    cursor: 'pointer',
    transition: `all ${animation.duration.fast}ms ${animation.easing.easeOut}`,
    boxShadow: darkMode ? shadowsDark.sm : shadows.sm,
    transform: isStarted ? 'scale(1.05)' : 'scale(1)',
    WebkitTapHighlightColor: 'transparent',
    touchAction: 'manipulation',
  });

  const presetValueStyle: CSSProperties = {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    fontFamily: typography.fontFamily.sans,
    lineHeight: 1,
  };

  const presetUnitStyle: CSSProperties = {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    fontFamily: typography.fontFamily.sans,
    marginTop: spacing[1],
    opacity: 0.8,
  };

  const customToggleStyle: CSSProperties = {
    padding: `${spacing[2]}px ${spacing[4]}px`,
    backgroundColor: 'transparent',
    color: darkMode ? colors.text.secondary.dark : colors.text.secondary.light,
    border: `1px dashed ${darkMode ? colors.neutral[600] : colors.neutral[300]}`,
    borderRadius: borderRadius.lg,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.sans,
    cursor: 'pointer',
    transition: `all ${animation.duration.fast}ms`,
    WebkitTapHighlightColor: 'transparent',
    touchAction: 'manipulation',
    alignSelf: 'center',
  };

  const customContainerStyle: CSSProperties = {
    display: showCustom ? 'flex' : 'none',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing[2],
    padding: spacing[3],
    backgroundColor: darkMode ? colors.neutral[800] : colors.neutral[50],
    borderRadius: borderRadius.lg,
    opacity: showCustom ? 1 : 0,
    transform: showCustom ? 'translateY(0)' : 'translateY(-10px)',
    transition: `all ${animation.duration.normal}ms ${animation.easing.easeOut}`,
  };

  const customButtonStyle = (isStarted: boolean): CSSProperties => ({
    padding: `${spacing[2]}px ${spacing[3]}px`,
    minWidth: touchTarget.minimum,
    minHeight: touchTarget.minimum,
    backgroundColor: isStarted
      ? colors.success
      : darkMode
        ? colors.neutral[700]
        : colors.surface.light,
    color: isStarted
      ? 'white'
      : darkMode
        ? colors.text.primary.dark
        : colors.text.primary.light,
    border: `1px solid ${
      isStarted
        ? colors.success
        : darkMode
          ? colors.neutral[600]
          : colors.neutral[200]
    }`,
    borderRadius: borderRadius.md,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    fontFamily: typography.fontFamily.sans,
    cursor: 'pointer',
    transition: `all ${animation.duration.fast}ms`,
    WebkitTapHighlightColor: 'transparent',
    touchAction: 'manipulation',
  });

  const confirmationStyle: CSSProperties = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: colors.success,
    color: 'white',
    padding: `${spacing[4]}px ${spacing[6]}px`,
    borderRadius: borderRadius.xl,
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    fontFamily: typography.fontFamily.sans,
    boxShadow: shadows.xl,
    zIndex: 9999,
    opacity: startedDuration !== null ? 1 : 0,
    visibility: startedDuration !== null ? 'visible' : 'hidden',
    transition: `all ${animation.duration.fast}ms`,
  };

  return (
    <div style={containerStyle}>
      {/* Last used indicator */}
      {lastUsedMinutes && (
        <p style={sectionTitleStyle}>Last: {lastUsedMinutes} min</p>
      )}

      {/* Preset buttons */}
      <div style={presetsContainerStyle}>
        {presets.map((minutes) => {
          const isLastUsed = minutes === lastUsedMinutes;
          const isStarted = minutes === startedDuration;

          return (
            <button
              key={minutes}
              style={presetButtonStyle(minutes, isLastUsed, isStarted)}
              onClick={() => handleStart(minutes)}
              aria-label={`Start ${minutes} minute timer`}
              type="button"
            >
              <span style={presetValueStyle}>{minutes}</span>
              <span style={presetUnitStyle}>min</span>
            </button>
          );
        })}
      </div>

      {/* Custom duration toggle */}
      <button
        style={customToggleStyle}
        onClick={handleToggleCustom}
        type="button"
      >
        {showCustom ? 'Hide custom' : 'Custom duration'}
      </button>

      {/* Custom duration options */}
      <div style={customContainerStyle}>
        {CUSTOM_DURATIONS.map(({ label, minutes }) => (
          <button
            key={minutes}
            style={customButtonStyle(minutes === startedDuration)}
            onClick={() => handleStart(minutes)}
            aria-label={`Start ${minutes} minute timer`}
            type="button"
          >
            {label}
          </button>
        ))}
      </div>

      {/* Visual confirmation overlay */}
      <div style={confirmationStyle} role="status" aria-live="polite">
        {startedDuration !== null && (
          <>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="currentColor"
              style={{ marginRight: spacing[2], verticalAlign: 'middle' }}
            >
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
            Timer started!
          </>
        )}
      </div>
    </div>
  );
}
