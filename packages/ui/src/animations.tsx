'use client';

import {
  type CSSProperties,
  type ReactNode,
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import { colors, animation, borderRadius } from './tokens';
import { useMotion } from './motion';

// ============================================================================
// SPRING ANIMATION PRESETS
// ============================================================================

/**
 * Spring animation presets for natural motion
 * Based on physical spring dynamics (tension, friction)
 */
export const SpringPresets = {
  // Gentle, relaxed motion
  gentle: {
    tension: 120,
    friction: 14,
    css: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    duration: 400,
  },
  // Default balanced motion
  default: {
    tension: 170,
    friction: 26,
    css: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
    duration: 300,
  },
  // Quick, snappy motion
  snappy: {
    tension: 300,
    friction: 30,
    css: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    duration: 200,
  },
  // Bouncy, playful motion
  bouncy: {
    tension: 180,
    friction: 12,
    css: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    duration: 500,
  },
  // Stiff, precise motion
  stiff: {
    tension: 400,
    friction: 40,
    css: 'cubic-bezier(0.4, 0, 0.2, 1)',
    duration: 150,
  },
  // Slow, dramatic motion
  slow: {
    tension: 100,
    friction: 20,
    css: 'cubic-bezier(0.4, 0, 0.2, 1)',
    duration: 600,
  },
} as const;

export type SpringPreset = keyof typeof SpringPresets;

// ============================================================================
// TRANSITION PRESETS
// ============================================================================

/**
 * Pre-built CSS transitions for common use cases
 */
export const Transitions = {
  // Fade
  fadeIn: (duration = animation.duration.normal) =>
    `opacity ${duration}ms ${animation.easing.easeOut}`,
  fadeOut: (duration = animation.duration.normal) =>
    `opacity ${duration}ms ${animation.easing.easeIn}`,

  // Scale
  scaleIn: (duration = animation.duration.normal) =>
    `transform ${duration}ms ${SpringPresets.bouncy.css}, opacity ${duration}ms ${animation.easing.easeOut}`,
  scaleOut: (duration = animation.duration.fast) =>
    `transform ${duration}ms ${animation.easing.easeIn}, opacity ${duration}ms ${animation.easing.easeIn}`,

  // Slide
  slideUp: (duration = animation.duration.normal) =>
    `transform ${duration}ms ${SpringPresets.gentle.css}, opacity ${duration}ms ${animation.easing.easeOut}`,
  slideDown: (duration = animation.duration.normal) =>
    `transform ${duration}ms ${SpringPresets.gentle.css}, opacity ${duration}ms ${animation.easing.easeOut}`,

  // All properties
  all: (duration = animation.duration.normal) =>
    `all ${duration}ms ${animation.easing.easeOut}`,

  // Button press
  buttonPress: `transform ${animation.duration.fast}ms ${animation.easing.easeOut}, box-shadow ${animation.duration.fast}ms ${animation.easing.easeOut}`,

  // Color change
  color: (duration = animation.duration.fast) =>
    `background-color ${duration}ms ${animation.easing.easeOut}, color ${duration}ms ${animation.easing.easeOut}, border-color ${duration}ms ${animation.easing.easeOut}`,
} as const;

// ============================================================================
// SKELETON LOADER
// ============================================================================

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number | string;
  darkMode?: boolean;
  style?: CSSProperties;
}

/**
 * Skeleton loading placeholder with shimmer effect
 */
export function Skeleton({
  width = '100%',
  height = 20,
  borderRadius: radius = borderRadius.md,
  darkMode = false,
  style,
}: SkeletonProps) {
  const { reducedMotion } = useMotion();

  const baseColor = darkMode ? colors.neutral[700] : colors.neutral[200];
  const shimmerColor = darkMode ? colors.neutral[600] : colors.neutral[100];

  const containerStyle: CSSProperties = {
    width,
    height,
    borderRadius: radius,
    backgroundColor: baseColor,
    overflow: 'hidden',
    position: 'relative',
    ...style,
  };

  const shimmerStyle: CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: reducedMotion
      ? 'none'
      : `linear-gradient(
          90deg,
          ${baseColor} 0%,
          ${shimmerColor} 50%,
          ${baseColor} 100%
        )`,
    backgroundSize: '200% 100%',
    animation: reducedMotion ? 'none' : 'shimmer 1.5s infinite',
  };

  return (
    <div style={containerStyle} aria-hidden="true">
      <div style={shimmerStyle} />
      <style>
        {`
          @keyframes shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}
      </style>
    </div>
  );
}

// ============================================================================
// SKELETON GROUP
// ============================================================================

interface SkeletonGroupProps {
  lines?: number;
  spacing?: number;
  darkMode?: boolean;
}

/**
 * Multiple skeleton lines for text content
 */
export function SkeletonGroup({
  lines = 3,
  spacing = 8,
  darkMode = false,
}: SkeletonGroupProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing }}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          width={i === lines - 1 ? '60%' : '100%'}
          height={16}
          darkMode={darkMode}
        />
      ))}
    </div>
  );
}

// ============================================================================
// PULSE ANIMATION
// ============================================================================

interface PulseProps {
  children: ReactNode;
  duration?: number;
  disabled?: boolean;
}

/**
 * Pulse animation wrapper for attention
 */
export function Pulse({
  children,
  duration = 2000,
  disabled = false,
}: PulseProps) {
  const { reducedMotion } = useMotion();

  if (reducedMotion || disabled) {
    return <>{children}</>;
  }

  return (
    <div
      style={{
        animation: `pulse ${duration}ms ease-in-out infinite`,
      }}
    >
      {children}
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.6; }
          }
        `}
      </style>
    </div>
  );
}

// ============================================================================
// SPIN ANIMATION
// ============================================================================

interface SpinProps {
  children: ReactNode;
  duration?: number;
  disabled?: boolean;
}

/**
 * Spin animation for loading indicators
 */
export function Spin({
  children,
  duration = 1000,
  disabled = false,
}: SpinProps) {
  const { reducedMotion } = useMotion();

  if (reducedMotion || disabled) {
    return <>{children}</>;
  }

  return (
    <div
      style={{
        display: 'inline-block',
        animation: `spin ${duration}ms linear infinite`,
      }}
    >
      {children}
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}

// ============================================================================
// LOADING SPINNER
// ============================================================================

interface LoadingSpinnerProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
  darkMode?: boolean;
}

/**
 * Circular loading spinner
 */
export function LoadingSpinner({
  size = 24,
  color,
  strokeWidth = 3,
  darkMode = false,
}: LoadingSpinnerProps) {
  const { reducedMotion } = useMotion();
  const spinnerColor = color || colors.primary[500];

  // For reduced motion, show static spinner at partial rotation
  const staticRotation = reducedMotion ? 'rotate(45deg)' : undefined;

  return (
    <Spin disabled={reducedMotion}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        style={{ transform: staticRotation }}
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          fill="none"
          stroke={darkMode ? colors.neutral[700] : colors.neutral[200]}
          strokeWidth={strokeWidth}
        />
        <circle
          cx="12"
          cy="12"
          r="10"
          fill="none"
          stroke={spinnerColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray="31.4 31.4"
          strokeDashoffset="0"
        />
      </svg>
    </Spin>
  );
}

// ============================================================================
// FADE IN/OUT ANIMATION
// ============================================================================

interface FadeProps {
  children: ReactNode;
  show: boolean;
  duration?: number;
  unmountOnHide?: boolean;
}

/**
 * Fade animation wrapper
 */
export function Fade({
  children,
  show,
  duration = animation.duration.normal,
  unmountOnHide = true,
}: FadeProps) {
  const { reducedMotion, getDuration } = useMotion();
  const [mounted, setMounted] = useState(show);
  const [visible, setVisible] = useState(show);

  const actualDuration = getDuration(duration);

  useEffect(() => {
    if (show) {
      setMounted(true);
      // Small delay to trigger transition
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
      if (unmountOnHide) {
        const timer = setTimeout(() => setMounted(false), actualDuration);
        return () => clearTimeout(timer);
      }
    }
  }, [show, unmountOnHide, actualDuration]);

  if (!mounted && unmountOnHide) return null;

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transition: reducedMotion
          ? 'none'
          : `opacity ${actualDuration}ms ${animation.easing.easeOut}`,
      }}
    >
      {children}
    </div>
  );
}

// ============================================================================
// SLIDE ANIMATION
// ============================================================================

type SlideDirection = 'up' | 'down' | 'left' | 'right';

interface SlideProps {
  children: ReactNode;
  show: boolean;
  direction?: SlideDirection;
  distance?: number;
  duration?: number;
  unmountOnHide?: boolean;
}

/**
 * Slide animation wrapper
 */
export function Slide({
  children,
  show,
  direction = 'up',
  distance = 20,
  duration = animation.duration.normal,
  unmountOnHide = true,
}: SlideProps) {
  const { reducedMotion, getDuration } = useMotion();
  const [mounted, setMounted] = useState(show);
  const [visible, setVisible] = useState(show);

  const actualDuration = getDuration(duration);

  useEffect(() => {
    if (show) {
      setMounted(true);
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
      if (unmountOnHide) {
        const timer = setTimeout(() => setMounted(false), actualDuration);
        return () => clearTimeout(timer);
      }
    }
  }, [show, unmountOnHide, actualDuration]);

  if (!mounted && unmountOnHide) return null;

  const getTransform = () => {
    if (visible) return 'translate(0, 0)';
    switch (direction) {
      case 'up':
        return `translateY(${distance}px)`;
      case 'down':
        return `translateY(-${distance}px)`;
      case 'left':
        return `translateX(${distance}px)`;
      case 'right':
        return `translateX(-${distance}px)`;
    }
  };

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: reducedMotion ? 'none' : getTransform(),
        transition: reducedMotion
          ? `opacity ${animation.duration.fastest}ms`
          : `transform ${actualDuration}ms ${SpringPresets.gentle.css}, opacity ${actualDuration}ms ${animation.easing.easeOut}`,
      }}
    >
      {children}
    </div>
  );
}

// ============================================================================
// SCALE ANIMATION
// ============================================================================

interface ScaleProps {
  children: ReactNode;
  show: boolean;
  from?: number;
  duration?: number;
  unmountOnHide?: boolean;
}

/**
 * Scale animation wrapper
 */
export function Scale({
  children,
  show,
  from = 0.95,
  duration = animation.duration.normal,
  unmountOnHide = true,
}: ScaleProps) {
  const { reducedMotion, getDuration } = useMotion();
  const [mounted, setMounted] = useState(show);
  const [visible, setVisible] = useState(show);

  const actualDuration = getDuration(duration);

  useEffect(() => {
    if (show) {
      setMounted(true);
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
      if (unmountOnHide) {
        const timer = setTimeout(() => setMounted(false), actualDuration);
        return () => clearTimeout(timer);
      }
    }
  }, [show, unmountOnHide, actualDuration]);

  if (!mounted && unmountOnHide) return null;

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: reducedMotion
          ? 'none'
          : visible
            ? 'scale(1)'
            : `scale(${from})`,
        transition: reducedMotion
          ? `opacity ${animation.duration.fastest}ms`
          : `transform ${actualDuration}ms ${SpringPresets.bouncy.css}, opacity ${actualDuration}ms ${animation.easing.easeOut}`,
      }}
    >
      {children}
    </div>
  );
}

// ============================================================================
// STAGGER ANIMATION
// ============================================================================

interface StaggerProps {
  children: ReactNode[];
  show: boolean;
  delay?: number;
  direction?: SlideDirection;
}

/**
 * Stagger animation for lists
 */
export function Stagger({
  children,
  show,
  delay = 50,
  direction = 'up',
}: StaggerProps) {
  return (
    <>
      {children.map((child, index) => (
        <Slide
          key={index}
          show={show}
          direction={direction}
          duration={animation.duration.normal + index * delay}
        >
          {child}
        </Slide>
      ))}
    </>
  );
}

// ============================================================================
// PRESS ANIMATION HOOK
// ============================================================================

/**
 * Hook for button press animation
 */
export function usePressAnimation(scale = 0.97) {
  const [isPressed, setIsPressed] = useState(false);
  const { reducedMotion } = useMotion();

  const pressStyle: CSSProperties = {
    transform: !reducedMotion && isPressed ? `scale(${scale})` : 'scale(1)',
    transition: Transitions.buttonPress,
  };

  const pressHandlers = {
    onMouseDown: () => setIsPressed(true),
    onMouseUp: () => setIsPressed(false),
    onMouseLeave: () => setIsPressed(false),
    onTouchStart: () => setIsPressed(true),
    onTouchEnd: () => setIsPressed(false),
  };

  return { pressStyle, pressHandlers, isPressed };
}
