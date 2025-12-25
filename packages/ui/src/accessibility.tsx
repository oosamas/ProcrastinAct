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
  useRef,
} from 'react';

// ============================================================================
// ACCESSIBILITY CONTEXT
// ============================================================================

interface AccessibilityContextValue {
  /** Whether reduced motion is preferred */
  reducedMotion: boolean;
  /** Whether screen reader is active (best effort detection) */
  screenReaderActive: boolean;
  /** Whether high contrast mode is preferred */
  highContrast: boolean;
  /** Announce message to screen readers */
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
}

const AccessibilityContext = createContext<AccessibilityContextValue>({
  reducedMotion: false,
  screenReaderActive: false,
  highContrast: false,
  announce: () => {},
});

// Hook to use accessibility context
export function useAccessibility(): AccessibilityContextValue {
  return useContext(AccessibilityContext);
}

interface AccessibilityProviderProps {
  children: ReactNode;
}

export function AccessibilityProvider({
  children,
}: AccessibilityProviderProps) {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [screenReaderActive, setScreenReaderActive] = useState(false);

  // Polite live region ref
  const politeRef = useRef<HTMLDivElement>(null);
  // Assertive live region ref
  const assertiveRef = useRef<HTMLDivElement>(null);

  // Detect reduced motion preference
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
    return undefined;
  }, []);

  // Detect high contrast preference
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-contrast: more)');
    setHighContrast(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setHighContrast(e.matches);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
    return undefined;
  }, []);

  // Best-effort screen reader detection
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check for screen reader indicators
    const checkScreenReader = () => {
      // This is a heuristic - not 100% reliable
      const _hints = [
        // iOS VoiceOver
        'ontouchstart' in window && window.navigator.maxTouchPoints > 0,
        // General hints
        window.navigator.userAgent.includes('VoiceOver'),
        // ARIA live regions are being used
        document.querySelector('[aria-live]') !== null,
      ];

      // If user has triggered any accessibility-specific events
      // This will be updated by focus events
    };

    checkScreenReader();

    // Listen for focus events which might indicate screen reader usage
    const handleFocus = () => {
      // Screen readers often focus elements in sequence
      setScreenReaderActive(true);
    };

    document.addEventListener('focusin', handleFocus);
    return () => document.removeEventListener('focusin', handleFocus);
  }, []);

  // Announce message to screen readers
  const announce = useCallback(
    (message: string, priority: 'polite' | 'assertive' = 'polite') => {
      const ref = priority === 'assertive' ? assertiveRef : politeRef;
      if (ref.current) {
        // Clear first to ensure re-announcement
        ref.current.textContent = '';
        // Small delay to ensure screen reader picks up change
        setTimeout(() => {
          if (ref.current) {
            ref.current.textContent = message;
          }
        }, 50);
      }
    },
    []
  );

  const value = useMemo(
    () => ({
      reducedMotion,
      screenReaderActive,
      highContrast,
      announce,
    }),
    [reducedMotion, screenReaderActive, highContrast, announce]
  );

  // Screen reader only style
  const srOnlyStyle: CSSProperties = {
    position: 'absolute',
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    border: 0,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}

      {/* Live regions for announcements */}
      <div
        ref={politeRef}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        style={srOnlyStyle}
      />
      <div
        ref={assertiveRef}
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        style={srOnlyStyle}
      />
    </AccessibilityContext.Provider>
  );
}

// ============================================================================
// SCREEN READER ONLY COMPONENT
// ============================================================================

interface ScreenReaderOnlyProps {
  children: ReactNode;
  /** Element type (default: span) */
  as?: 'span' | 'div' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

/**
 * Visually hidden content that's still accessible to screen readers
 */
export function ScreenReaderOnly({
  children,
  as = 'span',
}: ScreenReaderOnlyProps) {
  const style: CSSProperties = {
    position: 'absolute',
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    border: 0,
  };

  const Tag = as;
  return <Tag style={style}>{children}</Tag>;
}

// ============================================================================
// LIVE REGION COMPONENT
// ============================================================================

interface LiveRegionProps {
  children: ReactNode;
  /** Politeness level */
  politeness?: 'polite' | 'assertive' | 'off';
  /** Announce entire region or just changes */
  atomic?: boolean;
  /** Visible or screen-reader only */
  visible?: boolean;
}

/**
 * Live region for dynamic content announcements
 */
export function LiveRegion({
  children,
  politeness = 'polite',
  atomic = true,
  visible = false,
}: LiveRegionProps) {
  const style: CSSProperties = visible
    ? {}
    : {
        position: 'absolute',
        width: 1,
        height: 1,
        padding: 0,
        margin: -1,
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        border: 0,
      };

  return (
    <div
      role={politeness === 'assertive' ? 'alert' : 'status'}
      aria-live={politeness}
      aria-atomic={atomic}
      style={style}
    >
      {children}
    </div>
  );
}

// ============================================================================
// SKIP LINK COMPONENT
// ============================================================================

interface SkipLinkProps {
  /** Target element ID */
  targetId: string;
  /** Link text */
  children?: ReactNode;
}

/**
 * Skip link for keyboard navigation
 */
export function SkipLink({
  targetId,
  children = 'Skip to main content',
}: SkipLinkProps) {
  const style: CSSProperties = {
    position: 'absolute',
    left: -9999,
    top: 'auto',
    width: 1,
    height: 1,
    overflow: 'hidden',
    zIndex: 9999,
  };

  const focusStyle: CSSProperties = {
    position: 'fixed',
    left: 16,
    top: 16,
    width: 'auto',
    height: 'auto',
    overflow: 'visible',
    padding: '12px 24px',
    backgroundColor: '#000',
    color: '#fff',
    borderRadius: 8,
    textDecoration: 'none',
    fontWeight: 600,
  };

  const [isFocused, setIsFocused] = useState(false);

  return (
    <a
      href={`#${targetId}`}
      style={isFocused ? focusStyle : style}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
    >
      {children}
    </a>
  );
}

// ============================================================================
// FOCUS TRAP HOOK
// ============================================================================

/**
 * Trap focus within an element (for modals, dialogs)
 */
export function useFocusTrap(isActive: boolean = true) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    // Store current focus
    previousFocusRef.current = document.activeElement as HTMLElement;

    // Get focusable elements
    const getFocusableElements = () => {
      if (!containerRef.current) return [];
      return Array.from(
        containerRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => !el.hasAttribute('disabled'));
    };

    // Focus first element
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0 && focusableElements[0]) {
      focusableElements[0].focus();
    }

    // Handle tab key
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusable = getFocusableElements();
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // Restore previous focus
      previousFocusRef.current?.focus();
    };
  }, [isActive]);

  return containerRef;
}

// ============================================================================
// TIMER ANNOUNCEMENTS HOOK
// ============================================================================

interface UseTimerAnnouncementsOptions {
  /** Total duration in seconds */
  totalSeconds: number;
  /** Remaining seconds */
  remainingSeconds: number;
  /** Whether timer is running */
  isRunning: boolean;
  /** Announcement interval in seconds (default: 60) */
  interval?: number;
}

/**
 * Announce timer progress to screen readers
 */
export function useTimerAnnouncements({
  totalSeconds,
  remainingSeconds,
  isRunning,
  interval = 60,
}: UseTimerAnnouncementsOptions) {
  const { announce } = useAccessibility();
  const lastAnnouncedRef = useRef<number>(remainingSeconds);

  useEffect(() => {
    if (!isRunning) return;

    // Announce at intervals
    const shouldAnnounce = () => {
      const diff = lastAnnouncedRef.current - remainingSeconds;
      return diff >= interval;
    };

    // Announce at key milestones
    const getMilestoneMessage = () => {
      const percent = (remainingSeconds / totalSeconds) * 100;

      if (remainingSeconds === 0) {
        return 'Timer complete!';
      }
      if (percent <= 10 && percent > 0) {
        return `Less than 10% remaining. ${formatTimeForAnnouncement(remainingSeconds)} left.`;
      }
      if (percent <= 25 && percent > 10) {
        return `25% remaining. ${formatTimeForAnnouncement(remainingSeconds)} left.`;
      }
      if (percent <= 50 && percent > 25) {
        return `Halfway done. ${formatTimeForAnnouncement(remainingSeconds)} left.`;
      }

      return null;
    };

    const milestone = getMilestoneMessage();
    if (milestone && shouldAnnounce()) {
      announce(
        milestone,
        remainingSeconds <= totalSeconds * 0.1 ? 'assertive' : 'polite'
      );
      lastAnnouncedRef.current = remainingSeconds;
    }
  }, [remainingSeconds, totalSeconds, isRunning, interval, announce]);
}

// Format time for spoken announcement
function formatTimeForAnnouncement(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  const parts: string[] = [];
  if (h > 0) parts.push(`${h} ${h === 1 ? 'hour' : 'hours'}`);
  if (m > 0) parts.push(`${m} ${m === 1 ? 'minute' : 'minutes'}`);
  if (s > 0 && h === 0) parts.push(`${s} ${s === 1 ? 'second' : 'seconds'}`);

  return parts.join(' and ') || '0 seconds';
}

// Export context
export { AccessibilityContext };
