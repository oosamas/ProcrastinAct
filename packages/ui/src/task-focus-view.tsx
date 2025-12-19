'use client';

import {
  type CSSProperties,
  useCallback,
  useState,
  useEffect,
  useRef,
} from 'react';
import type { Task, TaskStatus } from '@procrastinact/types';
import { colors, spacing, typography, animation, borderRadius } from './tokens';

interface TaskFocusViewProps {
  task: Task;
  onComplete?: () => void;
  onShrink?: () => void;
  onStop?: () => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  style?: CSSProperties;
  darkMode?: boolean;
}

// Warm, calming gradient backgrounds
const gradients = {
  light: `linear-gradient(135deg,
    ${colors.primary[50]} 0%,
    #fef7f0 50%,
    ${colors.primary[100]} 100%)`,
  dark: `linear-gradient(135deg,
    ${colors.primary[900]} 0%,
    #1a1a2e 50%,
    ${colors.primary[800]} 100%)`,
};

// Calculate optimal font size based on text length
function calculateFontSize(text: string): number {
  const length = text.length;
  if (length < 20) return typography.fontSize['5xl']; // 48px
  if (length < 40) return typography.fontSize['4xl']; // 36px
  if (length < 60) return typography.fontSize['3xl']; // 30px
  if (length < 100) return typography.fontSize['2xl']; // 24px
  return typography.fontSize.xl; // 20px
}

export function TaskFocusView({
  task,
  onComplete,
  onShrink,
  onStop,
  onSwipeLeft,
  onSwipeRight,
  style,
  darkMode = false,
}: TaskFocusViewProps) {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(
    null
  );
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isPressed, setIsPressed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const fontSize = calculateFontSize(task.title);

  // Keyboard shortcuts for web
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (e.key) {
        case 'Enter':
        case ' ':
          e.preventDefault();
          onComplete?.();
          break;
        case 's':
        case 'S':
          e.preventDefault();
          onShrink?.();
          break;
        case 'Escape':
          e.preventDefault();
          onStop?.();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          onSwipeLeft?.();
          break;
        case 'ArrowRight':
          e.preventDefault();
          onSwipeRight?.();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onComplete, onShrink, onStop, onSwipeLeft, onSwipeRight]);

  // Touch/swipe handling
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (!touch) return;
    setTouchStart({ x: touch.clientX, y: touch.clientY });
    setIsPressed(true);
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStart) return;
      const touch = e.touches[0];
      if (!touch) return;
      const deltaX = touch.clientX - touchStart.x;
      const deltaY = Math.abs(touch.clientY - touchStart.y);

      // Only track horizontal swipes
      if (Math.abs(deltaX) > deltaY) {
        setSwipeOffset(deltaX);
      }
    },
    [touchStart]
  );

  const handleTouchEnd = useCallback(() => {
    setIsPressed(false);
    const threshold = 100;

    if (swipeOffset > threshold) {
      onSwipeRight?.();
    } else if (swipeOffset < -threshold) {
      onSwipeLeft?.();
    }

    setSwipeOffset(0);
    setTouchStart(null);
  }, [swipeOffset, onSwipeLeft, onSwipeRight]);

  // Container styles
  const containerStyle: CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: darkMode ? gradients.dark : gradients.light,
    padding: spacing[8],
    touchAction: 'pan-y',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    overflow: 'hidden',
    ...style,
  };

  // Task card styles with swipe transform
  const taskCardStyle: CSSProperties = {
    maxWidth: 600,
    width: '100%',
    textAlign: 'center',
    transform: `translateX(${swipeOffset}px) scale(${isPressed ? 0.98 : 1})`,
    transition: touchStart
      ? 'transform 0.05s ease-out'
      : `transform ${animation.duration.normal}ms ${animation.easing.easeOut}`,
    cursor: 'default',
  };

  // Task text styles
  const taskTextStyle: CSSProperties = {
    fontSize,
    fontWeight: typography.fontWeight.semibold,
    fontFamily: typography.fontFamily.sans,
    color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
    lineHeight: typography.lineHeight.relaxed,
    margin: 0,
    padding: `${spacing[4]}px`,
    transition: `font-size ${animation.duration.normal}ms ${animation.easing.easeOut}`,
    wordBreak: 'break-word',
  };

  // Shrink level indicator
  const shrinkIndicatorStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: spacing[1],
    marginTop: spacing[4],
    padding: `${spacing[1]}px ${spacing[3]}px`,
    backgroundColor: darkMode ? colors.primary[800] : colors.primary[100],
    color: darkMode ? colors.primary[200] : colors.primary[700],
    borderRadius: borderRadius.full,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.sans,
    opacity: 0.8,
  };

  // Action hints (subtle, at bottom)
  const hintsContainerStyle: CSSProperties = {
    position: 'absolute',
    bottom: spacing[8],
    left: 0,
    right: 0,
    display: 'flex',
    justifyContent: 'center',
    gap: spacing[6],
    opacity: 0.5,
    transition: `opacity ${animation.duration.normal}ms`,
  };

  const hintStyle: CSSProperties = {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.sans,
    color: darkMode ? colors.text.muted.dark : colors.text.muted.light,
    display: 'flex',
    alignItems: 'center',
    gap: spacing[1],
  };

  // Swipe indicators
  const swipeIndicatorStyle = (direction: 'left' | 'right'): CSSProperties => ({
    position: 'absolute',
    top: '50%',
    [direction]: spacing[4],
    transform: 'translateY(-50%)',
    opacity:
      (Math.min(Math.abs(swipeOffset) / 100, 0.8) *
        (direction === 'left' ? -swipeOffset : swipeOffset)) /
      100,
    color: direction === 'left' ? colors.danger : colors.success,
    fontSize: typography.fontSize['4xl'],
    transition: 'opacity 0.1s',
  });

  return (
    <div
      ref={containerRef}
      style={containerStyle}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      role="main"
      aria-label={`Current task: ${task.title}`}
    >
      {/* Swipe indicators */}
      {onSwipeLeft && (
        <div style={swipeIndicatorStyle('left')} aria-hidden="true">
          ←
        </div>
      )}
      {onSwipeRight && (
        <div style={swipeIndicatorStyle('right')} aria-hidden="true">
          →
        </div>
      )}

      {/* Main task display */}
      <div style={taskCardStyle}>
        <h1 style={taskTextStyle}>{task.title}</h1>

        {task.shrinkLevel > 0 && (
          <span style={shrinkIndicatorStyle}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13H5v-2h14v2z" />
            </svg>
            Shrunk {task.shrinkLevel}x
          </span>
        )}
      </div>

      {/* Subtle action hints */}
      <div style={hintsContainerStyle}>
        {onComplete && (
          <span style={hintStyle}>
            <kbd
              style={{
                padding: `${spacing[1]}px ${spacing[2]}px`,
                backgroundColor: darkMode
                  ? colors.neutral[700]
                  : colors.neutral[200],
                borderRadius: borderRadius.sm,
                fontSize: typography.fontSize.xs,
              }}
            >
              Space
            </kbd>
            Complete
          </span>
        )}
        {onShrink && (
          <span style={hintStyle}>
            <kbd
              style={{
                padding: `${spacing[1]}px ${spacing[2]}px`,
                backgroundColor: darkMode
                  ? colors.neutral[700]
                  : colors.neutral[200],
                borderRadius: borderRadius.sm,
                fontSize: typography.fontSize.xs,
              }}
            >
              S
            </kbd>
            Shrink
          </span>
        )}
        {onStop && (
          <span style={hintStyle}>
            <kbd
              style={{
                padding: `${spacing[1]}px ${spacing[2]}px`,
                backgroundColor: darkMode
                  ? colors.neutral[700]
                  : colors.neutral[200],
                borderRadius: borderRadius.sm,
                fontSize: typography.fontSize.xs,
              }}
            >
              Esc
            </kbd>
            Stop
          </span>
        )}
      </div>
    </div>
  );
}
