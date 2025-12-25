'use client';

import {
  type ReactNode,
  type CSSProperties,
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { animation } from './tokens';

// ============================================================================
// MOTION CONTEXT
// ============================================================================

interface MotionContextValue {
  /** Whether reduced motion is preferred (system or app setting) */
  reducedMotion: boolean;
  /** Whether the preference is from system or app override */
  source: 'system' | 'app';
  /** Override the system preference */
  setAppPreference: (reduced: boolean | null) => void;
  /** Get appropriate animation duration */
  getDuration: (baseDuration: number) => number;
  /** Get appropriate transition string */
  getTransition: (property: string, baseDuration?: number) => string;
}

const MotionContext = createContext<MotionContextValue>({
  reducedMotion: false,
  source: 'system',
  setAppPreference: () => {},
  getDuration: (d) => d,
  getTransition: () => '',
});

// Storage key for app preference
const STORAGE_KEY = 'procrastinact-reduced-motion';

// Get stored preference
function getStoredPreference(): boolean | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'true') return true;
    if (stored === 'false') return false;
  } catch {
    // localStorage might not be available
  }
  return null;
}

// Store preference
function storePreference(reduced: boolean | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (reduced === null) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, String(reduced));
    }
  } catch {
    // localStorage might not be available
  }
}

interface MotionProviderProps {
  children: ReactNode;
}

export function MotionProvider({ children }: MotionProviderProps) {
  // System preference
  const [systemPreference, setSystemPreference] = useState(false);
  // App override (null = follow system)
  const [appPreference, setAppPreferenceState] = useState<boolean | null>(null);

  // Detect system preference
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setSystemPreference(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setSystemPreference(e.matches);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
    return undefined;
  }, []);

  // Load app preference from storage
  useEffect(() => {
    setAppPreferenceState(getStoredPreference());
  }, []);

  // Set app preference
  const setAppPreference = useCallback((reduced: boolean | null) => {
    setAppPreferenceState(reduced);
    storePreference(reduced);
  }, []);

  // Resolved preference
  const reducedMotion = appPreference ?? systemPreference;
  const source: 'system' | 'app' = appPreference !== null ? 'app' : 'system';

  // Get appropriate duration
  const getDuration = useCallback(
    (baseDuration: number) => {
      if (reducedMotion) {
        // For reduced motion, use instant or very short transitions
        return baseDuration > 0 ? animation.duration.fastest : 0;
      }
      return baseDuration;
    },
    [reducedMotion]
  );

  // Get transition string
  const getTransition = useCallback(
    (property: string, baseDuration: number = animation.duration.normal) => {
      const duration = getDuration(baseDuration);
      if (duration === 0) return 'none';
      return `${property} ${duration}ms ${animation.easing.easeOut}`;
    },
    [getDuration]
  );

  const value = useMemo(
    () => ({
      reducedMotion,
      source,
      setAppPreference,
      getDuration,
      getTransition,
    }),
    [reducedMotion, source, setAppPreference, getDuration, getTransition]
  );

  return (
    <MotionContext.Provider value={value}>{children}</MotionContext.Provider>
  );
}

// Hook to use motion context
export function useMotion(): MotionContextValue {
  return useContext(MotionContext);
}

// ============================================================================
// MOTION SAFE WRAPPER
// ============================================================================

interface MotionSafeProps {
  children: ReactNode;
  /** Fallback for reduced motion users */
  fallback?: ReactNode;
}

/**
 * Render different content based on motion preference
 */
export function MotionSafe({ children, fallback }: MotionSafeProps) {
  const { reducedMotion } = useMotion();

  if (reducedMotion && fallback) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// ============================================================================
// ANIMATION PRESETS
// ============================================================================

/**
 * Get animation-safe CSS properties
 */
export function useAnimationStyle() {
  const { reducedMotion, getDuration, getTransition } = useMotion();

  return useMemo(() => {
    // Base styles that work with reduced motion
    const safeTransition = (
      properties: string[],
      duration?: number
    ): CSSProperties => {
      if (reducedMotion) {
        // Only allow opacity transitions for reduced motion
        const opacityOnly = properties.includes('opacity')
          ? { transition: `opacity ${animation.duration.fastest}ms` }
          : {};
        return opacityOnly;
      }

      return {
        transition: properties
          .map((p) => getTransition(p, duration))
          .join(', '),
      };
    };

    // Transform presets
    const transforms = {
      // Fade only (safe for reduced motion)
      fadeIn: (): CSSProperties => ({
        opacity: 1,
        ...safeTransition(['opacity']),
      }),
      fadeOut: (): CSSProperties => ({
        opacity: 0,
        ...safeTransition(['opacity']),
      }),

      // Scale (simplified for reduced motion)
      scaleIn: (_from: number = 0.95): CSSProperties =>
        reducedMotion
          ? { opacity: 1 }
          : {
              transform: 'scale(1)',
              opacity: 1,
              ...safeTransition(['transform', 'opacity']),
            },

      // Slide (disabled for reduced motion)
      slideIn: (
        _direction: 'up' | 'down' | 'left' | 'right' = 'up'
      ): CSSProperties =>
        reducedMotion
          ? { opacity: 1 }
          : {
              transform: 'translate(0, 0)',
              opacity: 1,
              ...safeTransition(['transform', 'opacity']),
            },
    };

    // Initial states for animations
    const initial = {
      fadeIn: { opacity: 0 },
      scaleIn: reducedMotion
        ? { opacity: 0 }
        : { transform: 'scale(0.95)', opacity: 0 },
      slideUp: reducedMotion
        ? { opacity: 0 }
        : { transform: 'translateY(20px)', opacity: 0 },
      slideDown: reducedMotion
        ? { opacity: 0 }
        : { transform: 'translateY(-20px)', opacity: 0 },
    };

    return {
      reducedMotion,
      getDuration,
      getTransition,
      safeTransition,
      transforms,
      initial,
    };
  }, [reducedMotion, getDuration, getTransition]);
}

// ============================================================================
// CELEBRATION STATIC FALLBACK
// ============================================================================

interface StaticCelebrationProps {
  message: string;
  darkMode?: boolean;
  style?: CSSProperties;
}

/**
 * Static celebration display for reduced motion users
 * Replaces animated confetti with a simple success message
 */
export function StaticCelebration({
  message,
  darkMode = false,
  style,
}: StaticCelebrationProps) {
  const containerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    textAlign: 'center',
    ...style,
  };

  const iconStyle: CSSProperties = {
    width: 64,
    height: 64,
    borderRadius: '50%',
    backgroundColor: '#22c55e',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  };

  const messageStyle: CSSProperties = {
    fontSize: 24,
    fontWeight: 700,
    color: darkMode ? '#f1f5f9' : '#1f2937',
    margin: 0,
  };

  return (
    <div style={containerStyle} role="alert" aria-live="polite">
      <div style={iconStyle}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
        </svg>
      </div>
      <p style={messageStyle}>{message}</p>
    </div>
  );
}

// ============================================================================
// MOTION TOGGLE COMPONENT
// ============================================================================

interface MotionToggleProps {
  showLabel?: boolean;
  darkMode?: boolean;
  style?: CSSProperties;
}

/**
 * Toggle for reduced motion preference
 */
export function MotionToggle({
  showLabel = true,
  darkMode = false,
  style,
}: MotionToggleProps) {
  const { reducedMotion, source, setAppPreference } = useMotion();

  const handleToggle = useCallback(() => {
    if (source === 'system') {
      // Override system preference
      setAppPreference(!reducedMotion);
    } else {
      // Toggle app preference or reset to system
      if (reducedMotion) {
        setAppPreference(null); // Reset to system
      } else {
        setAppPreference(true);
      }
    }
  }, [reducedMotion, source, setAppPreference]);

  const buttonStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 16px',
    backgroundColor: darkMode ? '#374151' : '#f3f4f6',
    color: darkMode ? '#f1f5f9' : '#1f2937',
    border: `1px solid ${darkMode ? '#4b5563' : '#e5e7eb'}`,
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 500,
    ...style,
  };

  return (
    <button
      style={buttonStyle}
      onClick={handleToggle}
      aria-pressed={reducedMotion}
      type="button"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="currentColor"
        style={{ opacity: reducedMotion ? 1 : 0.5 }}
      >
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-4h2v2h-2zm0-2h2V7h-2z" />
      </svg>
      {showLabel && (
        <span>
          {reducedMotion ? 'Reduced motion on' : 'Reduced motion off'}
          {source === 'system' && ' (system)'}
        </span>
      )}
    </button>
  );
}

// Export context
export { MotionContext };
