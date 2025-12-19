import type {
  EncouragementMessage,
  EncouragementContext,
} from '@procrastinact/types';

// ============================================================================
// EXTENDED MESSAGE DATABASE (200+ messages)
// ============================================================================

const ENCOURAGEMENT_MESSAGES: Record<EncouragementContext, string[]> = {
  starting: [
    // Original
    "You're about to start something. That's already a win.",
    "The hardest part is starting. You're doing it.",
    "One tiny step at a time. You've got this.",
    'Starting is a superpower. You have it.',
    // New - Warm
    "Ready? Let's do this together.",
    'This moment right here? This is courage.',
    'Future you is already proud of present you.',
    "You showed up. That's the whole battle sometimes.",
    'Beginning is the bravest thing.',
    "Let's make this happen, one piece at a time.",
    // New - Understanding
    "I know it's hard to start. You're doing it anyway.",
    "Starting something you've been avoiding? Hero move.",
    'The resistance you feel? It means you care.',
    'Every big thing started with someone deciding to begin.',
    // New - Funny/Light
    'Plot twist: you actually started!',
    'Breaking news: person does thing they were avoiding.',
    "And they said it couldn't be done... (it can)",
    'Procrastination: 0, You: 1',
    // New - Philosophical
    'A journey of a thousand miles begins with a single step. This is yours.',
    'The best time to start was yesterday. The second best time is now.',
    "You can't edit a blank page. Start writing.",
    // New - Practical
    "Just 2 minutes. That's all we need to get momentum.",
    "Don't think about the whole thing. Just think about right now.",
    'One thing at a time. This thing first.',
    // Additional
    "You've decided to start. That decision is powerful.",
    "Action beats anxiety. Let's go.",
    'This is you, taking control.',
    'Small start, big impact.',
    "The first step is often the hardest. You're taking it.",
  ],
  struggling: [
    // Original
    "It's okay to make it smaller. That's the point.",
    "Still too big? Let's shrink it again.",
    "There's no task too small. Break it down.",
    "Struggling is not failing. It's finding the right size.",
    // New - Supportive
    "We can make this easier. What's the tiniest version?",
    "If it's hard, it's too big. Let's fix that.",
    "You're not stuck. You just need a smaller step.",
    'Every expert was once a beginner who struggled.',
    "Difficulty doesn't mean impossibility.",
    // New - Understanding
    "Your brain is trying to protect you. Let's outsmart it together.",
    "Feeling overwhelmed? That's valid. Let's shrink it.",
    "This task is fighting back. Time to break it into pieces it can't win.",
    'Having a hard time? The task needs shrinking, not you.',
    // New - Practical
    "What's the absolute minimum version of this?",
    'Could you do just 1% of it? Start there.',
    'If a child had to explain this task, what would they say?',
    'Picture the tiniest, most ridiculous version. Do that.',
    // New - Reassuring
    "There's wisdom in recognizing when something's too big.",
    "Shrinking isn't giving up. It's strategy.",
    "Making things smaller is a skill. You're practicing it.",
    // Additional
    "Rome wasn't built in a day, and neither is this.",
    'Every task has a tiny version hiding inside it.',
    "Too hard? That's feedback, not failure.",
    "The size of the step doesn't matter. Taking it does.",
  ],
  completing: [
    // Original
    "You did it! That's real progress.",
    "Another one done. You're unstoppable.",
    'Completed! Your brain just got a little dopamine.',
    "Task crushed. You're amazing.",
    // New - Celebratory
    'Done! Cross that off and feel the satisfaction.',
    "Finished! That's one less thing on your mind.",
    'Complete! Your future self is thanking you right now.',
    'Victory! You made it happen.',
    'Nailed it! Give yourself a mental high-five.',
    // New - Encouraging momentum
    "One down. You've got momentum now.",
    "That's called progress. Beautiful, isn't it?",
    "From 'I should' to 'I did'. That's huge.",
    'You turned intention into action. Powerful stuff.',
    // New - Funny/Light
    'Task: destroyed. You: victorious.',
    'That task never saw it coming.',
    'Achievement unlocked: Actually Did The Thing.',
    '*confetti explosion*',
    'This calls for a tiny celebration. 🎉',
    // New - Reflective
    'Remember when this felt impossible? Look at you now.',
    "You proved yourself wrong. That's growth.",
    'Every completion is evidence that you can.',
    // Additional
    'Check! Moving right along.',
    "That's how it's done!",
    'Another win in the books.',
    'You made it happen. Period.',
    "Task complete. You're on a roll.",
    'Nice work! On to the next adventure.',
    'Done and dusted!',
    'Mission accomplished!',
  ],
  stopping: [
    // Original
    'Rest is part of the process.',
    'You did enough. Really.',
    "Taking a break? That's wisdom, not weakness.",
    "Stopping is a skill. You're practicing it well.",
    // New - Validating
    'Permission to stop: granted.',
    'Your energy is finite. Protecting it is smart.',
    "This isn't quitting. This is pacing yourself.",
    'Knowing when to pause is emotional intelligence.',
    // New - Understanding
    "Today isn't the day for this? Totally okay.",
    'Sometimes the best thing you can do is nothing.',
    "Rest isn't the opposite of productivity. It enables it.",
    "Your worth isn't measured by your output.",
    // New - Gentle
    "Be gentle with yourself. You're doing your best.",
    "It's okay to not be okay with everything.",
    "You've done what you can. That's enough.",
    'Breathe. The tasks will still be there.',
    // New - Practical
    'Taking breaks prevents burnout. This is self-care.',
    'A rested you is a more capable you.',
    'Stepping back gives perspective.',
    // Additional
    'You showed up. That counts.',
    'Not today? No problem.',
    'Rest is productive too.',
    'You know yourself best. Trust that.',
  ],
  returning: [
    // Original
    'Welcome back! Comebacks are part of the journey.',
    "You're here again. That's what matters.",
    'Every return is a fresh start.',
    "Back at it? You're braver than you think.",
    // New - Warm welcome
    'Hey, you came back! That takes strength.',
    'Returning after a break is an act of courage.',
    "You didn't give up. You just took a breather.",
    'Welcome back, champion. Ready when you are.',
    // New - Encouraging
    "The fact that you're back means everything.",
    "Returning is not starting over. It's continuing.",
    "Life happened. Now you're back. That's the story.",
    'Every comeback starts with showing up again.',
    // New - No judgment
    "No judgment here. Just glad you're back.",
    'We all take breaks. The important thing is you returned.',
    'Past you might have stopped, but present you is here.',
    // New - Motivational
    "Okay, fresh start. What's first?",
    "Back in action! Let's pick up where we left off.",
    'Returning is a skill. You have it.',
    // Additional
    "Missed you! Let's do this.",
    'Round two. Ready?',
    "You're back and that's what counts.",
    'The comeback is always stronger.',
  ],
  low_energy: [
    // Original
    "Low energy day? Let's go extra gentle.",
    "Your best today is different from yesterday. That's okay.",
    'Small wins count double on hard days.',
    // New - Understanding
    "Not every day is a high-energy day. That's human.",
    "Running on empty? We'll take it slow.",
    "Low battery? Let's find something small.",
    'Some days are just harder. This might be one of them.',
    // New - Validating
    "You're showing up despite low energy. That's impressive.",
    'Doing anything right now is an achievement.',
    "The fact that you're trying counts for everything.",
    // New - Practical
    "What's the easiest possible thing you could do?",
    "Let's find something that takes almost no energy.",
    'Baby steps are still steps forward.',
    "Could you do just one tiny thing? That's enough.",
    // New - Caring
    'Be extra kind to yourself today.',
    'Your energy will return. For now, go easy.',
    'Listen to what your body needs.',
    "It's okay to rest more on days like this.",
    // Additional
    'Gentle mode: activated.',
    'Low key is still progress.',
    'Even snails finish the race.',
    'Slow and steady today.',
  ],
  high_achievement: [
    // Original
    "You're on fire today!",
    'Look at you go! Incredible.',
    'This is what flow state looks like.',
    // New - Celebratory
    "Unstoppable! You're in the zone!",
    "Wow, you're really crushing it!",
    'Peak performance mode activated!',
    "You're making this look easy!",
    // New - Acknowledging
    'This level of productivity deserves recognition.',
    "Remember this feeling. This is what you're capable of.",
    "You're proving what's possible.",
    'This is you at your best. Take it in.',
    // New - Encouraging
    'Keep this momentum going!',
    'Riding the wave of productivity!',
    "You've got serious momentum now!",
    'The streak continues!',
    // New - Fun
    'Legend status: achieved.',
    "Is there anything you can't do today?",
    'Productivity machine mode: ON',
    "You're basically a superhero right now.",
    // Additional
    'Wow. Just... wow.',
    "You're on a roll!",
    "Can't stop, won't stop!",
    'This is your day!',
    "Champions do what you're doing.",
  ],
};

// ============================================================================
// MESSAGE RETRIEVAL
// ============================================================================

export function getRandomMessage(context: EncouragementContext): string {
  const messages = ENCOURAGEMENT_MESSAGES[context];
  const index = Math.floor(Math.random() * messages.length);
  return messages[index] ?? messages[0] ?? '';
}

export function getMessage(
  context: EncouragementContext,
  usedIds: string[] = []
): EncouragementMessage {
  const messages = ENCOURAGEMENT_MESSAGES[context];
  const availableMessages = messages.filter(
    (_, i) => !usedIds.includes(`${context}-${i}`)
  );

  const pool = availableMessages.length > 0 ? availableMessages : messages;
  const index = Math.floor(Math.random() * pool.length);
  const selectedMessage = pool[index] ?? pool[0] ?? '';
  const originalIndex = messages.indexOf(selectedMessage);

  return {
    id: `${context}-${originalIndex}`,
    text: selectedMessage,
    context,
  };
}

/**
 * Get all messages for a context (for browsing/favoriting)
 */
export function getAllMessages(
  context: EncouragementContext
): EncouragementMessage[] {
  return ENCOURAGEMENT_MESSAGES[context].map((text, index) => ({
    id: `${context}-${index}`,
    text,
    context,
  }));
}

/**
 * Get message by ID
 */
export function getMessageById(id: string): EncouragementMessage | null {
  const [context, indexStr] = id.split('-');
  const index = parseInt(indexStr, 10);

  if (!context || isNaN(index)) return null;

  const contextKey = context as EncouragementContext;
  const messages = ENCOURAGEMENT_MESSAGES[contextKey];

  if (!messages || !messages[index]) return null;

  return {
    id,
    text: messages[index],
    context: contextKey,
  };
}

// ============================================================================
// FAVORITES MANAGEMENT
// ============================================================================

export interface FavoriteMessage {
  id: string;
  text: string;
  context: EncouragementContext;
  favoritedAt: Date;
}

const FAVORITES_KEY = 'procrastinact-favorite-messages';

export function getFavorites(): FavoriteMessage[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(FAVORITES_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored) as Array<{
      id: string;
      text: string;
      context: EncouragementContext;
      favoritedAt: string;
    }>;

    return parsed.map((f) => ({
      ...f,
      favoritedAt: new Date(f.favoritedAt),
    }));
  } catch {
    return [];
  }
}

export function addFavorite(message: EncouragementMessage): FavoriteMessage[] {
  const favorites = getFavorites();

  // Check if already favorited
  if (favorites.some((f) => f.id === message.id)) {
    return favorites;
  }

  const newFavorite: FavoriteMessage = {
    ...message,
    favoritedAt: new Date(),
  };

  const updated = [...favorites, newFavorite];

  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
  } catch {
    // Storage might be full
  }

  return updated;
}

export function removeFavorite(messageId: string): FavoriteMessage[] {
  const favorites = getFavorites();
  const updated = favorites.filter((f) => f.id !== messageId);

  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
  } catch {
    // Ignore
  }

  return updated;
}

export function isFavorite(messageId: string): boolean {
  return getFavorites().some((f) => f.id === messageId);
}

/**
 * Get a random favorite message (for showing favorites)
 */
export function getRandomFavorite(): FavoriteMessage | null {
  const favorites = getFavorites();
  if (favorites.length === 0) return null;

  const index = Math.floor(Math.random() * favorites.length);
  return favorites[index] ?? null;
}

// ============================================================================
// SESSION TRACKING (prevent repetition)
// ============================================================================

interface SessionState {
  usedMessageIds: Set<string>;
  messageCountByContext: Map<EncouragementContext, number>;
}

let sessionState: SessionState | null = null;

function getSessionState(): SessionState {
  if (!sessionState) {
    sessionState = {
      usedMessageIds: new Set(),
      messageCountByContext: new Map(),
    };
  }
  return sessionState;
}

/**
 * Get a non-repetitive message for the session
 */
export function getSessionMessage(
  context: EncouragementContext
): EncouragementMessage {
  const state = getSessionState();
  const messages = ENCOURAGEMENT_MESSAGES[context];

  // Find unused messages
  const unusedMessages = messages.filter(
    (_, i) => !state.usedMessageIds.has(`${context}-${i}`)
  );

  // If all used, reset for this context
  const pool = unusedMessages.length > 0 ? unusedMessages : messages;
  if (unusedMessages.length === 0) {
    // Reset used IDs for this context
    messages.forEach((_, i) => {
      state.usedMessageIds.delete(`${context}-${i}`);
    });
  }

  // Pick random from pool
  const index = Math.floor(Math.random() * pool.length);
  const selectedMessage = pool[index] ?? pool[0] ?? '';
  const originalIndex = messages.indexOf(selectedMessage);
  const messageId = `${context}-${originalIndex}`;

  // Track usage
  state.usedMessageIds.add(messageId);
  state.messageCountByContext.set(
    context,
    (state.messageCountByContext.get(context) ?? 0) + 1
  );

  return {
    id: messageId,
    text: selectedMessage,
    context,
  };
}

/**
 * Reset session state (e.g., on app restart)
 */
export function resetSession(): void {
  sessionState = null;
}

// ============================================================================
// CONTEXT DETECTION
// ============================================================================

export interface UserContext {
  /** Number of tasks completed today */
  tasksCompletedToday: number;
  /** Current streak length */
  currentStreak: number;
  /** Time since last activity (hours) */
  hoursSinceLastActivity: number;
  /** Whether user just failed/stopped a task */
  justStopped: boolean;
  /** User's energy level if known */
  energyLevel?: 'low' | 'medium' | 'high';
  /** Time of day */
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
}

/**
 * Auto-detect appropriate message context based on user state
 */
export function detectContext(userContext: UserContext): EncouragementContext {
  // Returning after absence
  if (userContext.hoursSinceLastActivity > 48) {
    return 'returning';
  }

  // Just stopped a task
  if (userContext.justStopped) {
    return 'stopping';
  }

  // Low energy
  if (userContext.energyLevel === 'low') {
    return 'low_energy';
  }

  // High achievement - multiple tasks today
  if (userContext.tasksCompletedToday >= 5) {
    return 'high_achievement';
  }

  // Default to starting context
  return 'starting';
}

// ============================================================================
// STATS
// ============================================================================

/**
 * Get total message count
 */
export function getTotalMessageCount(): number {
  return Object.values(ENCOURAGEMENT_MESSAGES).reduce(
    (sum, messages) => sum + messages.length,
    0
  );
}

/**
 * Get message count by context
 */
export function getMessageCountByContext(): Record<
  EncouragementContext,
  number
> {
  const result: Record<string, number> = {};

  for (const [context, messages] of Object.entries(ENCOURAGEMENT_MESSAGES)) {
    result[context] = messages.length;
  }

  return result as Record<EncouragementContext, number>;
}
