'use client';

import { type CSSProperties, type InputHTMLAttributes } from 'react';
import {
  colors,
  borderRadius,
  spacing,
  typography,
  touchTarget,
  animation,
  shadows,
} from './tokens';

type InputSize = 'sm' | 'md' | 'lg';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
  inputSize?: InputSize;
  darkMode?: boolean;
}

// Size configurations with touch target compliance
const sizeConfig: Record<
  InputSize,
  { height: number; padding: string; fontSize: number }
> = {
  sm: {
    height: touchTarget.minimum, // 44px - WCAG 2.5.5
    padding: `${spacing[2]}px ${spacing[3]}px`,
    fontSize: typography.fontSize.sm,
  },
  md: {
    height: touchTarget.recommended, // 48px - recommended
    padding: `${spacing[3]}px ${spacing[4]}px`,
    fontSize: typography.fontSize.base,
  },
  lg: {
    height: touchTarget.comfortable, // 56px - comfortable
    padding: `${spacing[4]}px ${spacing[5]}px`,
    fontSize: typography.fontSize.lg,
  },
};

export function Input({
  label,
  error,
  fullWidth = false,
  inputSize = 'md',
  darkMode = false,
  style,
  ...props
}: InputProps) {
  const config = sizeConfig[inputSize];

  const containerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing[1],
    width: fullWidth ? '100%' : 'auto',
  };

  const labelStyle: CSSProperties = {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: darkMode ? colors.text.secondary.dark : colors.neutral[700],
    fontFamily: typography.fontFamily.sans,
    marginBottom: spacing[0.5],
  };

  const inputStyle: CSSProperties = {
    minHeight: config.height,
    padding: config.padding,
    fontSize: config.fontSize,
    fontFamily: typography.fontFamily.sans,
    backgroundColor: darkMode ? colors.surface.dark : colors.surface.light,
    color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
    border: `1px solid ${error ? colors.danger : darkMode ? colors.border.dark : colors.neutral[200]}`,
    borderRadius: borderRadius.lg,
    outline: 'none',
    transition: `border-color ${animation.duration.fast}ms, box-shadow ${animation.duration.fast}ms`,
    width: '100%',
    // Touch-friendly styles
    WebkitTapHighlightColor: 'transparent',
    touchAction: 'manipulation',
    // Focus visible styling handled via box-shadow
    ...style,
  };

  const errorStyle: CSSProperties = {
    fontSize: typography.fontSize.sm,
    color: colors.danger,
    fontFamily: typography.fontFamily.sans,
    marginTop: spacing[1],
  };

  return (
    <div style={containerStyle}>
      {label && <label style={labelStyle}>{label}</label>}
      <input
        style={inputStyle}
        aria-invalid={!!error}
        aria-describedby={error ? `${props.id || props.name}-error` : undefined}
        {...props}
      />
      {error && (
        <span
          id={`${props.id || props.name}-error`}
          style={errorStyle}
          role="alert"
        >
          {error}
        </span>
      )}
    </div>
  );
}
