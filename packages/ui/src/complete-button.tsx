'use client';

import {
  type CSSProperties,
  useState,
  useCallback,
  useRef,
  useEffect,
} from 'react';
import {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
  animation,
} from './tokens';

interface CompleteButtonProps {
  onComplete: () => void;
  disabled?: boolean;
  size?: 'default' | 'large';
  label?: string;
  darkMode?: boolean;
  style?: CSSProperties;
}

export function CompleteButton({
  onComplete,
  disabled = false,
  size = 'default',
  label = 'I did it!',
  darkMode = false,
  style,
}: CompleteButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

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
    setIsAnimating(true);

    // Trigger haptic feedback
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(30);
    }
  }, [disabled]);

  const handleRelease = useCallback(() => {
    if (!isPressed) return;

    setIsPressed(false);

    // Trigger success haptic
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([50, 30, 100]);
    }

    // Delay the completion callback for satisfying animation
    setTimeout(() => {
      onComplete();
      setIsAnimating(false);
    }, 150);
  }, [isPressed, onComplete]);

  // Handle keyboard activation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handlePress();
      }
    },
    [handlePress]
  );

  const handleKeyUp = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleRelease();
      }
    },
    [handleRelease]
  );

  const buttonStyle: CSSProperties = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    height: config.height,
    padding: config.padding,
    backgroundColor: isAnimating ? colors.success : colors.primary[500],
    color: 'white',
    border: 'none',
    borderRadius: borderRadius.xl,
    fontSize: config.fontSize,
    fontWeight: typography.fontWeight.bold,
    fontFamily: typography.fontFamily.sans,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    boxShadow: isPressed ? shadows.sm : shadows.lg,
    transform: isPressed ? 'scale(0.95)' : 'scale(1)',
    transition: `all ${animation.duration.fast}ms ${animation.easing.easeOut}`,
    overflow: 'hidden',
    WebkitTapHighlightColor: 'transparent',
    touchAction: 'manipulation',
    ...style,
  };

  const iconStyle: CSSProperties = {
    width: config.iconSize,
    height: config.iconSize,
    transform: isAnimating ? 'scale(1.2)' : 'scale(1)',
    transition: `transform ${animation.duration.fast}ms ${animation.easing.easeOut}`,
  };

  // Ripple effect
  const rippleStyle: CSSProperties = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '100%',
    paddingBottom: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: borderRadius.full,
    transform: isPressed
      ? 'translate(-50%, -50%) scale(2)'
      : 'translate(-50%, -50%) scale(0)',
    opacity: isPressed ? 1 : 0,
    transition: isPressed
      ? `transform ${animation.duration.normal}ms ${animation.easing.easeOut}`
      : `opacity ${animation.duration.fast}ms`,
    pointerEvents: 'none',
  };

  return (
    <button
      ref={buttonRef}
      style={buttonStyle}
      disabled={disabled}
      onMouseDown={handlePress}
      onMouseUp={handleRelease}
      onMouseLeave={() => setIsPressed(false)}
      onTouchStart={handlePress}
      onTouchEnd={handleRelease}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      aria-label={label}
      role="button"
    >
      <div style={rippleStyle} />

      {isAnimating ? (
        <svg style={iconStyle} viewBox="0 0 24 24" fill="currentColor">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
        </svg>
      ) : (
        <svg style={iconStyle} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        </svg>
      )}

      <span>{label}</span>
    </button>
  );
}
