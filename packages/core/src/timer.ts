import type { TimerState, TimerPreset } from '@procrastinact/types';

export const TIMER_PRESETS: TimerPreset[] = [5, 15, 25, 45];

export function createTimer(durationMinutes: number): TimerState {
  const durationSeconds = durationMinutes * 60;
  return {
    isRunning: false,
    duration: durationSeconds,
    remaining: durationSeconds,
  };
}

export function startTimer(timer: TimerState, taskId?: string): TimerState {
  return {
    ...timer,
    isRunning: true,
    startedAt: new Date(),
    taskId,
  };
}

export function pauseTimer(timer: TimerState): TimerState {
  return {
    ...timer,
    isRunning: false,
  };
}

export function extendTimer(
  timer: TimerState,
  additionalMinutes: number = 5
): TimerState {
  const additionalSeconds = additionalMinutes * 60;
  return {
    ...timer,
    duration: timer.duration + additionalSeconds,
    remaining: timer.remaining + additionalSeconds,
  };
}

export function calculateTimeRemaining(timer: TimerState): number {
  if (!timer.isRunning || !timer.startedAt) {
    return timer.remaining;
  }

  const elapsed = Math.floor((Date.now() - timer.startedAt.getTime()) / 1000);
  return Math.max(0, timer.remaining - elapsed);
}

export function getTimerProgress(timer: TimerState): number {
  if (timer.duration === 0) return 0;
  const remaining = calculateTimeRemaining(timer);
  return 1 - remaining / timer.duration;
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
