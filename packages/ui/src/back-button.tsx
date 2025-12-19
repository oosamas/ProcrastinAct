'use client';

import { type CSSProperties, useCallback } from 'react';
import {
  colors,
  spacing,
  typography,
  borderRadius,
  animation,
  touchTarget,
} from './tokens';

interface BackButtonProps {
  onBack: () => void;
  label?: string;
  showLabel?: boolean;
  darkMode?: boolean;
  hapticFeedback?: boolean;
  style?: CSSProperties;
}

export function BackButton({
  onBack,
  label = 'Back',
  showLabel = false,
  darkMode = false,
  hapticFeedback = true,
  style,
}: BackButtonProps) {
  const handleBack = useCallback(() => {
    if (
      hapticFeedback &&
      typeof navigator !== 'undefined' &&
      'vibrate' in navigator
    ) {
      navigator.vibrate(10);
    }
    onBack();
  }, [hapticFeedback, onBack]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleBack();
      }
    },
    [handleBack]
  );

  const buttonStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[1],
    minWidth: touchTarget.minimum,
    minHeight: touchTarget.minimum,
    padding: `${spacing[2]}px ${showLabel ? spacing[3] : spacing[2]}px`,
    backgroundColor: 'transparent',
    color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
    border: 'none',
    borderRadius: borderRadius.lg,
    cursor: 'pointer',
    transition: `background-color ${animation.duration.fast}ms ${animation.easing.easeOut}`,
    WebkitTapHighlightColor: 'transparent',
    touchAction: 'manipulation',
    ...style,
  };

  const iconStyle: CSSProperties = {
    width: 24,
    height: 24,
    flexShrink: 0,
  };

  const labelStyle: CSSProperties = {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    fontFamily: typography.fontFamily.sans,
  };

  return (
    <button
      style={buttonStyle}
      onClick={handleBack}
      onKeyDown={handleKeyDown}
      aria-label={label}
      type="button"
    >
      <svg style={iconStyle} viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
      </svg>
      {showLabel && <span style={labelStyle}>{label}</span>}
    </button>
  );
}
