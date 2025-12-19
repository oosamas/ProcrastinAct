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
import { colors, spacing, typography, borderRadius } from './tokens';

// ============================================================================
// HIGH CONTRAST COLOR SYSTEM
// ============================================================================

/**
 * High contrast color palette designed for low-vision accessibility
 * All colors meet WCAG AAA contrast requirements (7:1 ratio)
 */
export const highContrastColors = {
  // Backgrounds
  background: {
    primary: '#000000',
    secondary: '#1a1a1a',
    elevated: '#262626',
  },

  // Text (all meet 7:1 contrast on black)
  text: {
    primary: '#ffffff',
    secondary: '#e6e6e6',
    muted: '#b3b3b3',
  },

  // Accents (carefully chosen for visibility)
  accent: {
    primary: '#00d4ff', // Cyan - highly visible
    secondary: '#ffff00', // Yellow - maximum contrast
    success: '#00ff00', // Green - distinct
    warning: '#ff9500', // Orange
    danger: '#ff3b30', // Red
    info: '#64d2ff', // Light blue
  },

  // Borders (high visibility)
  border: {
    default: '#666666',
    focus: '#00d4ff',
    hover: '#ffffff',
  },

  // Overlays
  overlay: 'rgba(0, 0, 0, 0.9)',
};

// Light high contrast (for those who prefer light backgrounds)
export const highContrastColorsLight = {
  background: {
    primary: '#ffffff',
    secondary: '#f5f5f5',
    elevated: '#ffffff',
  },

  text: {
    primary: '#000000',
    secondary: '#1a1a1a',
    muted: '#404040',
  },

  accent: {
    primary: '#0066cc', // Blue - readable
    secondary: '#cc6600', // Orange
    success: '#006600', // Dark green
    warning: '#996600', // Dark orange
    danger: '#cc0000', // Dark red
    info: '#0066cc', // Blue
  },

  border: {
    default: '#666666',
    focus: '#0066cc',
    hover: '#000000',
  },

  overlay: 'rgba(255, 255, 255, 0.95)',
};

// ============================================================================
// HIGH CONTRAST CONTEXT
// ============================================================================

interface HighContrastContextValue {
  enabled: boolean;
  mode: 'dark' | 'light';
  setEnabled: (enabled: boolean) => void;
  setMode: (mode: 'dark' | 'light') => void;
  colors: typeof highContrastColors;
}

const HighContrastContext = createContext<HighContrastContextValue | null>(
  null
);

const HC_STORAGE_KEY = 'procrastinact-high-contrast';

interface HighContrastProviderProps {
  children: ReactNode;
  defaultEnabled?: boolean;
  defaultMode?: 'dark' | 'light';
}

/**
 * Provider for high contrast mode
 */
export function HighContrastProvider({
  children,
  defaultEnabled = false,
  defaultMode = 'dark',
}: HighContrastProviderProps) {
  const [enabled, setEnabledState] = useState(defaultEnabled);
  const [mode, setModeState] = useState<'dark' | 'light'>(defaultMode);

  // Load from storage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(HC_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as {
          enabled: boolean;
          mode: 'dark' | 'light';
        };
        setEnabledState(parsed.enabled);
        setModeState(parsed.mode);
      }
    } catch {
      // Ignore
    }
  }, []);

  // Check system preference for high contrast
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-contrast: more)');

    const handleChange = (e: MediaQueryListEvent) => {
      if (e.matches && !enabled) {
        setEnabledState(true);
      }
    };

    // Set initial if system prefers high contrast
    if (mediaQuery.matches && !enabled) {
      setEnabledState(true);
    }

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [enabled]);

  const setEnabled = useCallback(
    (value: boolean) => {
      setEnabledState(value);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(
            HC_STORAGE_KEY,
            JSON.stringify({ enabled: value, mode })
          );
        } catch {
          // Ignore
        }
      }
    },
    [mode]
  );

  const setMode = useCallback(
    (value: 'dark' | 'light') => {
      setModeState(value);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(
            HC_STORAGE_KEY,
            JSON.stringify({ enabled, mode: value })
          );
        } catch {
          // Ignore
        }
      }
    },
    [enabled]
  );

  const currentColors =
    mode === 'dark' ? highContrastColors : highContrastColorsLight;

  return (
    <HighContrastContext.Provider
      value={{
        enabled,
        mode,
        setEnabled,
        setMode,
        colors: currentColors,
      }}
    >
      {children}
    </HighContrastContext.Provider>
  );
}

/**
 * Hook to access high contrast settings
 */
export function useHighContrast(): HighContrastContextValue {
  const context = useContext(HighContrastContext);
  if (!context) {
    throw new Error('useHighContrast must be used within HighContrastProvider');
  }
  return context;
}

// ============================================================================
// HIGH CONTRAST TOGGLE
// ============================================================================

interface HighContrastToggleProps {
  showModeSelector?: boolean;
  darkMode?: boolean;
}

/**
 * Toggle for high contrast mode
 */
export function HighContrastToggle({
  showModeSelector = true,
  darkMode = false,
}: HighContrastToggleProps) {
  const { enabled, mode, setEnabled, setMode } = useHighContrast();

  const containerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing[3],
  };

  const rowStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[4],
  };

  const labelStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[3],
  };

  const iconStyle: CSSProperties = {
    width: 24,
    height: 24,
    color: enabled
      ? colors.primary[500]
      : darkMode
        ? colors.text.muted.dark
        : colors.text.muted.light,
  };

  const textStyle: CSSProperties = {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
    margin: 0,
  };

  const toggleTrackStyle: CSSProperties = {
    position: 'relative',
    width: 52,
    height: 32,
    backgroundColor: enabled
      ? colors.primary[500]
      : darkMode
        ? colors.neutral[700]
        : colors.neutral[300],
    borderRadius: borderRadius.full,
    cursor: 'pointer',
    border: 'none',
    padding: 0,
  };

  const toggleThumbStyle: CSSProperties = {
    position: 'absolute',
    top: 2,
    left: enabled ? 22 : 2,
    width: 28,
    height: 28,
    backgroundColor: 'white',
    borderRadius: borderRadius.full,
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
    transition: `left 150ms ease-out`,
  };

  const modeButtonStyle = (isActive: boolean): CSSProperties => ({
    padding: `${spacing[2]}px ${spacing[3]}px`,
    backgroundColor: isActive
      ? darkMode
        ? colors.neutral[700]
        : colors.neutral[200]
      : 'transparent',
    color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
    border: 'none',
    borderRadius: borderRadius.md,
    fontSize: typography.fontSize.sm,
    cursor: 'pointer',
    opacity: enabled ? 1 : 0.5,
  });

  return (
    <div style={containerStyle}>
      <div style={rowStyle}>
        <div style={labelStyle}>
          <svg style={iconStyle} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
          </svg>
          <p style={textStyle}>High Contrast</p>
        </div>

        <button
          style={toggleTrackStyle}
          onClick={() => setEnabled(!enabled)}
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label="Toggle high contrast mode"
        >
          <div style={toggleThumbStyle} />
        </button>
      </div>

      {showModeSelector && enabled && (
        <div
          style={{
            display: 'flex',
            gap: spacing[2],
            backgroundColor: darkMode
              ? colors.neutral[800]
              : colors.neutral[100],
            padding: spacing[1],
            borderRadius: borderRadius.lg,
          }}
        >
          <button
            style={modeButtonStyle(mode === 'dark')}
            onClick={() => setMode('dark')}
            type="button"
            disabled={!enabled}
          >
            Dark
          </button>
          <button
            style={modeButtonStyle(mode === 'light')}
            onClick={() => setMode('light')}
            type="button"
            disabled={!enabled}
          >
            Light
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// HIGH CONTRAST WRAPPER
// ============================================================================

interface HighContrastWrapperProps {
  children: ReactNode;
  className?: string;
}

/**
 * Wrapper that applies high contrast styles when enabled
 */
export function HighContrastWrapper({
  children,
  className,
}: HighContrastWrapperProps) {
  const { enabled, colors: hcColors } = useHighContrast();

  if (!enabled) {
    return <>{children}</>;
  }

  const wrapperStyle: CSSProperties = {
    backgroundColor: hcColors.background.primary,
    color: hcColors.text.primary,
    minHeight: '100vh',
  };

  return (
    <div style={wrapperStyle} className={className} data-high-contrast="true">
      {children}
      <style>
        {`
          [data-high-contrast="true"] * {
            border-color: ${hcColors.border.default} !important;
          }

          [data-high-contrast="true"] a {
            color: ${hcColors.accent.primary} !important;
            text-decoration: underline !important;
          }

          [data-high-contrast="true"] button:focus,
          [data-high-contrast="true"] input:focus,
          [data-high-contrast="true"] [tabindex]:focus {
            outline: 3px solid ${hcColors.border.focus} !important;
            outline-offset: 2px !important;
          }

          [data-high-contrast="true"] ::selection {
            background: ${hcColors.accent.secondary} !important;
            color: #000000 !important;
          }
        `}
      </style>
    </div>
  );
}

// ============================================================================
// HIGH CONTRAST TEXT
// ============================================================================

interface HighContrastTextProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'muted';
  as?: 'p' | 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  style?: CSSProperties;
}

/**
 * Text component with high contrast support
 */
export function HighContrastText({
  children,
  variant = 'primary',
  as: Component = 'span',
  style,
}: HighContrastTextProps) {
  const { enabled, colors: hcColors } = useHighContrast();

  const getColor = () => {
    if (enabled) {
      return hcColors.text[variant];
    }
    return undefined; // Use default
  };

  const textStyle: CSSProperties = {
    color: getColor(),
    ...style,
  };

  return <Component style={textStyle}>{children}</Component>;
}

// ============================================================================
// HIGH CONTRAST BUTTON
// ============================================================================

interface HighContrastButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  style?: CSSProperties;
}

/**
 * Button with high contrast support
 */
export function HighContrastButton({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  style,
}: HighContrastButtonProps) {
  const { enabled, colors: hcColors } = useHighContrast();

  const getStyles = (): CSSProperties => {
    if (!enabled) {
      // Return default button styles
      return {
        padding: `${spacing[3]}px ${spacing[5]}px`,
        backgroundColor: colors.primary[500],
        color: 'white',
        border: 'none',
        borderRadius: borderRadius.lg,
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.medium,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        ...style,
      };
    }

    // High contrast styles
    const bgColors = {
      primary: hcColors.accent.primary,
      secondary: 'transparent',
      danger: hcColors.accent.danger,
    };

    return {
      padding: `${spacing[3]}px ${spacing[5]}px`,
      backgroundColor: bgColors[variant],
      color: variant === 'secondary' ? hcColors.text.primary : '#000000',
      border:
        variant === 'secondary'
          ? `3px solid ${hcColors.border.default}`
          : 'none',
      borderRadius: borderRadius.lg,
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.bold,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      ...style,
    };
  };

  return (
    <button
      style={getStyles()}
      onClick={onClick}
      disabled={disabled}
      type="button"
    >
      {children}
    </button>
  );
}

// ============================================================================
// HIGH CONTRAST CARD
// ============================================================================

interface HighContrastCardProps {
  children: ReactNode;
  elevated?: boolean;
  style?: CSSProperties;
}

/**
 * Card with high contrast support
 */
export function HighContrastCard({
  children,
  elevated = false,
  style,
}: HighContrastCardProps) {
  const { enabled, colors: hcColors } = useHighContrast();

  const cardStyle: CSSProperties = enabled
    ? {
        backgroundColor: elevated
          ? hcColors.background.elevated
          : hcColors.background.secondary,
        border: `2px solid ${hcColors.border.default}`,
        borderRadius: borderRadius.lg,
        padding: spacing[4],
        ...style,
      }
    : {
        backgroundColor: colors.surface.light,
        borderRadius: borderRadius.lg,
        padding: spacing[4],
        boxShadow: elevated ? '0 4px 6px rgba(0, 0, 0, 0.1)' : 'none',
        ...style,
      };

  return <div style={cardStyle}>{children}</div>;
}

// ============================================================================
// HIGH CONTRAST INPUT
// ============================================================================

interface HighContrastInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'number';
  disabled?: boolean;
  style?: CSSProperties;
}

/**
 * Input with high contrast support
 */
export function HighContrastInput({
  value,
  onChange,
  placeholder,
  type = 'text',
  disabled = false,
  style,
}: HighContrastInputProps) {
  const { enabled, colors: hcColors } = useHighContrast();

  const inputStyle: CSSProperties = enabled
    ? {
        width: '100%',
        padding: `${spacing[3]}px ${spacing[4]}px`,
        backgroundColor: hcColors.background.secondary,
        color: hcColors.text.primary,
        border: `2px solid ${hcColors.border.default}`,
        borderRadius: borderRadius.lg,
        fontSize: typography.fontSize.base,
        outline: 'none',
        ...style,
      }
    : {
        width: '100%',
        padding: `${spacing[3]}px ${spacing[4]}px`,
        backgroundColor: colors.neutral[100],
        color: colors.text.primary.light,
        border: `1px solid ${colors.border.light}`,
        borderRadius: borderRadius.lg,
        fontSize: typography.fontSize.base,
        ...style,
      };

  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      style={inputStyle}
    />
  );
}
