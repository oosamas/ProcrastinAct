'use client';

import {
  type ReactNode,
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { colors, animation } from './tokens';

// Theme modes
export type ThemeMode = 'light' | 'dark' | 'system';

// Theme context value
interface ThemeContextValue {
  /** Current resolved theme (light or dark) */
  theme: 'light' | 'dark';
  /** User preference (light, dark, or system) */
  mode: ThemeMode;
  /** Set theme mode */
  setMode: (mode: ThemeMode) => void;
  /** Whether dark mode is active */
  isDark: boolean;
  /** Toggle between light and dark */
  toggleTheme: () => void;
}

// Create context with default values
const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  mode: 'system',
  setMode: () => {},
  isDark: false,
  toggleTheme: () => {},
});

// Storage key for persisting preference
const STORAGE_KEY = 'procrastinact-theme-mode';

// Get system preference
function getSystemPreference(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

// Get stored preference
function getStoredPreference(): ThemeMode | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored;
    }
  } catch {
    // localStorage might not be available
  }
  return null;
}

// Store preference
function storePreference(mode: ThemeMode): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    // localStorage might not be available
  }
}

interface ThemeProviderProps {
  children: ReactNode;
  /** Default mode (defaults to 'system') */
  defaultMode?: ThemeMode;
  /** Enable smooth transition between themes */
  enableTransition?: boolean;
  /** Transition duration in ms */
  transitionDuration?: number;
}

export function ThemeProvider({
  children,
  defaultMode = 'system',
  enableTransition = true,
  transitionDuration = animation.duration.normal,
}: ThemeProviderProps) {
  // Initialize mode from storage or default
  const [mode, setModeState] = useState<ThemeMode>(() => {
    const stored = getStoredPreference();
    return stored ?? defaultMode;
  });

  // Track system preference
  const [systemPreference, setSystemPreference] = useState<'light' | 'dark'>(
    () => getSystemPreference()
  );

  // Resolve actual theme
  const theme = useMemo(() => {
    if (mode === 'system') {
      return systemPreference;
    }
    return mode;
  }, [mode, systemPreference]);

  const isDark = theme === 'dark';

  // Listen for system preference changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      setSystemPreference(e.matches ? 'dark' : 'light');
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }

    return undefined;
  }, []);

  // Set mode and persist
  const setMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode);
    storePreference(newMode);
  }, []);

  // Toggle between light and dark
  const toggleTheme = useCallback(() => {
    setMode(isDark ? 'light' : 'dark');
  }, [isDark, setMode]);

  // Apply theme to document
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;

    // Add transition class if enabled
    if (enableTransition) {
      root.style.transition = `background-color ${transitionDuration}ms ease, color ${transitionDuration}ms ease`;
    }

    // Set theme attribute for CSS selectors
    root.setAttribute('data-theme', theme);

    // Set color-scheme for native elements
    root.style.colorScheme = theme;

    // Apply background color
    document.body.style.backgroundColor = isDark
      ? colors.background.dark
      : colors.background.light;
    document.body.style.color = isDark
      ? colors.text.primary.dark
      : colors.text.primary.light;

    // Clean up transition after it completes
    if (enableTransition) {
      const timer = setTimeout(() => {
        root.style.transition = '';
      }, transitionDuration);
      return () => clearTimeout(timer);
    }
  }, [theme, isDark, enableTransition, transitionDuration]);

  const value = useMemo(
    () => ({
      theme,
      mode,
      setMode,
      isDark,
      toggleTheme,
    }),
    [theme, mode, setMode, isDark, toggleTheme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

// Hook to use theme
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Export context for advanced use cases
export { ThemeContext };
