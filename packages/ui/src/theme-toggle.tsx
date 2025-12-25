'use client';

import { type CSSProperties, useCallback } from 'react';
import {
  colors,
  spacing,
  borderRadius,
  animation,
  touchTarget,
} from './tokens';
import { useTheme, type ThemeMode } from './theme-provider';

interface ThemeToggleProps {
  /** Show label next to icon */
  showLabel?: boolean;
  /** Compact mode (icon only, smaller) */
  compact?: boolean;
  /** Show all three options (light/dark/system) */
  showSystemOption?: boolean;
  /** Custom style */
  style?: CSSProperties;
}

export function ThemeToggle({
  showLabel = false,
  compact = false,
  showSystemOption = true,
  style,
}: ThemeToggleProps) {
  const { mode, setMode, isDark, toggleTheme } = useTheme();

  const handleToggle = useCallback(() => {
    // Haptic feedback
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(10);
    }

    if (showSystemOption) {
      // Cycle through: light → dark → system → light
      const nextMode: ThemeMode =
        mode === 'light' ? 'dark' : mode === 'dark' ? 'system' : 'light';
      setMode(nextMode);
    } else {
      toggleTheme();
    }
  }, [mode, setMode, showSystemOption, toggleTheme]);

  const buttonStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: compact ? 0 : spacing[2],
    minWidth: compact ? touchTarget.minimum : 'auto',
    minHeight: compact ? touchTarget.minimum : touchTarget.minimum,
    padding: compact ? spacing[2] : `${spacing[2]}px ${spacing[3]}px`,
    backgroundColor: isDark ? colors.neutral[700] : colors.neutral[100],
    color: isDark ? colors.text.primary.dark : colors.text.primary.light,
    border: `1px solid ${isDark ? colors.neutral[600] : colors.neutral[200]}`,
    borderRadius: compact ? borderRadius.full : borderRadius.lg,
    cursor: 'pointer',
    transition: `all ${animation.duration.fast}ms ${animation.easing.easeOut}`,
    WebkitTapHighlightColor: 'transparent',
    touchAction: 'manipulation',
    ...style,
  };

  const iconStyle: CSSProperties = {
    width: compact ? 20 : 24,
    height: compact ? 20 : 24,
    transition: `transform ${animation.duration.normal}ms ${animation.easing.easeOut}`,
  };

  const labelStyle: CSSProperties = {
    fontSize: 14,
    fontWeight: 500,
    textTransform: 'capitalize',
  };

  // Get current icon based on mode
  const getIcon = () => {
    if (mode === 'system') {
      // System/auto icon
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z" />
        </svg>
      );
    }

    if (isDark) {
      // Moon icon
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z" />
        </svg>
      );
    }

    // Sun icon
    return (
      <svg style={iconStyle} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z" />
      </svg>
    );
  };

  // Get label based on mode
  const getLabel = () => {
    if (mode === 'system') return 'Auto';
    return mode;
  };

  return (
    <button
      style={buttonStyle}
      onClick={handleToggle}
      aria-label={`Theme: ${getLabel()}. Click to change.`}
      type="button"
    >
      {getIcon()}
      {showLabel && !compact && <span style={labelStyle}>{getLabel()}</span>}
    </button>
  );
}
