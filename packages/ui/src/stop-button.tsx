'use client';

import { type CSSProperties, useState, useCallback } from 'react';
import {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
  animation,
} from './tokens';

interface StopButtonProps {
  onStop: () => void;
  disabled?: boolean;
  size?: 'default' | 'large';
  label?: string;
  darkMode?: boolean;
  style?: CSSProperties;
}

export function StopButton({
  onStop,
  disabled = false,
  size = 'default',
  label = 'Done for now',
  darkMode = false,
  style,
}: StopButtonProps) {
  const [isPressed, setIsPressed] = useState(false);

  const sizeConfig = {
    default: {
      height: 56,
      fontSize: typography.fontSize.lg,
      padding: `0 ${spacing[6]}px`,
      iconSize: 24,
    },
    large: {
      height: 72,
      fontSize: typography.fontSize.xl,
      padding: `0 ${spacing[8]}px`,
      iconSize: 32,
    },
  };

  const config = sizeConfig[size];

  const handlePress = useCallback(() => {
    if (disabled) return;
    setIsPressed(true);

    // Gentle haptic feedback
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(20);
    }
  }, [disabled]);

  const handleRelease = useCallback(() => {
    if (!isPressed) return;
    setIsPressed(false);

    // Calm haptic
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([30, 50, 30]);
    }

    setTimeout(() => {
      onStop();
    }, 100);
  }, [isPressed, onStop]);

  // Button uses warm, calming colors (not warning/danger colors!)
  const buttonStyle: CSSProperties = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    height: config.height,
    padding: config.padding,
    // Using soft, warm color - NOT a warning color
    backgroundColor: darkMode ? colors.neutral[700] : colors.neutral[100],
    color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
    border: `2px solid ${darkMode ? colors.neutral[600] : colors.neutral[300]}`,
    borderRadius: borderRadius.xl,
    fontSize: config.fontSize,
    fontWeight: typography.fontWeight.semibold,
    fontFamily: typography.fontFamily.sans,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    boxShadow: isPressed ? 'none' : shadows.sm,
    transform: isPressed ? 'scale(0.98)' : 'scale(1)',
    transition: `all ${animation.duration.fast}ms ${animation.easing.easeOut}`,
    WebkitTapHighlightColor: 'transparent',
    touchAction: 'manipulation',
    ...style,
  };

  const iconStyle: CSSProperties = {
    width: config.iconSize,
    height: config.iconSize,
  };

  return (
    <button
      style={buttonStyle}
      disabled={disabled}
      onMouseDown={handlePress}
      onMouseUp={handleRelease}
      onMouseLeave={() => setIsPressed(false)}
      onTouchStart={handlePress}
      onTouchEnd={handleRelease}
      aria-label={label}
      role="button"
    >
      {/* Pause/rest icon (not stop!) */}
      <svg style={iconStyle} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
      </svg>
      <span>{label}</span>
    </button>
  );
}
