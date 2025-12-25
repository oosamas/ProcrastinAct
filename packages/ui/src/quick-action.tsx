'use client';

import {
  type CSSProperties,
  type ReactNode,
  useState,
  useCallback,
  useEffect,
  useRef,
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

// Quick action item
export interface QuickActionItem {
  key: string;
  label: string;
  icon: ReactNode;
  color?: string;
  disabled?: boolean;
}

interface QuickActionProps {
  actions: QuickActionItem[];
  onAction: (key: string) => void;
  mainIcon?: ReactNode;
  mainLabel?: string;
  darkMode?: boolean;
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  hapticFeedback?: boolean;
  style?: CSSProperties;
}

// Default quick actions
export const defaultQuickActions: QuickActionItem[] = [
  {
    key: 'add-task',
    label: 'Add task',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
      </svg>
    ),
  },
  {
    key: 'voice-task',
    label: 'Voice task',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" />
      </svg>
    ),
  },
  {
    key: 'start-timer',
    label: 'Start timer',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M8 5v14l11-7z" />
      </svg>
    ),
    color: colors.success,
  },
];

export function QuickAction({
  actions = defaultQuickActions,
  onAction,
  mainIcon,
  mainLabel = 'Quick actions',
  darkMode = false,
  position = 'bottom-right',
  hapticFeedback = true,
  style,
}: QuickActionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleToggle = useCallback(() => {
    if (
      hapticFeedback &&
      typeof navigator !== 'undefined' &&
      'vibrate' in navigator
    ) {
      navigator.vibrate(10);
    }
    setIsOpen((prev) => !prev);
  }, [hapticFeedback]);

  const handleAction = useCallback(
    (key: string, disabled?: boolean) => {
      if (disabled) return;

      if (
        hapticFeedback &&
        typeof navigator !== 'undefined' &&
        'vibrate' in navigator
      ) {
        navigator.vibrate([20, 30, 20]);
      }

      setIsOpen(false);
      onAction(key);
    },
    [hapticFeedback, onAction]
  );

  // Position styles
  const positionStyles: Record<string, CSSProperties> = {
    'bottom-right': {
      right: spacing[4],
      bottom: spacing[24], // Above tab bar
    },
    'bottom-left': {
      left: spacing[4],
      bottom: spacing[24],
    },
    'bottom-center': {
      left: '50%',
      transform: 'translateX(-50%)',
      bottom: spacing[24],
    },
  };

  const containerStyle: CSSProperties = {
    position: 'fixed',
    zIndex: zIndex.dropdown,
    ...positionStyles[position],
    ...style,
  };

  const fabStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: touchTarget.comfortable,
    height: touchTarget.comfortable,
    backgroundColor: colors.primary[500],
    color: 'white',
    border: 'none',
    borderRadius: borderRadius.full,
    boxShadow: darkMode ? shadowsDark.lg : shadows.lg,
    cursor: 'pointer',
    transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
    transition: `transform ${animation.duration.normal}ms ${animation.easing.easeOut}, box-shadow ${animation.duration.fast}ms`,
    WebkitTapHighlightColor: 'transparent',
    touchAction: 'manipulation',
  };

  const menuStyle: CSSProperties = {
    position: 'absolute',
    bottom: touchTarget.comfortable + spacing[3],
    right: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: spacing[2],
    opacity: isOpen ? 1 : 0,
    visibility: isOpen ? 'visible' : 'hidden',
    transform: isOpen
      ? 'translateY(0) scale(1)'
      : 'translateY(10px) scale(0.95)',
    transition: `all ${animation.duration.normal}ms ${animation.easing.easeOut}`,
    transformOrigin: 'bottom right',
  };

  const actionButtonStyle = (_color?: string): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: spacing[3],
    padding: `${spacing[3]}px ${spacing[4]}px`,
    backgroundColor: darkMode ? colors.surface.dark : colors.surface.light,
    border: `1px solid ${darkMode ? colors.border.dark : colors.border.light}`,
    borderRadius: borderRadius.xl,
    boxShadow: darkMode ? shadowsDark.md : shadows.md,
    cursor: 'pointer',
    transition: `all ${animation.duration.fast}ms ${animation.easing.easeOut}`,
    WebkitTapHighlightColor: 'transparent',
    touchAction: 'manipulation',
  });

  const actionIconStyle = (color?: string): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    backgroundColor: color || colors.primary[500],
    color: 'white',
    borderRadius: borderRadius.full,
    flexShrink: 0,
  });

  const actionLabelStyle: CSSProperties = {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    fontFamily: typography.fontFamily.sans,
    color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
    whiteSpace: 'nowrap',
  };

  const defaultIcon = (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
    </svg>
  );

  return (
    <div ref={containerRef} style={containerStyle}>
      {/* Action menu */}
      <div style={menuStyle} role="menu" aria-hidden={!isOpen}>
        {actions.map((action, index) => (
          <button
            key={action.key}
            style={{
              ...actionButtonStyle(action.color),
              opacity: isOpen ? 1 : 0,
              transform: isOpen ? 'translateX(0)' : 'translateX(20px)',
              transition: `all ${animation.duration.normal}ms ${animation.easing.easeOut}`,
              transitionDelay: isOpen ? `${index * 50}ms` : '0ms',
            }}
            onClick={() => handleAction(action.key, action.disabled)}
            disabled={action.disabled}
            role="menuitem"
            aria-label={action.label}
            tabIndex={isOpen ? 0 : -1}
          >
            <div style={actionIconStyle(action.color)}>{action.icon}</div>
            <span style={actionLabelStyle}>{action.label}</span>
          </button>
        ))}
      </div>

      {/* Main FAB */}
      <button
        style={fabStyle}
        onClick={handleToggle}
        aria-label={mainLabel}
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        {mainIcon || defaultIcon}
      </button>
    </div>
  );
}
