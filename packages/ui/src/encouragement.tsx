'use client';

import {
  type CSSProperties,
  type ReactNode,
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
} from 'react';
import {
  colors,
  spacing,
  typography,
  borderRadius,
  animation,
  touchTarget,
  shadows,
} from './tokens';
import { useMotion } from './motion';
import { useHaptics } from './haptics';
import type {
  EncouragementContext as MessageContext,
  EncouragementMessage,
} from '@procrastinact/types';

// ============================================================================
// TYPES
// ============================================================================

export interface EncouragementDisplayProps {
  message: string;
  context?: MessageContext;
  darkMode?: boolean;
  style?: CSSProperties;
}

export interface EncouragementCardProps {
  message: EncouragementMessage;
  isFavorite?: boolean;
  onFavoriteToggle?: (id: string) => void;
  onShare?: (message: string) => void;
  darkMode?: boolean;
  animated?: boolean;
}

export interface EncouragementFeedProps {
  messages: EncouragementMessage[];
  favorites: Set<string>;
  onFavoriteToggle: (id: string) => void;
  darkMode?: boolean;
}

// ============================================================================
// CONTEXT COLORS
// ============================================================================

const CONTEXT_COLORS: Record<
  MessageContext,
  { bg: string; text: string; accent: string }
> = {
  starting: {
    bg: colors.primary[50],
    text: colors.primary[700],
    accent: colors.primary[500],
  },
  struggling: {
    bg: '#fff7ed', // warm orange
    text: '#9a3412',
    accent: '#f97316',
  },
  completing: {
    bg: colors.successScale[50],
    text: colors.successScale[700],
    accent: colors.success,
  },
  stopping: {
    bg: colors.neutral[100],
    text: colors.neutral[700],
    accent: colors.neutral[500],
  },
  returning: {
    bg: colors.accent[50],
    text: colors.accent[700],
    accent: colors.accent[500],
  },
  low_energy: {
    bg: '#faf5ff', // soft purple
    text: '#6b21a8',
    accent: '#a855f7',
  },
  high_achievement: {
    bg: colors.secondary[50],
    text: colors.secondary[700],
    accent: colors.secondary[500],
  },
};

const CONTEXT_COLORS_DARK: Record<
  MessageContext,
  { bg: string; text: string; accent: string }
> = {
  starting: {
    bg: colors.primary[900],
    text: colors.primary[200],
    accent: colors.primary[400],
  },
  struggling: {
    bg: '#451a03',
    text: '#fed7aa',
    accent: '#f97316',
  },
  completing: {
    bg: colors.successScale[900],
    text: colors.successScale[200],
    accent: colors.success,
  },
  stopping: {
    bg: colors.neutral[800],
    text: colors.neutral[300],
    accent: colors.neutral[400],
  },
  returning: {
    bg: colors.accent[900],
    text: colors.accent[200],
    accent: colors.accent[400],
  },
  low_energy: {
    bg: '#3b0764',
    text: '#e9d5ff',
    accent: '#a855f7',
  },
  high_achievement: {
    bg: colors.secondary[900],
    text: colors.secondary[200],
    accent: colors.secondary[400],
  },
};

// ============================================================================
// SIMPLE ENCOURAGEMENT DISPLAY
// ============================================================================

/**
 * Simple encouragement message display
 */
export function Encouragement({
  message,
  context,
  darkMode = false,
  style,
}: EncouragementDisplayProps) {
  const contextColors = context
    ? (darkMode ? CONTEXT_COLORS_DARK : CONTEXT_COLORS)[context]
    : null;

  const containerStyle: CSSProperties = {
    padding: spacing[4],
    textAlign: 'center',
    backgroundColor: contextColors?.bg || 'transparent',
    borderRadius: borderRadius.lg,
    ...style,
  };

  const textStyle: CSSProperties = {
    fontSize: typography.fontSize.base,
    color:
      contextColors?.text ||
      (darkMode ? colors.text.secondary.dark : colors.text.secondary.light),
    fontStyle: 'italic',
    fontFamily: typography.fontFamily.sans,
    lineHeight: typography.lineHeight.relaxed,
    margin: 0,
  };

  return (
    <div style={containerStyle}>
      <p style={textStyle}>&ldquo;{message}&rdquo;</p>
    </div>
  );
}

// ============================================================================
// ENCOURAGEMENT CARD
// ============================================================================

/**
 * Card-style encouragement with favorite and share actions
 */
export function EncouragementCard({
  message,
  isFavorite = false,
  onFavoriteToggle,
  onShare,
  darkMode = false,
  animated = true,
}: EncouragementCardProps) {
  const { reducedMotion } = useMotion();
  const { trigger } = useHaptics();
  const [isAnimating, setIsAnimating] = useState(animated);

  const contextColors = (darkMode ? CONTEXT_COLORS_DARK : CONTEXT_COLORS)[
    message.context
  ];

  useEffect(() => {
    if (animated && !reducedMotion) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [message.id, animated, reducedMotion]);

  const handleFavorite = useCallback(() => {
    trigger(isFavorite ? 'tap' : 'success');
    onFavoriteToggle?.(message.id);
  }, [trigger, isFavorite, onFavoriteToggle, message.id]);

  const handleShare = useCallback(() => {
    trigger('tap');
    onShare?.(message.text);
  }, [trigger, onShare, message.text]);

  const containerStyle: CSSProperties = {
    padding: spacing[5],
    backgroundColor: darkMode ? colors.surface.dark : colors.surface.light,
    borderRadius: borderRadius.xl,
    borderLeft: `4px solid ${contextColors.accent}`,
    boxShadow: darkMode ? shadows.md : shadows.sm,
    transform:
      isAnimating && !reducedMotion ? 'translateY(10px)' : 'translateY(0)',
    opacity: isAnimating && !reducedMotion ? 0 : 1,
    transition: reducedMotion
      ? 'none'
      : `all ${animation.duration.normal}ms ${animation.easing.easeOut}`,
  };

  const labelStyle: CSSProperties = {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: contextColors.accent,
    textTransform: 'uppercase',
    letterSpacing: typography.letterSpacing.wider,
    marginBottom: spacing[2],
  };

  const textStyle: CSSProperties = {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
    lineHeight: typography.lineHeight.relaxed,
    margin: 0,
    marginBottom: spacing[4],
  };

  const actionsStyle: CSSProperties = {
    display: 'flex',
    gap: spacing[2],
    justifyContent: 'flex-end',
  };

  const buttonStyle = (isActive: boolean): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: touchTarget.minimum,
    height: touchTarget.minimum,
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: borderRadius.full,
    cursor: 'pointer',
    color: isActive
      ? colors.secondary[500]
      : darkMode
        ? colors.text.muted.dark
        : colors.text.muted.light,
    transition: `all ${animation.duration.fast}ms ${animation.easing.easeOut}`,
  });

  const contextLabel = message.context.replace('_', ' ');

  return (
    <div style={containerStyle}>
      <div style={labelStyle}>{contextLabel}</div>
      <p style={textStyle}>{message.text}</p>
      <div style={actionsStyle}>
        {onFavoriteToggle && (
          <button
            style={buttonStyle(isFavorite)}
            onClick={handleFavorite}
            type="button"
            aria-label={
              isFavorite ? 'Remove from favorites' : 'Add to favorites'
            }
            aria-pressed={isFavorite}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill={isFavorite ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </button>
        )}
        {onShare && (
          <button
            style={buttonStyle(false)}
            onClick={handleShare}
            type="button"
            aria-label="Share message"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// ENCOURAGEMENT BANNER
// ============================================================================

interface EncouragementBannerProps {
  message: string;
  context?: MessageContext;
  onDismiss?: () => void;
  onNext?: () => void;
  darkMode?: boolean;
}

/**
 * Full-width encouragement banner with navigation
 */
export function EncouragementBanner({
  message,
  context = 'starting',
  onDismiss,
  onNext,
  darkMode = false,
}: EncouragementBannerProps) {
  const { trigger } = useHaptics();
  const { reducedMotion } = useMotion();
  const contextColors = (darkMode ? CONTEXT_COLORS_DARK : CONTEXT_COLORS)[
    context
  ];

  const containerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[3],
    padding: `${spacing[4]}px ${spacing[5]}px`,
    backgroundColor: contextColors.bg,
    borderRadius: borderRadius.lg,
    animation: reducedMotion
      ? 'none'
      : `slideIn ${animation.duration.normal}ms ${animation.easing.easeOut}`,
  };

  const textStyle: CSSProperties = {
    flex: 1,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: contextColors.text,
    margin: 0,
    lineHeight: typography.lineHeight.snug,
  };

  const buttonStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: borderRadius.full,
    cursor: 'pointer',
    color: contextColors.accent,
    opacity: 0.7,
  };

  return (
    <div style={containerStyle}>
      <p style={textStyle}>{message}</p>
      {onNext && (
        <button
          style={buttonStyle}
          onClick={() => {
            trigger('tap');
            onNext();
          }}
          type="button"
          aria-label="Next message"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
          </svg>
        </button>
      )}
      {onDismiss && (
        <button
          style={buttonStyle}
          onClick={() => {
            trigger('tap');
            onDismiss();
          }}
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
          @keyframes slideIn {
            from {
              transform: translateY(-10px);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
        `}
      </style>
    </div>
  );
}

// ============================================================================
// ANIMATED MESSAGE DISPLAY
// ============================================================================

interface AnimatedMessageProps {
  message: string;
  typingSpeed?: number;
  showCursor?: boolean;
  onComplete?: () => void;
  darkMode?: boolean;
  style?: CSSProperties;
}

/**
 * Typewriter-style animated message display
 */
export function AnimatedMessage({
  message,
  typingSpeed = 30,
  showCursor = true,
  onComplete,
  darkMode = false,
  style,
}: AnimatedMessageProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const { reducedMotion } = useMotion();

  useEffect(() => {
    if (reducedMotion) {
      setDisplayedText(message);
      setIsComplete(true);
      onComplete?.();
      return;
    }

    setDisplayedText('');
    setIsComplete(false);

    let index = 0;
    const interval = setInterval(() => {
      if (index < message.length) {
        setDisplayedText(message.slice(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
        setIsComplete(true);
        onComplete?.();
      }
    }, typingSpeed);

    return () => clearInterval(interval);
  }, [message, typingSpeed, reducedMotion, onComplete]);

  const containerStyle: CSSProperties = {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
    lineHeight: typography.lineHeight.relaxed,
    fontFamily: typography.fontFamily.sans,
    ...style,
  };

  const cursorStyle: CSSProperties = {
    display: 'inline-block',
    width: 2,
    height: '1em',
    backgroundColor: colors.primary[500],
    marginLeft: 2,
    animation:
      isComplete || reducedMotion ? 'none' : 'blink 0.8s step-end infinite',
    verticalAlign: 'text-bottom',
  };

  return (
    <div style={containerStyle}>
      <span>{displayedText}</span>
      {showCursor && !isComplete && <span style={cursorStyle} />}
      <style>
        {`
          @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
          }
        `}
      </style>
    </div>
  );
}

// ============================================================================
// FAVORITES LIST
// ============================================================================

interface FavoritesListProps {
  favorites: EncouragementMessage[];
  onRemove: (id: string) => void;
  onShare?: (message: string) => void;
  darkMode?: boolean;
  emptyMessage?: string;
}

/**
 * Display list of favorite encouragement messages
 */
export function FavoritesList({
  favorites,
  onRemove,
  onShare,
  darkMode = false,
  emptyMessage = 'No favorites yet. Tap the heart on messages you love!',
}: FavoritesListProps) {
  const containerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing[3],
  };

  const emptyStyle: CSSProperties = {
    padding: spacing[8],
    textAlign: 'center',
    color: darkMode ? colors.text.muted.dark : colors.text.muted.light,
    fontSize: typography.fontSize.base,
    lineHeight: typography.lineHeight.relaxed,
  };

  if (favorites.length === 0) {
    return (
      <div style={emptyStyle}>
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          style={{ margin: '0 auto', marginBottom: spacing[4], opacity: 0.5 }}
        >
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
        <p style={{ margin: 0 }}>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      {favorites.map((message) => (
        <EncouragementCard
          key={message.id}
          message={message}
          isFavorite
          onFavoriteToggle={onRemove}
          onShare={onShare}
          darkMode={darkMode}
          animated={false}
        />
      ))}
    </div>
  );
}

// ============================================================================
// MESSAGE BROWSER
// ============================================================================

interface MessageBrowserProps {
  messages: EncouragementMessage[];
  favorites: Set<string>;
  onFavoriteToggle: (id: string) => void;
  selectedContext?: MessageContext;
  onContextChange?: (context: MessageContext | undefined) => void;
  darkMode?: boolean;
}

const ALL_CONTEXTS: MessageContext[] = [
  'starting',
  'struggling',
  'completing',
  'stopping',
  'returning',
  'low_energy',
  'high_achievement',
];

/**
 * Browse all encouragement messages with filtering
 */
export function MessageBrowser({
  messages,
  favorites,
  onFavoriteToggle,
  selectedContext,
  onContextChange,
  darkMode = false,
}: MessageBrowserProps) {
  const { trigger } = useHaptics();

  const filteredMessages = selectedContext
    ? messages.filter((m) => m.context === selectedContext)
    : messages;

  const containerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing[4],
  };

  const filtersStyle: CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: spacing[2],
    marginBottom: spacing[2],
  };

  const filterButtonStyle = (isActive: boolean): CSSProperties => ({
    padding: `${spacing[2]}px ${spacing[3]}px`,
    backgroundColor: isActive
      ? colors.primary[500]
      : darkMode
        ? colors.neutral[800]
        : colors.neutral[100],
    color: isActive
      ? 'white'
      : darkMode
        ? colors.text.secondary.dark
        : colors.text.secondary.light,
    border: 'none',
    borderRadius: borderRadius.full,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    cursor: 'pointer',
    textTransform: 'capitalize',
  });

  const listStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing[3],
    maxHeight: 400,
    overflowY: 'auto',
    paddingRight: spacing[2],
  };

  const countStyle: CSSProperties = {
    fontSize: typography.fontSize.sm,
    color: darkMode ? colors.text.muted.dark : colors.text.muted.light,
    marginBottom: spacing[3],
  };

  return (
    <div style={containerStyle}>
      <div style={filtersStyle}>
        <button
          style={filterButtonStyle(!selectedContext)}
          onClick={() => {
            trigger('tap');
            onContextChange?.(undefined);
          }}
          type="button"
        >
          All
        </button>
        {ALL_CONTEXTS.map((ctx) => (
          <button
            key={ctx}
            style={filterButtonStyle(selectedContext === ctx)}
            onClick={() => {
              trigger('tap');
              onContextChange?.(ctx);
            }}
            type="button"
          >
            {ctx.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div style={countStyle}>
        {filteredMessages.length} message
        {filteredMessages.length !== 1 ? 's' : ''}
      </div>

      <div style={listStyle}>
        {filteredMessages.map((message) => (
          <EncouragementCard
            key={message.id}
            message={message}
            isFavorite={favorites.has(message.id)}
            onFavoriteToggle={onFavoriteToggle}
            darkMode={darkMode}
            animated={false}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// ENCOURAGEMENT CONTEXT & PROVIDER
// ============================================================================

interface EncouragementState {
  currentMessage: EncouragementMessage | null;
  favorites: Set<string>;
  context: MessageContext;
}

interface EncouragementContextValue {
  state: EncouragementState;
  showMessage: (message: EncouragementMessage) => void;
  showRandomMessage: (context?: MessageContext) => void;
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  setContext: (context: MessageContext) => void;
  dismissMessage: () => void;
}

const EncouragementContext = createContext<EncouragementContextValue | null>(
  null
);

interface EncouragementProviderProps {
  children: ReactNode;
  initialFavorites?: string[];
  getRandomMessage?: (context: MessageContext) => EncouragementMessage;
  onFavoritesChange?: (favorites: string[]) => void;
}

/**
 * Provider for app-wide encouragement state
 */
export function EncouragementProvider({
  children,
  initialFavorites = [],
  getRandomMessage,
  onFavoritesChange,
}: EncouragementProviderProps) {
  const [state, setState] = useState<EncouragementState>({
    currentMessage: null,
    favorites: new Set(initialFavorites),
    context: 'starting',
  });

  const showMessage = useCallback((message: EncouragementMessage) => {
    setState((prev) => ({ ...prev, currentMessage: message }));
  }, []);

  const showRandomMessage = useCallback(
    (context?: MessageContext) => {
      if (getRandomMessage) {
        const ctx = context || state.context;
        const message = getRandomMessage(ctx);
        setState((prev) => ({
          ...prev,
          currentMessage: message,
          context: ctx,
        }));
      }
    },
    [getRandomMessage, state.context]
  );

  const toggleFavorite = useCallback(
    (id: string) => {
      setState((prev) => {
        const newFavorites = new Set(prev.favorites);
        if (newFavorites.has(id)) {
          newFavorites.delete(id);
        } else {
          newFavorites.add(id);
        }
        onFavoritesChange?.(Array.from(newFavorites));
        return { ...prev, favorites: newFavorites };
      });
    },
    [onFavoritesChange]
  );

  const isFavorite = useCallback(
    (id: string) => state.favorites.has(id),
    [state.favorites]
  );

  const setContext = useCallback((context: MessageContext) => {
    setState((prev) => ({ ...prev, context }));
  }, []);

  const dismissMessage = useCallback(() => {
    setState((prev) => ({ ...prev, currentMessage: null }));
  }, []);

  const value: EncouragementContextValue = {
    state,
    showMessage,
    showRandomMessage,
    toggleFavorite,
    isFavorite,
    setContext,
    dismissMessage,
  };

  return (
    <EncouragementContext.Provider value={value}>
      {children}
    </EncouragementContext.Provider>
  );
}

/**
 * Hook to access encouragement context
 */
export function useEncouragement(): EncouragementContextValue {
  const context = useContext(EncouragementContext);
  if (!context) {
    throw new Error(
      'useEncouragement must be used within EncouragementProvider'
    );
  }
  return context;
}

// ============================================================================
// FLOATING ENCOURAGEMENT
// ============================================================================

interface FloatingEncouragementProps {
  message: EncouragementMessage | null;
  onDismiss: () => void;
  onFavorite?: (id: string) => void;
  isFavorite?: boolean;
  position?: 'top' | 'bottom';
  darkMode?: boolean;
}

/**
 * Floating encouragement message overlay
 */
export function FloatingEncouragement({
  message,
  onDismiss,
  onFavorite,
  isFavorite = false,
  position = 'bottom',
  darkMode = false,
}: FloatingEncouragementProps) {
  const [isVisible, setIsVisible] = useState(false);
  const { reducedMotion } = useMotion();
  const { trigger } = useHaptics();

  useEffect(() => {
    if (message) {
      setIsVisible(true);
      trigger('gentle');

      // Auto-dismiss after 5 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onDismiss, reducedMotion ? 0 : 300);
      }, 5000);

      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [message, onDismiss, reducedMotion, trigger]);

  if (!message) return null;

  const contextColors = (darkMode ? CONTEXT_COLORS_DARK : CONTEXT_COLORS)[
    message.context
  ];

  const containerStyle: CSSProperties = {
    position: 'fixed',
    left: spacing[4],
    right: spacing[4],
    [position]: spacing[6],
    padding: spacing[4],
    backgroundColor: darkMode ? colors.surface.dark : colors.surface.light,
    borderRadius: borderRadius.xl,
    borderLeft: `4px solid ${contextColors.accent}`,
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
    zIndex: 1000,
    transform: isVisible
      ? 'translateY(0)'
      : position === 'bottom'
        ? 'translateY(100%)'
        : 'translateY(-100%)',
    opacity: isVisible ? 1 : 0,
    transition: reducedMotion
      ? 'opacity 100ms'
      : `transform 300ms ${animation.easing.easeOut}, opacity 300ms ${animation.easing.easeOut}`,
  };

  const contentStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: spacing[3],
  };

  const textStyle: CSSProperties = {
    flex: 1,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
    lineHeight: typography.lineHeight.snug,
    margin: 0,
  };

  const actionsStyle: CSSProperties = {
    display: 'flex',
    gap: spacing[1],
  };

  const buttonStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: borderRadius.full,
    cursor: 'pointer',
    color: darkMode ? colors.text.muted.dark : colors.text.muted.light,
  };

  return (
    <div style={containerStyle} role="alert" aria-live="polite">
      <div style={contentStyle}>
        <p style={textStyle}>{message.text}</p>
        <div style={actionsStyle}>
          {onFavorite && (
            <button
              style={{
                ...buttonStyle,
                color: isFavorite ? colors.secondary[500] : buttonStyle.color,
              }}
              onClick={() => {
                trigger(isFavorite ? 'tap' : 'success');
                onFavorite(message.id);
              }}
              type="button"
              aria-label={
                isFavorite ? 'Remove from favorites' : 'Add to favorites'
              }
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill={isFavorite ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </button>
          )}
          <button
            style={buttonStyle}
            onClick={() => {
              setIsVisible(false);
              setTimeout(onDismiss, reducedMotion ? 0 : 300);
            }}
            type="button"
            aria-label="Dismiss"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
