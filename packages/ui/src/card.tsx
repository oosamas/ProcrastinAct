'use client';

import { type ReactNode, type CSSProperties } from 'react';
import { colors, borderRadius, spacing, shadows } from './tokens';

interface CardProps {
  children: ReactNode;
  padding?: keyof typeof spacing;
  style?: CSSProperties;
  className?: string;
}

export function Card({ children, padding = 4, style, className }: CardProps) {
  const cardStyle: CSSProperties = {
    backgroundColor: colors.surface.light,
    borderRadius: borderRadius.xl,
    padding: spacing[padding],
    boxShadow: shadows.md,
    ...style,
  };

  return (
    <div className={className} style={cardStyle}>
      {children}
    </div>
  );
}
