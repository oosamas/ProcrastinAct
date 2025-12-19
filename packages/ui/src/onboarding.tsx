'use client';

import {
  type ReactNode,
  type CSSProperties,
  useState,
  useEffect,
  useCallback,
} from 'react';
import {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
  animation,
  touchTarget,
} from './tokens';
import { useHaptics, HapticPatterns } from './haptics';
import { useMotion } from './motion';

// ============================================================================
// ONBOARDING TYPES
// ============================================================================

export type OnboardingStep =
  | 'welcome'
  | 'task_input'
  | 'shrink_demo'
  | 'start_task'
  | 'celebration'
  | 'setup_prompt';

export interface OnboardingState {
  currentStep: OnboardingStep;
  taskInput: string;
  shrunkTask: string;
  isFirstTask: boolean;
  completedAt?: Date;
}

// ============================================================================
// SHRINK EXAMPLES (for demo)
// ============================================================================

const SHRINK_EXAMPLES: Record<string, string[]> = {
  // Default fallbacks
  default: [
    'Just open the app/document',
    'Write one word',
    'Look at it for 10 seconds',
    'Take one tiny step',
  ],

  // Common tasks
  clean: [
    'Pick up one item',
    'Wipe one surface',
    'Clear one small area',
    'Put away one thing',
  ],
  exercise: [
    'Put on your shoes',
    'Do one stretch',
    'Walk to the door',
    'Stand up and move',
  ],
  work: [
    'Open the document',
    'Write one sentence',
    'Read the first paragraph',
    'Make one note',
  ],
  email: [
    'Open your inbox',
    'Read one email',
    'Type one reply',
    'Delete one old email',
  ],
  study: [
    'Open the book/notes',
    'Read one page',
    'Highlight one thing',
    'Write one bullet point',
  ],
  call: [
    'Find the contact',
    'Dial the number',
    'Say hello',
    'Schedule for later',
  ],
};

function shrinkTask(task: string): string {
  const lower = task.toLowerCase();

  // Check for keywords and return appropriate shrink
  for (const [key, shrinks] of Object.entries(SHRINK_EXAMPLES)) {
    if (key !== 'default' && lower.includes(key)) {
      return shrinks[Math.floor(Math.random() * shrinks.length)];
    }
  }

  // Default shrinks
  const defaults = SHRINK_EXAMPLES.default;
  return defaults[Math.floor(Math.random() * defaults.length)];
}

// ============================================================================
// ENCOURAGEMENT MESSAGES
// ============================================================================

const FIRST_TASK_CELEBRATIONS = [
  "You just started something. That's huge.",
  'You did it. The hardest part is behind you.',
  "Look at you go! That's how it begins.",
  "Small step, big win. You're already doing it.",
  'The journey of a thousand tasks begins with a single shrink.',
  "You showed up. That's what matters most.",
];

function getRandomCelebration(): string {
  return FIRST_TASK_CELEBRATIONS[
    Math.floor(Math.random() * FIRST_TASK_CELEBRATIONS.length)
  ];
}

// ============================================================================
// ONBOARDING FLOW COMPONENT
// ============================================================================

interface OnboardingFlowProps {
  /** Called when onboarding is complete */
  onComplete: () => void;
  /** Called when user wants to skip to main app */
  onSkip?: () => void;
  /** Dark mode */
  darkMode?: boolean;
}

export function OnboardingFlow({
  onComplete,
  onSkip,
  darkMode = false,
}: OnboardingFlowProps) {
  const [state, setState] = useState<OnboardingState>({
    currentStep: 'welcome',
    taskInput: '',
    shrunkTask: '',
    isFirstTask: true,
  });

  const { trigger } = useHaptics();
  const { reducedMotion } = useMotion();
  const [isAnimating, setIsAnimating] = useState(false);

  // Handle step transitions
  const goToStep = useCallback(
    (step: OnboardingStep) => {
      setIsAnimating(true);
      setTimeout(
        () => {
          setState((prev) => ({ ...prev, currentStep: step }));
          setIsAnimating(false);
        },
        reducedMotion ? 50 : 200
      );
    },
    [reducedMotion]
  );

  // Handle task input submit
  const handleTaskSubmit = useCallback(() => {
    if (state.taskInput.trim().length < 2) return;

    trigger('taskAdd');
    const shrunk = shrinkTask(state.taskInput);
    setState((prev) => ({ ...prev, shrunkTask: shrunk }));
    goToStep('shrink_demo');
  }, [state.taskInput, trigger, goToStep]);

  // Handle "start task" completion
  const handleTaskComplete = useCallback(() => {
    trigger('taskComplete');
    setState((prev) => ({ ...prev, completedAt: new Date() }));
    goToStep('celebration');
  }, [trigger, goToStep]);

  // Common styles
  const containerStyle: CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[6],
    backgroundColor: darkMode
      ? colors.background.dark
      : colors.background.light,
    transition: reducedMotion
      ? 'none'
      : `opacity ${animation.duration.normal}ms ${animation.easing.easeOut}`,
    opacity: isAnimating ? 0.5 : 1,
  };

  const contentStyle: CSSProperties = {
    maxWidth: 400,
    width: '100%',
    textAlign: 'center',
  };

  const headingStyle: CSSProperties = {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    fontFamily: typography.fontFamily.sans,
    color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
    margin: 0,
    marginBottom: spacing[4],
    lineHeight: typography.lineHeight.tight,
  };

  const subheadingStyle: CSSProperties = {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.normal,
    fontFamily: typography.fontFamily.sans,
    color: darkMode ? colors.text.secondary.dark : colors.text.secondary.light,
    margin: 0,
    marginBottom: spacing[8],
    lineHeight: typography.lineHeight.relaxed,
  };

  const primaryButtonStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    padding: `${spacing[4]}px ${spacing[6]}px`,
    minHeight: touchTarget.comfortable,
    backgroundColor: colors.primary[500],
    color: 'white',
    border: 'none',
    borderRadius: borderRadius.xl,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    fontFamily: typography.fontFamily.sans,
    cursor: 'pointer',
    boxShadow: shadows.md,
    transition: `all ${animation.duration.fast}ms`,
    WebkitTapHighlightColor: 'transparent',
    touchAction: 'manipulation',
  };

  const secondaryButtonStyle: CSSProperties = {
    ...primaryButtonStyle,
    backgroundColor: darkMode ? colors.neutral[700] : colors.neutral[100],
    color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
    boxShadow: 'none',
    border: `1px solid ${darkMode ? colors.neutral[600] : colors.neutral[300]}`,
  };

  const skipButtonStyle: CSSProperties = {
    marginTop: spacing[6],
    padding: `${spacing[2]}px ${spacing[4]}px`,
    backgroundColor: 'transparent',
    color: darkMode ? colors.text.muted.dark : colors.text.muted.light,
    border: 'none',
    fontSize: typography.fontSize.sm,
    cursor: 'pointer',
    WebkitTapHighlightColor: 'transparent',
  };

  // Render current step
  const renderStep = () => {
    switch (state.currentStep) {
      case 'welcome':
        return (
          <div style={contentStyle}>
            <div
              style={{
                width: 80,
                height: 80,
                margin: '0 auto',
                marginBottom: spacing[6],
                backgroundColor: colors.primary[100],
                borderRadius: borderRadius.full,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill={colors.primary[500]}
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            </div>
            <h1 style={headingStyle}>Let's start with one small win</h1>
            <p style={subheadingStyle}>
              No setup needed. Just tell me one thing you've been putting off.
            </p>
            <button
              style={primaryButtonStyle}
              onClick={() => {
                trigger('tap');
                goToStep('task_input');
              }}
              type="button"
            >
              I'm ready
            </button>
            {onSkip && (
              <button style={skipButtonStyle} onClick={onSkip} type="button">
                Skip for now
              </button>
            )}
          </div>
        );

      case 'task_input':
        return (
          <div style={contentStyle}>
            <h1 style={headingStyle}>What's one thing you've been avoiding?</h1>
            <p style={subheadingStyle}>
              It could be anything. The bigger, the better - we'll shrink it.
            </p>
            <input
              type="text"
              value={state.taskInput}
              onChange={(e) =>
                setState((prev) => ({ ...prev, taskInput: e.target.value }))
              }
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleTaskSubmit();
              }}
              placeholder="e.g., Clean my room, Reply to emails..."
              autoFocus
              style={{
                width: '100%',
                padding: spacing[4],
                marginBottom: spacing[4],
                fontSize: typography.fontSize.lg,
                fontFamily: typography.fontFamily.sans,
                color: darkMode
                  ? colors.text.primary.dark
                  : colors.text.primary.light,
                backgroundColor: darkMode
                  ? colors.surface.dark
                  : colors.surface.light,
                border: `2px solid ${
                  darkMode ? colors.neutral[600] : colors.neutral[200]
                }`,
                borderRadius: borderRadius.lg,
                outline: 'none',
                transition: `border-color ${animation.duration.fast}ms`,
              }}
            />
            <button
              style={{
                ...primaryButtonStyle,
                opacity: state.taskInput.trim().length < 2 ? 0.5 : 1,
              }}
              onClick={handleTaskSubmit}
              disabled={state.taskInput.trim().length < 2}
              type="button"
            >
              Shrink it
            </button>
            <button
              style={skipButtonStyle}
              onClick={() => goToStep('welcome')}
              type="button"
            >
              Go back
            </button>
          </div>
        );

      case 'shrink_demo':
        return (
          <div style={contentStyle}>
            <div
              style={{
                padding: spacing[4],
                marginBottom: spacing[6],
                backgroundColor: darkMode
                  ? colors.neutral[800]
                  : colors.neutral[100],
                borderRadius: borderRadius.lg,
                textAlign: 'left',
              }}
            >
              <p
                style={{
                  fontSize: typography.fontSize.sm,
                  color: darkMode
                    ? colors.text.muted.dark
                    : colors.text.muted.light,
                  margin: 0,
                  marginBottom: spacing[2],
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Your task
              </p>
              <p
                style={{
                  fontSize: typography.fontSize.lg,
                  color: darkMode
                    ? colors.text.secondary.dark
                    : colors.text.secondary.light,
                  margin: 0,
                  textDecoration: 'line-through',
                }}
              >
                {state.taskInput}
              </p>
            </div>

            <div
              style={{
                width: 48,
                height: 48,
                margin: '0 auto',
                marginBottom: spacing[4],
              }}
            >
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill={colors.secondary[500]}
              >
                <path d="M16 13h-3V3h-2v10H8l4 4 4-4zM4 19v2h16v-2H4z" />
              </svg>
            </div>

            <div
              style={{
                padding: spacing[5],
                marginBottom: spacing[6],
                backgroundColor: colors.secondary[50],
                border: `2px solid ${colors.secondary[200]}`,
                borderRadius: borderRadius.xl,
                textAlign: 'left',
              }}
            >
              <p
                style={{
                  fontSize: typography.fontSize.sm,
                  color: colors.secondary[700],
                  margin: 0,
                  marginBottom: spacing[2],
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontWeight: typography.fontWeight.semibold,
                }}
              >
                Tiny first step
              </p>
              <p
                style={{
                  fontSize: typography.fontSize.xl,
                  fontWeight: typography.fontWeight.semibold,
                  color: colors.secondary[900],
                  margin: 0,
                }}
              >
                {state.shrunkTask}
              </p>
            </div>

            <p style={{ ...subheadingStyle, marginBottom: spacing[4] }}>
              Big tasks become tiny steps. Ready to try?
            </p>

            <button
              style={primaryButtonStyle}
              onClick={() => {
                trigger('timerStart');
                goToStep('start_task');
              }}
              type="button"
            >
              Start this tiny step
            </button>
          </div>
        );

      case 'start_task':
        return (
          <div style={contentStyle}>
            <div
              style={{
                padding: spacing[8],
                marginBottom: spacing[8],
                backgroundColor: colors.primary[50],
                borderRadius: borderRadius['2xl'],
                border: `2px solid ${colors.primary[200]}`,
              }}
            >
              <p
                style={{
                  fontSize: typography.fontSize['2xl'],
                  fontWeight: typography.fontWeight.semibold,
                  color: colors.primary[900],
                  margin: 0,
                  lineHeight: typography.lineHeight.snug,
                }}
              >
                {state.shrunkTask}
              </p>
            </div>

            <p style={subheadingStyle}>
              Just focus on this. Nothing else matters right now.
            </p>

            <button
              style={{
                ...primaryButtonStyle,
                backgroundColor: colors.success,
              }}
              onClick={handleTaskComplete}
              type="button"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
                style={{ marginRight: spacing[2] }}
              >
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
              Done!
            </button>

            <button
              style={{ ...secondaryButtonStyle, marginTop: spacing[3] }}
              onClick={() => goToStep('shrink_demo')}
              type="button"
            >
              Too hard? Shrink it more
            </button>
          </div>
        );

      case 'celebration':
        return (
          <div style={contentStyle}>
            <div
              style={{
                width: 100,
                height: 100,
                margin: '0 auto',
                marginBottom: spacing[6],
                backgroundColor: colors.successScale[100],
                borderRadius: borderRadius.full,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg
                width="56"
                height="56"
                viewBox="0 0 24 24"
                fill={colors.success}
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            </div>

            <h1
              style={{
                ...headingStyle,
                fontSize: typography.fontSize['3xl'],
                marginBottom: spacing[4],
              }}
            >
              {getRandomCelebration()}
            </h1>

            <p style={{ ...subheadingStyle, marginBottom: spacing[2] }}>
              Your original task was:
            </p>
            <p
              style={{
                fontSize: typography.fontSize.lg,
                fontWeight: typography.fontWeight.medium,
                color: darkMode
                  ? colors.text.primary.dark
                  : colors.text.primary.light,
                margin: 0,
                marginBottom: spacing[8],
              }}
            >
              "{state.taskInput}"
            </p>

            <p
              style={{
                fontSize: typography.fontSize.base,
                color: darkMode
                  ? colors.text.secondary.dark
                  : colors.text.secondary.light,
                margin: 0,
                marginBottom: spacing[6],
              }}
            >
              You started with just "{state.shrunkTask}" - and that's all it
              takes. This is the ProcrastinAct way.
            </p>

            <button
              style={primaryButtonStyle}
              onClick={() => {
                trigger('tap');
                goToStep('setup_prompt');
              }}
              type="button"
            >
              Continue
            </button>
          </div>
        );

      case 'setup_prompt':
        return (
          <div style={contentStyle}>
            <h1 style={headingStyle}>That's ProcrastinAct</h1>
            <p style={subheadingStyle}>
              Big tasks become tiny steps. Every time.
            </p>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: spacing[3],
                marginBottom: spacing[6],
              }}
            >
              <FeaturePoint
                icon="shrink"
                title="Shrink anything"
                description="Every task becomes a tiny first step"
                darkMode={darkMode}
              />
              <FeaturePoint
                icon="stop"
                title="Permission to stop"
                description="It's okay if today isn't the day"
                darkMode={darkMode}
              />
              <FeaturePoint
                icon="celebrate"
                title="Celebrate progress"
                description="Every start is a win worth noting"
                darkMode={darkMode}
              />
            </div>

            <button
              style={primaryButtonStyle}
              onClick={() => {
                trigger('success');
                onComplete();
              }}
              type="button"
            >
              Let's set up my experience
            </button>

            <button
              style={skipButtonStyle}
              onClick={() => {
                trigger('tap');
                onComplete();
              }}
              type="button"
            >
              Start using the app now
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return <div style={containerStyle}>{renderStep()}</div>;
}

// ============================================================================
// FEATURE POINT COMPONENT
// ============================================================================

interface FeaturePointProps {
  icon: 'shrink' | 'stop' | 'celebrate';
  title: string;
  description: string;
  darkMode?: boolean;
}

function FeaturePoint({
  icon,
  title,
  description,
  darkMode = false,
}: FeaturePointProps) {
  const iconPaths: Record<string, string> = {
    shrink:
      'M7.41 18.59L8.83 20 12 16.83 15.17 20l1.41-1.41L12 14l-4.59 4.59zm9.18-13.18L15.17 4 12 7.17 8.83 4 7.41 5.41 12 10l4.59-4.59z',
    stop: 'M6 6h12v12H6z',
    celebrate:
      'M19.5 4c-.42 0-.83.04-1.24.11L16.5 6.88l2.72.56c.81-.5 1.69-.94 2.78-.94V4c-.86 0-1.67.21-2.5.5zm-15 0c-.86 0-1.67.21-2.5.5v2.5c1.09 0 1.97.44 2.78.94l2.72-.56-1.76-2.77C5.33 4.04 4.92 4 4.5 4zM12 4c-.38 0-.75.04-1.11.1L12 5.44l1.11-1.34c-.36-.06-.73-.1-1.11-.1zm0 3L9.14 9.14 12 12l2.86-2.86L12 7zM5.5 9.5L4 14l3.5 2 2-3.5-4-3zm13 0l-4 3 2 3.5L20 14l-1.5-4.5zM12 14c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z',
  };

  const containerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: spacing[3],
    padding: spacing[4],
    backgroundColor: darkMode ? colors.neutral[800] : colors.neutral[50],
    borderRadius: borderRadius.lg,
    textAlign: 'left',
  };

  const iconStyle: CSSProperties = {
    width: 24,
    height: 24,
    flexShrink: 0,
    marginTop: 2,
  };

  return (
    <div style={containerStyle}>
      <svg style={iconStyle} viewBox="0 0 24 24" fill={colors.primary[500]}>
        <path d={iconPaths[icon]} />
      </svg>
      <div>
        <p
          style={{
            fontSize: typography.fontSize.base,
            fontWeight: typography.fontWeight.semibold,
            color: darkMode
              ? colors.text.primary.dark
              : colors.text.primary.light,
            margin: 0,
            marginBottom: spacing[1],
          }}
        >
          {title}
        </p>
        <p
          style={{
            fontSize: typography.fontSize.sm,
            color: darkMode
              ? colors.text.secondary.dark
              : colors.text.secondary.light,
            margin: 0,
          }}
        >
          {description}
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// ONBOARDING STATUS TRACKER
// ============================================================================

const ONBOARDING_KEY = 'procrastinact-onboarding';

export interface OnboardingProgress {
  completed: boolean;
  completedAt?: string;
  skipped?: boolean;
  firstTaskCompleted?: boolean;
  firstTaskCompletedAt?: string;
}

export function getOnboardingProgress(): OnboardingProgress | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(ONBOARDING_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function setOnboardingProgress(progress: OnboardingProgress): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ONBOARDING_KEY, JSON.stringify(progress));
  } catch {
    // Ignore storage errors
  }
}

export function hasCompletedOnboarding(): boolean {
  const progress = getOnboardingProgress();
  return progress?.completed ?? false;
}

// ============================================================================
// PROGRESS INDICATOR
// ============================================================================

interface OnboardingProgressIndicatorProps {
  currentStep: OnboardingStep;
  darkMode?: boolean;
}

export function OnboardingProgressIndicator({
  currentStep,
  darkMode = false,
}: OnboardingProgressIndicatorProps) {
  const steps: OnboardingStep[] = [
    'welcome',
    'task_input',
    'shrink_demo',
    'start_task',
    'celebration',
    'setup_prompt',
  ];

  const currentIndex = steps.indexOf(currentStep);

  const containerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    padding: spacing[4],
  };

  const dotStyle = (index: number): CSSProperties => ({
    width: 8,
    height: 8,
    borderRadius: borderRadius.full,
    backgroundColor:
      index <= currentIndex
        ? colors.primary[500]
        : darkMode
          ? colors.neutral[600]
          : colors.neutral[300],
    transition: `background-color ${animation.duration.fast}ms`,
  });

  return (
    <div
      style={containerStyle}
      role="progressbar"
      aria-valuenow={currentIndex + 1}
      aria-valuemax={steps.length}
    >
      {steps.map((_, index) => (
        <div key={index} style={dotStyle(index)} />
      ))}
    </div>
  );
}
