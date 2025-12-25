'use client';

import {
  type CSSProperties,
  type ReactNode,
  useState,
  useEffect,
  useMemo,
} from 'react';
import { animation, zIndex } from './tokens';

interface AmbientTimeProps {
  /** Time remaining as percentage (0-100) */
  percentRemaining: number;
  /** Intensity of the gradient (0-1) */
  intensity?: number;
  /** Whether dark mode is enabled */
  darkMode?: boolean;
  /** Content to display over the gradient */
  children?: ReactNode;
  /** Whether to show pulse animation at 0% */
  pulseAtZero?: boolean;
  /** Custom style overrides */
  style?: CSSProperties;
}

// Color stops for the time journey (calibrated for calm)
const TIME_COLORS = {
  light: {
    100: { start: '#e0f2fe', end: '#cffafe' }, // Soft blue/teal
    75: { start: '#bbfcd8', end: '#d9f99d' }, // Blue to green
    50: { start: '#fef08a', end: '#fde68a' }, // Green to warm yellow
    25: { start: '#fed7aa', end: '#fdba74' }, // Amber
    10: { start: '#fecaca', end: '#fda4af' }, // Soft coral
    0: { start: '#fecdd3', end: '#fecdd3' }, // Gentle pink (not alarming)
  },
  dark: {
    100: { start: '#0c4a6e', end: '#164e63' }, // Deep blue/teal
    75: { start: '#14532d', end: '#365314' }, // Deep green
    50: { start: '#713f12', end: '#854d0e' }, // Deep yellow/amber
    25: { start: '#7c2d12', end: '#9a3412' }, // Deep amber/orange
    10: { start: '#7f1d1d', end: '#881337' }, // Deep coral
    0: { start: '#831843', end: '#831843' }, // Deep pink
  },
} as const;

// Get interpolated colors based on percentage
function getGradientColors(
  percent: number,
  darkMode: boolean
): { start: string; end: string } {
  const colorMap = darkMode ? TIME_COLORS.dark : TIME_COLORS.light;

  // Determine which color stops to interpolate between
  const stops = [100, 75, 50, 25, 10, 0] as const;

  for (let i = 0; i < stops.length - 1; i++) {
    const highStop = stops[i] as keyof typeof colorMap;
    const lowStop = stops[i + 1] as keyof typeof colorMap;

    if (percent <= highStop && percent > lowStop) {
      // Interpolate between the two stops
      const range = highStop - lowStop;
      const progress = (percent - lowStop) / range;

      return {
        start: interpolateColor(
          colorMap[lowStop].start,
          colorMap[highStop].start,
          progress
        ),
        end: interpolateColor(
          colorMap[lowStop].end,
          colorMap[highStop].end,
          progress
        ),
      };
    }
  }

  // Edge cases
  if (percent >= 100) {
    return colorMap[100];
  }
  return colorMap[0];
}

// Interpolate between two hex colors
function interpolateColor(color1: string, color2: string, t: number): string {
  const r1 = parseInt(color1.slice(1, 3), 16);
  const g1 = parseInt(color1.slice(3, 5), 16);
  const b1 = parseInt(color1.slice(5, 7), 16);

  const r2 = parseInt(color2.slice(1, 3), 16);
  const g2 = parseInt(color2.slice(3, 5), 16);
  const b2 = parseInt(color2.slice(5, 7), 16);

  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

export function AmbientTime({
  percentRemaining,
  intensity = 0.6,
  darkMode = false,
  children,
  pulseAtZero = true,
  style,
}: AmbientTimeProps) {
  const [isPulsing, setIsPulsing] = useState(false);

  // Clamp percentage to valid range
  const clampedPercent = Math.max(0, Math.min(100, percentRemaining));

  // Get gradient colors based on time remaining
  const gradientColors = useMemo(
    () => getGradientColors(clampedPercent, darkMode),
    [clampedPercent, darkMode]
  );

  // Handle pulse animation at 0%
  useEffect(() => {
    if (clampedPercent === 0 && pulseAtZero) {
      setIsPulsing(true);
    } else {
      setIsPulsing(false);
    }
  }, [clampedPercent, pulseAtZero]);

  // Calculate opacity based on intensity
  const gradientOpacity = Math.max(0.1, Math.min(1, intensity));

  const containerStyle: CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '100%',
    minHeight: '100vh',
    overflow: 'hidden',
    ...style,
  };

  const gradientStyle: CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `linear-gradient(135deg, ${gradientColors.start} 0%, ${gradientColors.end} 100%)`,
    opacity: gradientOpacity,
    transition: `background ${animation.duration.slow}ms ${animation.easing.easeInOut}, opacity ${animation.duration.normal}ms`,
    animation: isPulsing ? 'ambientPulse 2s ease-in-out infinite' : 'none',
    zIndex: zIndex.base,
  };

  const contentStyle: CSSProperties = {
    position: 'relative',
    zIndex: zIndex.raised,
    width: '100%',
    height: '100%',
  };

  return (
    <div style={containerStyle}>
      {/* Ambient gradient background */}
      <div style={gradientStyle} aria-hidden="true" />

      {/* Content overlay */}
      <div style={contentStyle}>{children}</div>

      {/* Pulse animation keyframes */}
      <style>
        {`
          @keyframes ambientPulse {
            0%, 100% {
              opacity: ${gradientOpacity};
            }
            50% {
              opacity: ${Math.max(0.3, gradientOpacity * 0.6)};
            }
          }
        `}
      </style>
    </div>
  );
}

// Preset intensity levels for easy use
export const AmbientIntensity = {
  /** Very subtle background shift */
  subtle: 0.3,
  /** Noticeable but not distracting */
  normal: 0.5,
  /** Clear time indicator */
  obvious: 0.7,
  /** Maximum visibility */
  maximum: 0.9,
} as const;
