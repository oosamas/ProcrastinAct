'use client';

import { type CSSProperties, type InputHTMLAttributes } from 'react';
import { colors, borderRadius, spacing, typography } from './tokens';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

export function Input({
  label,
  error,
  fullWidth = false,
  style,
  ...props
}: InputProps) {
  const containerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing[1],
    width: fullWidth ? '100%' : 'auto',
  };

  const labelStyle: CSSProperties = {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[700],
    fontFamily: typography.fontFamily.sans,
  };

  const inputStyle: CSSProperties = {
    padding: `${spacing[3]}px ${spacing[4]}px`,
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.sans,
    backgroundColor: colors.surface.light,
    color: colors.text.primary.light,
    border: `1px solid ${error ? colors.danger : colors.neutral[200]}`,
    borderRadius: borderRadius.lg,
    outline: 'none',
    transition: 'border-color 0.2s',
    width: '100%',
    ...style,
  };

  const errorStyle: CSSProperties = {
    fontSize: typography.fontSize.sm,
    color: colors.danger,
    fontFamily: typography.fontFamily.sans,
  };

  return (
    <div style={containerStyle}>
      {label && <label style={labelStyle}>{label}</label>}
      <input style={inputStyle} {...props} />
      {error && <span style={errorStyle}>{error}</span>}
    </div>
  );
}
