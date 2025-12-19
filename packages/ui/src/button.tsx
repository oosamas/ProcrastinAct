'use client';

import { type ReactNode, type CSSProperties } from 'react';
import { colors, borderRadius, spacing, typography } from './tokens';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  fullWidth?: boolean;
  onClick?: () => void;
  style?: CSSProperties;
  className?: string;
}

const variantStyles: Record<ButtonVariant, CSSProperties> = {
  primary: {
    backgroundColor: colors.primary[500],
    color: '#ffffff',
    border: 'none',
  },
  secondary: {
    backgroundColor: 'transparent',
    color: colors.primary[500],
    border: `1px solid ${colors.neutral[200]}`,
  },
  ghost: {
    backgroundColor: 'transparent',
    color: colors.neutral[700],
    border: 'none',
  },
  danger: {
    backgroundColor: colors.danger,
    color: '#ffffff',
    border: 'none',
  },
};

const sizeStyles: Record<ButtonSize, CSSProperties> = {
  sm: {
    padding: `${spacing[2]}px ${spacing[3]}px`,
    fontSize: typography.fontSize.sm,
    borderRadius: borderRadius.md,
  },
  md: {
    padding: `${spacing[3]}px ${spacing[4]}px`,
    fontSize: typography.fontSize.base,
    borderRadius: borderRadius.lg,
  },
  lg: {
    padding: `${spacing[4]}px ${spacing[6]}px`,
    fontSize: typography.fontSize.lg,
    borderRadius: borderRadius.xl,
  },
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  fullWidth = false,
  onClick,
  style,
  className,
}: ButtonProps) {
  const baseStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    fontWeight: typography.fontWeight.semibold,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: 'background-color 0.2s, opacity 0.2s',
    width: fullWidth ? '100%' : 'auto',
    fontFamily: typography.fontFamily.sans,
    ...variantStyles[variant],
    ...sizeStyles[size],
    ...style,
  };

  return (
    <button
      className={className}
      style={baseStyle}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
