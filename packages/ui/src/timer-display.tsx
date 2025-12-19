'use client';

import { type CSSProperties } from 'react';
import { colors, borderRadius, spacing, typography, shadows } from './tokens';

interface TimerDisplayProps {
  minutes: number;
  seconds: number;
  label?: string;
  isRunning?: boolean;
  size?: 'sm' | 'md' | 'lg';
  style?: CSSProperties;
}

const sizeConfig = {
  sm: {
    circle: 120,
    fontSize: typography.fontSize['2xl'],
    labelSize: typography.fontSize.xs,
    borderWidth: 3,
  },
  md: {
    circle: 180,
    fontSize: typography.fontSize['4xl'],
    labelSize: typography.fontSize.sm,
    borderWidth: 4,
  },
  lg: {
    circle: 240,
    fontSize: typography.fontSize['5xl'],
    labelSize: typography.fontSize.base,
    borderWidth: 5,
  },
};

export function TimerDisplay({
  minutes,
  seconds,
  label = 'Focus Time',
  isRunning = false,
  size = 'md',
  style,
}: TimerDisplayProps) {
  const config = sizeConfig[size];

  const formatTime = (m: number, s: number) => {
    const mins = String(m).padStart(2, '0');
    const secs = String(s).padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const circleStyle: CSSProperties = {
    width: config.circle,
    height: config.circle,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface.light,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: shadows.lg,
    border: `${config.borderWidth}px solid ${isRunning ? colors.success : colors.primary[500]}`,
    transition: 'border-color 0.3s',
    ...style,
  };

  const timeStyle: CSSProperties = {
    fontSize: config.fontSize,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary.light,
    fontVariantNumeric: 'tabular-nums',
    fontFamily: typography.fontFamily.sans,
  };

  const labelStyle: CSSProperties = {
    fontSize: config.labelSize,
    color: colors.text.secondary.light,
    marginTop: spacing[1],
    fontFamily: typography.fontFamily.sans,
  };

  return (
    <div style={circleStyle}>
      <span style={timeStyle}>{formatTime(minutes, seconds)}</span>
      <span style={labelStyle}>{label}</span>
    </div>
  );
}
