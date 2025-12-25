/**
 * Design tokens for ProcrastinAct
 *
 * These tokens define the visual design language across all platforms.
 * The design aims to be:
 * - Calm but not cold (warm colors, soft edges)
 * - Playful but not childish (subtle animations, not cartoonish)
 * - Supportive but not patronizing (gentle encouragement, no guilt)
 * - Clear but not clinical (readable, but approachable)
 *
 * All spacing values follow a 4px base grid system.
 */

// ============================================================================
// COLOR SYSTEM
// ============================================================================

export const colors = {
  // Primary palette - Indigo (calm, focused)
  // Used for primary actions, focus states, key interactions
  primary: {
    50: '#eef2ff',
    100: '#e0e7ff',
    200: '#c7d2fe',
    300: '#a5b4fc',
    400: '#818cf8',
    500: '#6366f1', // Main primary
    600: '#4f46e5',
    700: '#4338ca',
    800: '#3730a3',
    900: '#312e81',
  },

  // Secondary palette - Warm Amber (supportive, encouraging)
  // Used for highlights, achievements, warmth
  secondary: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b', // Main secondary
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },

  // Accent palette - Teal (fresh, calming)
  // Used for secondary actions, subtle highlights
  accent: {
    50: '#f0fdfa',
    100: '#ccfbf1',
    200: '#99f6e4',
    300: '#5eead4',
    400: '#2dd4bf',
    500: '#14b8a6', // Main accent
    600: '#0d9488',
    700: '#0f766e',
    800: '#115e59',
    900: '#134e4a',
  },

  // Semantic colors
  success: '#22c55e', // Task completion, positive feedback
  warning: '#f97316', // Gentle warnings, attention needed
  danger: '#ef4444', // Destructive actions (rarely used)
  info: '#3b82f6', // Informational content

  // Semantic color scales (for gradients, hover states)
  successScale: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },

  warningScale: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#f97316',
    600: '#ea580c',
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12',
  },

  dangerScale: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },

  // Neutral palette - Slate (readable, professional)
  neutral: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },

  // Surface colors (backgrounds, cards)
  background: {
    light: '#f9fafb',
    dark: '#0f172a',
  },
  surface: {
    light: '#ffffff',
    dark: '#1e293b',
  },
  surfaceElevated: {
    light: '#ffffff',
    dark: '#334155',
  },

  // Text colors
  text: {
    primary: {
      light: '#1f2937',
      dark: '#f1f5f9',
    },
    secondary: {
      light: '#6b7280',
      dark: '#94a3b8',
    },
    muted: {
      light: '#9ca3af',
      dark: '#64748b',
    },
    inverse: {
      light: '#ffffff',
      dark: '#0f172a',
    },
  },

  // Border colors
  border: {
    light: '#e5e7eb',
    dark: '#334155',
  },
  borderFocus: {
    light: '#6366f1',
    dark: '#818cf8',
  },

  // Overlay colors
  overlay: {
    light: 'rgba(0, 0, 0, 0.5)',
    dark: 'rgba(0, 0, 0, 0.7)',
  },
} as const;

// ============================================================================
// SPACING SYSTEM (4px base grid)
// ============================================================================

export const spacing = {
  0: 0,
  0.5: 2, // 0.5 * 4 = 2px (fine adjustments)
  1: 4, // 1 * 4 = 4px
  1.5: 6, // 1.5 * 4 = 6px
  2: 8, // 2 * 4 = 8px
  2.5: 10, // 2.5 * 4 = 10px
  3: 12, // 3 * 4 = 12px
  3.5: 14, // 3.5 * 4 = 14px
  4: 16, // 4 * 4 = 16px (common component padding)
  5: 20, // 5 * 4 = 20px
  6: 24, // 6 * 4 = 24px (common section spacing)
  7: 28, // 7 * 4 = 28px
  8: 32, // 8 * 4 = 32px
  9: 36, // 9 * 4 = 36px
  10: 40, // 10 * 4 = 40px
  11: 44, // 11 * 4 = 44px (minimum touch target)
  12: 48, // 12 * 4 = 48px (recommended touch target)
  14: 56, // 14 * 4 = 56px
  16: 64, // 16 * 4 = 64px
  20: 80, // 20 * 4 = 80px
  24: 96, // 24 * 4 = 96px
  28: 112, // 28 * 4 = 112px
  32: 128, // 32 * 4 = 128px
} as const;

// ============================================================================
// BORDER RADIUS
// ============================================================================

export const borderRadius = {
  none: 0,
  sm: 4, // Subtle rounding (inputs, small buttons)
  md: 8, // Standard rounding (cards, medium buttons)
  lg: 12, // Prominent rounding (modals, large cards)
  xl: 16, // Extra rounding (CTAs, feature highlights)
  '2xl': 24, // Large rounding (pills, tags)
  '3xl': 32, // Very large rounding
  full: 9999, // Circular (avatars, round buttons)
} as const;

// ============================================================================
// TYPOGRAPHY
// ============================================================================

export const typography = {
  // Font families
  fontFamily: {
    // System font stack for optimal rendering on each platform
    sans: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    // Monospace for code, timers, numeric displays
    mono: '"SF Mono", "Roboto Mono", "Fira Code", Menlo, Monaco, Consolas, monospace',
  },

  // Font sizes (using major third scale: 1.25)
  fontSize: {
    xs: 12, // Captions, labels
    sm: 14, // Secondary text, descriptions
    base: 16, // Body text, default
    lg: 18, // Emphasized text
    xl: 20, // Subheadings
    '2xl': 24, // Section headings
    '3xl': 30, // Page headings
    '4xl': 36, // Large headings
    '5xl': 48, // Hero headings
    '6xl': 60, // Display text
    '7xl': 72, // Large display
    '8xl': 96, // Extra large display (timer)
    '9xl': 128, // Massive display
  },

  // Font weights
  fontWeight: {
    light: '300', // Light emphasis
    normal: '400', // Body text
    medium: '500', // Slight emphasis
    semibold: '600', // Headings, emphasis
    bold: '700', // Strong emphasis
    extrabold: '800', // Hero text
  },

  // Line heights
  lineHeight: {
    none: 1, // Headings with no spacing
    tight: 1.25, // Compact text, headings
    snug: 1.375, // Slightly compact
    normal: 1.5, // Body text
    relaxed: 1.625, // Comfortable reading
    loose: 2, // Very spaced out
  },

  // Letter spacing
  letterSpacing: {
    tighter: -0.05, // Tight headlines
    tight: -0.025, // Slightly tight
    normal: 0, // Default
    wide: 0.025, // Slightly wide
    wider: 0.05, // Labels, all-caps
    widest: 0.1, // Very spaced
  },
} as const;

// ============================================================================
// SHADOWS
// ============================================================================

export const shadows = {
  none: 'none',
  xs: '0 1px 2px rgba(0, 0, 0, 0.05)',
  sm: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.06)',
  // Focus rings
  focus: '0 0 0 3px rgba(99, 102, 241, 0.5)', // Primary focus
  focusSuccess: '0 0 0 3px rgba(34, 197, 94, 0.5)', // Success focus
  focusDanger: '0 0 0 3px rgba(239, 68, 68, 0.5)', // Danger focus
} as const;

// Dark mode shadows (slightly more prominent)
export const shadowsDark = {
  none: 'none',
  xs: '0 1px 2px rgba(0, 0, 0, 0.2)',
  sm: '0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2)',
  md: '0 4px 6px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.2)',
  lg: '0 10px 15px rgba(0, 0, 0, 0.3), 0 4px 6px rgba(0, 0, 0, 0.2)',
  xl: '0 20px 25px rgba(0, 0, 0, 0.4), 0 10px 10px rgba(0, 0, 0, 0.2)',
  '2xl': '0 25px 50px rgba(0, 0, 0, 0.5)',
  inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.3)',
  focus: '0 0 0 3px rgba(129, 140, 248, 0.5)',
  focusSuccess: '0 0 0 3px rgba(74, 222, 128, 0.5)',
  focusDanger: '0 0 0 3px rgba(248, 113, 113, 0.5)',
} as const;

// ============================================================================
// ANIMATION
// ============================================================================

export const animation = {
  // Duration (in ms)
  duration: {
    instant: 0,
    fastest: 50,
    fast: 150, // Micro-interactions
    normal: 250, // Standard transitions
    slow: 400, // Deliberate animations
    slower: 600, // Complex animations
    slowest: 1000, // Dramatic effects
  },

  // Easing functions
  easing: {
    // Standard easings
    linear: 'linear',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    standard: 'cubic-bezier(0.4, 0, 0.2, 1)', // Alias for easeInOut

    // Expressive easings
    easeInBack: 'cubic-bezier(0.6, -0.28, 0.735, 0.045)',
    easeOutBack: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    easeInOutBack: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',

    // Bouncy easings (for celebrations)
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  },

  // Pre-defined transitions
  transition: {
    fast: '150ms cubic-bezier(0, 0, 0.2, 1)',
    normal: '250ms cubic-bezier(0, 0, 0.2, 1)',
    slow: '400ms cubic-bezier(0, 0, 0.2, 1)',
    bounce: '500ms cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
} as const;

// ============================================================================
// Z-INDEX SCALE
// ============================================================================

export const zIndex = {
  hide: -1,
  base: 0,
  raised: 1, // Cards slightly raised
  dropdown: 10, // Dropdowns, popovers
  sticky: 20, // Sticky headers
  banner: 30, // Banners, notifications
  overlay: 40, // Background overlays
  modal: 50, // Modal dialogs
  popover: 60, // Popovers above modals
  tooltip: 70, // Tooltips
  toast: 80, // Toast notifications
  celebration: 90, // Celebration overlays
  max: 9999, // Maximum z-index
} as const;

// ============================================================================
// BREAKPOINTS
// ============================================================================

export const breakpoints = {
  xs: 320, // Small phones
  sm: 480, // Large phones
  md: 768, // Tablets
  lg: 1024, // Small laptops
  xl: 1280, // Desktops
  '2xl': 1536, // Large desktops
} as const;

// ============================================================================
// TOUCH TARGET SIZES (for ADHD-friendly accessibility)
// ============================================================================

export const touchTarget = {
  // Minimum touch targets (WCAG 2.5.5 Level AAA)
  minimum: 44, // 44x44px minimum for interactive elements
  recommended: 48, // 48x48px recommended
  comfortable: 56, // 56x56px comfortable for motor difficulties

  // Spacing between touch targets
  gap: 8, // Minimum 8px gap between targets
} as const;

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type Colors = typeof colors;
export type Spacing = typeof spacing;
export type BorderRadius = typeof borderRadius;
export type Typography = typeof typography;
export type Shadows = typeof shadows;
export type ShadowsDark = typeof shadowsDark;
export type Animation = typeof animation;
export type ZIndex = typeof zIndex;
export type Breakpoints = typeof breakpoints;
export type TouchTarget = typeof touchTarget;

// Helper type for accessing nested color values
export type ColorScale = keyof typeof colors.primary;

// ============================================================================
// DESIGN TOKENS OBJECT (for programmatic access)
// ============================================================================

export const designTokens = {
  colors,
  spacing,
  borderRadius,
  typography,
  shadows,
  shadowsDark,
  animation,
  zIndex,
  breakpoints,
  touchTarget,
} as const;

export type DesignTokens = typeof designTokens;
