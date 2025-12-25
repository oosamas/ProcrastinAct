/**
 * Notification Actions - Issue #94
 * Actionable notifications for quick responses
 */

import type { NotificationType } from '@procrastinact/types';
import type { NotificationAction } from './types';

// ============================================================================
// ACTION TYPES
// ============================================================================

/**
 * Types of actions that can be performed from notifications
 */
export type NotificationActionType =
  | 'complete_task'
  | 'snooze'
  | 'start_timer'
  | 'voice_reply'
  | 'view'
  | 'dismiss'
  | 'quick_add';

/**
 * Action result from notification interaction
 */
export interface NotificationActionResult {
  actionId: string;
  actionType: NotificationActionType;
  notificationId: string;
  notificationType: NotificationType;
  success: boolean;
  data?: Record<string, unknown>;
  error?: string;
  timestamp: Date;
}

/**
 * Snooze duration options
 */
export type SnoozeDuration = 5 | 10 | 15 | 30 | 60; // minutes

/**
 * Voice reply result
 */
export interface VoiceReplyResult {
  transcript: string;
  confidence: number;
  intent: 'complete' | 'snooze' | 'reschedule' | 'add_note' | 'unknown';
  parsedDuration?: number; // for snooze
  parsedNote?: string; // for add_note
}

// ============================================================================
// PREDEFINED ACTIONS
// ============================================================================

/**
 * Predefined notification actions
 */
export const NOTIFICATION_ACTIONS = {
  // Task-related actions
  completeTask: {
    id: 'complete_task',
    title: '✓ Done',
    options: {
      opensApp: false,
      destructive: false,
    },
  } as NotificationAction,

  viewTask: {
    id: 'view_task',
    title: 'View',
    options: {
      opensApp: true,
      destructive: false,
    },
  } as NotificationAction,

  // Snooze actions
  snooze5: {
    id: 'snooze_5',
    title: '5 min',
    options: {
      opensApp: false,
      destructive: false,
    },
  } as NotificationAction,

  snooze15: {
    id: 'snooze_15',
    title: '15 min',
    options: {
      opensApp: false,
      destructive: false,
    },
  } as NotificationAction,

  snooze30: {
    id: 'snooze_30',
    title: '30 min',
    options: {
      opensApp: false,
      destructive: false,
    },
  } as NotificationAction,

  snooze60: {
    id: 'snooze_60',
    title: '1 hour',
    options: {
      opensApp: false,
      destructive: false,
    },
  } as NotificationAction,

  // Timer actions
  startTimer: {
    id: 'start_timer',
    title: '▶ Start Timer',
    options: {
      opensApp: true,
      destructive: false,
    },
  } as NotificationAction,

  startQuickTimer: {
    id: 'start_quick_timer',
    title: '⏱ 5 min',
    options: {
      opensApp: false,
      destructive: false,
    },
  } as NotificationAction,

  // Voice actions
  voiceReply: {
    id: 'voice_reply',
    title: '🎤 Voice',
    options: {
      opensApp: false,
      destructive: false,
    },
  } as NotificationAction,

  // General actions
  dismiss: {
    id: 'dismiss',
    title: 'Dismiss',
    options: {
      opensApp: false,
      destructive: false,
    },
  } as NotificationAction,

  quickAdd: {
    id: 'quick_add',
    title: '+ Quick Add',
    options: {
      opensApp: false,
      destructive: false,
    },
  } as NotificationAction,
};

// ============================================================================
// ACTION SETS FOR NOTIFICATION TYPES
// ============================================================================

/**
 * Get actions for a specific notification type
 */
export function getActionsForNotificationType(
  type: NotificationType,
  options: {
    includeVoice?: boolean;
    includeDismiss?: boolean;
    hasTask?: boolean;
  } = {}
): NotificationAction[] {
  const {
    includeVoice = false,
    includeDismiss = true,
    hasTask = false,
  } = options;

  const actions: NotificationAction[] = [];

  switch (type) {
    case 'reminder':
      if (hasTask) {
        actions.push(NOTIFICATION_ACTIONS.completeTask);
      }
      actions.push(NOTIFICATION_ACTIONS.snooze15);
      if (hasTask) {
        actions.push(NOTIFICATION_ACTIONS.startQuickTimer);
      }
      break;

    case 'encouragement':
      actions.push(NOTIFICATION_ACTIONS.viewTask);
      break;

    case 'achievement':
      // Achievements don't need actions typically
      break;

    case 'streak':
      actions.push(NOTIFICATION_ACTIONS.viewTask);
      break;

    case 'time_awareness':
      actions.push(NOTIFICATION_ACTIONS.snooze5);
      actions.push(NOTIFICATION_ACTIONS.viewTask);
      break;

    case 'gentle_nudge':
      actions.push(NOTIFICATION_ACTIONS.viewTask);
      actions.push(NOTIFICATION_ACTIONS.snooze30);
      break;

    default:
      break;
  }

  if (includeVoice && actions.length < 3) {
    actions.push(NOTIFICATION_ACTIONS.voiceReply);
  }

  if (includeDismiss && actions.length < 4) {
    actions.push(NOTIFICATION_ACTIONS.dismiss);
  }

  // Most platforms support max 4 actions
  return actions.slice(0, 4);
}

// ============================================================================
// ACTION HANDLERS
// ============================================================================

/**
 * Callback types for action handlers
 */
export interface NotificationActionHandlers {
  onCompleteTask?: (taskId: string) => Promise<boolean>;
  onSnooze?: (
    notificationId: string,
    minutes: SnoozeDuration
  ) => Promise<boolean>;
  onStartTimer?: (
    taskId: string | undefined,
    minutes: number
  ) => Promise<boolean>;
  onVoiceReply?: (result: VoiceReplyResult) => Promise<boolean>;
  onDismiss?: (notificationId: string) => Promise<void>;
  onQuickAdd?: (text: string) => Promise<string | null>; // Returns new task ID
  onView?: (
    notificationId: string,
    data?: Record<string, unknown>
  ) => Promise<void>;
}

/**
 * Parse action ID to extract type and parameters
 */
export function parseActionId(actionId: string): {
  type: NotificationActionType;
  params: Record<string, unknown>;
} {
  // Handle snooze durations
  if (actionId.startsWith('snooze_')) {
    const minutes = parseInt(actionId.replace('snooze_', ''), 10);
    return {
      type: 'snooze',
      params: { minutes },
    };
  }

  // Handle timer durations
  if (actionId === 'start_quick_timer') {
    return {
      type: 'start_timer',
      params: { minutes: 5 },
    };
  }

  // Direct mappings
  const typeMap: Record<string, NotificationActionType> = {
    complete_task: 'complete_task',
    view_task: 'view',
    start_timer: 'start_timer',
    voice_reply: 'voice_reply',
    dismiss: 'dismiss',
    quick_add: 'quick_add',
  };

  return {
    type: typeMap[actionId] || 'dismiss',
    params: {},
  };
}

/**
 * Notification Action Handler - processes notification actions
 */
export class NotificationActionHandler {
  private handlers: NotificationActionHandlers;
  private pendingActions: Map<string, NotificationActionResult> = new Map();
  private listeners: Set<(result: NotificationActionResult) => void> =
    new Set();

  constructor(handlers: NotificationActionHandlers = {}) {
    this.handlers = handlers;
  }

  /**
   * Update handlers
   */
  setHandlers(handlers: Partial<NotificationActionHandlers>): void {
    this.handlers = { ...this.handlers, ...handlers };
  }

  /**
   * Handle an action from a notification
   */
  async handleAction(
    actionId: string,
    notificationId: string,
    notificationType: NotificationType,
    data?: Record<string, unknown>
  ): Promise<NotificationActionResult> {
    const { type, params } = parseActionId(actionId);
    const taskId = data?.taskId as string | undefined;

    const result: NotificationActionResult = {
      actionId,
      actionType: type,
      notificationId,
      notificationType,
      success: false,
      timestamp: new Date(),
    };

    try {
      switch (type) {
        case 'complete_task':
          if (taskId && this.handlers.onCompleteTask) {
            result.success = await this.handlers.onCompleteTask(taskId);
            result.data = { taskId };
          }
          break;

        case 'snooze':
          if (this.handlers.onSnooze) {
            const minutes = (params.minutes as SnoozeDuration) || 15;
            result.success = await this.handlers.onSnooze(
              notificationId,
              minutes
            );
            result.data = { minutes };
          }
          break;

        case 'start_timer':
          if (this.handlers.onStartTimer) {
            const minutes = (params.minutes as number) || 25;
            result.success = await this.handlers.onStartTimer(taskId, minutes);
            result.data = { taskId, minutes };
          }
          break;

        case 'voice_reply':
          // Voice reply is handled separately through speech recognition
          result.success = true;
          result.data = { requiresInput: true };
          break;

        case 'view':
          if (this.handlers.onView) {
            await this.handlers.onView(notificationId, data);
            result.success = true;
          }
          break;

        case 'dismiss':
          if (this.handlers.onDismiss) {
            await this.handlers.onDismiss(notificationId);
          }
          result.success = true;
          break;

        case 'quick_add':
          // Quick add is handled through text input
          result.success = true;
          result.data = { requiresInput: true };
          break;

        default:
          result.error = `Unknown action type: ${type}`;
      }
    } catch (error) {
      result.error = error instanceof Error ? error.message : 'Action failed';
    }

    // Store result
    this.pendingActions.set(notificationId, result);

    // Notify listeners
    this.notifyListeners(result);

    return result;
  }

  /**
   * Handle voice reply result
   */
  async handleVoiceReply(
    voiceResult: VoiceReplyResult,
    notificationId: string,
    notificationType: NotificationType,
    data?: Record<string, unknown>
  ): Promise<NotificationActionResult> {
    const result: NotificationActionResult = {
      actionId: 'voice_reply',
      actionType: 'voice_reply',
      notificationId,
      notificationType,
      success: false,
      timestamp: new Date(),
    };

    try {
      if (this.handlers.onVoiceReply) {
        result.success = await this.handlers.onVoiceReply(voiceResult);
      }

      // Handle parsed intent
      switch (voiceResult.intent) {
        case 'complete':
          if (data?.taskId && this.handlers.onCompleteTask) {
            await this.handlers.onCompleteTask(data.taskId as string);
          }
          break;
        case 'snooze':
          if (voiceResult.parsedDuration && this.handlers.onSnooze) {
            await this.handlers.onSnooze(
              notificationId,
              voiceResult.parsedDuration as SnoozeDuration
            );
          }
          break;
        default:
          break;
      }

      result.data = {
        voiceResult,
        intent: voiceResult.intent,
      };
    } catch (error) {
      result.error =
        error instanceof Error ? error.message : 'Voice reply failed';
    }

    this.pendingActions.set(notificationId, result);
    this.notifyListeners(result);

    return result;
  }

  /**
   * Handle quick add text input
   */
  async handleQuickAdd(
    text: string,
    notificationId: string
  ): Promise<NotificationActionResult> {
    const result: NotificationActionResult = {
      actionId: 'quick_add',
      actionType: 'quick_add',
      notificationId,
      notificationType: 'reminder',
      success: false,
      timestamp: new Date(),
    };

    try {
      if (this.handlers.onQuickAdd) {
        const newTaskId = await this.handlers.onQuickAdd(text);
        result.success = !!newTaskId;
        result.data = { newTaskId, text };
      }
    } catch (error) {
      result.error =
        error instanceof Error ? error.message : 'Quick add failed';
    }

    this.pendingActions.set(notificationId, result);
    this.notifyListeners(result);

    return result;
  }

  /**
   * Get pending action result
   */
  getPendingAction(
    notificationId: string
  ): NotificationActionResult | undefined {
    return this.pendingActions.get(notificationId);
  }

  /**
   * Clear pending action
   */
  clearPendingAction(notificationId: string): void {
    this.pendingActions.delete(notificationId);
  }

  /**
   * Subscribe to action results
   */
  subscribe(listener: (result: NotificationActionResult) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(result: NotificationActionResult): void {
    this.listeners.forEach((listener) => listener(result));
  }
}

// ============================================================================
// VOICE COMMAND PARSING
// ============================================================================

/**
 * Voice command patterns for intent detection
 */
const VOICE_PATTERNS = {
  complete: [
    /^(done|complete|finish|mark.*(done|complete)|i did it|finished)/i,
    /^(check|checked|✓|yes)/i,
  ],
  snooze: [
    /^(snooze|remind me in|later|wait)/i,
    /^(in )?(5|five|10|ten|15|fifteen|30|thirty|60|one hour)( min(ute)?s?)?/i,
  ],
  reschedule: [/^(reschedule|move to|postpone|tomorrow|next week)/i],
  addNote: [/^(add|note|remember|memo)/i],
};

/**
 * Duration patterns for snooze parsing
 */
const DURATION_PATTERNS: Array<{ pattern: RegExp; minutes: number }> = [
  { pattern: /5|five/i, minutes: 5 },
  { pattern: /10|ten/i, minutes: 10 },
  { pattern: /15|fifteen/i, minutes: 15 },
  { pattern: /30|thirty|half( an)? hour/i, minutes: 30 },
  { pattern: /60|sixty|one hour|an hour/i, minutes: 60 },
];

/**
 * Parse voice input to detect intent
 */
export function parseVoiceCommand(transcript: string): VoiceReplyResult {
  const cleanTranscript = transcript.trim().toLowerCase();

  // Check for complete intent
  for (const pattern of VOICE_PATTERNS.complete) {
    if (pattern.test(cleanTranscript)) {
      return {
        transcript,
        confidence: 0.9,
        intent: 'complete',
      };
    }
  }

  // Check for snooze intent
  for (const pattern of VOICE_PATTERNS.snooze) {
    if (pattern.test(cleanTranscript)) {
      // Try to extract duration
      let duration: number | undefined;
      for (const dp of DURATION_PATTERNS) {
        if (dp.pattern.test(cleanTranscript)) {
          duration = dp.minutes;
          break;
        }
      }

      return {
        transcript,
        confidence: 0.85,
        intent: 'snooze',
        parsedDuration: duration || 15, // Default to 15 minutes
      };
    }
  }

  // Check for reschedule intent
  for (const pattern of VOICE_PATTERNS.reschedule) {
    if (pattern.test(cleanTranscript)) {
      return {
        transcript,
        confidence: 0.8,
        intent: 'reschedule',
      };
    }
  }

  // Check for add note intent
  for (const pattern of VOICE_PATTERNS.addNote) {
    if (pattern.test(cleanTranscript)) {
      // Extract note content after the trigger word
      const noteMatch = cleanTranscript.match(
        /(?:add|note|remember|memo)\s+(.+)/i
      );
      return {
        transcript,
        confidence: 0.8,
        intent: 'add_note',
        parsedNote: noteMatch?.[1] || transcript,
      };
    }
  }

  return {
    transcript,
    confidence: 0.5,
    intent: 'unknown',
  };
}

// ============================================================================
// ACTION FEEDBACK MESSAGES
// ============================================================================

/**
 * Get feedback message for an action result
 */
export function getActionFeedbackMessage(result: NotificationActionResult): {
  title: string;
  message: string;
  type: 'success' | 'error' | 'info';
} {
  if (!result.success) {
    return {
      title: 'Action Failed',
      message: result.error || 'Something went wrong. Please try again.',
      type: 'error',
    };
  }

  switch (result.actionType) {
    case 'complete_task':
      return {
        title: 'Task Completed! ✓',
        message: 'Great job! Keep up the momentum.',
        type: 'success',
      };

    case 'snooze': {
      const minutes = result.data?.minutes as number;
      return {
        title: 'Snoozed',
        message: `Reminder set for ${minutes} minute${minutes !== 1 ? 's' : ''} from now.`,
        type: 'info',
      };
    }

    case 'start_timer': {
      const timerMinutes = result.data?.minutes as number;
      return {
        title: 'Timer Started',
        message: `${timerMinutes}-minute focus session started. You've got this!`,
        type: 'success',
      };
    }

    case 'quick_add':
      return {
        title: 'Task Added',
        message: 'New task added to your list.',
        type: 'success',
      };

    case 'dismiss':
      return {
        title: 'Dismissed',
        message: '',
        type: 'info',
      };

    default:
      return {
        title: 'Done',
        message: 'Action completed.',
        type: 'success',
      };
  }
}

// ============================================================================
// INLINE ACTION CATEGORIES
// ============================================================================

/**
 * Category of notification actions for grouping
 */
export type ActionCategory =
  | 'task'
  | 'timer'
  | 'snooze'
  | 'input'
  | 'navigation';

/**
 * Get category for an action
 */
export function getActionCategory(
  actionType: NotificationActionType
): ActionCategory {
  switch (actionType) {
    case 'complete_task':
      return 'task';
    case 'start_timer':
      return 'timer';
    case 'snooze':
      return 'snooze';
    case 'voice_reply':
    case 'quick_add':
      return 'input';
    case 'view':
    case 'dismiss':
    default:
      return 'navigation';
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  NOTIFICATION_ACTIONS as NotificationActions,
  NotificationActionHandler as ActionHandler,
};
