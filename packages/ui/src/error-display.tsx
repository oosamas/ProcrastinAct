'use client';

import { type CSSProperties, useState, useEffect, useCallback } from 'react';
import {
  colors,
  spacing,
  typography,
  borderRadius,
  animation,
  touchTarget,
} from './tokens';
import { useHaptics } from './haptics';
import { useMotion } from './motion';

// ============================================================================
// TYPES
// ============================================================================

export interface ErrorInfo {
  code: string;
  message: string;
  suggestion: string;
  retryable: boolean;
}

// ============================================================================
// ERROR BANNER
// ============================================================================

interface ErrorBannerProps {
  error: ErrorInfo;
  onRetry?: () => void;
  onDismiss?: () => void;
  darkMode?: boolean;
}

/**
 * Non-intrusive error banner at top of screen
 */
export function ErrorBanner({
  error,
  onRetry,
  onDismiss,
  darkMode = false,
}: ErrorBannerProps) {
  const [isVisible, setIsVisible] = useState(true);
  const { trigger } = useHaptics();
  const { reducedMotion } = useMotion();

  useEffect(() => {
    trigger('warning');
  }, [trigger]);

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => onDismiss?.(), reducedMotion ? 0 : 200);
  }, [onDismiss, reducedMotion]);

  const handleRetry = useCallback(() => {
    trigger('tap');
    onRetry?.();
  }, [trigger, onRetry]);

  if (!isVisible) return null;

  const containerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: spacing[3],
    padding: spacing[4],
    backgroundColor: darkMode ? '#451a03' : '#fff7ed',
    borderBottom: `1px solid ${darkMode ? '#78350f' : '#fed7aa'}`,
    animation: reducedMotion ? 'none' : 'slideDown 200ms ease-out',
  };

  const contentStyle: CSSProperties = {
    flex: 1,
  };

  const messageStyle: CSSProperties = {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: darkMode ? '#fef3c7' : '#9a3412',
    margin: 0,
    marginBottom: spacing[1],
  };

  const suggestionStyle: CSSProperties = {
    fontSize: typography.fontSize.sm,
    color: darkMode ? '#fcd34d' : '#c2410c',
    margin: 0,
  };

  const buttonStyle: CSSProperties = {
    padding: `${spacing[2]}px ${spacing[3]}px`,
    minHeight: touchTarget.minimum,
    backgroundColor: darkMode ? '#78350f' : '#fed7aa',
    color: darkMode ? '#fef3c7' : '#9a3412',
    border: 'none',
    borderRadius: borderRadius.lg,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    cursor: 'pointer',
  };

  const dismissStyle: CSSProperties = {
    padding: spacing[2],
    backgroundColor: 'transparent',
    color: darkMode ? '#fcd34d' : '#c2410c',
    border: 'none',
    cursor: 'pointer',
  };

  return (
    <div style={containerStyle} role="alert">
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill={darkMode ? '#fbbf24' : '#f97316'}
      >
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
      </svg>
      <div style={contentStyle}>
        <p style={messageStyle}>{error.message}</p>
        <p style={suggestionStyle}>{error.suggestion}</p>
      </div>
      {error.retryable && onRetry && (
        <button style={buttonStyle} onClick={handleRetry} type="button">
          Try again
        </button>
      )}
      {onDismiss && (
        <button
          style={dismissStyle}
          onClick={handleDismiss}
          type="button"
          aria-label="Dismiss"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        </button>
      )}
      <style>
        {`
          @keyframes slideDown {
            from { transform: translateY(-100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
        `}
      </style>
    </div>
  );
}

// ============================================================================
// ERROR CARD
// ============================================================================

interface ErrorCardProps {
  error: ErrorInfo;
  onRetry?: () => void;
  onContactSupport?: () => void;
  darkMode?: boolean;
}

/**
 * Larger error display for full-page errors
 */
export function ErrorCard({
  error,
  onRetry,
  onContactSupport,
  darkMode = false,
}: ErrorCardProps) {
  const { trigger } = useHaptics();

  useEffect(() => {
    trigger('error');
  }, [trigger]);

  const containerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: spacing[8],
    maxWidth: 400,
    margin: '0 auto',
  };

  const iconStyle: CSSProperties = {
    width: 64,
    height: 64,
    marginBottom: spacing[6],
    color: colors.warning,
  };

  const titleStyle: CSSProperties = {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.semibold,
    color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
    margin: 0,
    marginBottom: spacing[3],
  };

  const messageStyle: CSSProperties = {
    fontSize: typography.fontSize.base,
    color: darkMode ? colors.text.secondary.dark : colors.text.secondary.light,
    margin: 0,
    marginBottom: spacing[2],
    lineHeight: typography.lineHeight.relaxed,
  };

  const suggestionStyle: CSSProperties = {
    fontSize: typography.fontSize.sm,
    color: darkMode ? colors.text.muted.dark : colors.text.muted.light,
    margin: 0,
    marginBottom: spacing[8],
  };

  const buttonContainerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing[3],
    width: '100%',
  };

  const primaryButtonStyle: CSSProperties = {
    width: '100%',
    padding: `${spacing[4]}px ${spacing[6]}px`,
    minHeight: touchTarget.comfortable,
    backgroundColor: colors.primary[500],
    color: 'white',
    border: 'none',
    borderRadius: borderRadius.xl,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    cursor: 'pointer',
  };

  const secondaryButtonStyle: CSSProperties = {
    width: '100%',
    padding: `${spacing[3]}px ${spacing[4]}px`,
    minHeight: touchTarget.minimum,
    backgroundColor: 'transparent',
    color: darkMode ? colors.text.secondary.dark : colors.text.secondary.light,
    border: 'none',
    fontSize: typography.fontSize.sm,
    cursor: 'pointer',
  };

  return (
    <div style={containerStyle}>
      <svg style={iconStyle} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 11c-.55 0-1-.45-1-1V8c0-.55.45-1 1-1s1 .45 1 1v4c0 .55-.45 1-1 1zm1 4h-2v-2h2v2z" />
      </svg>
      <h2 style={titleStyle}>Oops!</h2>
      <p style={messageStyle}>{error.message}</p>
      <p style={suggestionStyle}>{error.suggestion}</p>
      <div style={buttonContainerStyle}>
        {error.retryable && onRetry && (
          <button
            style={primaryButtonStyle}
            onClick={() => {
              trigger('tap');
              onRetry();
            }}
            type="button"
          >
            Try again
          </button>
        )}
        {onContactSupport && (
          <button
            style={secondaryButtonStyle}
            onClick={() => {
              trigger('tap');
              onContactSupport();
            }}
            type="button"
          >
            Contact support
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// INLINE ERROR
// ============================================================================

interface InlineErrorProps {
  message: string;
  darkMode?: boolean;
}

/**
 * Small inline error for form fields
 */
export function InlineError({ message, darkMode = false }: InlineErrorProps) {
  const errorStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[1],
    marginTop: spacing[1],
    fontSize: typography.fontSize.sm,
    color: colors.danger,
  };

  return (
    <div style={errorStyle} role="alert">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
      </svg>
      <span>{message}</span>
    </div>
  );
}

// ============================================================================
// RETRY INDICATOR
// ============================================================================

interface RetryIndicatorProps {
  attempt: number;
  maxAttempts: number;
  nextRetryIn?: number;
  darkMode?: boolean;
}

/**
 * Shows retry progress
 */
export function RetryIndicator({
  attempt,
  maxAttempts,
  nextRetryIn,
  darkMode = false,
}: RetryIndicatorProps) {
  const [countdown, setCountdown] = useState(nextRetryIn);

  useEffect(() => {
    if (!nextRetryIn) return;
    setCountdown(nextRetryIn);

    const interval = setInterval(() => {
      setCountdown((prev) => (prev && prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [nextRetryIn]);

  const containerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[2],
    padding: `${spacing[2]}px ${spacing[3]}px`,
    backgroundColor: darkMode ? colors.neutral[800] : colors.neutral[100],
    borderRadius: borderRadius.lg,
    fontSize: typography.fontSize.sm,
    color: darkMode ? colors.text.secondary.dark : colors.text.secondary.light,
  };

  const spinnerStyle: CSSProperties = {
    width: 16,
    height: 16,
    animation: 'spin 1s linear infinite',
  };

  return (
    <div style={containerStyle}>
      <svg
        style={spinnerStyle}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="10" opacity="0.25" />
        <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
      </svg>
      <span>
        Retrying ({attempt}/{maxAttempts})
        {countdown ? ` in ${countdown}s` : '...'}
      </span>
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
// OFFLINE INDICATOR
// ============================================================================

interface OfflineIndicatorProps {
  darkMode?: boolean;
}

/**
 * Shows when app is offline
 */
export function OfflineIndicator({ darkMode = false }: OfflineIndicatorProps) {
  const containerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    padding: `${spacing[2]}px ${spacing[4]}px`,
    backgroundColor: darkMode ? '#1e3a5f' : '#dbeafe',
    color: darkMode ? '#93c5fd' : '#1e40af',
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  };

  return (
    <div style={containerStyle} role="status">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.64 7c-.45-.34-4.93-4-11.64-4-1.5 0-2.89.19-4.15.48L18.18 13.8 23.64 7zM17.04 15.22L3.27 1.44 2 2.72l2.05 2.06C1.91 5.76.59 6.82.36 7L12 21.5l3.07-4.04 4.28 4.28 1.27-1.28-3.58-3.24z" />
      </svg>
      <span>Offline - your work is saved locally</span>
    </div>
  );
}

// ============================================================================
// ERROR TOAST
// ============================================================================

interface ErrorToastProps {
  message: string;
  duration?: number;
  onClose: () => void;
  darkMode?: boolean;
}

/**
 * Temporary error toast notification
 */
export function ErrorToast({
  message,
  duration = 4000,
  onClose,
  darkMode = false,
}: ErrorToastProps) {
  const { trigger } = useHaptics();
  const { reducedMotion } = useMotion();
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    trigger('warning');

    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onClose, reducedMotion ? 0 : 200);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose, trigger, reducedMotion]);

  const toastStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[3],
    padding: `${spacing[3]}px ${spacing[4]}px`,
    backgroundColor: darkMode ? colors.neutral[800] : colors.neutral[900],
    color: 'white',
    borderRadius: borderRadius.lg,
    boxShadow: '0 10px 15px rgba(0, 0, 0, 0.2)',
    animation: reducedMotion
      ? 'none'
      : isExiting
        ? 'fadeOut 200ms ease-out forwards'
        : 'fadeIn 200ms ease-out',
  };

  return (
    <div style={toastStyle} role="alert">
      <svg width="20" height="20" viewBox="0 0 24 24" fill={colors.warning}>
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
      </svg>
      <span style={{ flex: 1, fontSize: typography.fontSize.sm }}>
        {message}
      </span>
      <button
        style={{
          padding: spacing[1],
          backgroundColor: 'transparent',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          opacity: 0.7,
        }}
        onClick={() => {
          setIsExiting(true);
          setTimeout(onClose, reducedMotion ? 0 : 200);
        }}
        type="button"
        aria-label="Close"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
        </svg>
      </button>
      <style>
        {`
          @keyframes fadeIn {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          @keyframes fadeOut {
            from { transform: translateY(0); opacity: 1; }
            to { transform: translateY(20px); opacity: 0; }
          }
        `}
      </style>
    </div>
  );
}
