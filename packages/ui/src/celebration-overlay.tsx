'use client';

import { type CSSProperties, useState, useEffect, useMemo } from 'react';
import { colors, spacing, typography, borderRadius, animation } from './tokens';

interface CelebrationOverlayProps {
  show: boolean;
  onComplete?: () => void;
  message?: string;
  streakCount?: number;
  darkMode?: boolean;
  soundEnabled?: boolean;
  duration?: number;
}

// Large pool of encouraging messages (100+)
const CELEBRATION_MESSAGES = [
  // Achievement focused
  'You did it!',
  'Task complete!',
  'Done and done!',
  'Crushed it!',
  'Victory!',
  "That's a wrap!",
  'Checked off!',
  'Mission accomplished!',
  'Nailed it!',
  'Boom! Done!',

  // Encouraging
  'You showed up. That matters.',
  'Look at you go!',
  'One step at a time works.',
  'Progress is progress.',
  'That took effort. Well done.',
  'Your future self thanks you.',
  'Small wins add up.',
  'You made it happen.',
  'Proud of you!',
  'Every task counts.',

  // Gentle acknowledgment
  'You did what you could today.',
  "That's more than zero.",
  'You chose action over avoidance.',
  'Starting was the hardest part.',
  'You pushed through.',
  'The task is behind you now.',
  'One less thing to worry about.',
  "You're making progress.",
  "That's in the done pile.",
  'Moving forward.',

  // Momentum builders
  'Momentum is building!',
  'On a roll now.',
  'Keep the streak alive!',
  "You're in the groove.",
  'Nothing can stop you.',
  'Flow state activated!',
  'Ready for the next one?',
  "What's next?",
  "You're unstoppable today.",
  'Productivity mode: engaged.',

  // Self-compassion
  'Be proud of yourself.',
  'You deserve this win.',
  'Give yourself credit.',
  'Celebrate this moment.',
  'You earned this.',
  'Take a breath. You did it.',
  'That was worth it.',
  'Remember this feeling.',
  "You're capable of hard things.",
  'This proves you can.',

  // Humor/Light
  'Task? What task? Gone.',
  'Another one bites the dust!',
  'Future you is cheering.',
  'Task completed successfully!',
  'Error 404: Task not found (because you finished it).',
  'Productivity level: Expert.',
  "*chef's kiss*",
  'Mic drop.',
  'Like a boss!',
  'Smooth operator.',

  // ADHD-specific encouragement
  'Your brain did the thing!',
  'Executive function: activated!',
  'Past you would be impressed.',
  'You beat the resistance.',
  'The wall? Demolished.',
  'Procrastination: 0, You: 1',
  'Started AND finished. Legend.',
  'Your brain played nice today.',
  'Focus achievement unlocked!',
  'You outsmarted the overwhelm.',

  // Validation
  "That wasn't easy. You did it anyway.",
  "You didn't give up.",
  'Persistence pays off.',
  'You stayed with it.',
  'Discipline in action.',
  'Commitment honored.',
  'Promise kept to yourself.',
  'You followed through.',
  'Word kept.',
  "Done, not perfect. That's the goal.",

  // Energy aware
  'Even on a tough day, you showed up.',
  'Low energy, high effort. Respect.',
  'You worked with what you had.',
  "Tired but tried. That's winning.",
  'You pushed past the fog.',
  'Despite everything, done.',
  'You found a way.',
  'Against the odds.',
  'You made it work.',
  'Adaptability at its finest.',

  // Growth mindset
  'Getting better every day.',
  'Practice makes progress.',
  'Building the habit, one task at a time.',
  'This is how change happens.',
  'Future you is being built right now.',
  'Compound progress.',
  'This is growth.',
  "You're evolving.",
  'Level up!',
  'Skill: Doing Hard Things.',
];

// Streak-specific messages
const STREAK_MESSAGES: Record<number, string[]> = {
  3: ["3 days in a row! You're building momentum."],
  7: ['One week strong! This is becoming a habit.'],
  14: ["Two weeks! You're officially consistent."],
  30: ["A whole month! You're unstoppable."],
  60: ['60 days! This is who you are now.'],
  90: ['90 days! Legendary status achieved.'],
  100: ['100 DAYS! You are incredible.'],
  365: ['ONE YEAR! You absolute champion.'],
};

// Get a random celebration message
function getRandomMessage(streakCount?: number): string {
  // Check for streak milestones first
  if (streakCount && STREAK_MESSAGES[streakCount]) {
    const streakMsgs = STREAK_MESSAGES[streakCount];
    return streakMsgs[Math.floor(Math.random() * streakMsgs.length)] as string;
  }

  return CELEBRATION_MESSAGES[
    Math.floor(Math.random() * CELEBRATION_MESSAGES.length)
  ] as string;
}

// Confetti particle type
interface Particle {
  id: number;
  x: number;
  color: string;
  rotation: number;
  size: number;
  delay: number;
}

// Generate confetti particles
function generateConfetti(count: number): Particle[] {
  const confettiColors = [
    colors.primary[400],
    colors.primary[500],
    colors.primary[600],
    colors.success,
    '#FFD700', // gold
    '#FF69B4', // pink
    '#87CEEB', // sky blue
    '#FFA500', // orange
  ];

  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: confettiColors[
      Math.floor(Math.random() * confettiColors.length)
    ] as string,
    rotation: Math.random() * 360,
    size: Math.random() * 8 + 4,
    delay: Math.random() * 0.5,
  }));
}

export function CelebrationOverlay({
  show,
  onComplete,
  message,
  streakCount,
  darkMode = false,
  soundEnabled = false,
  duration = 2000,
}: CelebrationOverlayProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const displayMessage = useMemo(
    () => message || getRandomMessage(streakCount),
    [message, streakCount]
  );

  const confetti = useMemo(() => generateConfetti(50), []);

  // Handle show/hide with animation
  useEffect(() => {
    if (show) {
      setIsVisible(true);
      setIsAnimating(true);

      // Trigger haptic feedback if available
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        // Success pattern: short-long-short
        navigator.vibrate([50, 50, 100, 50, 50]);
      }

      // Play sound if enabled
      if (soundEnabled) {
        // Would play celebration sound here
      }

      // Auto-hide after duration
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setTimeout(() => {
          setIsVisible(false);
          onComplete?.();
        }, 300);
      }, duration);

      return () => clearTimeout(timer);
    } else {
      setIsAnimating(false);
      setIsVisible(false);
    }
  }, [show, duration, onComplete, soundEnabled]);

  if (!isVisible) return null;

  const overlayStyle: CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: darkMode
      ? 'rgba(0, 0, 0, 0.8)'
      : 'rgba(255, 255, 255, 0.9)',
    zIndex: 9999,
    opacity: isAnimating ? 1 : 0,
    transition: `opacity 300ms ${animation.easing.easeOut}`,
    overflow: 'hidden',
  };

  const contentStyle: CSSProperties = {
    textAlign: 'center',
    transform: isAnimating ? 'scale(1)' : 'scale(0.8)',
    opacity: isAnimating ? 1 : 0,
    transition: `all ${animation.duration.normal}ms ${animation.easing.easeOut}`,
    zIndex: 10,
  };

  const checkmarkStyle: CSSProperties = {
    width: 80,
    height: 80,
    borderRadius: borderRadius.full,
    backgroundColor: colors.success,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto',
    marginBottom: spacing[4],
    animation: 'pop 0.5s ease-out',
    boxShadow: `0 0 30px ${colors.success}50`,
  };

  const messageStyle: CSSProperties = {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    fontFamily: typography.fontFamily.sans,
    color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
    margin: 0,
    padding: `0 ${spacing[4]}px`,
    maxWidth: 400,
    animation: 'fadeInUp 0.5s ease-out 0.2s both',
  };

  const streakStyle: CSSProperties = {
    display: streakCount && streakCount > 1 ? 'flex' : 'none',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    marginTop: spacing[4],
    padding: `${spacing[2]}px ${spacing[4]}px`,
    backgroundColor: darkMode ? colors.primary[900] : colors.primary[100],
    color: darkMode ? colors.primary[200] : colors.primary[700],
    borderRadius: borderRadius.full,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    fontFamily: typography.fontFamily.sans,
    animation: 'fadeInUp 0.5s ease-out 0.4s both',
  };

  const confettiContainerStyle: CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
    overflow: 'hidden',
  };

  return (
    <div style={overlayStyle} role="alert" aria-live="polite">
      {/* Confetti */}
      <div style={confettiContainerStyle}>
        {confetti.map((particle) => (
          <div
            key={particle.id}
            style={{
              position: 'absolute',
              left: `${particle.x}%`,
              top: '-20px',
              width: particle.size,
              height: particle.size * 0.6,
              backgroundColor: particle.color,
              borderRadius: 2,
              transform: `rotate(${particle.rotation}deg)`,
              animation: `fall 2s ease-out ${particle.delay}s forwards`,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div style={contentStyle}>
        <div style={checkmarkStyle}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="white">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
          </svg>
        </div>

        <p style={messageStyle}>{displayMessage}</p>

        {streakCount && streakCount > 1 && (
          <div style={streakStyle}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z" />
            </svg>
            {streakCount} day streak!
          </div>
        )}
      </div>

      {/* CSS Animations */}
      <style>
        {`
          @keyframes pop {
            0% { transform: scale(0); }
            50% { transform: scale(1.2); }
            100% { transform: scale(1); }
          }

          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes fall {
            0% {
              transform: translateY(0) rotate(0deg);
              opacity: 1;
            }
            100% {
              transform: translateY(100vh) rotate(720deg);
              opacity: 0;
            }
          }
        `}
      </style>
    </div>
  );
}
