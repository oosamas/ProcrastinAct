'use client';

import {
  type CSSProperties,
  type ReactNode,
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';
import {
  colors,
  spacing,
  typography,
  borderRadius,
  touchTarget,
  zIndex,
} from './tokens';
import { useMotion } from './motion';
import { useHaptics } from './haptics';

// ============================================================================
// TYPES
// ============================================================================

export type FocusModeLevel = 'off' | 'reduced' | 'minimal' | 'zen';

export interface FocusModeSettings {
  level: FocusModeLevel;
  hideNavigation: boolean;
  hideStreaks: boolean;
  hideGamification: boolean;
  singleTaskView: boolean;
  reduceAnimations: boolean;
  simplifyColors: boolean;
  largerText: boolean;
  undoEnabled: boolean;
}

export const DEFAULT_FOCUS_SETTINGS: FocusModeSettings = {
  level: 'off',
  hideNavigation: false,
  hideStreaks: false,
  hideGamification: false,
  singleTaskView: false,
  reduceAnimations: false,
  simplifyColors: false,
  largerText: false,
  undoEnabled: true,
};

// Preset configurations for different focus levels
const FOCUS_PRESETS: Record<FocusModeLevel, Partial<FocusModeSettings>> = {
  off: {
    hideNavigation: false,
    hideStreaks: false,
    hideGamification: false,
    singleTaskView: false,
    reduceAnimations: false,
    simplifyColors: false,
  },
  reduced: {
    hideNavigation: false,
    hideStreaks: false,
    hideGamification: false,
    singleTaskView: false,
    reduceAnimations: true,
    simplifyColors: false,
  },
  minimal: {
    hideNavigation: true,
    hideStreaks: true,
    hideGamification: true,
    singleTaskView: true,
    reduceAnimations: true,
    simplifyColors: false,
  },
  zen: {
    hideNavigation: true,
    hideStreaks: true,
    hideGamification: true,
    singleTaskView: true,
    reduceAnimations: true,
    simplifyColors: true,
  },
};

// ============================================================================
// FOCUS MODE CONTEXT
// ============================================================================

interface FocusModeContextValue {
  settings: FocusModeSettings;
  isActive: boolean;
  setLevel: (level: FocusModeLevel) => void;
  updateSettings: (updates: Partial<FocusModeSettings>) => void;
  enterFocusMode: (level?: FocusModeLevel) => void;
  exitFocusMode: () => void;
  toggleFocusMode: () => void;
}

const FocusModeContext = createContext<FocusModeContextValue | null>(null);

const FOCUS_STORAGE_KEY = 'procrastinact-focus-mode';

interface FocusModeProviderProps {
  children: ReactNode;
  defaultSettings?: Partial<FocusModeSettings>;
}

/**
 * Provider for focus mode (cognitive load reduction)
 */
export function FocusModeProvider({
  children,
  defaultSettings = {},
}: FocusModeProviderProps) {
  const [settings, setSettings] = useState<FocusModeSettings>({
    ...DEFAULT_FOCUS_SETTINGS,
    ...defaultSettings,
  });

  // Load from storage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(FOCUS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as FocusModeSettings;
        setSettings((prev) => ({ ...prev, ...parsed }));
      }
    } catch {
      // Ignore
    }
  }, []);

  // Save to storage
  const saveSettings = useCallback((newSettings: FocusModeSettings) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(FOCUS_STORAGE_KEY, JSON.stringify(newSettings));
      } catch {
        // Ignore
      }
    }
  }, []);

  const setLevel = useCallback(
    (level: FocusModeLevel) => {
      const preset = FOCUS_PRESETS[level];
      const newSettings: FocusModeSettings = {
        ...settings,
        ...preset,
        level,
      };
      setSettings(newSettings);
      saveSettings(newSettings);
    },
    [settings, saveSettings]
  );

  const updateSettings = useCallback(
    (updates: Partial<FocusModeSettings>) => {
      const newSettings: FocusModeSettings = { ...settings, ...updates };
      setSettings(newSettings);
      saveSettings(newSettings);
    },
    [settings, saveSettings]
  );

  const enterFocusMode = useCallback(
    (level: FocusModeLevel = 'minimal') => {
      setLevel(level);
    },
    [setLevel]
  );

  const exitFocusMode = useCallback(() => {
    setLevel('off');
  }, [setLevel]);

  const toggleFocusMode = useCallback(() => {
    if (settings.level === 'off') {
      setLevel('minimal');
    } else {
      setLevel('off');
    }
  }, [settings.level, setLevel]);

  const value: FocusModeContextValue = {
    settings,
    isActive: settings.level !== 'off',
    setLevel,
    updateSettings,
    enterFocusMode,
    exitFocusMode,
    toggleFocusMode,
  };

  return (
    <FocusModeContext.Provider value={value}>
      {children}
    </FocusModeContext.Provider>
  );
}

/**
 * Hook to access focus mode settings
 */
export function useFocusMode(): FocusModeContextValue {
  const context = useContext(FocusModeContext);
  if (!context) {
    throw new Error('useFocusMode must be used within FocusModeProvider');
  }
  return context;
}

// ============================================================================
// FOCUS MODE TOGGLE
// ============================================================================

interface FocusModeToggleProps {
  compact?: boolean;
  darkMode?: boolean;
}

/**
 * Quick toggle for focus mode
 */
export function FocusModeToggle({
  compact = false,
  darkMode = false,
}: FocusModeToggleProps) {
  const { isActive, toggleFocusMode, settings } = useFocusMode();
  const { trigger } = useHaptics();

  const handleToggle = useCallback(() => {
    trigger('tap');
    toggleFocusMode();
  }, [trigger, toggleFocusMode]);

  if (compact) {
    const buttonStyle: CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: touchTarget.minimum,
      height: touchTarget.minimum,
      backgroundColor: isActive
        ? colors.primary[500]
        : darkMode
          ? colors.neutral[800]
          : colors.neutral[100],
      color: isActive
        ? 'white'
        : darkMode
          ? colors.text.secondary.dark
          : colors.text.secondary.light,
      border: 'none',
      borderRadius: borderRadius.full,
      cursor: 'pointer',
    };

    return (
      <button
        style={buttonStyle}
        onClick={handleToggle}
        type="button"
        aria-label={isActive ? 'Exit focus mode' : 'Enter focus mode'}
        aria-pressed={isActive}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        </svg>
      </button>
    );
  }

  const containerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[3],
    padding: spacing[4],
    backgroundColor: isActive
      ? darkMode
        ? colors.primary[900]
        : colors.primary[50]
      : darkMode
        ? colors.neutral[800]
        : colors.neutral[100],
    borderRadius: borderRadius.xl,
    cursor: 'pointer',
    border: isActive
      ? `2px solid ${colors.primary[500]}`
      : '2px solid transparent',
  };

  const iconStyle: CSSProperties = {
    width: 32,
    height: 32,
    color: isActive
      ? colors.primary[500]
      : darkMode
        ? colors.text.secondary.dark
        : colors.text.secondary.light,
  };

  const textContainerStyle: CSSProperties = {
    flex: 1,
  };

  const labelStyle: CSSProperties = {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
    margin: 0,
  };

  const statusStyle: CSSProperties = {
    fontSize: typography.fontSize.sm,
    color: darkMode ? colors.text.secondary.dark : colors.text.secondary.light,
    margin: 0,
  };

  return (
    <button
      style={{ ...containerStyle, border: 'none', width: '100%' }}
      onClick={handleToggle}
      type="button"
    >
      <svg style={iconStyle} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
      </svg>
      <div style={textContainerStyle}>
        <p style={labelStyle}>Focus Mode</p>
        <p style={statusStyle}>
          {isActive
            ? `${settings.level.charAt(0).toUpperCase() + settings.level.slice(1)} mode active`
            : 'Reduce distractions'}
        </p>
      </div>
    </button>
  );
}

// ============================================================================
// FOCUS MODE SELECTOR
// ============================================================================

interface FocusModeSelectorProps {
  darkMode?: boolean;
}

/**
 * Full focus mode level selector
 */
export function FocusModeSelector({
  darkMode = false,
}: FocusModeSelectorProps) {
  const { settings, setLevel } = useFocusMode();
  const { trigger } = useHaptics();

  const levels: {
    level: FocusModeLevel;
    name: string;
    description: string;
    icon: string;
  }[] = [
    {
      level: 'off',
      name: 'Full Interface',
      description: 'All features visible',
      icon: 'M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z',
    },
    {
      level: 'reduced',
      name: 'Reduced',
      description: 'Fewer animations',
      icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z',
    },
    {
      level: 'minimal',
      name: 'Minimal',
      description: 'Essential only',
      icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
    },
    {
      level: 'zen',
      name: 'Zen',
      description: 'Maximum focus',
      icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z',
    },
  ];

  const containerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing[2],
  };

  const optionStyle = (isSelected: boolean): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: spacing[3],
    padding: spacing[4],
    backgroundColor: isSelected
      ? darkMode
        ? colors.primary[900]
        : colors.primary[50]
      : 'transparent',
    border: `2px solid ${isSelected ? colors.primary[500] : 'transparent'}`,
    borderRadius: borderRadius.lg,
    cursor: 'pointer',
    textAlign: 'left',
  });

  const iconContainerStyle: CSSProperties = {
    width: 40,
    height: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const nameStyle: CSSProperties = {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
    margin: 0,
  };

  const descStyle: CSSProperties = {
    fontSize: typography.fontSize.sm,
    color: darkMode ? colors.text.secondary.dark : colors.text.secondary.light,
    margin: 0,
  };

  return (
    <div style={containerStyle}>
      {levels.map(({ level, name, description, icon }) => (
        <button
          key={level}
          style={optionStyle(settings.level === level)}
          onClick={() => {
            trigger('tap');
            setLevel(level);
          }}
          type="button"
        >
          <div style={iconContainerStyle}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill={
                settings.level === level
                  ? colors.primary[500]
                  : darkMode
                    ? colors.text.muted.dark
                    : colors.text.muted.light
              }
            >
              <path d={icon} />
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <p style={nameStyle}>{name}</p>
            <p style={descStyle}>{description}</p>
          </div>
        </button>
      ))}
    </div>
  );
}

// ============================================================================
// CONDITIONAL RENDER HELPERS
// ============================================================================

interface FocusConditionalProps {
  children: ReactNode;
  when?: 'navigation' | 'streaks' | 'gamification' | 'animations';
  inverse?: boolean;
}

/**
 * Conditionally render based on focus mode settings
 */
export function FocusConditional({
  children,
  when,
  inverse = false,
}: FocusConditionalProps) {
  const { settings, isActive } = useFocusMode();

  if (!isActive) {
    return inverse ? null : <>{children}</>;
  }

  let shouldHide = false;

  switch (when) {
    case 'navigation':
      shouldHide = settings.hideNavigation;
      break;
    case 'streaks':
      shouldHide = settings.hideStreaks;
      break;
    case 'gamification':
      shouldHide = settings.hideGamification;
      break;
    case 'animations':
      shouldHide = settings.reduceAnimations;
      break;
    default:
      shouldHide = false;
  }

  if (inverse) {
    return shouldHide ? <>{children}</> : null;
  }

  return shouldHide ? null : <>{children}</>;
}

// ============================================================================
// SIMPLIFIED TASK VIEW
// ============================================================================

interface SimplifiedTaskViewProps {
  taskTitle: string;
  onComplete: () => void;
  onSkip?: () => void;
  timeRemaining?: string;
  darkMode?: boolean;
}

/**
 * Extremely simplified single-task view for zen mode
 */
export function SimplifiedTaskView({
  taskTitle,
  onComplete,
  onSkip,
  timeRemaining,
  darkMode = false,
}: SimplifiedTaskViewProps) {
  const { trigger } = useHaptics();
  const { reducedMotion } = useMotion();

  const containerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: spacing[6],
    backgroundColor: darkMode
      ? colors.background.dark
      : colors.background.light,
    textAlign: 'center',
  };

  const taskStyle: CSSProperties = {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
    margin: 0,
    marginBottom: spacing[8],
    lineHeight: typography.lineHeight.tight,
    maxWidth: 500,
  };

  const timerStyle: CSSProperties = {
    fontSize: typography.fontSize['5xl'],
    fontWeight: typography.fontWeight.light,
    fontFamily: typography.fontFamily.mono,
    color: darkMode ? colors.text.secondary.dark : colors.text.secondary.light,
    margin: 0,
    marginBottom: spacing[8],
  };

  const completeButtonStyle: CSSProperties = {
    width: 120,
    height: 120,
    borderRadius: borderRadius.full,
    backgroundColor: colors.success,
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: `0 0 0 0 ${colors.success}`,
    animation: reducedMotion ? 'none' : 'pulse-ring 2s infinite',
  };

  const skipStyle: CSSProperties = {
    marginTop: spacing[6],
    padding: spacing[3],
    backgroundColor: 'transparent',
    color: darkMode ? colors.text.muted.dark : colors.text.muted.light,
    border: 'none',
    fontSize: typography.fontSize.base,
    cursor: 'pointer',
  };

  return (
    <div style={containerStyle}>
      <p style={taskStyle}>{taskTitle}</p>

      {timeRemaining && <p style={timerStyle}>{timeRemaining}</p>}

      <button
        style={completeButtonStyle}
        onClick={() => {
          trigger('success');
          onComplete();
        }}
        type="button"
        aria-label="Complete task"
      >
        <svg width="48" height="48" viewBox="0 0 24 24" fill="white">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
        </svg>
      </button>

      {onSkip && (
        <button
          style={skipStyle}
          onClick={() => {
            trigger('tap');
            onSkip();
          }}
          type="button"
        >
          Skip for now
        </button>
      )}

      <style>
        {`
          @keyframes pulse-ring {
            0% {
              box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4);
            }
            70% {
              box-shadow: 0 0 0 20px rgba(34, 197, 94, 0);
            }
            100% {
              box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
            }
          }
        `}
      </style>
    </div>
  );
}

// ============================================================================
// UNDO BANNER
// ============================================================================

interface UndoBannerProps {
  action: string;
  onUndo: () => void;
  duration?: number;
  darkMode?: boolean;
}

/**
 * Undo banner for reversible actions
 */
export function UndoBanner({
  action,
  onUndo,
  duration = 5000,
  darkMode = false,
}: UndoBannerProps) {
  const [isVisible, setIsVisible] = useState(true);
  const { trigger } = useHaptics();
  const { reducedMotion } = useMotion();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  if (!isVisible) return null;

  const containerStyle: CSSProperties = {
    position: 'fixed',
    bottom: spacing[6],
    left: spacing[4],
    right: spacing[4],
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing[4],
    backgroundColor: darkMode ? colors.neutral[800] : colors.neutral[900],
    borderRadius: borderRadius.lg,
    zIndex: zIndex.toast,
    animation: reducedMotion ? 'none' : 'slideUp 200ms ease-out',
  };

  const textStyle: CSSProperties = {
    fontSize: typography.fontSize.base,
    color: 'white',
    margin: 0,
  };

  const undoButtonStyle: CSSProperties = {
    padding: `${spacing[2]}px ${spacing[4]}px`,
    backgroundColor: colors.primary[500],
    color: 'white',
    border: 'none',
    borderRadius: borderRadius.lg,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    cursor: 'pointer',
  };

  return (
    <div style={containerStyle}>
      <p style={textStyle}>{action}</p>
      <button
        style={undoButtonStyle}
        onClick={() => {
          trigger('tap');
          onUndo();
          setIsVisible(false);
        }}
        type="button"
      >
        Undo
      </button>
      <style>
        {`
          @keyframes slideUp {
            from {
              transform: translateY(100%);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
        `}
      </style>
    </div>
  );
}
