'use client';

import { type CSSProperties, useEffect } from 'react';
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

export interface StreakInfo {
  streak: number;
  longestStreak: number;
  freezes: number;
  weeklyProgress: number;
  activeToday: boolean;
  atRisk: boolean;
  isPaused: boolean;
  message: string;
}

// ============================================================================
// STREAK BADGE (Compact)
// ============================================================================

interface StreakBadgeProps {
  streak: number;
  activeToday?: boolean;
  atRisk?: boolean;
  size?: 'small' | 'medium' | 'large';
  darkMode?: boolean;
}

/**
 * Compact streak display for headers
 */
export function StreakBadge({
  streak,
  activeToday = false,
  atRisk = false,
  size = 'medium',
  darkMode = false,
}: StreakBadgeProps) {
  const sizes = {
    small: {
      padding: `${spacing[1]}px ${spacing[2]}px`,
      fontSize: typography.fontSize.xs,
      iconSize: 12,
    },
    medium: {
      padding: `${spacing[1.5]}px ${spacing[3]}px`,
      fontSize: typography.fontSize.sm,
      iconSize: 14,
    },
    large: {
      padding: `${spacing[2]}px ${spacing[4]}px`,
      fontSize: typography.fontSize.base,
      iconSize: 18,
    },
  };

  const s = sizes[size];

  // Color based on state
  let bgColor = darkMode ? colors.neutral[700] : colors.neutral[100];
  let textColor = darkMode
    ? colors.text.primary.dark
    : colors.text.primary.light;
  let iconColor = colors.secondary[500];

  if (atRisk) {
    bgColor = `${colors.warning}20`;
    textColor = colors.warning;
    iconColor = colors.warning;
  } else if (activeToday) {
    bgColor = `${colors.success}20`;
    textColor = colors.success;
    iconColor = colors.success;
  } else if (streak >= 7) {
    bgColor = `${colors.secondary[500]}20`;
    textColor = darkMode ? colors.secondary[300] : colors.secondary[700];
  }

  const badgeStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: spacing[1],
    padding: s.padding,
    backgroundColor: bgColor,
    color: textColor,
    borderRadius: borderRadius.full,
    fontSize: s.fontSize,
    fontWeight: typography.fontWeight.semibold,
  };

  return (
    <span style={badgeStyle}>
      <svg
        width={s.iconSize}
        height={s.iconSize}
        viewBox="0 0 24 24"
        fill={iconColor}
      >
        <path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z" />
      </svg>
      <span>{streak}</span>
    </span>
  );
}

// ============================================================================
// STREAK CARD
// ============================================================================

interface StreakCardProps {
  info: StreakInfo;
  onPause?: () => void;
  darkMode?: boolean;
}

/**
 * Full streak card for profile/stats
 */
export function StreakCard({
  info,
  onPause,
  darkMode = false,
}: StreakCardProps) {
  const { trigger } = useHaptics();

  const cardStyle: CSSProperties = {
    padding: spacing[5],
    backgroundColor: darkMode ? colors.surface.dark : colors.surface.light,
    borderRadius: borderRadius.xl,
    border: `1px solid ${darkMode ? colors.border.dark : colors.border.light}`,
  };

  const headerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[4],
  };

  const titleStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[2],
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
    margin: 0,
  };

  const streakNumberStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'baseline',
    gap: spacing[1],
    marginBottom: spacing[2],
  };

  const bigNumberStyle: CSSProperties = {
    fontSize: typography.fontSize['5xl'],
    fontWeight: typography.fontWeight.bold,
    color: info.atRisk
      ? colors.warning
      : info.activeToday
        ? colors.success
        : darkMode
          ? colors.text.primary.dark
          : colors.text.primary.light,
    lineHeight: 1,
  };

  const labelStyle: CSSProperties = {
    fontSize: typography.fontSize.lg,
    color: darkMode ? colors.text.secondary.dark : colors.text.secondary.light,
  };

  const messageStyle: CSSProperties = {
    fontSize: typography.fontSize.base,
    color: darkMode ? colors.text.secondary.dark : colors.text.secondary.light,
    marginBottom: spacing[4],
  };

  const statsRowStyle: CSSProperties = {
    display: 'flex',
    gap: spacing[4],
    marginTop: spacing[4],
    paddingTop: spacing[4],
    borderTop: `1px solid ${darkMode ? colors.border.dark : colors.border.light}`,
  };

  const statStyle: CSSProperties = {
    flex: 1,
    textAlign: 'center',
  };

  const statValueStyle: CSSProperties = {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
    margin: 0,
  };

  const statLabelStyle: CSSProperties = {
    fontSize: typography.fontSize.xs,
    color: darkMode ? colors.text.muted.dark : colors.text.muted.light,
    margin: 0,
    marginTop: spacing[1],
  };

  const pauseButtonStyle: CSSProperties = {
    padding: `${spacing[1]}px ${spacing[2]}px`,
    backgroundColor: 'transparent',
    color: darkMode ? colors.text.muted.dark : colors.text.muted.light,
    border: 'none',
    fontSize: typography.fontSize.xs,
    cursor: 'pointer',
  };

  return (
    <div style={cardStyle}>
      <div style={headerStyle}>
        <h3 style={titleStyle}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill={colors.secondary[500]}
          >
            <path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z" />
          </svg>
          Streak
        </h3>
        {info.isPaused ? (
          <span
            style={{
              fontSize: typography.fontSize.xs,
              color: colors.info,
              padding: `${spacing[1]}px ${spacing[2]}px`,
              backgroundColor: `${colors.info}20`,
              borderRadius: borderRadius.full,
            }}
          >
            Paused
          </span>
        ) : onPause ? (
          <button
            style={pauseButtonStyle}
            onClick={() => {
              trigger('tap');
              onPause();
            }}
            type="button"
          >
            Pause streak
          </button>
        ) : null}
      </div>

      <div style={streakNumberStyle}>
        <span style={bigNumberStyle}>{info.streak}</span>
        <span style={labelStyle}>days</span>
      </div>

      <p style={messageStyle}>{info.message}</p>

      {/* Weekly progress */}
      <WeeklyProgress progress={info.weeklyProgress} darkMode={darkMode} />

      {/* Stats row */}
      <div style={statsRowStyle}>
        <div style={statStyle}>
          <p style={statValueStyle}>{info.longestStreak}</p>
          <p style={statLabelStyle}>Best streak</p>
        </div>
        <div style={statStyle}>
          <p style={statValueStyle}>{info.freezes}</p>
          <p style={statLabelStyle}>Freezes</p>
        </div>
        <div style={statStyle}>
          <p style={statValueStyle}>{Math.round(info.weeklyProgress * 100)}%</p>
          <p style={statLabelStyle}>Weekly goal</p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// WEEKLY PROGRESS
// ============================================================================

interface WeeklyProgressProps {
  progress: number;
  darkMode?: boolean;
}

export function WeeklyProgress({
  progress,
  darkMode = false,
}: WeeklyProgressProps) {
  const containerStyle: CSSProperties = {
    height: 8,
    backgroundColor: darkMode ? colors.neutral[700] : colors.neutral[200],
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  };

  const barStyle: CSSProperties = {
    height: '100%',
    width: `${Math.min(100, progress * 100)}%`,
    backgroundColor: progress >= 1 ? colors.success : colors.primary[500],
    borderRadius: borderRadius.full,
    transition: `width ${animation.duration.slow}ms ${animation.easing.easeOut}`,
  };

  return (
    <div style={containerStyle}>
      <div style={barStyle} />
    </div>
  );
}

// ============================================================================
// STREAK CELEBRATION
// ============================================================================

interface StreakCelebrationProps {
  message: string;
  milestone?: number;
  onDismiss: () => void;
  darkMode?: boolean;
}

/**
 * Celebration overlay for streak milestones
 */
export function StreakCelebration({
  message,
  milestone,
  onDismiss,
  darkMode = false,
}: StreakCelebrationProps) {
  const { trigger } = useHaptics();
  const { reducedMotion } = useMotion();

  useEffect(() => {
    trigger('celebration');
  }, [trigger]);

  const overlayStyle: CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: darkMode
      ? 'rgba(0, 0, 0, 0.8)'
      : 'rgba(255, 255, 255, 0.95)',
    zIndex: 100,
    padding: spacing[6],
    animation: reducedMotion ? 'none' : 'fadeIn 300ms ease-out',
  };

  const contentStyle: CSSProperties = {
    textAlign: 'center',
    maxWidth: 320,
  };

  const iconContainerStyle: CSSProperties = {
    width: 80,
    height: 80,
    margin: '0 auto',
    marginBottom: spacing[4],
    backgroundColor: `${colors.secondary[500]}20`,
    borderRadius: borderRadius.full,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    animation: reducedMotion ? 'none' : 'bounce 600ms ease-out',
  };

  const milestoneStyle: CSSProperties = {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.secondary[500],
    margin: 0,
    marginBottom: spacing[2],
  };

  const messageStyle: CSSProperties = {
    fontSize: typography.fontSize.lg,
    color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
    margin: 0,
    marginBottom: spacing[6],
    lineHeight: typography.lineHeight.relaxed,
  };

  const buttonStyle: CSSProperties = {
    padding: `${spacing[3]}px ${spacing[6]}px`,
    minHeight: touchTarget.minimum,
    backgroundColor: colors.secondary[500],
    color: 'white',
    border: 'none',
    borderRadius: borderRadius.xl,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    cursor: 'pointer',
  };

  return (
    <div style={overlayStyle} onClick={onDismiss}>
      <div style={contentStyle} onClick={(e) => e.stopPropagation()}>
        <div style={iconContainerStyle}>
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill={colors.secondary[500]}
          >
            <path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z" />
          </svg>
        </div>
        {milestone && <p style={milestoneStyle}>{milestone} days!</p>}
        <p style={messageStyle}>{message}</p>
        <button
          style={buttonStyle}
          onClick={() => {
            trigger('tap');
            onDismiss();
          }}
          type="button"
        >
          Keep going!
        </button>
      </div>
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes bounce {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }
        `}
      </style>
    </div>
  );
}

// ============================================================================
// FREEZE INDICATOR
// ============================================================================

interface FreezeIndicatorProps {
  freezes: number;
  maxFreezes?: number;
  darkMode?: boolean;
}

/**
 * Shows available streak freezes
 */
export function FreezeIndicator({
  freezes,
  maxFreezes = 5,
  darkMode = false,
}: FreezeIndicatorProps) {
  const containerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[2],
  };

  const labelStyle: CSSProperties = {
    fontSize: typography.fontSize.xs,
    color: darkMode ? colors.text.muted.dark : colors.text.muted.light,
  };

  const snowflakesStyle: CSSProperties = {
    display: 'flex',
    gap: spacing[1],
  };

  const snowflakeStyle = (active: boolean): CSSProperties => ({
    fontSize: typography.fontSize.sm,
    opacity: active ? 1 : 0.3,
  });

  return (
    <div style={containerStyle}>
      <span style={labelStyle}>Freezes:</span>
      <div style={snowflakesStyle}>
        {Array.from({ length: maxFreezes }).map((_, i) => (
          <span key={i} style={snowflakeStyle(i < freezes)}>
            ❄️
          </span>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// AT RISK WARNING
// ============================================================================

interface AtRiskWarningProps {
  daysUntilBreak?: number | null;
  onCheckIn?: () => void;
  darkMode?: boolean;
}

/**
 * Warning when streak is at risk
 */
export function AtRiskWarning({
  daysUntilBreak,
  onCheckIn,
  darkMode = false,
}: AtRiskWarningProps) {
  const { trigger } = useHaptics();

  const containerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[3],
    padding: spacing[4],
    backgroundColor: `${colors.warning}15`,
    borderRadius: borderRadius.lg,
    border: `1px solid ${colors.warning}40`,
  };

  const textStyle: CSSProperties = {
    flex: 1,
  };

  const titleStyle: CSSProperties = {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.warning,
    margin: 0,
  };

  const subtitleStyle: CSSProperties = {
    fontSize: typography.fontSize.sm,
    color: darkMode ? colors.text.secondary.dark : colors.text.secondary.light,
    margin: 0,
    marginTop: spacing[1],
  };

  const buttonStyle: CSSProperties = {
    padding: `${spacing[2]}px ${spacing[4]}px`,
    minHeight: touchTarget.minimum,
    backgroundColor: colors.warning,
    color: 'white',
    border: 'none',
    borderRadius: borderRadius.lg,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    cursor: 'pointer',
  };

  return (
    <div style={containerStyle}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill={colors.warning}>
        <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
      </svg>
      <div style={textStyle}>
        <p style={titleStyle}>
          {daysUntilBreak === 0
            ? "Don't lose your streak!"
            : `${daysUntilBreak} day${daysUntilBreak === 1 ? '' : 's'} left`}
        </p>
        <p style={subtitleStyle}>Complete any task to keep going</p>
      </div>
      {onCheckIn && (
        <button
          style={buttonStyle}
          onClick={() => {
            trigger('tap');
            onCheckIn();
          }}
          type="button"
        >
          Check in
        </button>
      )}
    </div>
  );
}
