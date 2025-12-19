'use client';

import {
  type CSSProperties,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
  animation,
  touchTarget,
  zIndex,
} from './tokens';
import { useHaptics, HapticPatterns } from './haptics';

// ============================================================================
// SOUND OPTIONS
// ============================================================================

export type TimerSound =
  | 'tibetan-bowl'
  | 'soft-bell'
  | 'water-drop'
  | 'bird'
  | 'none';

export const TimerSounds: Record<TimerSound, { label: string; emoji: string }> =
  {
    'tibetan-bowl': { label: 'Tibetan Bowl', emoji: '🔔' },
    'soft-bell': { label: 'Soft Bell', emoji: '🛎️' },
    'water-drop': { label: 'Water Drop', emoji: '💧' },
    bird: { label: 'Bird Song', emoji: '🐦' },
    none: { label: 'Silent', emoji: '🔇' },
  };

// ============================================================================
// GENTLE MESSAGES
// ============================================================================

const COMPLETION_MESSAGES = [
  // Curious, not demanding
  "Time's up! How did it go?",
  'Your timer has finished.',
  'The time you set has passed.',
  "That's your focus time complete.",
  'Timer done. Take a breath.',

  // Encouraging
  'You stayed with it. Nice.',
  'Focus session complete.',
  'You showed up for that time.',
  "That's dedication.",
  'Well done for seeing it through.',

  // Gentle inquiry
  'How are you feeling?',
  'Ready to wrap up?',
  'What would feel good now?',
  'Time to check in with yourself.',
  'Your focused time is complete.',
];

function getRandomMessage(): string {
  return COMPLETION_MESSAGES[
    Math.floor(Math.random() * COMPLETION_MESSAGES.length)
  ] as string;
}

// ============================================================================
// TIMER COMPLETE OVERLAY
// ============================================================================

interface TimerCompleteProps {
  show: boolean;
  /** Duration that was completed (in minutes) */
  completedMinutes: number;
  /** Task name if applicable */
  taskName?: string;
  /** Callback when user wants to extend time */
  onExtend: () => void;
  /** Callback when user marks task complete */
  onComplete: () => void;
  /** Callback when user dismisses without action */
  onDismiss: () => void;
  /** Sound to play */
  sound?: TimerSound;
  /** Dark mode */
  darkMode?: boolean;
  /** Custom message override */
  message?: string;
}

export function TimerComplete({
  show,
  completedMinutes,
  taskName,
  onExtend,
  onComplete,
  onDismiss,
  sound = 'soft-bell',
  darkMode = false,
  message,
}: TimerCompleteProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const { trigger } = useHaptics();

  const displayMessage = useMemo(
    () => message || getRandomMessage(),
    [message]
  );

  // Handle show/hide with animation
  useEffect(() => {
    if (show) {
      setIsVisible(true);
      setIsAnimating(true);

      // Gentle haptic (not aggressive)
      trigger(HapticPatterns.timerComplete);

      // Play sound (would integrate with actual audio system)
      if (sound !== 'none') {
        // Audio playback would go here
        // For now, we'll just trigger the visual
      }
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [show, sound, trigger]);

  const handleExtend = useCallback(() => {
    trigger('gentle');
    onExtend();
  }, [onExtend, trigger]);

  const handleComplete = useCallback(() => {
    trigger('taskComplete');
    onComplete();
  }, [onComplete, trigger]);

  const handleDismiss = useCallback(() => {
    trigger('tap');
    onDismiss();
  }, [onDismiss, trigger]);

  if (!isVisible) return null;

  // Soft, warm gradient (not jarring flash)
  const overlayStyle: CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: darkMode
      ? 'linear-gradient(180deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%)'
      : 'linear-gradient(180deg, #fef3c7 0%, #fde68a 50%, #fef3c7 100%)',
    zIndex: zIndex.celebration,
    opacity: isAnimating ? 1 : 0,
    transition: `opacity ${animation.duration.slow}ms ${animation.easing.easeOut}`,
    padding: spacing[6],
  };

  const contentStyle: CSSProperties = {
    maxWidth: 400,
    width: '100%',
    textAlign: 'center',
    transform: isAnimating ? 'translateY(0)' : 'translateY(20px)',
    opacity: isAnimating ? 1 : 0,
    transition: `all ${animation.duration.normal}ms ${animation.easing.easeOut}`,
  };

  const iconStyle: CSSProperties = {
    width: 80,
    height: 80,
    margin: '0 auto',
    marginBottom: spacing[4],
    color: darkMode ? colors.secondary[300] : colors.secondary[600],
  };

  const messageStyle: CSSProperties = {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.semibold,
    fontFamily: typography.fontFamily.sans,
    color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
    margin: 0,
    marginBottom: spacing[2],
  };

  const subtitleStyle: CSSProperties = {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.sans,
    color: darkMode ? colors.text.secondary.dark : colors.text.secondary.light,
    margin: 0,
    marginBottom: spacing[8],
  };

  const taskNameStyle: CSSProperties = {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.sans,
    color: darkMode ? colors.text.muted.dark : colors.text.muted.light,
    margin: 0,
    marginBottom: spacing[6],
    padding: `${spacing[2]}px ${spacing[4]}px`,
    backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
    borderRadius: borderRadius.lg,
    display: 'inline-block',
  };

  const buttonsStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing[3],
    width: '100%',
    maxWidth: 280,
    margin: '0 auto',
  };

  const primaryButtonStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    padding: `${spacing[4]}px ${spacing[6]}px`,
    minHeight: touchTarget.comfortable,
    backgroundColor: colors.success,
    color: 'white',
    border: 'none',
    borderRadius: borderRadius.xl,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    fontFamily: typography.fontFamily.sans,
    cursor: 'pointer',
    boxShadow: shadows.md,
    transition: `all ${animation.duration.fast}ms`,
    WebkitTapHighlightColor: 'transparent',
    touchAction: 'manipulation',
  };

  const secondaryButtonStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    padding: `${spacing[3]}px ${spacing[5]}px`,
    minHeight: touchTarget.minimum,
    backgroundColor: darkMode ? colors.neutral[700] : colors.neutral[100],
    color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
    border: `1px solid ${darkMode ? colors.neutral[600] : colors.neutral[300]}`,
    borderRadius: borderRadius.lg,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    fontFamily: typography.fontFamily.sans,
    cursor: 'pointer',
    transition: `all ${animation.duration.fast}ms`,
    WebkitTapHighlightColor: 'transparent',
    touchAction: 'manipulation',
  };

  const tertiaryButtonStyle: CSSProperties = {
    padding: `${spacing[2]}px ${spacing[4]}px`,
    minHeight: touchTarget.minimum,
    backgroundColor: 'transparent',
    color: darkMode ? colors.text.muted.dark : colors.text.muted.light,
    border: 'none',
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.sans,
    cursor: 'pointer',
    WebkitTapHighlightColor: 'transparent',
    touchAction: 'manipulation',
  };

  const formatTime = (minutes: number): string => {
    if (minutes < 60) return `${minutes} min`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  return (
    <div style={overlayStyle} role="dialog" aria-label="Timer complete">
      <div style={contentStyle}>
        {/* Gentle icon (not alarm) */}
        <svg style={iconStyle} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z" />
        </svg>

        <p style={messageStyle}>{displayMessage}</p>
        <p style={subtitleStyle}>
          {formatTime(completedMinutes)} of focused time
        </p>

        {taskName && <p style={taskNameStyle}>{taskName}</p>}

        <div style={buttonsStyle}>
          {/* Primary: Mark complete */}
          <button
            style={primaryButtonStyle}
            onClick={handleComplete}
            type="button"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
            I finished!
          </button>

          {/* Secondary: Extend time */}
          <button
            style={secondaryButtonStyle}
            onClick={handleExtend}
            type="button"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
            </svg>
            Need more time
          </button>

          {/* Tertiary: Just dismiss */}
          <button
            style={tertiaryButtonStyle}
            onClick={handleDismiss}
            type="button"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SOUND SELECTOR
// ============================================================================

interface TimerSoundSelectorProps {
  value: TimerSound;
  onChange: (sound: TimerSound) => void;
  darkMode?: boolean;
}

export function TimerSoundSelector({
  value,
  onChange,
  darkMode = false,
}: TimerSoundSelectorProps) {
  const { trigger } = useHaptics();

  const containerStyle: CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: spacing[2],
  };

  const optionStyle = (isSelected: boolean): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: spacing[2],
    padding: `${spacing[2]}px ${spacing[3]}px`,
    minHeight: touchTarget.minimum,
    backgroundColor: isSelected
      ? colors.primary[500]
      : darkMode
        ? colors.neutral[700]
        : colors.neutral[100],
    color: isSelected
      ? 'white'
      : darkMode
        ? colors.text.primary.dark
        : colors.text.primary.light,
    border: `1px solid ${
      isSelected
        ? colors.primary[500]
        : darkMode
          ? colors.neutral[600]
          : colors.neutral[200]
    }`,
    borderRadius: borderRadius.lg,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.sans,
    cursor: 'pointer',
    transition: `all ${animation.duration.fast}ms`,
    WebkitTapHighlightColor: 'transparent',
    touchAction: 'manipulation',
  });

  return (
    <div style={containerStyle} role="radiogroup" aria-label="Timer sound">
      {(
        Object.entries(TimerSounds) as [
          TimerSound,
          { label: string; emoji: string },
        ][]
      ).map(([key, { label, emoji }]) => (
        <button
          key={key}
          style={optionStyle(value === key)}
          onClick={() => {
            trigger('selection');
            onChange(key);
          }}
          role="radio"
          aria-checked={value === key}
          type="button"
        >
          <span>{emoji}</span>
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}
