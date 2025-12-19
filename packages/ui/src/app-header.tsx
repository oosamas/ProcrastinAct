'use client';

import { type CSSProperties, type ReactNode } from 'react';
import {
  colors,
  spacing,
  typography,
  shadows,
  shadowsDark,
  zIndex,
  touchTarget,
} from './tokens';

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  leftAction?: ReactNode;
  rightAction?: ReactNode;
  transparent?: boolean;
  darkMode?: boolean;
  centerTitle?: boolean;
  style?: CSSProperties;
}

export function AppHeader({
  title,
  subtitle,
  leftAction,
  rightAction,
  transparent = false,
  darkMode = false,
  centerTitle = false,
  style,
}: AppHeaderProps) {
  const headerStyle: CSSProperties = {
    position: 'sticky',
    top: 0,
    left: 0,
    right: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: touchTarget.comfortable,
    padding: `${spacing[2]}px ${spacing[4]}px`,
    paddingTop: `calc(env(safe-area-inset-top, 0px) + ${spacing[2]}px)`,
    backgroundColor: transparent
      ? 'transparent'
      : darkMode
        ? colors.surface.dark
        : colors.surface.light,
    borderBottom: transparent
      ? 'none'
      : `1px solid ${darkMode ? colors.border.dark : colors.border.light}`,
    boxShadow: transparent ? 'none' : darkMode ? shadowsDark.sm : shadows.sm,
    zIndex: zIndex.sticky,
    ...style,
  };

  const leftSectionStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    minWidth: touchTarget.minimum,
    justifyContent: 'flex-start',
  };

  const centerSectionStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: centerTitle ? 'center' : 'flex-start',
    flex: 1,
    paddingLeft: leftAction ? spacing[2] : 0,
    paddingRight: rightAction ? spacing[2] : 0,
    overflow: 'hidden',
  };

  const rightSectionStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    minWidth: touchTarget.minimum,
    justifyContent: 'flex-end',
  };

  const titleStyle: CSSProperties = {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    fontFamily: typography.fontFamily.sans,
    color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
    margin: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };

  const subtitleStyle: CSSProperties = {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.normal,
    fontFamily: typography.fontFamily.sans,
    color: darkMode ? colors.text.secondary.dark : colors.text.secondary.light,
    margin: 0,
    marginTop: spacing[0.5],
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };

  return (
    <header style={headerStyle}>
      <div style={leftSectionStyle}>{leftAction}</div>

      <div style={centerSectionStyle}>
        {title && <h1 style={titleStyle}>{title}</h1>}
        {subtitle && <p style={subtitleStyle}>{subtitle}</p>}
      </div>

      <div style={rightSectionStyle}>{rightAction}</div>
    </header>
  );
}
