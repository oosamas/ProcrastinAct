// Design tokens
export * from './tokens';

// Theme system
export { ThemeProvider, useTheme, ThemeContext } from './theme-provider';
export type { ThemeMode } from './theme-provider';
export { ThemeToggle } from './theme-toggle';

// Accessibility utilities
export {
  AccessibilityProvider,
  AccessibilityContext,
  useAccessibility,
  ScreenReaderOnly,
  LiveRegion,
  SkipLink,
  useFocusTrap,
  useTimerAnnouncements,
} from './accessibility';

// Motion / Reduced motion
export {
  MotionProvider,
  MotionContext,
  useMotion,
  MotionSafe,
  useAnimationStyle,
  StaticCelebration,
  MotionToggle,
} from './motion';

// Haptic feedback
export {
  HapticProvider,
  HapticContext,
  HapticPatterns,
  useHaptics,
  WithHaptic,
  HapticSettings,
} from './haptics';
export type { HapticPattern, HapticIntensity } from './haptics';

// Typography system
export {
  TypographyProvider,
  TypographyContext,
  useTypography,
  fontOptions,
  textSizeScales,
  lineSpacingMultipliers,
  Text,
  Paragraph,
  TypographySettings,
  getLuminance,
  getContrastRatio,
  meetsWCAG_AA,
  meetsWCAG_AAA,
} from './typography';
export type {
  FontOption,
  TextSizePreset,
  LineSpacingPreset,
} from './typography';

// Animations
export {
  SpringPresets,
  Transitions,
  Skeleton,
  SkeletonGroup,
  Pulse,
  Spin,
  LoadingSpinner,
  Fade,
  Slide,
  Scale,
  Stagger,
  usePressAnimation,
} from './animations';
export type { SpringPreset } from './animations';

// Core components
export { Button } from './button';
export { Card } from './card';
export { Input } from './input';

// Navigation components
export { TabBar, defaultRoutes } from './tab-bar';
export type { TabRoute } from './tab-bar';
export { QuickAction, defaultQuickActions } from './quick-action';
export type { QuickActionItem } from './quick-action';
export { BackButton } from './back-button';
export { AppHeader } from './app-header';

// Time awareness components
export { AmbientTime, AmbientIntensity } from './ambient-time';
export { TimerQuickStart } from './timer-quick-start';
export { TimerRunning } from './timer-running';
export {
  TimerComplete,
  TimerSounds,
  TimerSoundSelector,
} from './timer-complete';
export type { TimerSound } from './timer-complete';

// ProcrastinAct-specific components
export { TimerDisplay } from './timer-display';
export { TaskItem } from './task-item';
export { TaskFocusView } from './task-focus-view';
export { TaskInput } from './task-input';
export { TaskShrinkButton } from './task-shrink-button';
export { ShrunkTaskList } from './shrunk-task-list';
export { CompleteButton } from './complete-button';
export { CelebrationOverlay } from './celebration-overlay';
export { StopButton } from './stop-button';
export { RestOverlay } from './rest-overlay';
export { Encouragement } from './encouragement';

// Onboarding
export {
  OnboardingFlow,
  OnboardingProgressIndicator,
  getOnboardingProgress,
  setOnboardingProgress,
  hasCompletedOnboarding,
} from './onboarding';
export type {
  OnboardingStep,
  OnboardingState,
  OnboardingProgress,
} from './onboarding';

// Category picker
export {
  CategoryPill,
  CategoryPicker,
  CategoryBadge,
  CategoryColorPicker,
  CategoryEmojiPicker,
  CategoryEditor,
} from './category-picker';
export type { Category } from './category-picker';

// Task notes
export { TaskNotes, RichTextPreview, FormattingToolbar } from './task-notes';
export type { NoteImage, VoiceNote } from './task-notes';

// Error display
export {
  ErrorBanner,
  ErrorCard,
  InlineError,
  RetryIndicator,
  OfflineIndicator,
  ErrorToast,
} from './error-display';
export type { ErrorInfo } from './error-display';

// Streak display
export {
  StreakBadge,
  StreakCard,
  WeeklyProgress,
  StreakCelebration,
  FreezeIndicator,
  AtRiskWarning,
} from './streak-display';
export type { StreakInfo } from './streak-display';
