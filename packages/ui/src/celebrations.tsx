'use client';

import {
  type CSSProperties,
  type ReactNode,
  useState,
  useEffect,
  useMemo,
} from 'react';
import { colors, zIndex } from './tokens';
import { useMotion } from './motion';
import { useHaptics } from './haptics';

// ============================================================================
// TYPES
// ============================================================================

export type CelebrationLevel = 'subtle' | 'normal' | 'big' | 'epic';

export interface CelebrationConfig {
  /** Animation intensity level */
  level: CelebrationLevel;
  /** Custom color palette */
  colors?: string[];
  /** Duration override in ms */
  duration?: number;
  /** Disable sound */
  silent?: boolean;
}

interface ParticleBase {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  delay: number;
}

interface ConfettiParticle extends ParticleBase {
  rotation: number;
  shape: 'rect' | 'circle' | 'star';
  velocity: { x: number; y: number };
}

interface StarParticle extends ParticleBase {
  scale: number;
  angle: number;
  distance: number;
}

interface FireworkParticle extends ParticleBase {
  angle: number;
  speed: number;
  decay: number;
}

// ============================================================================
// DEFAULT COLORS
// ============================================================================

const CELEBRATION_COLORS = {
  default: [
    colors.primary[400],
    colors.primary[500],
    colors.success,
    '#FFD700', // gold
    '#FF69B4', // pink
    '#87CEEB', // sky blue
    '#FFA500', // orange
    '#E066FF', // purple
  ],
  warm: ['#FF6B6B', '#FFE66D', '#FF8E53', '#FFA07A', '#FFD700', '#FF4500'],
  cool: ['#4ECDC4', '#45B7D1', '#96E6A1', '#87CEEB', '#7B68EE', '#00CED1'],
  gold: ['#FFD700', '#FFC107', '#FFAB00', '#FF8F00', '#FFE57F', '#FFD54F'],
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)] as T;
}

function getParticleCount(level: CelebrationLevel): number {
  switch (level) {
    case 'subtle':
      return 15;
    case 'normal':
      return 30;
    case 'big':
      return 50;
    case 'epic':
      return 80;
  }
}

function getDuration(level: CelebrationLevel): number {
  switch (level) {
    case 'subtle':
      return 1500;
    case 'normal':
      return 2000;
    case 'big':
      return 3000;
    case 'epic':
      return 4000;
  }
}

// ============================================================================
// CONFETTI ANIMATION
// ============================================================================

interface ConfettiProps {
  show: boolean;
  level?: CelebrationLevel;
  colors?: string[];
  duration?: number;
  onComplete?: () => void;
}

function generateConfetti(
  count: number,
  colorPalette: string[]
): ConfettiParticle[] {
  const shapes: ConfettiParticle['shape'][] = ['rect', 'circle', 'star'];

  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: randomBetween(10, 90),
    y: -10,
    size: randomBetween(6, 12),
    color: randomFrom(colorPalette),
    delay: randomBetween(0, 0.8),
    rotation: randomBetween(0, 360),
    shape: randomFrom(shapes),
    velocity: {
      x: randomBetween(-3, 3),
      y: randomBetween(2, 5),
    },
  }));
}

/**
 * Confetti animation with multiple particle shapes
 */
export function Confetti({
  show,
  level = 'normal',
  colors: customColors,
  duration: customDuration,
  onComplete,
}: ConfettiProps) {
  const [particles, setParticles] = useState<ConfettiParticle[]>([]);
  const [isActive, setIsActive] = useState(false);
  const { reducedMotion } = useMotion();
  const { trigger } = useHaptics();

  const colorPalette = customColors || CELEBRATION_COLORS.default;
  const particleCount = getParticleCount(level);
  const animDuration = customDuration || getDuration(level);

  useEffect(() => {
    if (show && !reducedMotion) {
      setParticles(generateConfetti(particleCount, colorPalette));
      setIsActive(true);
      trigger('success');

      const timer = setTimeout(() => {
        setIsActive(false);
        onComplete?.();
      }, animDuration);

      return () => clearTimeout(timer);
    } else if (show && reducedMotion) {
      // For reduced motion, just show a brief flash
      setIsActive(true);
      trigger('success');
      setTimeout(() => {
        setIsActive(false);
        onComplete?.();
      }, 300);
    }
  }, [
    show,
    reducedMotion,
    particleCount,
    colorPalette,
    animDuration,
    trigger,
    onComplete,
  ]);

  if (!isActive) return null;

  // Reduced motion: show simple success indicator
  if (reducedMotion) {
    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          zIndex: zIndex.celebration,
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      />
    );
  }

  const containerStyle: CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    pointerEvents: 'none',
    zIndex: zIndex.celebration,
  };

  const renderParticle = (particle: ConfettiParticle) => {
    const baseStyle: CSSProperties = {
      position: 'absolute',
      left: `${particle.x}%`,
      top: `${particle.y}%`,
      width: particle.size,
      height: particle.shape === 'rect' ? particle.size * 0.6 : particle.size,
      backgroundColor:
        particle.shape !== 'star' ? particle.color : 'transparent',
      transform: `rotate(${particle.rotation}deg)`,
      animation: `confetti-fall ${animDuration / 1000}s ease-out ${particle.delay}s forwards`,
      opacity: 0,
    };

    if (particle.shape === 'circle') {
      baseStyle.borderRadius = '50%';
    }

    if (particle.shape === 'star') {
      return (
        <svg
          key={particle.id}
          style={{
            ...baseStyle,
            fill: particle.color,
          }}
          viewBox="0 0 24 24"
          width={particle.size}
          height={particle.size}
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      );
    }

    return <div key={particle.id} style={baseStyle} />;
  };

  return (
    <div style={containerStyle} aria-hidden="true">
      {particles.map(renderParticle)}
      <style>
        {`
          @keyframes confetti-fall {
            0% {
              opacity: 1;
              transform: translateY(0) rotate(0deg);
            }
            100% {
              opacity: 0;
              transform: translateY(100vh) rotate(720deg);
            }
          }
        `}
      </style>
    </div>
  );
}

// ============================================================================
// STAR BURST ANIMATION
// ============================================================================

interface StarBurstProps {
  show: boolean;
  x?: number;
  y?: number;
  level?: CelebrationLevel;
  colors?: string[];
  onComplete?: () => void;
}

function generateStars(count: number, colorPalette: string[]): StarParticle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: 50,
    y: 50,
    size: randomBetween(8, 20),
    color: randomFrom(colorPalette),
    delay: randomBetween(0, 0.2),
    scale: randomBetween(0.5, 1.5),
    angle: (360 / count) * i + randomBetween(-10, 10),
    distance: randomBetween(80, 200),
  }));
}

/**
 * Star burst animation radiating from a point
 */
export function StarBurst({
  show,
  x = 50,
  y = 50,
  level = 'normal',
  colors: customColors,
  onComplete,
}: StarBurstProps) {
  const [particles, setParticles] = useState<StarParticle[]>([]);
  const [isActive, setIsActive] = useState(false);
  const { reducedMotion } = useMotion();
  const { trigger } = useHaptics();

  const colorPalette = customColors || CELEBRATION_COLORS.gold;
  const particleCount = getParticleCount(level);
  const animDuration = getDuration(level) * 0.7;

  useEffect(() => {
    if (show && !reducedMotion) {
      const stars = generateStars(particleCount, colorPalette).map((star) => ({
        ...star,
        x,
        y,
      }));
      setParticles(stars);
      setIsActive(true);
      trigger('success');

      const timer = setTimeout(() => {
        setIsActive(false);
        onComplete?.();
      }, animDuration);

      return () => clearTimeout(timer);
    } else if (show && reducedMotion) {
      setIsActive(true);
      trigger('success');
      setTimeout(() => {
        setIsActive(false);
        onComplete?.();
      }, 200);
    }
  }, [
    show,
    x,
    y,
    reducedMotion,
    particleCount,
    colorPalette,
    animDuration,
    trigger,
    onComplete,
  ]);

  if (!isActive) return null;

  if (reducedMotion) {
    return (
      <div
        style={{
          position: 'fixed',
          left: `${x}%`,
          top: `${y}%`,
          transform: 'translate(-50%, -50%)',
          width: 60,
          height: 60,
          borderRadius: '50%',
          backgroundColor: colors.success,
          opacity: 0.3,
          zIndex: zIndex.celebration,
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      />
    );
  }

  const containerStyle: CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    pointerEvents: 'none',
    zIndex: zIndex.celebration,
  };

  return (
    <div style={containerStyle} aria-hidden="true">
      {particles.map((particle) => (
        <svg
          key={particle.id}
          style={
            {
              position: 'absolute',
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: particle.size,
              height: particle.size,
              fill: particle.color,
              transform: `translate(-50%, -50%) scale(${particle.scale})`,
              animation: `star-burst ${animDuration / 1000}s ease-out ${particle.delay}s forwards`,
              '--angle': `${particle.angle}deg`,
              '--distance': `${particle.distance}px`,
              opacity: 0,
            } as CSSProperties
          }
          viewBox="0 0 24 24"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
      <style>
        {`
          @keyframes star-burst {
            0% {
              opacity: 1;
              transform: translate(-50%, -50%) scale(0) rotate(0deg);
            }
            50% {
              opacity: 1;
              transform: translate(
                calc(-50% + cos(var(--angle)) * var(--distance) * 0.5),
                calc(-50% + sin(var(--angle)) * var(--distance) * 0.5)
              ) scale(1) rotate(180deg);
            }
            100% {
              opacity: 0;
              transform: translate(
                calc(-50% + cos(var(--angle)) * var(--distance)),
                calc(-50% + sin(var(--angle)) * var(--distance))
              ) scale(0.5) rotate(360deg);
            }
          }
        `}
      </style>
    </div>
  );
}

// ============================================================================
// PULSE GLOW ANIMATION
// ============================================================================

interface PulseGlowProps {
  show: boolean;
  x?: number;
  y?: number;
  color?: string;
  size?: number;
  pulses?: number;
  onComplete?: () => void;
}

/**
 * Gentle pulse/glow animation - subtle celebration
 */
export function PulseGlow({
  show,
  x = 50,
  y = 50,
  color = colors.success,
  size = 100,
  pulses = 3,
  onComplete,
}: PulseGlowProps) {
  const [isActive, setIsActive] = useState(false);
  const { reducedMotion } = useMotion();
  const { trigger } = useHaptics();

  const animDuration = pulses * 600;

  useEffect(() => {
    if (show) {
      setIsActive(true);
      trigger('tap');

      const timer = setTimeout(() => {
        setIsActive(false);
        onComplete?.();
      }, animDuration);

      return () => clearTimeout(timer);
    }
  }, [show, animDuration, trigger, onComplete]);

  if (!isActive) return null;

  const containerStyle: CSSProperties = {
    position: 'fixed',
    left: `${x}%`,
    top: `${y}%`,
    transform: 'translate(-50%, -50%)',
    width: size,
    height: size,
    pointerEvents: 'none',
    zIndex: zIndex.celebration,
  };

  const ringStyle = (index: number): CSSProperties => ({
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    border: `3px solid ${color}`,
    opacity: 0,
    animation: reducedMotion
      ? 'none'
      : `pulse-ring 1.5s ease-out ${index * 0.3}s infinite`,
  });

  const centerStyle: CSSProperties = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 20,
    height: 20,
    borderRadius: '50%',
    backgroundColor: color,
    boxShadow: `0 0 20px ${color}, 0 0 40px ${color}50`,
    animation: reducedMotion ? 'none' : 'pulse-center 0.6s ease-out infinite',
  };

  return (
    <div style={containerStyle} aria-hidden="true">
      <div style={centerStyle} />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} style={ringStyle(i)} />
      ))}
      <style>
        {`
          @keyframes pulse-ring {
            0% {
              opacity: 1;
              transform: translate(-50%, -50%) scale(0.3);
            }
            100% {
              opacity: 0;
              transform: translate(-50%, -50%) scale(1.5);
            }
          }
          @keyframes pulse-center {
            0%, 100% {
              transform: translate(-50%, -50%) scale(1);
            }
            50% {
              transform: translate(-50%, -50%) scale(1.2);
            }
          }
        `}
      </style>
    </div>
  );
}

// ============================================================================
// FIREWORKS ANIMATION
// ============================================================================

interface FireworksProps {
  show: boolean;
  level?: CelebrationLevel;
  colors?: string[];
  onComplete?: () => void;
}

interface FireworkBurst {
  id: number;
  x: number;
  y: number;
  particles: FireworkParticle[];
  delay: number;
}

function generateFireworkBurst(
  id: number,
  x: number,
  y: number,
  colorPalette: string[],
  delay: number
): FireworkBurst {
  const color = randomFrom(colorPalette);
  const particleCount = randomBetween(20, 35);

  return {
    id,
    x,
    y,
    delay,
    particles: Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: 0,
      y: 0,
      size: randomBetween(3, 6),
      color,
      delay: 0,
      angle: (360 / particleCount) * i + randomBetween(-5, 5),
      speed: randomBetween(60, 120),
      decay: randomBetween(0.92, 0.98),
    })),
  };
}

/**
 * Fireworks animation for epic celebrations
 */
export function Fireworks({
  show,
  level = 'big',
  colors: customColors,
  onComplete,
}: FireworksProps) {
  const [bursts, setBursts] = useState<FireworkBurst[]>([]);
  const [isActive, setIsActive] = useState(false);
  const { reducedMotion } = useMotion();
  const { trigger } = useHaptics();

  const colorPalette = customColors || CELEBRATION_COLORS.default;
  const burstCount = level === 'epic' ? 5 : level === 'big' ? 3 : 2;
  const animDuration = getDuration(level);

  useEffect(() => {
    if (show && !reducedMotion) {
      const newBursts = Array.from({ length: burstCount }, (_, i) =>
        generateFireworkBurst(
          i,
          randomBetween(20, 80),
          randomBetween(20, 50),
          colorPalette,
          i * 400
        )
      );
      setBursts(newBursts);
      setIsActive(true);
      trigger('success');

      const timer = setTimeout(() => {
        setIsActive(false);
        onComplete?.();
      }, animDuration);

      return () => clearTimeout(timer);
    } else if (show && reducedMotion) {
      setIsActive(true);
      trigger('success');
      setTimeout(() => {
        setIsActive(false);
        onComplete?.();
      }, 300);
    }
  }, [
    show,
    reducedMotion,
    burstCount,
    colorPalette,
    animDuration,
    trigger,
    onComplete,
  ]);

  if (!isActive) return null;

  if (reducedMotion) {
    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            'linear-gradient(180deg, rgba(99, 102, 241, 0.1) 0%, transparent 50%)',
          zIndex: zIndex.celebration,
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      />
    );
  }

  const containerStyle: CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    pointerEvents: 'none',
    zIndex: zIndex.celebration,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  };

  return (
    <div style={containerStyle} aria-hidden="true">
      {bursts.map((burst) => (
        <div
          key={burst.id}
          style={{
            position: 'absolute',
            left: `${burst.x}%`,
            top: `${burst.y}%`,
            animation: `firework-rise 0.5s ease-out ${burst.delay / 1000}s forwards`,
            opacity: 0,
          }}
        >
          {burst.particles.map((particle) => (
            <div
              key={particle.id}
              style={
                {
                  position: 'absolute',
                  width: particle.size,
                  height: particle.size,
                  borderRadius: '50%',
                  backgroundColor: particle.color,
                  boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
                  animation: `firework-explode 1s ease-out ${burst.delay / 1000 + 0.5}s forwards`,
                  '--angle': `${particle.angle}deg`,
                  '--speed': `${particle.speed}px`,
                  opacity: 0,
                } as CSSProperties
              }
            />
          ))}
        </div>
      ))}
      <style>
        {`
          @keyframes firework-rise {
            0% {
              opacity: 1;
              transform: translateY(100vh);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes firework-explode {
            0% {
              opacity: 1;
              transform: translate(0, 0) scale(1);
            }
            100% {
              opacity: 0;
              transform: translate(
                calc(cos(var(--angle)) * var(--speed)),
                calc(sin(var(--angle)) * var(--speed) + 50px)
              ) scale(0);
            }
          }
        `}
      </style>
    </div>
  );
}

// ============================================================================
// SPARKLES ANIMATION
// ============================================================================

interface SparklesProps {
  show: boolean;
  x?: number;
  y?: number;
  spread?: number;
  count?: number;
  color?: string;
  duration?: number;
  onComplete?: () => void;
}

/**
 * Sparkles animation - small twinkling stars
 */
export function Sparkles({
  show,
  x = 50,
  y = 50,
  spread = 60,
  count = 12,
  color = colors.secondary[400],
  duration = 1000,
  onComplete,
}: SparklesProps) {
  const [isActive, setIsActive] = useState(false);
  const { reducedMotion } = useMotion();
  const { trigger } = useHaptics();

  const sparkles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        x: randomBetween(-spread, spread),
        y: randomBetween(-spread, spread),
        size: randomBetween(4, 10),
        delay: randomBetween(0, 0.3),
        duration: randomBetween(0.4, 0.8),
      })),
    [count, spread]
  );

  useEffect(() => {
    if (show) {
      setIsActive(true);
      trigger('tap');

      const timer = setTimeout(() => {
        setIsActive(false);
        onComplete?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, duration, trigger, onComplete]);

  if (!isActive) return null;

  if (reducedMotion) {
    return null; // Sparkles are too subtle for reduced motion replacement
  }

  return (
    <div
      style={{
        position: 'fixed',
        left: `${x}%`,
        top: `${y}%`,
        pointerEvents: 'none',
        zIndex: zIndex.celebration,
      }}
      aria-hidden="true"
    >
      {sparkles.map((sparkle) => (
        <svg
          key={sparkle.id}
          style={{
            position: 'absolute',
            left: sparkle.x,
            top: sparkle.y,
            width: sparkle.size,
            height: sparkle.size,
            fill: color,
            animation: `sparkle ${sparkle.duration}s ease-out ${sparkle.delay}s forwards`,
            opacity: 0,
          }}
          viewBox="0 0 24 24"
        >
          <path d="M12 2l1.5 6.5L20 10l-6.5 1.5L12 18l-1.5-6.5L4 10l6.5-1.5z" />
        </svg>
      ))}
      <style>
        {`
          @keyframes sparkle {
            0% {
              opacity: 0;
              transform: scale(0) rotate(0deg);
            }
            50% {
              opacity: 1;
              transform: scale(1) rotate(180deg);
            }
            100% {
              opacity: 0;
              transform: scale(0) rotate(360deg);
            }
          }
        `}
      </style>
    </div>
  );
}

// ============================================================================
// CELEBRATION HOOK
// ============================================================================

export interface UseCelebrationOptions {
  defaultLevel?: CelebrationLevel;
  defaultColors?: string[];
}

export interface CelebrationTrigger {
  confetti: (options?: Partial<CelebrationConfig>) => void;
  starBurst: (
    x?: number,
    y?: number,
    options?: Partial<CelebrationConfig>
  ) => void;
  pulseGlow: (x?: number, y?: number, color?: string) => void;
  fireworks: (options?: Partial<CelebrationConfig>) => void;
  sparkles: (x?: number, y?: number, color?: string) => void;
  auto: (level?: CelebrationLevel) => void;
}

/**
 * Hook for triggering celebrations
 */
export function useCelebration(
  options: UseCelebrationOptions = {}
): [CelebrationTrigger, ReactNode] {
  const { defaultLevel = 'normal', defaultColors } = options;
  const { reducedMotion: _reducedMotion } = useMotion();

  const [confettiState, setConfettiState] = useState<{
    show: boolean;
    config: Partial<CelebrationConfig>;
  }>({ show: false, config: {} });

  const [starBurstState, setStarBurstState] = useState<{
    show: boolean;
    x: number;
    y: number;
    config: Partial<CelebrationConfig>;
  }>({ show: false, x: 50, y: 50, config: {} });

  const [pulseGlowState, setPulseGlowState] = useState<{
    show: boolean;
    x: number;
    y: number;
    color: string;
  }>({ show: false, x: 50, y: 50, color: colors.success });

  const [fireworksState, setFireworksState] = useState<{
    show: boolean;
    config: Partial<CelebrationConfig>;
  }>({ show: false, config: {} });

  const [sparklesState, setSparklesState] = useState<{
    show: boolean;
    x: number;
    y: number;
    color: string;
  }>({ show: false, x: 50, y: 50, color: colors.secondary[400] });

  const trigger: CelebrationTrigger = useMemo(
    () => ({
      confetti: (config = {}) => {
        setConfettiState({
          show: true,
          config: { level: defaultLevel, colors: defaultColors, ...config },
        });
      },

      starBurst: (x = 50, y = 50, config = {}) => {
        setStarBurstState({
          show: true,
          x,
          y,
          config: { level: defaultLevel, colors: defaultColors, ...config },
        });
      },

      pulseGlow: (x = 50, y = 50, color = colors.success) => {
        setPulseGlowState({ show: true, x, y, color });
      },

      fireworks: (config = {}) => {
        setFireworksState({
          show: true,
          config: { level: defaultLevel, colors: defaultColors, ...config },
        });
      },

      sparkles: (x = 50, y = 50, color = colors.secondary[400]) => {
        setSparklesState({ show: true, x, y, color });
      },

      auto: (level = defaultLevel) => {
        // Automatically choose celebration based on level
        switch (level) {
          case 'subtle':
            setPulseGlowState({
              show: true,
              x: 50,
              y: 50,
              color: colors.success,
            });
            break;
          case 'normal':
            setConfettiState({ show: true, config: { level: 'normal' } });
            break;
          case 'big':
            setStarBurstState({
              show: true,
              x: 50,
              y: 50,
              config: { level: 'big' },
            });
            setConfettiState({ show: true, config: { level: 'big' } });
            break;
          case 'epic':
            setFireworksState({ show: true, config: { level: 'epic' } });
            setTimeout(() => {
              setConfettiState({ show: true, config: { level: 'epic' } });
            }, 500);
            break;
        }
      },
    }),
    [defaultLevel, defaultColors]
  );

  const celebrationElements = (
    <>
      <Confetti
        show={confettiState.show}
        level={confettiState.config.level as CelebrationLevel}
        colors={confettiState.config.colors}
        duration={confettiState.config.duration}
        onComplete={() => setConfettiState({ show: false, config: {} })}
      />
      <StarBurst
        show={starBurstState.show}
        x={starBurstState.x}
        y={starBurstState.y}
        level={starBurstState.config.level as CelebrationLevel}
        colors={starBurstState.config.colors}
        onComplete={() =>
          setStarBurstState({ show: false, x: 50, y: 50, config: {} })
        }
      />
      <PulseGlow
        show={pulseGlowState.show}
        x={pulseGlowState.x}
        y={pulseGlowState.y}
        color={pulseGlowState.color}
        onComplete={() =>
          setPulseGlowState({
            show: false,
            x: 50,
            y: 50,
            color: colors.success,
          })
        }
      />
      <Fireworks
        show={fireworksState.show}
        level={fireworksState.config.level as CelebrationLevel}
        colors={fireworksState.config.colors}
        onComplete={() => setFireworksState({ show: false, config: {} })}
      />
      <Sparkles
        show={sparklesState.show}
        x={sparklesState.x}
        y={sparklesState.y}
        color={sparklesState.color}
        onComplete={() =>
          setSparklesState({
            show: false,
            x: 50,
            y: 50,
            color: colors.secondary[400],
          })
        }
      />
    </>
  );

  return [trigger, celebrationElements];
}

// ============================================================================
// CELEBRATION PROVIDER
// ============================================================================

import { createContext, useContext } from 'react';

interface CelebrationContextValue {
  trigger: CelebrationTrigger;
}

const CelebrationContext = createContext<CelebrationContextValue | null>(null);

interface CelebrationProviderProps {
  children: ReactNode;
  defaultLevel?: CelebrationLevel;
  defaultColors?: string[];
}

/**
 * Provider for app-wide celebration access
 */
export function CelebrationProvider({
  children,
  defaultLevel = 'normal',
  defaultColors,
}: CelebrationProviderProps) {
  const [trigger, elements] = useCelebration({ defaultLevel, defaultColors });

  return (
    <CelebrationContext.Provider value={{ trigger }}>
      {children}
      {elements}
    </CelebrationContext.Provider>
  );
}

/**
 * Hook to access celebration triggers from context
 */
export function useCelebrationContext(): CelebrationTrigger {
  const context = useContext(CelebrationContext);
  if (!context) {
    throw new Error(
      'useCelebrationContext must be used within CelebrationProvider'
    );
  }
  return context.trigger;
}
