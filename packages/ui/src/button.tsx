'use client';

import { type ReactNode, type CSSProperties } from 'react';
import {
  colors,
  borderRadius,
  spacing,
  typography,
  touchTarget,
  animation,
} from './tokens';

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
  /** Apply WCAG 2.5.5 touch target minimum (44px) */
  touchTargetEnforced?: boolean;
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

// Size styles with minimum touch targets
const sizeStyles: Record<ButtonSize, CSSProperties> = {
  sm: {
    padding: `${spacing[2]}px ${spacing[3]}px`,
    fontSize: typography.fontSize.sm,
    borderRadius: borderRadius.md,
    minHeight: touchTarget.minimum, // 44px - WCAG 2.5.5
  },
  md: {
    padding: `${spacing[3]}px ${spacing[4]}px`,
    fontSize: typography.fontSize.base,
    borderRadius: borderRadius.lg,
    minHeight: touchTarget.recommended, // 48px - recommended
  },
  lg: {
    padding: `${spacing[4]}px ${spacing[6]}px`,
    fontSize: typography.fontSize.lg,
    borderRadius: borderRadius.xl,
    minHeight: touchTarget.comfortable, // 56px - comfortable
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
  touchTargetEnforced = true,
}: ButtonProps) {
  const baseStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    fontWeight: typography.fontWeight.semibold,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: `background-color ${animation.duration.fast}ms, opacity ${animation.duration.fast}ms, transform ${animation.duration.fast}ms`,
    width: fullWidth ? '100%' : 'auto',
    fontFamily: typography.fontFamily.sans,
    // Touch-friendly styles
    WebkitTapHighlightColor: 'transparent',
    touchAction: 'manipulation',
    // Ensure minimum touch target width
    minWidth: touchTargetEnforced ? touchTarget.minimum : undefined,
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
      type="button"
    >
      {children}
    </button>
  );
}
