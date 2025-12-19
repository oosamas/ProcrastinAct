'use client';

import { type CSSProperties } from 'react';
import { colors, spacing, typography } from './tokens';

interface EncouragementProps {
  message: string;
  style?: CSSProperties;
}

export function Encouragement({ message, style }: EncouragementProps) {
  const containerStyle: CSSProperties = {
    padding: spacing[4],
    textAlign: 'center',
    ...style,
  };

  const textStyle: CSSProperties = {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary.light,
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
