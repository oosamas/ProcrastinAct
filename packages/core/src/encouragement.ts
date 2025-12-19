import type {
  EncouragementMessage,
  EncouragementContext,
} from '@procrastinact/types';

const ENCOURAGEMENT_MESSAGES: Record<EncouragementContext, string[]> = {
  starting: [
    "You're about to start something. That's already a win.",
    "The hardest part is starting. You're doing it.",
    "One tiny step at a time. You've got this.",
    'Starting is a superpower. You have it.',
  ],
  struggling: [
    "It's okay to make it smaller. That's the point.",
    "Still too big? Let's shrink it again.",
    "There's no task too small. Break it down.",
    "Struggling is not failing. It's finding the right size.",
  ],
  completing: [
    "You did it! That's real progress.",
    "Another one done. You're unstoppable.",
    'Completed! Your brain just got a little dopamine.',
    "Task crushed. You're amazing.",
  ],
  stopping: [
    'Rest is part of the process.',
    'You did enough. Really.',
    "Taking a break? That's wisdom, not weakness.",
    "Stopping is a skill. You're practicing it well.",
  ],
  returning: [
    'Welcome back! Comebacks are part of the journey.',
    "You're here again. That's what matters.",
    'Every return is a fresh start.',
    "Back at it? You're braver than you think.",
  ],
  low_energy: [
    "Low energy day? Let's go extra gentle.",
    "Your best today is different from yesterday. That's okay.",
    'Small wins count double on hard days.',
  ],
  high_achievement: [
    "You're on fire today!",
    'Look at you go! Incredible.',
    'This is what flow state looks like.',
  ],
};

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
