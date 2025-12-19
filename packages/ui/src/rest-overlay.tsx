'use client';

import { type CSSProperties, useState, useEffect, useMemo } from 'react';
import { colors, spacing, typography, borderRadius, animation } from './tokens';

interface RestOverlayProps {
  show: boolean;
  onDismiss?: () => void;
  onSetReminder?: (minutes: number) => void;
  completedTasks?: number;
  focusTime?: number; // in minutes
  darkMode?: boolean;
}

// Positive, non-guilt messages about resting
const REST_MESSAGES = [
  // Permission
  'Rest is part of the process.',
  'You did enough. Really.',
  "Taking a break? That's wisdom, not weakness.",
  "Pausing is a skill. You're practicing it.",
  'You have permission to stop.',
  "There's no shame in rest.",
  'Breaks are productive.',
  "You've earned this pause.",
  'Stepping back is moving forward.',
  "Rest isn't quitting. It's recharging.",

  // Validation
  'You showed up today. That matters.',
  "Progress was made, even if you can't see it all.",
  'What you did today counts.',
  "You don't have to finish everything.",
  'Partial progress is still progress.',
  'You did what you could with what you had.',
  "Some days, 'enough' is just showing up.",
  "You're not behind. You're where you are.",
  'Comparison is the thief of rest.',
  "Your worth isn't measured in tasks.",

  // Self-compassion
  "Be as kind to yourself as you'd be to a friend.",
  "You're doing better than you think.",
  'Tomorrow is another chance.',
  'Your brain needs downtime to process.',
  'Rest helps your mind solve problems.',
  'Taking care of yourself is productive.',
  'You matter more than any task.',
  'Burnout serves no one.',
  'Sustainable pace wins the race.',
  'Listen to what your mind needs.',

  // Reframing
  "Stopping isn't failing—it's choosing.",
  "You're not abandoning the task. You're respecting your limits.",
  'Coming back fresh is a strategy.',
  'Sometimes the most productive thing is rest.',
  'Quality over quantity. Always.',
  'A tired brain makes more work.',
  'Strategic rest is a power move.',
  "You're building for the long term.",
  'Marathon, not a sprint.',
  'Pacing yourself shows wisdom.',
];

// Get random rest message
function getRandomRestMessage(): string {
  return REST_MESSAGES[
    Math.floor(Math.random() * REST_MESSAGES.length)
  ] as string;
}

// Reminder options
const REMINDER_OPTIONS = [
  { label: 'In 15 minutes', minutes: 15 },
  { label: 'In 30 minutes', minutes: 30 },
  { label: 'In 1 hour', minutes: 60 },
  { label: 'Tomorrow', minutes: 24 * 60 },
  { label: 'No reminder', minutes: 0 },
];

export function RestOverlay({
  show,
  onDismiss,
  onSetReminder,
  completedTasks = 0,
  focusTime = 0,
  darkMode = false,
}: RestOverlayProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const message = useMemo(() => getRandomRestMessage(), []);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      setIsAnimating(true);

      // Gentle haptic
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([30, 50, 30]);
      }
    } else {
      setIsAnimating(false);
      setTimeout(() => setIsVisible(false), 300);
    }
  }, [show]);

  if (!isVisible) return null;

  const handleReminder = (minutes: number) => {
    if (minutes > 0) {
      onSetReminder?.(minutes);
    }
    onDismiss?.();
  };

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
    // Warm, calming gradient
    background: darkMode
      ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
      : 'linear-gradient(135deg, #fef7f0 0%, #fff1e6 50%, #ffe4d6 100%)',
    zIndex: 9999,
    opacity: isAnimating ? 1 : 0,
    transition: `opacity 300ms ${animation.easing.easeOut}`,
    padding: spacing[6],
    overflow: 'auto',
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
    width: 64,
    height: 64,
    margin: '0 auto',
    marginBottom: spacing[4],
    color: darkMode ? colors.primary[300] : colors.primary[600],
  };

  const messageStyle: CSSProperties = {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    fontFamily: typography.fontFamily.sans,
    color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
    margin: 0,
    marginBottom: spacing[6],
    lineHeight: typography.lineHeight.relaxed,
  };

  const summaryStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    gap: spacing[6],
    marginBottom: spacing[8],
    padding: spacing[4],
    backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
    borderRadius: borderRadius.lg,
  };

  const statStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  };

  const statValueStyle: CSSProperties = {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    fontFamily: typography.fontFamily.sans,
    color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
  };

  const statLabelStyle: CSSProperties = {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.sans,
    color: darkMode ? colors.text.secondary.dark : colors.text.secondary.light,
  };

  const reminderSectionStyle: CSSProperties = {
    marginTop: spacing[4],
  };

  const reminderTitleStyle: CSSProperties = {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    fontFamily: typography.fontFamily.sans,
    color: darkMode ? colors.text.secondary.dark : colors.text.secondary.light,
    marginBottom: spacing[3],
  };

  const reminderButtonsStyle: CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: spacing[2],
    justifyContent: 'center',
  };

  const reminderButtonStyle = (isNoReminder: boolean): CSSProperties => ({
    padding: `${spacing[2]}px ${spacing[4]}px`,
    backgroundColor: isNoReminder
      ? 'transparent'
      : darkMode
        ? colors.neutral[700]
        : colors.neutral[100],
    color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
    border: `1px solid ${darkMode ? colors.neutral[600] : colors.neutral[300]}`,
    borderRadius: borderRadius.lg,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.sans,
    cursor: 'pointer',
    transition: `all ${animation.duration.fast}ms`,
  });

  // Format focus time nicely
  const formatTime = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <div style={overlayStyle} role="dialog" aria-label="Taking a break">
      <div style={contentStyle}>
        {/* Calming icon (moon/stars) */}
        <svg style={iconStyle} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.43 2.3c-2.38-.59-4.68-.27-6.63.64-.35.16-.41.64-.1.86C8.3 5.6 10 8.6 10 12c0 3.4-1.7 6.4-4.3 8.2-.32.22-.26.7.09.86 1.28.6 2.71.94 4.21.94 6.05 0 10.85-5.38 9.87-11.6-.61-3.92-3.59-7.16-7.44-8.1z" />
        </svg>

        <p style={messageStyle}>{message}</p>

        {/* Session summary - what WAS done (not what wasn't) */}
        {(completedTasks > 0 || focusTime > 0) && (
          <div style={summaryStyle}>
            {completedTasks > 0 && (
              <div style={statStyle}>
                <span style={statValueStyle}>{completedTasks}</span>
                <span style={statLabelStyle}>
                  {completedTasks === 1 ? 'task completed' : 'tasks completed'}
                </span>
              </div>
            )}
            {focusTime > 0 && (
              <div style={statStyle}>
                <span style={statValueStyle}>{formatTime(focusTime)}</span>
                <span style={statLabelStyle}>focused time</span>
              </div>
            )}
          </div>
        )}

        {/* Reminder options */}
        <div style={reminderSectionStyle}>
          <p style={reminderTitleStyle}>Want a gentle reminder to come back?</p>
          <div style={reminderButtonsStyle}>
            {REMINDER_OPTIONS.map((option) => (
              <button
                key={option.minutes}
                style={reminderButtonStyle(option.minutes === 0)}
                onClick={() => handleReminder(option.minutes)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
