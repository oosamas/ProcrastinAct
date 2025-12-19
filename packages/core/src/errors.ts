/**
 * Error Handling System
 *
 * Graceful error handling that doesn't blame the user.
 * Uses friendly messages and provides recovery suggestions.
 */

// ============================================================================
// ERROR TYPES
// ============================================================================

export type ErrorCategory =
  | 'network'
  | 'storage'
  | 'sync'
  | 'auth'
  | 'validation'
  | 'permission'
  | 'timeout'
  | 'unknown';

export interface AppError {
  /** Unique error code */
  code: string;
  /** Error category for handling */
  category: ErrorCategory;
  /** User-friendly message */
  message: string;
  /** Recovery suggestion */
  suggestion: string;
  /** Whether automatic retry should be attempted */
  retryable: boolean;
  /** Technical details (for logging only) */
  technicalDetails?: string;
  /** Original error */
  originalError?: Error;
  /** When the error occurred */
  timestamp: Date;
}

// ============================================================================
// FRIENDLY ERROR MESSAGES
// ============================================================================

const FRIENDLY_MESSAGES: Record<ErrorCategory, string[]> = {
  network: [
    "Hmm, we can't reach the internet right now.",
    "Looks like we're offline. No worries, your data is safe.",
    "We hit a bump connecting. Everything's saved locally.",
    'The connection seems a bit wobbly right now.',
  ],
  storage: [
    "We're having trouble saving. Your work won't be lost though.",
    "Something went wrong with storage. Let's try again.",
    'A small hiccup with saving. Your recent work is safe.',
  ],
  sync: [
    "Syncing hit a snag. We'll try again soon.",
    'Your devices are taking a moment to catch up.',
    "Sync is being a bit slow. Everything's fine on this device.",
  ],
  auth: [
    "Let's get you logged in again.",
    'Your session needs a refresh.',
    'Time for a quick sign-in.',
  ],
  validation: [
    "That doesn't look quite right.",
    "Let's double-check that.",
    'Something seems off. Mind taking another look?',
  ],
  permission: [
    'We need your permission for that.',
    'That action needs an OK from you.',
    "You'll need to allow access for this feature.",
  ],
  timeout: [
    "That's taking longer than expected.",
    'Things are a bit slow right now.',
    'Still working on it... taking a moment.',
  ],
  unknown: [
    'Hmm, something went wrong.',
    'We hit a bump. Your data is safe.',
    'Something unexpected happened.',
  ],
};

const RECOVERY_SUGGESTIONS: Record<ErrorCategory, string[]> = {
  network: [
    'Check your internet connection and try again.',
    "We'll automatically retry when you're back online.",
    'Your work is saved locally and will sync later.',
  ],
  storage: [
    'Try freeing up some space and retry.',
    "We'll keep trying to save your work.",
    'Your most recent changes are in memory.',
  ],
  sync: [
    "Hang tight—we're trying again in a moment.",
    'Your data is safe on both devices.',
    'Pull down to refresh when ready.',
  ],
  auth: [
    'Tap to sign in again.',
    'Your data will be waiting for you.',
    "Quick sign-in and you're back.",
  ],
  validation: [
    'Check the highlighted fields.',
    'Make sure all required info is filled in.',
    'Try a different value.',
  ],
  permission: [
    'Open Settings to grant access.',
    'You can change this anytime in Settings.',
    'This feature needs extra permissions.',
  ],
  timeout: [
    'Give it another go—might just be busy.',
    "We'll keep trying in the background.",
    'Try again in a moment.',
  ],
  unknown: [
    "Let's try that again.",
    'If this keeps happening, let us know.',
    "We've saved your work just in case.",
  ],
};

// ============================================================================
// ERROR CREATION
// ============================================================================

/**
 * Create a user-friendly error
 */
export function createError(
  category: ErrorCategory,
  code: string,
  options?: {
    technicalDetails?: string;
    originalError?: Error;
    customMessage?: string;
    customSuggestion?: string;
  }
): AppError {
  const messages = FRIENDLY_MESSAGES[category];
  const suggestions = RECOVERY_SUGGESTIONS[category];

  return {
    code,
    category,
    message:
      options?.customMessage ||
      messages[Math.floor(Math.random() * messages.length)],
    suggestion:
      options?.customSuggestion ||
      suggestions[Math.floor(Math.random() * suggestions.length)],
    retryable: isRetryable(category),
    technicalDetails: options?.technicalDetails,
    originalError: options?.originalError,
    timestamp: new Date(),
  };
}

/**
 * Determine if error category is retryable
 */
function isRetryable(category: ErrorCategory): boolean {
  return ['network', 'sync', 'timeout'].includes(category);
}

/**
 * Convert unknown error to AppError
 */
export function normalizeError(error: unknown): AppError {
  if (isAppError(error)) return error;

  if (error instanceof Error) {
    // Try to categorize based on error properties
    const category = categorizeError(error);
    return createError(category, 'UNKNOWN_ERROR', {
      technicalDetails: error.message,
      originalError: error,
    });
  }

  return createError('unknown', 'UNKNOWN_ERROR', {
    technicalDetails: String(error),
  });
}

/**
 * Type guard for AppError
 */
export function isAppError(error: unknown): error is AppError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'category' in error &&
    'message' in error
  );
}

/**
 * Try to categorize an error based on its properties
 */
function categorizeError(error: Error): ErrorCategory {
  const message = error.message.toLowerCase();
  const name = error.name.toLowerCase();

  if (
    message.includes('network') ||
    message.includes('fetch') ||
    message.includes('offline') ||
    name.includes('network')
  ) {
    return 'network';
  }

  if (
    message.includes('storage') ||
    message.includes('quota') ||
    message.includes('localstorage') ||
    message.includes('indexeddb')
  ) {
    return 'storage';
  }

  if (message.includes('timeout') || message.includes('timed out')) {
    return 'timeout';
  }

  if (
    message.includes('auth') ||
    message.includes('unauthorized') ||
    message.includes('forbidden') ||
    message.includes('401') ||
    message.includes('403')
  ) {
    return 'auth';
  }

  if (
    message.includes('permission') ||
    message.includes('denied') ||
    message.includes('not allowed')
  ) {
    return 'permission';
  }

  if (
    message.includes('invalid') ||
    message.includes('required') ||
    message.includes('validation')
  ) {
    return 'validation';
  }

  return 'unknown';
}

// ============================================================================
// RETRY LOGIC
// ============================================================================

export interface RetryConfig {
  /** Maximum number of retry attempts */
  maxAttempts: number;
  /** Base delay between retries (ms) */
  baseDelay: number;
  /** Maximum delay between retries (ms) */
  maxDelay: number;
  /** Exponential backoff multiplier */
  backoffMultiplier: number;
  /** Add random jitter to delays */
  jitter: boolean;
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 30000,
  backoffMultiplier: 2,
  jitter: true,
};

/**
 * Calculate delay for retry attempt
 */
export function calculateRetryDelay(
  attempt: number,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): number {
  let delay = config.baseDelay * Math.pow(config.backoffMultiplier, attempt);
  delay = Math.min(delay, config.maxDelay);

  if (config.jitter) {
    // Add random jitter up to 30%
    delay = delay * (0.85 + Math.random() * 0.3);
  }

  return Math.round(delay);
}

/**
 * Execute a function with automatic retry
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const fullConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: AppError | undefined;

  for (let attempt = 0; attempt < fullConfig.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = normalizeError(error);

      if (!lastError.retryable || attempt === fullConfig.maxAttempts - 1) {
        throw lastError;
      }

      const delay = calculateRetryDelay(attempt, fullConfig);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError || createError('unknown', 'RETRY_EXHAUSTED');
}

// ============================================================================
// ERROR RECOVERY STATE
// ============================================================================

export interface ErrorRecoveryState {
  /** Current error if any */
  error: AppError | null;
  /** Is recovery in progress */
  isRecovering: boolean;
  /** Recovery attempt count */
  attemptCount: number;
  /** When recovery will be retried */
  nextRetryAt?: Date;
}

/**
 * Create initial recovery state
 */
export function createRecoveryState(): ErrorRecoveryState {
  return {
    error: null,
    isRecovering: false,
    attemptCount: 0,
  };
}

/**
 * Update recovery state with error
 */
export function setRecoveryError(
  state: ErrorRecoveryState,
  error: AppError
): ErrorRecoveryState {
  const nextRetryDelay = error.retryable
    ? calculateRetryDelay(state.attemptCount)
    : undefined;

  return {
    ...state,
    error,
    attemptCount: state.attemptCount + 1,
    nextRetryAt: nextRetryDelay
      ? new Date(Date.now() + nextRetryDelay)
      : undefined,
  };
}

/**
 * Clear recovery state after success
 */
export function clearRecoveryError(
  state: ErrorRecoveryState
): ErrorRecoveryState {
  return {
    error: null,
    isRecovering: false,
    attemptCount: 0,
  };
}

// ============================================================================
// ERROR BOUNDARY HELPERS
// ============================================================================

/**
 * Error info for error boundaries
 */
export interface ErrorBoundaryInfo {
  componentStack: string;
  error: AppError;
  canRecover: boolean;
  recoveryAction?: () => void;
}

/**
 * Create error boundary info
 */
export function createErrorBoundaryInfo(
  error: Error,
  componentStack: string
): ErrorBoundaryInfo {
  const appError = normalizeError(error);

  return {
    componentStack,
    error: appError,
    canRecover: appError.retryable,
  };
}

// ============================================================================
// ANALYTICS INTEGRATION
// ============================================================================

/**
 * Format error for analytics
 */
export function formatErrorForAnalytics(
  error: AppError
): Record<string, unknown> {
  return {
    error_code: error.code,
    error_category: error.category,
    error_message: error.message,
    error_retryable: error.retryable,
    error_technical: error.technicalDetails,
    error_timestamp: error.timestamp.toISOString(),
  };
}

// ============================================================================
// SPECIFIC ERROR CREATORS
// ============================================================================

export const Errors = {
  networkOffline: () =>
    createError('network', 'NETWORK_OFFLINE', {
      customMessage: "You're offline, but your work is safe.",
      customSuggestion: "We'll sync everything when you're back online.",
    }),

  networkTimeout: () =>
    createError('timeout', 'NETWORK_TIMEOUT', {
      customMessage: "That's taking longer than expected.",
      customSuggestion: "Let's try again.",
    }),

  storageFull: () =>
    createError('storage', 'STORAGE_FULL', {
      customMessage: "We're running low on space.",
      customSuggestion: 'Try freeing up some space on your device.',
    }),

  storageUnavailable: () =>
    createError('storage', 'STORAGE_UNAVAILABLE', {
      customMessage: 'Having trouble saving right now.',
      customSuggestion: "Your work is in memory—we'll keep trying.",
    }),

  syncConflict: () =>
    createError('sync', 'SYNC_CONFLICT', {
      customMessage: 'Found changes on another device.',
      customSuggestion: "We'll merge them together safely.",
    }),

  sessionExpired: () =>
    createError('auth', 'SESSION_EXPIRED', {
      customMessage: 'Time for a quick sign-in.',
      customSuggestion: 'Tap to continue where you left off.',
    }),

  validationFailed: (field: string) =>
    createError('validation', 'VALIDATION_FAILED', {
      customMessage: `Let's check ${field}.`,
      customSuggestion: 'Make sure the info looks right.',
    }),

  permissionDenied: (permission: string) =>
    createError('permission', 'PERMISSION_DENIED', {
      customMessage: `We need ${permission} access.`,
      customSuggestion: 'You can grant this in Settings.',
    }),
};
