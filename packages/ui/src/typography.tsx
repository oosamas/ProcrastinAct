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
import { typography, colors } from './tokens';

// ============================================================================
// FONT OPTIONS
// ============================================================================

/**
 * Font options including dyslexia-friendly alternatives
 */
export const fontOptions = {
  // System default - most compatible
  system: {
    name: 'System Default',
    description: 'Uses your device default font',
    family:
      'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    letterSpacingAdjust: 0,
    lineHeightAdjust: 0,
  },

  // OpenDyslexic - popular dyslexia-friendly font
  openDyslexic: {
    name: 'OpenDyslexic',
    description: 'Font designed to increase readability for dyslexia',
    family: '"OpenDyslexic", "Comic Sans MS", sans-serif',
    letterSpacingAdjust: 0.02,
    lineHeightAdjust: 0.1,
    webFontUrl: 'https://fonts.cdnfonts.com/css/opendyslexic',
  },

  // Lexie Readable - another dyslexia-friendly option
  lexieReadable: {
    name: 'Lexie Readable',
    description: 'Clean, open font for improved readability',
    family: '"Lexie Readable", "Verdana", sans-serif',
    letterSpacingAdjust: 0.015,
    lineHeightAdjust: 0.05,
    webFontUrl: 'https://fonts.cdnfonts.com/css/lexie-readable',
  },

  // Atkinson Hyperlegible - designed for low vision
  atkinson: {
    name: 'Atkinson Hyperlegible',
    description: 'Designed for maximum legibility by Braille Institute',
    family: '"Atkinson Hyperlegible", "Arial", sans-serif',
    letterSpacingAdjust: 0.01,
    lineHeightAdjust: 0.05,
    webFontUrl:
      'https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&display=swap',
  },

  // Inter - clean, highly readable
  inter: {
    name: 'Inter',
    description: 'Modern, clean font optimized for screens',
    family: '"Inter", "Helvetica Neue", sans-serif',
    letterSpacingAdjust: 0,
    lineHeightAdjust: 0,
    webFontUrl:
      'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
  },
} as const;

export type FontOption = keyof typeof fontOptions;

// ============================================================================
// TEXT SIZE OPTIONS
// ============================================================================

export type TextSizePreset = 'small' | 'medium' | 'large' | 'extraLarge';

/**
 * Text size scaling for accessibility
 */
export const textSizeScales: Record<TextSizePreset, number> = {
  small: 0.875, // 87.5% of base
  medium: 1, // 100% base
  large: 1.125, // 112.5% of base
  extraLarge: 1.25, // 125% of base
};

// ============================================================================
// LINE SPACING OPTIONS
// ============================================================================

export type LineSpacingPreset = 'compact' | 'normal' | 'relaxed' | 'loose';

export const lineSpacingMultipliers: Record<LineSpacingPreset, number> = {
  compact: 1.3,
  normal: 1.5,
  relaxed: 1.75,
  loose: 2,
};

// ============================================================================
// TYPOGRAPHY CONTEXT
// ============================================================================

interface TypographyContextValue {
  /** Selected font */
  font: FontOption;
  /** Text size preset */
  textSize: TextSizePreset;
  /** Line spacing preset */
  lineSpacing: LineSpacingPreset;
  /** Letter spacing (0-0.1em) */
  letterSpacing: number;
  /** Maximum line width in characters */
  maxLineWidth: number;
  /** Whether high contrast mode is on */
  highContrast: boolean;
  /** Setters */
  setFont: (font: FontOption) => void;
  setTextSize: (size: TextSizePreset) => void;
  setLineSpacing: (spacing: LineSpacingPreset) => void;
  setLetterSpacing: (spacing: number) => void;
  setMaxLineWidth: (width: number) => void;
  setHighContrast: (enabled: boolean) => void;
  /** Get computed font family */
  getFontFamily: () => string;
  /** Get scaled font size */
  getScaledSize: (baseSize: number) => number;
  /** Get computed line height */
  getLineHeight: () => number;
}

const TypographyContext = createContext<TypographyContextValue>({
  font: 'system',
  textSize: 'medium',
  lineSpacing: 'normal',
  letterSpacing: 0,
  maxLineWidth: 80,
  highContrast: false,
  setFont: () => {},
  setTextSize: () => {},
  setLineSpacing: () => {},
  setLetterSpacing: () => {},
  setMaxLineWidth: () => {},
  setHighContrast: () => {},
  getFontFamily: () => typography.fontFamily.sans,
  getScaledSize: (size) => size,
  getLineHeight: () => 1.5,
});

// Storage keys
const STORAGE_PREFIX = 'procrastinact-typography-';
const FONT_KEY = STORAGE_PREFIX + 'font';
const SIZE_KEY = STORAGE_PREFIX + 'size';
const LINE_SPACING_KEY = STORAGE_PREFIX + 'line-spacing';
const LETTER_SPACING_KEY = STORAGE_PREFIX + 'letter-spacing';
const MAX_WIDTH_KEY = STORAGE_PREFIX + 'max-width';
const HIGH_CONTRAST_KEY = STORAGE_PREFIX + 'high-contrast';

interface TypographyProviderProps {
  children: ReactNode;
  /** Default font option */
  defaultFont?: FontOption;
  /** Default text size */
  defaultTextSize?: TextSizePreset;
}

export function TypographyProvider({
  children,
  defaultFont = 'system',
  defaultTextSize = 'medium',
}: TypographyProviderProps) {
  const [font, setFontState] = useState<FontOption>(defaultFont);
  const [textSize, setTextSizeState] =
    useState<TextSizePreset>(defaultTextSize);
  const [lineSpacing, setLineSpacingState] =
    useState<LineSpacingPreset>('normal');
  const [letterSpacing, setLetterSpacingState] = useState(0);
  const [maxLineWidth, setMaxLineWidthState] = useState(80);
  const [highContrast, setHighContrastState] = useState(false);
  const [_fontsLoaded, setFontsLoaded] = useState(false);

  // Load settings from storage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const storedFont = localStorage.getItem(FONT_KEY) as FontOption | null;
      if (storedFont && storedFont in fontOptions) {
        setFontState(storedFont);
      }

      const storedSize = localStorage.getItem(
        SIZE_KEY
      ) as TextSizePreset | null;
      if (storedSize && storedSize in textSizeScales) {
        setTextSizeState(storedSize);
      }

      const storedLineSpacing = localStorage.getItem(
        LINE_SPACING_KEY
      ) as LineSpacingPreset | null;
      if (storedLineSpacing && storedLineSpacing in lineSpacingMultipliers) {
        setLineSpacingState(storedLineSpacing);
      }

      const storedLetterSpacing = localStorage.getItem(LETTER_SPACING_KEY);
      if (storedLetterSpacing) {
        const value = parseFloat(storedLetterSpacing);
        if (!isNaN(value) && value >= 0 && value <= 0.1) {
          setLetterSpacingState(value);
        }
      }

      const storedMaxWidth = localStorage.getItem(MAX_WIDTH_KEY);
      if (storedMaxWidth) {
        const value = parseInt(storedMaxWidth, 10);
        if (!isNaN(value) && value >= 40 && value <= 120) {
          setMaxLineWidthState(value);
        }
      }

      const storedHighContrast = localStorage.getItem(HIGH_CONTRAST_KEY);
      if (storedHighContrast) {
        setHighContrastState(storedHighContrast === 'true');
      }
    } catch {
      // localStorage might not be available
    }
  }, []);

  // Load web fonts when font changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const fontConfig = fontOptions[font];
    if ('webFontUrl' in fontConfig && fontConfig.webFontUrl) {
      // Check if font is already loaded
      const existingLink = document.querySelector(
        `link[href="${fontConfig.webFontUrl}"]`
      );
      if (!existingLink) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = fontConfig.webFontUrl;
        link.onload = () => setFontsLoaded(true);
        document.head.appendChild(link);
      } else {
        setFontsLoaded(true);
      }
    } else {
      setFontsLoaded(true);
    }
  }, [font]);

  // Setters with persistence
  const setFont = useCallback((value: FontOption) => {
    setFontState(value);
    try {
      localStorage.setItem(FONT_KEY, value);
    } catch {
      // Ignore
    }
  }, []);

  const setTextSize = useCallback((value: TextSizePreset) => {
    setTextSizeState(value);
    try {
      localStorage.setItem(SIZE_KEY, value);
    } catch {
      // Ignore
    }
  }, []);

  const setLineSpacing = useCallback((value: LineSpacingPreset) => {
    setLineSpacingState(value);
    try {
      localStorage.setItem(LINE_SPACING_KEY, value);
    } catch {
      // Ignore
    }
  }, []);

  const setLetterSpacing = useCallback((value: number) => {
    const clamped = Math.max(0, Math.min(0.1, value));
    setLetterSpacingState(clamped);
    try {
      localStorage.setItem(LETTER_SPACING_KEY, String(clamped));
    } catch {
      // Ignore
    }
  }, []);

  const setMaxLineWidth = useCallback((value: number) => {
    const clamped = Math.max(40, Math.min(120, value));
    setMaxLineWidthState(clamped);
    try {
      localStorage.setItem(MAX_WIDTH_KEY, String(clamped));
    } catch {
      // Ignore
    }
  }, []);

  const setHighContrast = useCallback((value: boolean) => {
    setHighContrastState(value);
    try {
      localStorage.setItem(HIGH_CONTRAST_KEY, String(value));
    } catch {
      // Ignore
    }
  }, []);

  // Get computed font family
  const getFontFamily = useCallback(() => {
    return fontOptions[font].family;
  }, [font]);

  // Get scaled font size
  const getScaledSize = useCallback(
    (baseSize: number) => {
      const scale = textSizeScales[textSize];
      return Math.round(baseSize * scale);
    },
    [textSize]
  );

  // Get computed line height
  const getLineHeight = useCallback(() => {
    const fontConfig = fontOptions[font];
    const baseMultiplier = lineSpacingMultipliers[lineSpacing];
    return baseMultiplier + fontConfig.lineHeightAdjust;
  }, [font, lineSpacing]);

  const value = useMemo(
    () => ({
      font,
      textSize,
      lineSpacing,
      letterSpacing,
      maxLineWidth,
      highContrast,
      setFont,
      setTextSize,
      setLineSpacing,
      setLetterSpacing,
      setMaxLineWidth,
      setHighContrast,
      getFontFamily,
      getScaledSize,
      getLineHeight,
    }),
    [
      font,
      textSize,
      lineSpacing,
      letterSpacing,
      maxLineWidth,
      highContrast,
      setFont,
      setTextSize,
      setLineSpacing,
      setLetterSpacing,
      setMaxLineWidth,
      setHighContrast,
      getFontFamily,
      getScaledSize,
      getLineHeight,
    ]
  );

  return (
    <TypographyContext.Provider value={value}>
      {children}
    </TypographyContext.Provider>
  );
}

export function useTypography(): TypographyContextValue {
  return useContext(TypographyContext);
}

// ============================================================================
// TYPOGRAPHY COMPONENTS
// ============================================================================

interface TextProps {
  children: ReactNode;
  /** Text variant */
  variant?:
    | 'body'
    | 'caption'
    | 'label'
    | 'heading1'
    | 'heading2'
    | 'heading3'
    | 'display';
  /** Text color */
  color?: 'primary' | 'secondary' | 'muted' | 'success' | 'danger' | 'inherit';
  /** Text alignment */
  align?: 'left' | 'center' | 'right';
  /** Font weight override */
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  /** Truncate text with ellipsis */
  truncate?: boolean;
  /** Maximum lines before truncating */
  maxLines?: number;
  /** Dark mode */
  darkMode?: boolean;
  /** Additional styles */
  style?: CSSProperties;
  /** Component to render as */
  as?: 'p' | 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'label';
}

/**
 * Accessible text component with typography settings applied
 */
export function Text({
  children,
  variant = 'body',
  color = 'primary',
  align = 'left',
  weight,
  truncate = false,
  maxLines,
  darkMode = false,
  style,
  as,
}: TextProps) {
  const {
    getFontFamily,
    getScaledSize,
    getLineHeight,
    letterSpacing,
    maxLineWidth,
    highContrast,
  } = useTypography();

  // Determine base styles for variant
  const variantStyles: Record<
    NonNullable<TextProps['variant']>,
    { size: number; weight: string; lineHeight: number }
  > = {
    body: {
      size: typography.fontSize.base,
      weight: typography.fontWeight.normal,
      lineHeight: typography.lineHeight.normal,
    },
    caption: {
      size: typography.fontSize.sm,
      weight: typography.fontWeight.normal,
      lineHeight: typography.lineHeight.normal,
    },
    label: {
      size: typography.fontSize.xs,
      weight: typography.fontWeight.medium,
      lineHeight: typography.lineHeight.snug,
    },
    heading1: {
      size: typography.fontSize['3xl'],
      weight: typography.fontWeight.bold,
      lineHeight: typography.lineHeight.tight,
    },
    heading2: {
      size: typography.fontSize['2xl'],
      weight: typography.fontWeight.semibold,
      lineHeight: typography.lineHeight.tight,
    },
    heading3: {
      size: typography.fontSize.xl,
      weight: typography.fontWeight.semibold,
      lineHeight: typography.lineHeight.snug,
    },
    display: {
      size: typography.fontSize['5xl'],
      weight: typography.fontWeight.bold,
      lineHeight: typography.lineHeight.none,
    },
  };

  const variantStyle = variantStyles[variant];

  // Determine color
  const getColor = (): string => {
    if (color === 'inherit') return 'inherit';
    if (color === 'success') return colors.success;
    if (color === 'danger') return colors.danger;

    const textColors = colors.text[color as keyof typeof colors.text];
    if (textColors) {
      return darkMode ? textColors.dark : textColors.light;
    }
    return darkMode ? colors.text.primary.dark : colors.text.primary.light;
  };

  // High contrast adjustments
  const contrastColor = highContrast
    ? darkMode
      ? '#ffffff'
      : '#000000'
    : getColor();

  const computedStyle: CSSProperties = {
    fontFamily: getFontFamily(),
    fontSize: getScaledSize(variantStyle.size),
    fontWeight: weight ? typography.fontWeight[weight] : variantStyle.weight,
    lineHeight:
      variant.startsWith('heading') || variant === 'display'
        ? variantStyle.lineHeight
        : getLineHeight(),
    letterSpacing: `${letterSpacing}em`,
    color: contrastColor,
    textAlign: align,
    margin: 0,
    maxWidth:
      variant === 'body' || variant === 'caption'
        ? `${maxLineWidth}ch`
        : undefined,
    ...(truncate && {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    }),
    ...(maxLines && {
      display: '-webkit-box',
      WebkitLineClamp: maxLines,
      WebkitBoxOrient: 'vertical' as const,
      overflow: 'hidden',
    }),
    ...style,
  };

  // Determine element to render
  const Component =
    as ||
    (variant === 'heading1'
      ? 'h1'
      : variant === 'heading2'
        ? 'h2'
        : variant === 'heading3'
          ? 'h3'
          : variant === 'display'
            ? 'h1'
            : variant === 'label'
              ? 'label'
              : 'p');

  return <Component style={computedStyle}>{children}</Component>;
}

// ============================================================================
// PARAGRAPH COMPONENT
// ============================================================================

interface ParagraphProps {
  children: ReactNode;
  /** First paragraph (no margin top) */
  first?: boolean;
  /** Last paragraph (no margin bottom) */
  last?: boolean;
  /** Dark mode */
  darkMode?: boolean;
  /** Additional styles */
  style?: CSSProperties;
}

/**
 * Optimized paragraph with proper spacing and max-width
 */
export function Paragraph({
  children,
  first = false,
  last = false,
  darkMode = false,
  style,
}: ParagraphProps) {
  const {
    getFontFamily,
    getScaledSize,
    getLineHeight,
    letterSpacing,
    maxLineWidth,
    highContrast,
  } = useTypography();

  const computedStyle: CSSProperties = {
    fontFamily: getFontFamily(),
    fontSize: getScaledSize(typography.fontSize.base),
    fontWeight: typography.fontWeight.normal,
    lineHeight: getLineHeight(),
    letterSpacing: `${letterSpacing}em`,
    color: highContrast
      ? darkMode
        ? '#ffffff'
        : '#000000'
      : darkMode
        ? colors.text.primary.dark
        : colors.text.primary.light,
    maxWidth: `${maxLineWidth}ch`,
    marginTop: first ? 0 : '1em',
    marginBottom: last ? 0 : '1em',
    ...style,
  };

  return <p style={computedStyle}>{children}</p>;
}

// ============================================================================
// TYPOGRAPHY SETTINGS COMPONENT
// ============================================================================

interface TypographySettingsProps {
  darkMode?: boolean;
}

/**
 * Settings UI for typography preferences
 */
export function TypographySettings({
  darkMode = false,
}: TypographySettingsProps) {
  const {
    font,
    textSize,
    lineSpacing,
    letterSpacing,
    maxLineWidth,
    highContrast,
    setFont,
    setTextSize,
    setLineSpacing,
    setLetterSpacing,
    setMaxLineWidth,
    setHighContrast,
  } = useTypography();

  const containerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
    padding: 16,
  };

  const sectionStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  };

  const labelStyle: CSSProperties = {
    fontSize: 14,
    fontWeight: 600,
    color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
    marginBottom: 4,
  };

  const descriptionStyle: CSSProperties = {
    fontSize: 12,
    color: darkMode ? colors.text.muted.dark : colors.text.muted.light,
    marginBottom: 8,
  };

  const optionsStyle: CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
  };

  const optionButtonStyle = (selected: boolean): CSSProperties => ({
    padding: '8px 16px',
    minHeight: 44,
    backgroundColor: selected
      ? colors.primary[500]
      : darkMode
        ? colors.neutral[700]
        : colors.neutral[100],
    color: selected
      ? 'white'
      : darkMode
        ? colors.text.primary.dark
        : colors.text.primary.light,
    border: `1px solid ${
      selected
        ? colors.primary[500]
        : darkMode
          ? colors.neutral[600]
          : colors.neutral[200]
    }`,
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 500,
    transition: 'all 150ms',
  });

  const sliderContainerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  };

  const sliderStyle: CSSProperties = {
    flex: 1,
    height: 8,
    WebkitAppearance: 'none',
    appearance: 'none',
    backgroundColor: darkMode ? colors.neutral[700] : colors.neutral[200],
    borderRadius: 4,
    cursor: 'pointer',
  };

  const sliderValueStyle: CSSProperties = {
    fontSize: 14,
    fontWeight: 500,
    color: darkMode ? colors.text.secondary.dark : colors.text.secondary.light,
    minWidth: 48,
    textAlign: 'right',
  };

  return (
    <div style={containerStyle}>
      {/* Font Selection */}
      <div style={sectionStyle}>
        <label style={labelStyle}>Font</label>
        <p style={descriptionStyle}>Choose a font that works best for you</p>
        <div style={optionsStyle}>
          {(Object.keys(fontOptions) as FontOption[]).map((key) => (
            <button
              key={key}
              style={{
                ...optionButtonStyle(font === key),
                fontFamily: fontOptions[key].family,
              }}
              onClick={() => setFont(key)}
              type="button"
              title={fontOptions[key].description}
            >
              {fontOptions[key].name}
            </button>
          ))}
        </div>
      </div>

      {/* Text Size */}
      <div style={sectionStyle}>
        <label style={labelStyle}>Text Size</label>
        <div style={optionsStyle}>
          {(Object.keys(textSizeScales) as TextSizePreset[]).map((size) => (
            <button
              key={size}
              style={optionButtonStyle(textSize === size)}
              onClick={() => setTextSize(size)}
              type="button"
            >
              {size.charAt(0).toUpperCase() + size.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Line Spacing */}
      <div style={sectionStyle}>
        <label style={labelStyle}>Line Spacing</label>
        <div style={optionsStyle}>
          {(Object.keys(lineSpacingMultipliers) as LineSpacingPreset[]).map(
            (spacing) => (
              <button
                key={spacing}
                style={optionButtonStyle(lineSpacing === spacing)}
                onClick={() => setLineSpacing(spacing)}
                type="button"
              >
                {spacing.charAt(0).toUpperCase() + spacing.slice(1)}
              </button>
            )
          )}
        </div>
      </div>

      {/* Letter Spacing */}
      <div style={sectionStyle}>
        <label style={labelStyle}>Letter Spacing</label>
        <div style={sliderContainerStyle}>
          <input
            type="range"
            min="0"
            max="0.1"
            step="0.01"
            value={letterSpacing}
            onChange={(e) => setLetterSpacing(parseFloat(e.target.value))}
            style={sliderStyle}
          />
          <span style={sliderValueStyle}>
            {Math.round(letterSpacing * 100)}%
          </span>
        </div>
      </div>

      {/* Max Line Width */}
      <div style={sectionStyle}>
        <label style={labelStyle}>Line Width</label>
        <p style={descriptionStyle}>Maximum characters per line (40-120)</p>
        <div style={sliderContainerStyle}>
          <input
            type="range"
            min="40"
            max="120"
            step="5"
            value={maxLineWidth}
            onChange={(e) => setMaxLineWidth(parseInt(e.target.value, 10))}
            style={sliderStyle}
          />
          <span style={sliderValueStyle}>{maxLineWidth}</span>
        </div>
      </div>

      {/* High Contrast */}
      <div style={sectionStyle}>
        <label style={labelStyle}>High Contrast</label>
        <button
          style={optionButtonStyle(highContrast)}
          onClick={() => setHighContrast(!highContrast)}
          type="button"
        >
          {highContrast ? 'On' : 'Off'}
        </button>
      </div>

      {/* Preview */}
      <div style={sectionStyle}>
        <label style={labelStyle}>Preview</label>
        <div
          style={{
            padding: 16,
            backgroundColor: darkMode
              ? colors.surface.dark
              : colors.surface.light,
            borderRadius: 8,
            border: `1px solid ${
              darkMode ? colors.border.dark : colors.border.light
            }`,
          }}
        >
          <Text
            variant="heading3"
            darkMode={darkMode}
            style={{ marginBottom: 8 }}
          >
            Sample Heading
          </Text>
          <Paragraph darkMode={darkMode} first>
            This is how your text will look with the current settings. The quick
            brown fox jumps over the lazy dog. Reading should feel comfortable
            and effortless.
          </Paragraph>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// CONTRAST UTILITIES
// ============================================================================

/**
 * Calculate relative luminance of a color
 */
export function getLuminance(hexColor: string): number {
  const rgb = hexToRgb(hexColor);
  if (!rgb) return 0;

  const toLinear = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };

  const r = toLinear(rgb.r);
  const g = toLinear(rgb.g);
  const b = toLinear(rgb.b);

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculate contrast ratio between two colors
 * WCAG AA requires 4.5:1 for normal text, 3:1 for large text
 */
export function getContrastRatio(color1: string, color2: string): number {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if color combination meets WCAG AA
 */
export function meetsWCAG_AA(
  foreground: string,
  background: string,
  isLargeText: boolean = false
): boolean {
  const ratio = getContrastRatio(foreground, background);
  return isLargeText ? ratio >= 3 : ratio >= 4.5;
}

/**
 * Check if color combination meets WCAG AAA
 */
export function meetsWCAG_AAA(
  foreground: string,
  background: string,
  isLargeText: boolean = false
): boolean {
  const ratio = getContrastRatio(foreground, background);
  return isLargeText ? ratio >= 4.5 : ratio >= 7;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result || !result[1] || !result[2] || !result[3]) return null;
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

// Export context
export { TypographyContext };
