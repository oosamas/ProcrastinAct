'use client';

import {
  type CSSProperties,
  type ReactNode,
  useState,
  useCallback,
  useEffect,
} from 'react';
import {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
  shadowsDark,
  animation,
  touchTarget,
  zIndex,
} from './tokens';

// Navigation route definition
export interface TabRoute {
  key: string;
  label: string;
  icon: ReactNode;
  activeIcon?: ReactNode;
  badge?: number | string;
  disabled?: boolean;
}

interface TabBarProps {
  routes: TabRoute[];
  activeKey: string;
  onTabChange: (key: string) => void;
  darkMode?: boolean;
  showLabels?: boolean;
  hapticFeedback?: boolean;
  style?: CSSProperties;
}

// Default navigation routes
export const defaultRoutes: TabRoute[] = [
  {
    key: 'focus',
    label: 'Focus',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" />
      </svg>
    ),
    activeIcon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" />
      </svg>
    ),
  },
  {
    key: 'timer',
    label: 'Timer',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M15 1H9v2h6V1zm-4 13h2V8h-2v6zm8.03-6.61l1.42-1.42c-.43-.51-.9-.99-1.41-1.41l-1.42 1.42C16.07 4.74 14.12 4 12 4c-4.97 0-9 4.03-9 9s4.02 9 9 9 9-4.03 9-9c0-2.12-.74-4.07-1.97-5.61zM12 20c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z" />
      </svg>
    ),
    activeIcon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M15 1H9v2h6V1zm-4 13h2V8h-2v6zm8.03-6.61l1.42-1.42c-.43-.51-.9-.99-1.41-1.41l-1.42 1.42C16.07 4.74 14.12 4 12 4c-4.97 0-9 4.03-9 9s4.02 9 9 9 9-4.03 9-9c0-2.12-.74-4.07-1.97-5.61z" />
      </svg>
    ),
  },
  {
    key: 'insights',
    label: 'Insights',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4zm2.5 2.1h-15V5h15v14.1zm0-16.1h-15c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" />
      </svg>
    ),
    activeIcon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
      </svg>
    ),
  },
  {
    key: 'settings',
    label: 'Settings',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
      </svg>
    ),
    activeIcon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
      </svg>
    ),
  },
];

export function TabBar({
  routes = defaultRoutes,
  activeKey,
  onTabChange,
  darkMode = false,
  showLabels = true,
  hapticFeedback = true,
  style,
}: TabBarProps) {
  const handleTabPress = useCallback(
    (key: string, disabled?: boolean) => {
      if (disabled) return;

      // Trigger haptic feedback
      if (
        hapticFeedback &&
        typeof navigator !== 'undefined' &&
        'vibrate' in navigator
      ) {
        navigator.vibrate(10);
      }

      onTabChange(key);
    },
    [hapticFeedback, onTabChange]
  );

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (
      e: React.KeyboardEvent,
      key: string,
      index: number,
      disabled?: boolean
    ) => {
      if (disabled) return;

      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleTabPress(key, disabled);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const prevIndex = index > 0 ? index - 1 : routes.length - 1;
        const prevRoute = routes[prevIndex];
        if (prevRoute && !prevRoute.disabled) {
          onTabChange(prevRoute.key);
        }
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        const nextIndex = index < routes.length - 1 ? index + 1 : 0;
        const nextRoute = routes[nextIndex];
        if (nextRoute && !nextRoute.disabled) {
          onTabChange(nextRoute.key);
        }
      }
    },
    [handleTabPress, onTabChange, routes]
  );

  const containerStyle: CSSProperties = {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    display: 'flex',
    alignItems: 'stretch',
    justifyContent: 'space-around',
    backgroundColor: darkMode ? colors.surface.dark : colors.surface.light,
    borderTop: `1px solid ${darkMode ? colors.border.dark : colors.border.light}`,
    paddingBottom: 'env(safe-area-inset-bottom, 0)',
    zIndex: zIndex.sticky,
    boxShadow: darkMode ? shadowsDark.md : shadows.md,
    ...style,
  };

  const tabStyle = (isActive: boolean, disabled?: boolean): CSSProperties => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    minHeight: touchTarget.recommended,
    padding: `${spacing[2]}px ${spacing[1]}px`,
    backgroundColor: 'transparent',
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.4 : 1,
    color: isActive
      ? colors.primary[500]
      : darkMode
        ? colors.text.secondary.dark
        : colors.text.secondary.light,
    transition: `color ${animation.duration.fast}ms ${animation.easing.easeOut}`,
    WebkitTapHighlightColor: 'transparent',
    touchAction: 'manipulation',
    outline: 'none',
    position: 'relative',
  });

  const iconContainerStyle = (isActive: boolean): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    transform: isActive ? 'scale(1.1)' : 'scale(1)',
    transition: `transform ${animation.duration.fast}ms ${animation.easing.easeOut}`,
    position: 'relative',
  });

  const labelStyle: CSSProperties = {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    fontFamily: typography.fontFamily.sans,
    marginTop: spacing[1],
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };

  const badgeStyle: CSSProperties = {
    position: 'absolute',
    top: -4,
    right: -8,
    minWidth: 18,
    height: 18,
    padding: `0 ${spacing[1]}px`,
    backgroundColor: colors.danger,
    color: 'white',
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    fontFamily: typography.fontFamily.sans,
    borderRadius: borderRadius.full,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const activeIndicatorStyle: CSSProperties = {
    position: 'absolute',
    top: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 24,
    height: 3,
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.full,
  };

  return (
    <nav style={containerStyle} role="tablist" aria-label="Main navigation">
      {routes.map((route, index) => {
        const isActive = activeKey === route.key;

        return (
          <button
            key={route.key}
            style={tabStyle(isActive, route.disabled)}
            onClick={() => handleTabPress(route.key, route.disabled)}
            onKeyDown={(e) =>
              handleKeyDown(e, route.key, index, route.disabled)
            }
            role="tab"
            aria-selected={isActive}
            aria-disabled={route.disabled}
            aria-label={route.label}
            tabIndex={isActive ? 0 : -1}
          >
            {isActive && <div style={activeIndicatorStyle} />}

            <div style={iconContainerStyle(isActive)}>
              {isActive && route.activeIcon ? route.activeIcon : route.icon}
              {route.badge !== undefined && (
                <span style={badgeStyle}>{route.badge}</span>
              )}
            </div>

            {showLabels && <span style={labelStyle}>{route.label}</span>}
          </button>
        );
      })}
    </nav>
  );
}
