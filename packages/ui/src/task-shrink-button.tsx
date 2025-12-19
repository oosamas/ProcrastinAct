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

interface ShrunkTask {
  title: string;
  description?: string;
  estimatedMinutes: number;
  difficulty: 'trivial' | 'easy' | 'medium';
  motivation?: string;
}

interface TaskShrinkButtonProps {
  taskTitle: string;
  onShrink: (shrunkTasks: ShrunkTask[]) => void;
  isLoading?: boolean;
  streamingText?: string;
  disabled?: boolean;
  shrinkLevel?: number;
  darkMode?: boolean;
  style?: CSSProperties;
}

type ShrinkState = 'idle' | 'loading' | 'streaming' | 'success' | 'error';

// Encouraging micro-copy for loading states
const loadingMessages = [
  'Breaking it down for you...',
  'Finding the smallest first step...',
  'Making it more manageable...',
  'Simplifying this for you...',
  "You've got this, let me help...",
  'Finding a gentle way in...',
];

const getRandomMessage = () =>
  loadingMessages[Math.floor(Math.random() * loadingMessages.length)];

export function TaskShrinkButton({
  taskTitle,
  onShrink,
  isLoading = false,
  streamingText,
  disabled = false,
  shrinkLevel = 0,
  darkMode = false,
  style,
}: TaskShrinkButtonProps) {
  const [state, setState] = useState<ShrinkState>('idle');
  const [loadingMessage] = useState(getRandomMessage);

  const currentState: ShrinkState = isLoading
    ? streamingText
      ? 'streaming'
      : 'loading'
    : state;

  // Button styles based on state
  const buttonStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    padding: `${spacing[4]}px ${spacing[6]}px`,
    backgroundColor:
      currentState === 'loading' || currentState === 'streaming'
        ? colors.primary[400]
        : currentState === 'error'
          ? colors.danger
          : colors.primary[500],
    color: 'white',
    border: 'none',
    borderRadius: borderRadius.xl,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    fontFamily: typography.fontFamily.sans,
    cursor: disabled || currentState !== 'idle' ? 'default' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    boxShadow: shadows.md,
    transition: `all ${animation.duration.normal}ms ${animation.easing.easeOut}`,
    minHeight: 56, // Touch-friendly
    minWidth: 200,
    ...style,
  };

  const iconStyle: CSSProperties = {
    width: 24,
    height: 24,
    animation:
      currentState === 'loading' ? 'spin 1s linear infinite' : undefined,
  };

  // Shrink level badge
  const badgeStyle: CSSProperties = {
    display: shrinkLevel > 0 ? 'flex' : 'none',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    backgroundColor: colors.primary[700],
    borderRadius: borderRadius.full,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    border: `2px solid ${darkMode ? colors.surface.dark : colors.surface.light}`,
  };

  // Get button content based on state
  const getButtonContent = () => {
    switch (currentState) {
      case 'loading':
        return (
          <>
            <svg style={iconStyle} viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 4V2C6.48 2 2 6.48 2 12h2c0-4.42 3.58-8 8-8z" />
            </svg>
            {loadingMessage}
          </>
        );

      case 'streaming':
        return (
          <>
            <svg style={iconStyle} viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="3" />
              <circle
                cx="12"
                cy="12"
                r="8"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
            </svg>
            Thinking...
          </>
        );

      case 'success':
        return (
          <>
            <svg style={iconStyle} viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
            Shrunk!
          </>
        );

      case 'error':
        return (
          <>
            <svg style={iconStyle} viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
            Try again
          </>
        );

      default:
        return (
          <>
            <svg style={iconStyle} viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13H5v-2h14v2z" />
              <path d="M12 5v14" stroke="currentColor" strokeWidth="2" />
            </svg>
            Make it smaller
          </>
        );
    }
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        style={buttonStyle}
        disabled={disabled || currentState !== 'idle'}
        onClick={() => {
          if (!disabled && currentState === 'idle') {
            onShrink([]);
          }
        }}
        aria-label={`Shrink task: ${taskTitle}`}
        aria-busy={currentState === 'loading' || currentState === 'streaming'}
      >
        {getButtonContent()}
      </button>

      {shrinkLevel > 0 && (
        <span style={badgeStyle} aria-label={`Shrunk ${shrinkLevel} times`}>
          {shrinkLevel}
        </span>
      )}

      {/* Streaming text preview */}
      {streamingText && (
        <div
          style={{
            marginTop: spacing[3],
            padding: spacing[3],
            backgroundColor: darkMode
              ? colors.neutral[800]
              : colors.neutral[100],
            borderRadius: borderRadius.lg,
            fontSize: typography.fontSize.sm,
            fontFamily: typography.fontFamily.sans,
            color: darkMode
              ? colors.text.secondary.dark
              : colors.text.secondary.light,
            maxHeight: 150,
            overflow: 'auto',
            whiteSpace: 'pre-wrap',
          }}
        >
          {streamingText}
          <span
            style={{
              animation: 'blink 1s step-end infinite',
            }}
          >
            |
          </span>
        </div>
      )}

      {/* CSS for animations */}
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes blink {
            50% { opacity: 0; }
          }
        `}
      </style>
    </div>
  );
}

// Export ShrunkTask type for use in parent components
export type { ShrunkTask };
