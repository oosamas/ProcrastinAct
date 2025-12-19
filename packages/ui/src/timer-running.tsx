'use client';

import { type CSSProperties, useState, useCallback, useMemo } from 'react';
import {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
  shadowsDark,
  animation,
  touchTarget,
  zIndex,
} from './tokens';

interface TimerRunningProps {
  /** Total duration in seconds */
  totalSeconds: number;
  /** Remaining time in seconds */
  remainingSeconds: number;
  /** Whether timer is paused */
  isPaused: boolean;
  /** Callback when pause/resume is clicked */
  onTogglePause: () => void;
  /** Callback when end early is clicked */
  onEndEarly: () => void;
  /** Callback when extend time is clicked (adds 5 minutes) */
  onExtend: () => void;
  /** Hide numbers and show ambient mode only */
  ambientOnly?: boolean;
  /** Toggle between ambient and number mode */
  onToggleAmbient?: () => void;
  /** Whether in minimized state */
  minimized?: boolean;
  /** Callback to toggle minimized state */
  onToggleMinimized?: () => void;
  /** Enable haptic feedback */
  hapticFeedback?: boolean;
  /** Dark mode */
  darkMode?: boolean;
  /** Custom style */
  style?: CSSProperties;
}

// Format seconds to MM:SS or HH:MM:SS
function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function TimerRunning({
  totalSeconds,
  remainingSeconds,
  isPaused,
  onTogglePause,
  onEndEarly,
  onExtend,
  ambientOnly = false,
  onToggleAmbient,
  minimized = false,
  onToggleMinimized,
  hapticFeedback = true,
  darkMode = false,
  style,
}: TimerRunningProps) {
  // Calculate progress percentage
  const progressPercent = useMemo(() => {
    if (totalSeconds === 0) return 0;
    return ((totalSeconds - remainingSeconds) / totalSeconds) * 100;
  }, [totalSeconds, remainingSeconds]);

  // Calculate remaining percentage for ambient color
  const remainingPercent = useMemo(() => {
    if (totalSeconds === 0) return 100;
    return (remainingSeconds / totalSeconds) * 100;
  }, [totalSeconds, remainingSeconds]);

  const triggerHaptic = useCallback(
    (pattern: number | number[]) => {
      if (
        hapticFeedback &&
        typeof navigator !== 'undefined' &&
        'vibrate' in navigator
      ) {
        navigator.vibrate(pattern);
      }
    },
    [hapticFeedback]
  );

  const handlePauseResume = useCallback(() => {
    triggerHaptic(isPaused ? [20, 30, 20] : 20);
    onTogglePause();
  }, [isPaused, onTogglePause, triggerHaptic]);

  const handleEndEarly = useCallback(() => {
    triggerHaptic([30, 50, 30]);
    onEndEarly();
  }, [onEndEarly, triggerHaptic]);

  const handleExtend = useCallback(() => {
    triggerHaptic([20, 30, 20]);
    onExtend();
  }, [onExtend, triggerHaptic]);

  const handleToggleMinimized = useCallback(() => {
    triggerHaptic(10);
    onToggleMinimized?.();
  }, [onToggleMinimized, triggerHaptic]);

  // Minimized floating timer
  if (minimized) {
    const minimizedStyle: CSSProperties = {
      position: 'fixed',
      bottom: spacing[24], // Above tab bar
      right: spacing[4],
      display: 'flex',
      alignItems: 'center',
      gap: spacing[2],
      padding: `${spacing[3]}px ${spacing[4]}px`,
      backgroundColor: darkMode ? colors.surface.dark : colors.surface.light,
      borderRadius: borderRadius.full,
      boxShadow: darkMode ? shadowsDark.lg : shadows.lg,
      zIndex: zIndex.sticky,
      cursor: 'pointer',
      WebkitTapHighlightColor: 'transparent',
      touchAction: 'manipulation',
      ...style,
    };

    const minimizedTimeStyle: CSSProperties = {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.bold,
      fontFamily: typography.fontFamily.mono,
      color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
    };

    const minimizedProgressStyle: CSSProperties = {
      width: 32,
      height: 32,
      borderRadius: borderRadius.full,
      background: `conic-gradient(${colors.primary[500]} ${progressPercent}%, ${
        darkMode ? colors.neutral[700] : colors.neutral[200]
      } 0%)`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    };

    const minimizedInnerStyle: CSSProperties = {
      width: 24,
      height: 24,
      borderRadius: borderRadius.full,
      backgroundColor: darkMode ? colors.surface.dark : colors.surface.light,
    };

    return (
      <button
        style={minimizedStyle}
        onClick={handleToggleMinimized}
        aria-label={`Timer: ${formatTime(remainingSeconds)} remaining. Click to expand.`}
        type="button"
      >
        <div style={minimizedProgressStyle}>
          <div style={minimizedInnerStyle} />
        </div>
        <span style={minimizedTimeStyle}>{formatTime(remainingSeconds)}</span>
        {isPaused && (
          <svg width="16" height="16" viewBox="0 0 24 24" fill={colors.warning}>
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
          </svg>
        )}
      </button>
    );
  }

  // Full timer UI
  const containerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[6],
    minHeight: 300,
    ...style,
  };

  const timeDisplayStyle: CSSProperties = {
    fontSize: ambientOnly ? 0 : typography.fontSize['8xl'],
    fontWeight: typography.fontWeight.light,
    fontFamily: typography.fontFamily.mono,
    color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
    letterSpacing: -2,
    lineHeight: 1,
    marginBottom: spacing[6],
    opacity: ambientOnly ? 0 : 1,
    height: ambientOnly ? 0 : 'auto',
    overflow: 'hidden',
    transition: `all ${animation.duration.normal}ms ${animation.easing.easeOut}`,
  };

  // Circular progress indicator
  const progressSize = 200;
  const strokeWidth = 8;
  const radius = (progressSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progressPercent / 100);

  const progressContainerStyle: CSSProperties = {
    position: 'relative',
    width: progressSize,
    height: progressSize,
    marginBottom: spacing[6],
  };

  const progressBackgroundStyle: CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: progressSize,
    height: progressSize,
  };

  const progressForegroundStyle: CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: progressSize,
    height: progressSize,
    transform: 'rotate(-90deg)',
  };

  const controlsStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[4],
    flexWrap: 'wrap',
    marginTop: spacing[4],
  };

  const primaryButtonStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: touchTarget.comfortable,
    height: touchTarget.comfortable,
    backgroundColor: isPaused ? colors.primary[500] : colors.neutral[200],
    color: isPaused ? 'white' : colors.neutral[700],
    border: 'none',
    borderRadius: borderRadius.full,
    cursor: 'pointer',
    boxShadow: darkMode ? shadowsDark.md : shadows.md,
    transition: `all ${animation.duration.fast}ms ${animation.easing.easeOut}`,
    WebkitTapHighlightColor: 'transparent',
    touchAction: 'manipulation',
  };

  const secondaryButtonStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: `${spacing[2]}px ${spacing[4]}px`,
    minHeight: touchTarget.minimum,
    backgroundColor: 'transparent',
    color: darkMode ? colors.text.secondary.dark : colors.text.secondary.light,
    border: `1px solid ${darkMode ? colors.neutral[600] : colors.neutral[300]}`,
    borderRadius: borderRadius.lg,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.sans,
    cursor: 'pointer',
    transition: `all ${animation.duration.fast}ms`,
    WebkitTapHighlightColor: 'transparent',
    touchAction: 'manipulation',
  };

  const iconButtonStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: touchTarget.minimum,
    height: touchTarget.minimum,
    backgroundColor: 'transparent',
    color: darkMode ? colors.text.secondary.dark : colors.text.secondary.light,
    border: 'none',
    borderRadius: borderRadius.full,
    cursor: 'pointer',
    transition: `all ${animation.duration.fast}ms`,
    WebkitTapHighlightColor: 'transparent',
    touchAction: 'manipulation',
  };

  return (
    <div style={containerStyle}>
      {/* Progress ring */}
      <div style={progressContainerStyle}>
        <svg
          style={progressBackgroundStyle}
          viewBox={`0 0 ${progressSize} ${progressSize}`}
        >
          <circle
            cx={progressSize / 2}
            cy={progressSize / 2}
            r={radius}
            fill="none"
            stroke={darkMode ? colors.neutral[700] : colors.neutral[200]}
            strokeWidth={strokeWidth}
          />
        </svg>
        <svg
          style={progressForegroundStyle}
          viewBox={`0 0 ${progressSize} ${progressSize}`}
        >
          <circle
            cx={progressSize / 2}
            cy={progressSize / 2}
            r={radius}
            fill="none"
            stroke={colors.primary[500]}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{
              transition: `stroke-dashoffset ${animation.duration.slow}ms ${animation.easing.easeOut}`,
            }}
          />
        </svg>

        {/* Time display in center */}
        {!ambientOnly && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
            }}
          >
            <div style={timeDisplayStyle}>{formatTime(remainingSeconds)}</div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div style={controlsStyle}>
        {/* Extend (+5 min) */}
        <button
          style={secondaryButtonStyle}
          onClick={handleExtend}
          aria-label="Extend timer by 5 minutes"
          type="button"
        >
          +5 min
        </button>

        {/* Pause/Resume */}
        <button
          style={primaryButtonStyle}
          onClick={handlePauseResume}
          aria-label={isPaused ? 'Resume timer' : 'Pause timer'}
          type="button"
        >
          {isPaused ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          )}
        </button>

        {/* End early (no guilt messaging) */}
        <button
          style={secondaryButtonStyle}
          onClick={handleEndEarly}
          aria-label="End timer early"
          type="button"
        >
          Done for now
        </button>
      </div>

      {/* Bottom actions */}
      <div
        style={{
          display: 'flex',
          gap: spacing[4],
          marginTop: spacing[6],
        }}
      >
        {/* Toggle ambient mode */}
        {onToggleAmbient && (
          <button
            style={iconButtonStyle}
            onClick={() => {
              triggerHaptic(10);
              onToggleAmbient();
            }}
            aria-label={ambientOnly ? 'Show time' : 'Hide time'}
            type="button"
          >
            {ambientOnly ? (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
              </svg>
            ) : (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" />
              </svg>
            )}
          </button>
        )}

        {/* Minimize */}
        {onToggleMinimized && (
          <button
            style={iconButtonStyle}
            onClick={handleToggleMinimized}
            aria-label="Minimize timer"
            type="button"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13H5v-2h14v2z" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
