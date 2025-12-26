/**
 * Utility functions for the mobile app
 */

/**
 * Generate a unique ID for tasks and other entities.
 * Uses crypto.getRandomValues when available for better randomness,
 * falls back to Math.random for compatibility.
 */
export function generateId(): string {
  const timestamp = Date.now().toString(36);
  let randomPart: string;

  // Try to use crypto.getRandomValues for better randomness
  if (
    typeof globalThis !== 'undefined' &&
    globalThis.crypto &&
    typeof globalThis.crypto.getRandomValues === 'function'
  ) {
    const array = new Uint32Array(2);
    globalThis.crypto.getRandomValues(array);
    randomPart = array[0]!.toString(36) + array[1]!.toString(36);
  } else {
    // Fallback to Math.random (still fine for task IDs)
    randomPart =
      Math.random().toString(36).slice(2, 9) +
      Math.random().toString(36).slice(2, 9);
  }

  return `${timestamp}_${randomPart}`;
}

/**
 * Format a duration in seconds to a human-readable string
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
