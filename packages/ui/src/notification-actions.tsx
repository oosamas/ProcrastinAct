'use client';

import {
  type CSSProperties,
  type ReactNode,
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import {
  colors,
  spacing,
  typography,
  borderRadius,
  animation,
  touchTarget,
} from './tokens';

// ============================================================================
// TYPES
// ============================================================================

export type NotificationActionType =
  | 'complete_task'
  | 'snooze'
  | 'start_timer'
  | 'voice_reply'
  | 'view'
  | 'dismiss'
  | 'quick_add';

export interface ActionButtonConfig {
  id: string;
  type: NotificationActionType;
  label: string;
  icon?: string;
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
}

export interface ActionFeedback {
  id: string;
  type: 'success' | 'error' | 'info' | 'pending';
  title: string;
  message: string;
  timestamp: Date;
  autoDismiss?: boolean;
}

// ============================================================================
// ACTION BUTTONS COMPONENT
// ============================================================================

interface ActionButtonProps {
  config: ActionButtonConfig;
  onPress: (actionId: string, type: NotificationActionType) => void;
  loading?: boolean;
  disabled?: boolean;
  compact?: boolean;
  darkMode?: boolean;
}

/**
 * Individual action button for notifications
 */
export function ActionButton({
  config,
  onPress,
  loading = false,
  disabled = false,
  compact = false,
  darkMode = false,
}: ActionButtonProps) {
  const [isPressed, setIsPressed] = useState(false);

  const getVariantColors = () => {
    switch (config.variant) {
      case 'primary':
        return {
          bg: colors.primary[500],
          text: '#ffffff',
          border: colors.primary[600],
        };
      case 'success':
        return {
          bg: colors.success[500],
          text: '#ffffff',
          border: colors.success[600],
        };
      case 'danger':
        return {
          bg: colors.danger[500],
          text: '#ffffff',
          border: colors.danger[600],
        };
      case 'secondary':
      default:
        return {
          bg: darkMode ? colors.neutral[700] : colors.neutral[200],
          text: darkMode ? colors.text.primary.dark : colors.text.primary.light,
          border: darkMode ? colors.neutral[600] : colors.neutral[300],
        };
    }
  };

  const variantColors = getVariantColors();

  const buttonStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: compact ? spacing[1] : spacing[2],
    minHeight: compact ? touchTarget.minimum : touchTarget.recommended,
    padding: compact
      ? `${spacing[1]}px ${spacing[3]}px`
      : `${spacing[2]}px ${spacing[4]}px`,
    backgroundColor: disabled
      ? darkMode
        ? colors.neutral[800]
        : colors.neutral[100]
      : variantColors.bg,
    color: disabled
      ? darkMode
        ? colors.text.muted.dark
        : colors.text.muted.light
      : variantColors.text,
    border: `1px solid ${variantColors.border}`,
    borderRadius: borderRadius.lg,
    fontSize: compact ? typography.fontSize.sm : typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : isPressed ? 0.9 : 1,
    transform: isPressed ? 'scale(0.97)' : 'scale(1)',
    transition: `all ${animation.duration.fast}ms ${animation.easing.standard}`,
    whiteSpace: 'nowrap',
    userSelect: 'none',
    WebkitTapHighlightColor: 'transparent',
  };

  const handleClick = () => {
    if (!disabled && !loading) {
      onPress(config.id, config.type);
    }
  };

  return (
    <button
      style={buttonStyle}
      onClick={handleClick}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      disabled={disabled || loading}
      type="button"
      aria-label={config.label}
    >
      {loading ? (
        <span style={{ width: 16, height: 16 }}>
          <LoadingSpinner size={16} />
        </span>
      ) : config.icon ? (
        <span aria-hidden="true">{config.icon}</span>
      ) : null}
      <span>{config.label}</span>
    </button>
  );
}

// ============================================================================
// ACTION BAR COMPONENT
// ============================================================================

interface ActionBarProps {
  actions: ActionButtonConfig[];
  onAction: (actionId: string, type: NotificationActionType) => void;
  loadingAction?: string;
  compact?: boolean;
  darkMode?: boolean;
}

/**
 * Horizontal bar of action buttons
 */
export function ActionBar({
  actions,
  onAction,
  loadingAction,
  compact = false,
  darkMode = false,
}: ActionBarProps) {
  const barStyle: CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: spacing[2],
    alignItems: 'center',
  };

  return (
    <div style={barStyle} role="group" aria-label="Notification actions">
      {actions.map((action) => (
        <ActionButton
          key={action.id}
          config={action}
          onPress={onAction}
          loading={loadingAction === action.id}
          compact={compact}
          darkMode={darkMode}
        />
      ))}
    </div>
  );
}

// ============================================================================
// INLINE ACTION NOTIFICATION
// ============================================================================

interface InlineActionNotificationProps {
  title: string;
  body: string;
  actions: ActionButtonConfig[];
  onAction: (actionId: string, type: NotificationActionType) => void;
  onDismiss?: () => void;
  loadingAction?: string;
  icon?: ReactNode;
  darkMode?: boolean;
}

/**
 * Full notification display with inline actions
 */
export function InlineActionNotification({
  title,
  body,
  actions,
  onAction,
  onDismiss,
  loadingAction,
  icon,
  darkMode = false,
}: InlineActionNotificationProps) {
  const containerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing[3],
    padding: spacing[4],
    backgroundColor: darkMode ? colors.neutral[800] : colors.surface.light,
    borderRadius: borderRadius.xl,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    border: `1px solid ${darkMode ? colors.neutral[700] : colors.border.light}`,
  };

  const headerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: spacing[3],
  };

  const iconContainerStyle: CSSProperties = {
    flexShrink: 0,
    width: 40,
    height: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: darkMode ? colors.neutral[700] : colors.neutral[100],
    borderRadius: borderRadius.lg,
    fontSize: 20,
  };

  const contentStyle: CSSProperties = {
    flex: 1,
    minWidth: 0,
  };

  const titleStyle: CSSProperties = {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
    margin: 0,
    marginBottom: spacing[1],
  };

  const bodyStyle: CSSProperties = {
    fontSize: typography.fontSize.sm,
    color: darkMode ? colors.text.secondary.dark : colors.text.secondary.light,
    margin: 0,
    lineHeight: 1.4,
  };

  const dismissButtonStyle: CSSProperties = {
    flexShrink: 0,
    width: 32,
    height: 32,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: borderRadius.full,
    cursor: 'pointer',
    color: darkMode ? colors.text.muted.dark : colors.text.muted.light,
    fontSize: 18,
  };

  return (
    <div style={containerStyle} role="alert" aria-live="polite">
      <div style={headerStyle}>
        {icon && <div style={iconContainerStyle}>{icon}</div>}
        <div style={contentStyle}>
          <h3 style={titleStyle}>{title}</h3>
          <p style={bodyStyle}>{body}</p>
        </div>
        {onDismiss && (
          <button
            style={dismissButtonStyle}
            onClick={onDismiss}
            type="button"
            aria-label="Dismiss notification"
          >
            ×
          </button>
        )}
      </div>
      <ActionBar
        actions={actions}
        onAction={onAction}
        loadingAction={loadingAction}
        darkMode={darkMode}
      />
    </div>
  );
}

// ============================================================================
// QUICK SNOOZE PICKER
// ============================================================================

interface QuickSnoozePickerProps {
  onSelect: (minutes: number) => void;
  onCancel?: () => void;
  loading?: boolean;
  darkMode?: boolean;
}

const SNOOZE_OPTIONS = [
  { minutes: 5, label: '5 min' },
  { minutes: 10, label: '10 min' },
  { minutes: 15, label: '15 min' },
  { minutes: 30, label: '30 min' },
  { minutes: 60, label: '1 hour' },
];

/**
 * Quick snooze duration picker
 */
export function QuickSnoozePicker({
  onSelect,
  onCancel,
  loading = false,
  darkMode = false,
}: QuickSnoozePickerProps) {
  const containerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing[3],
    padding: spacing[4],
    backgroundColor: darkMode ? colors.neutral[800] : colors.surface.light,
    borderRadius: borderRadius.xl,
  };

  const titleStyle: CSSProperties = {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: darkMode ? colors.text.secondary.dark : colors.text.secondary.light,
    margin: 0,
    textAlign: 'center',
  };

  const optionsStyle: CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: spacing[2],
    justifyContent: 'center',
  };

  const optionButtonStyle: CSSProperties = {
    minWidth: 70,
    padding: `${spacing[2]}px ${spacing[3]}px`,
    backgroundColor: darkMode ? colors.neutral[700] : colors.neutral[100],
    color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
    border: `1px solid ${darkMode ? colors.neutral[600] : colors.neutral[300]}`,
    borderRadius: borderRadius.lg,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    cursor: loading ? 'not-allowed' : 'pointer',
    opacity: loading ? 0.6 : 1,
  };

  const cancelButtonStyle: CSSProperties = {
    padding: `${spacing[2]}px ${spacing[3]}px`,
    backgroundColor: 'transparent',
    color: darkMode ? colors.text.muted.dark : colors.text.muted.light,
    border: 'none',
    borderRadius: borderRadius.lg,
    fontSize: typography.fontSize.sm,
    cursor: 'pointer',
    textAlign: 'center',
  };

  return (
    <div style={containerStyle}>
      <p style={titleStyle}>Snooze for:</p>
      <div style={optionsStyle}>
        {SNOOZE_OPTIONS.map((option) => (
          <button
            key={option.minutes}
            style={optionButtonStyle}
            onClick={() => !loading && onSelect(option.minutes)}
            disabled={loading}
            type="button"
          >
            {option.label}
          </button>
        ))}
      </div>
      {onCancel && (
        <button style={cancelButtonStyle} onClick={onCancel} type="button">
          Cancel
        </button>
      )}
    </div>
  );
}

// ============================================================================
// ACTION FEEDBACK TOAST
// ============================================================================

interface ActionFeedbackToastProps {
  feedback: ActionFeedback;
  onDismiss: () => void;
  autoDismissMs?: number;
  darkMode?: boolean;
}

/**
 * Toast notification for action feedback
 */
export function ActionFeedbackToast({
  feedback,
  onDismiss,
  autoDismissMs = 3000,
  darkMode = false,
}: ActionFeedbackToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (feedback.autoDismiss !== false) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onDismiss, 200);
      }, autoDismissMs);
      return () => clearTimeout(timer);
    }
  }, [feedback, autoDismissMs, onDismiss]);

  const getTypeStyles = (): { bg: string; border: string; icon: string } => {
    switch (feedback.type) {
      case 'success':
        return {
          bg: darkMode ? colors.success[900] : colors.success[50],
          border: colors.success[500],
          icon: '✓',
        };
      case 'error':
        return {
          bg: darkMode ? colors.danger[900] : colors.danger[50],
          border: colors.danger[500],
          icon: '✕',
        };
      case 'pending':
        return {
          bg: darkMode ? colors.warning[900] : colors.warning[50],
          border: colors.warning[500],
          icon: '⏳',
        };
      case 'info':
      default:
        return {
          bg: darkMode ? colors.neutral[800] : colors.neutral[100],
          border: colors.primary[500],
          icon: 'ℹ',
        };
    }
  };

  const typeStyles = getTypeStyles();

  const containerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[3],
    padding: `${spacing[3]}px ${spacing[4]}px`,
    backgroundColor: typeStyles.bg,
    borderRadius: borderRadius.lg,
    borderLeft: `4px solid ${typeStyles.border}`,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateY(0)' : 'translateY(-10px)',
    transition: `all ${animation.duration.normal}ms ${animation.easing.standard}`,
    maxWidth: 360,
  };

  const iconStyle: CSSProperties = {
    width: 24,
    height: 24,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: typeStyles.border,
    color: '#ffffff',
    borderRadius: borderRadius.full,
    fontSize: 14,
    fontWeight: typography.fontWeight.bold,
    flexShrink: 0,
  };

  const contentStyle: CSSProperties = {
    flex: 1,
    minWidth: 0,
  };

  const titleStyle: CSSProperties = {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
    margin: 0,
  };

  const messageStyle: CSSProperties = {
    fontSize: typography.fontSize.xs,
    color: darkMode ? colors.text.secondary.dark : colors.text.secondary.light,
    margin: 0,
    marginTop: 2,
  };

  return (
    <div style={containerStyle} role="alert" aria-live="polite">
      <div style={iconStyle}>{typeStyles.icon}</div>
      <div style={contentStyle}>
        <p style={titleStyle}>{feedback.title}</p>
        {feedback.message && <p style={messageStyle}>{feedback.message}</p>}
      </div>
      <button
        style={{
          background: 'none',
          border: 'none',
          color: darkMode ? colors.text.muted.dark : colors.text.muted.light,
          cursor: 'pointer',
          padding: spacing[1],
          fontSize: 16,
        }}
        onClick={onDismiss}
        type="button"
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
}

// ============================================================================
// ACTION FEEDBACK PROVIDER
// ============================================================================

interface ActionFeedbackContextValue {
  showFeedback: (feedback: Omit<ActionFeedback, 'id' | 'timestamp'>) => string;
  dismissFeedback: (id: string) => void;
  clearAll: () => void;
}

const ActionFeedbackContext = createContext<ActionFeedbackContextValue | null>(
  null
);

interface ActionFeedbackProviderProps {
  children: ReactNode;
  maxVisible?: number;
  darkMode?: boolean;
}

/**
 * Provider for managing action feedback toasts
 */
export function ActionFeedbackProvider({
  children,
  maxVisible = 3,
  darkMode = false,
}: ActionFeedbackProviderProps) {
  const [feedbacks, setFeedbacks] = useState<ActionFeedback[]>([]);

  const showFeedback = useCallback(
    (feedback: Omit<ActionFeedback, 'id' | 'timestamp'>) => {
      const id = `feedback_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      const newFeedback: ActionFeedback = {
        ...feedback,
        id,
        timestamp: new Date(),
      };

      setFeedbacks((prev) => {
        const updated = [newFeedback, ...prev];
        return updated.slice(0, maxVisible);
      });

      return id;
    },
    [maxVisible]
  );

  const dismissFeedback = useCallback((id: string) => {
    setFeedbacks((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setFeedbacks([]);
  }, []);

  const containerStyle: CSSProperties = {
    position: 'fixed',
    top: spacing[4],
    right: spacing[4],
    display: 'flex',
    flexDirection: 'column',
    gap: spacing[2],
    zIndex: 9999,
    pointerEvents: 'none',
  };

  const toastWrapperStyle: CSSProperties = {
    pointerEvents: 'auto',
  };

  return (
    <ActionFeedbackContext.Provider
      value={{ showFeedback, dismissFeedback, clearAll }}
    >
      {children}
      <div style={containerStyle}>
        {feedbacks.map((feedback) => (
          <div key={feedback.id} style={toastWrapperStyle}>
            <ActionFeedbackToast
              feedback={feedback}
              onDismiss={() => dismissFeedback(feedback.id)}
              darkMode={darkMode}
            />
          </div>
        ))}
      </div>
    </ActionFeedbackContext.Provider>
  );
}

/**
 * Hook to use action feedback
 */
export function useActionFeedback(): ActionFeedbackContextValue {
  const context = useContext(ActionFeedbackContext);
  if (!context) {
    throw new Error(
      'useActionFeedback must be used within ActionFeedbackProvider'
    );
  }
  return context;
}

// ============================================================================
// VOICE REPLY COMPONENT
// ============================================================================

interface VoiceReplyProps {
  onResult: (transcript: string) => void;
  onCancel?: () => void;
  listening?: boolean;
  darkMode?: boolean;
}

/**
 * Voice reply recording component (placeholder - needs speech recognition API)
 */
export function VoiceReply({
  onResult,
  onCancel,
  listening = false,
  darkMode = false,
}: VoiceReplyProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');

  const containerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: spacing[4],
    padding: spacing[5],
    backgroundColor: darkMode ? colors.neutral[800] : colors.surface.light,
    borderRadius: borderRadius.xl,
  };

  const micButtonStyle: CSSProperties = {
    width: 80,
    height: 80,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: isRecording ? colors.danger[500] : colors.primary[500],
    color: '#ffffff',
    border: 'none',
    borderRadius: borderRadius.full,
    fontSize: 32,
    cursor: 'pointer',
    boxShadow: isRecording
      ? '0 0 0 8px rgba(239, 68, 68, 0.2)'
      : '0 4px 12px rgba(0, 0, 0, 0.2)',
    animation: isRecording ? 'pulse 1.5s infinite' : 'none',
  };

  const statusStyle: CSSProperties = {
    fontSize: typography.fontSize.sm,
    color: isRecording
      ? colors.danger[500]
      : darkMode
        ? colors.text.secondary.dark
        : colors.text.secondary.light,
    margin: 0,
  };

  const transcriptStyle: CSSProperties = {
    padding: spacing[3],
    backgroundColor: darkMode ? colors.neutral[700] : colors.neutral[100],
    borderRadius: borderRadius.lg,
    fontSize: typography.fontSize.sm,
    color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
    width: '100%',
    textAlign: 'center',
    minHeight: 44,
  };

  const cancelStyle: CSSProperties = {
    padding: `${spacing[2]}px ${spacing[4]}px`,
    backgroundColor: 'transparent',
    color: darkMode ? colors.text.muted.dark : colors.text.muted.light,
    border: 'none',
    fontSize: typography.fontSize.sm,
    cursor: 'pointer',
  };

  const handleMicClick = () => {
    if (isRecording) {
      setIsRecording(false);
      if (transcript) {
        onResult(transcript);
      }
    } else {
      setIsRecording(true);
      setTranscript('');
      // Note: Actual speech recognition would be implemented here
      // using the Web Speech API or a native module
    }
  };

  return (
    <div style={containerStyle}>
      <button
        style={micButtonStyle}
        onClick={handleMicClick}
        type="button"
        aria-label={isRecording ? 'Stop recording' : 'Start voice reply'}
      >
        {isRecording ? '⬛' : '🎤'}
      </button>
      <p style={statusStyle}>{isRecording ? 'Listening...' : 'Tap to speak'}</p>
      {transcript && <div style={transcriptStyle}>{transcript}</div>}
      {onCancel && (
        <button style={cancelStyle} onClick={onCancel} type="button">
          Cancel
        </button>
      )}
      <style>
        {`
          @keyframes pulse {
            0%, 100% { box-shadow: 0 0 0 8px rgba(239, 68, 68, 0.2); }
            50% { box-shadow: 0 0 0 16px rgba(239, 68, 68, 0.1); }
          }
        `}
      </style>
    </div>
  );
}

// ============================================================================
// QUICK ADD INPUT
// ============================================================================

interface QuickAddInputProps {
  onSubmit: (text: string) => void;
  onCancel?: () => void;
  placeholder?: string;
  loading?: boolean;
  darkMode?: boolean;
}

/**
 * Quick add task input from notification
 */
export function QuickAddInput({
  onSubmit,
  onCancel,
  placeholder = 'Add a task...',
  loading = false,
  darkMode = false,
}: QuickAddInputProps) {
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const containerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing[3],
    padding: spacing[4],
    backgroundColor: darkMode ? colors.neutral[800] : colors.surface.light,
    borderRadius: borderRadius.xl,
  };

  const inputRowStyle: CSSProperties = {
    display: 'flex',
    gap: spacing[2],
  };

  const inputStyle: CSSProperties = {
    flex: 1,
    padding: `${spacing[3]}px ${spacing[4]}px`,
    backgroundColor: darkMode ? colors.neutral[700] : colors.neutral[100],
    color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
    border: `1px solid ${darkMode ? colors.neutral[600] : colors.neutral[300]}`,
    borderRadius: borderRadius.lg,
    fontSize: typography.fontSize.base,
    outline: 'none',
  };

  const submitButtonStyle: CSSProperties = {
    padding: `${spacing[2]}px ${spacing[4]}px`,
    backgroundColor: colors.primary[500],
    color: '#ffffff',
    border: 'none',
    borderRadius: borderRadius.lg,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    cursor: loading || !text.trim() ? 'not-allowed' : 'pointer',
    opacity: loading || !text.trim() ? 0.6 : 1,
  };

  const cancelStyle: CSSProperties = {
    padding: `${spacing[2]}px ${spacing[3]}px`,
    backgroundColor: 'transparent',
    color: darkMode ? colors.text.muted.dark : colors.text.muted.light,
    border: 'none',
    fontSize: typography.fontSize.sm,
    cursor: 'pointer',
    textAlign: 'center',
  };

  const handleSubmit = () => {
    if (text.trim() && !loading) {
      onSubmit(text.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    } else if (e.key === 'Escape' && onCancel) {
      onCancel();
    }
  };

  return (
    <div style={containerStyle}>
      <div style={inputRowStyle}>
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          style={inputStyle}
          disabled={loading}
          aria-label="Task title"
        />
        <button
          style={submitButtonStyle}
          onClick={handleSubmit}
          disabled={loading || !text.trim()}
          type="button"
        >
          {loading ? <LoadingSpinner size={16} /> : 'Add'}
        </button>
      </div>
      {onCancel && (
        <button style={cancelStyle} onClick={onCancel} type="button">
          Cancel
        </button>
      )}
    </div>
  );
}

// ============================================================================
// LOADING SPINNER COMPONENT
// ============================================================================

interface LoadingSpinnerProps {
  size?: number;
  color?: string;
}

function LoadingSpinner({
  size = 20,
  color = 'currentColor',
}: LoadingSpinnerProps) {
  const spinnerStyle: CSSProperties = {
    width: size,
    height: size,
    border: `2px solid transparent`,
    borderTopColor: color,
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  };

  return (
    <>
      <div style={spinnerStyle} aria-label="Loading" />
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </>
  );
}

// ============================================================================
// NOTIFICATION ACTION PRESETS
// ============================================================================

/**
 * Preset action configurations for common scenarios
 */
export const ACTION_PRESETS = {
  taskReminder: [
    {
      id: 'complete',
      type: 'complete_task' as NotificationActionType,
      label: '✓ Done',
      variant: 'success' as const,
    },
    {
      id: 'snooze',
      type: 'snooze' as NotificationActionType,
      label: '⏰ Snooze',
      variant: 'secondary' as const,
    },
    {
      id: 'timer',
      type: 'start_timer' as NotificationActionType,
      label: '▶ Start',
      variant: 'primary' as const,
    },
  ],

  encouragement: [
    {
      id: 'view',
      type: 'view' as NotificationActionType,
      label: 'View Tasks',
      variant: 'primary' as const,
    },
    {
      id: 'dismiss',
      type: 'dismiss' as NotificationActionType,
      label: 'Thanks!',
      variant: 'secondary' as const,
    },
  ],

  streak: [
    {
      id: 'view',
      type: 'view' as NotificationActionType,
      label: 'Keep Going!',
      variant: 'success' as const,
    },
    {
      id: 'quick_add',
      type: 'quick_add' as NotificationActionType,
      label: '+ Add Task',
      variant: 'secondary' as const,
    },
  ],

  gentleNudge: [
    {
      id: 'view',
      type: 'view' as NotificationActionType,
      label: "I'm Ready",
      variant: 'primary' as const,
    },
    {
      id: 'snooze',
      type: 'snooze' as NotificationActionType,
      label: 'Later',
      variant: 'secondary' as const,
    },
  ],
};

// ============================================================================
// EXPORTS
// ============================================================================

export {
  ActionButton,
  ActionBar,
  InlineActionNotification,
  QuickSnoozePicker,
  ActionFeedbackToast,
  ActionFeedbackProvider,
  useActionFeedback,
  VoiceReply,
  QuickAddInput,
  ACTION_PRESETS,
};
