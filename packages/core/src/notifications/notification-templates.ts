/**
 * Notification Templates
 * Pre-defined notification messages with different tonalities
 */

import type {
  NotificationType,
  NotificationTonality,
  NotificationTemplate,
} from './types';

// Template variable replacer
export function applyTemplate(
  template: string,
  variables: Record<string, string | number>
): string {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
  }
  return result;
}

// Get a random variant for variety
function getRandomVariant<T>(variants: T[]): T {
  return variants[Math.floor(Math.random() * variants.length)] as T;
}

// Reminder templates
const REMINDER_TEMPLATES: Record<
  NotificationTonality,
  { title: string; body: string }[]
> = {
  supportive: [
    {
      title: 'Gentle Reminder',
      body: 'When you\'re ready, "{{taskName}}" is waiting for you.',
    },
    { title: 'Hey there', body: 'Just a friendly nudge about "{{taskName}}".' },
    {
      title: "You've got this",
      body: 'Remember "{{taskName}}"? It\'s still on your list.',
    },
  ],
  neutral: [
    { title: 'Reminder', body: '{{taskName}}' },
    { title: 'Task Reminder', body: 'Scheduled: {{taskName}}' },
    { title: "Don't forget", body: '{{taskName}}' },
  ],
  playful: [
    { title: 'Psst! ', body: '"{{taskName}}" is feeling lonely!' },
    {
      title: 'Task incoming!',
      body: 'Your task "{{taskName}}" requests your presence.',
    },
    { title: 'Boop!', body: '"{{taskName}}" would love some attention.' },
  ],
};

// Encouragement templates
const ENCOURAGEMENT_TEMPLATES: Record<
  NotificationTonality,
  { title: string; body: string }[]
> = {
  supportive: [
    {
      title: "You're doing great",
      body: 'Every small step counts. Keep going!',
    },
    {
      title: 'Remember',
      body: "Progress isn't always visible, but it's happening.",
    },
    {
      title: 'Be kind to yourself',
      body: "You're doing better than you think.",
    },
  ],
  neutral: [
    { title: 'Keep going', body: "You've made progress today." },
    { title: 'Check in', body: 'How are you doing with your tasks?' },
    { title: 'Status update', body: "You've got this." },
  ],
  playful: [
    { title: 'High five!', body: 'Your brain is doing awesome things today!' },
    {
      title: 'Fun fact',
      body: "You're 100% more productive than yesterday's you who was asleep!",
    },
    {
      title: 'Achievement unlocked',
      body: "You opened the app. That's a win!",
    },
  ],
};

// Achievement templates
const ACHIEVEMENT_TEMPLATES: Record<
  NotificationTonality,
  { title: string; body: string }[]
> = {
  supportive: [
    { title: 'You did it!', body: 'Achievement unlocked: {{achievementName}}' },
    { title: 'Wonderful!', body: 'You\'ve earned "{{achievementName}}"' },
    { title: 'Celebrating you', body: '{{achievementName}} - well deserved!' },
  ],
  neutral: [
    { title: 'Achievement Unlocked', body: '{{achievementName}}' },
    { title: 'New Achievement', body: 'You earned: {{achievementName}}' },
    { title: 'Badge Earned', body: '{{achievementName}}' },
  ],
  playful: [
    { title: 'ACHIEVEMENT GET!', body: '{{achievementName}} is now yours!' },
    { title: 'Level up!', body: "You've unlocked {{achievementName}}!" },
    {
      title: '*confetti*',
      body: '{{achievementName}} has been added to your collection!',
    },
  ],
};

// Streak templates
const STREAK_TEMPLATES: Record<
  NotificationTonality,
  { title: string; body: string }[]
> = {
  supportive: [
    {
      title: '{{streakCount}} day streak!',
      body: 'Amazing consistency. You should be proud.',
    },
    {
      title: 'Keep it going',
      body: 'Your {{streakCount}}-day streak is inspiring!',
    },
    {
      title: 'Streak milestone',
      body: "{{streakCount}} days of showing up. That's real progress.",
    },
  ],
  neutral: [
    { title: 'Streak: {{streakCount}} days', body: 'Keep it up!' },
    { title: '{{streakCount}}-day streak', body: "You're on a roll." },
    { title: 'Streak update', body: '{{streakCount}} consecutive days.' },
  ],
  playful: [
    {
      title: '{{streakCount}} DAYS!',
      body: "You're on fire! (Not literally, please stay safe)",
    },
    {
      title: 'Streak check',
      body: '{{streakCount}} days! Your future self is impressed.',
    },
    { title: 'Hot streak!', body: '{{streakCount}} days and counting!' },
  ],
};

// Time awareness templates
const TIME_AWARENESS_TEMPLATES: Record<
  NotificationTonality,
  { title: string; body: string }[]
> = {
  supportive: [
    {
      title: 'Time check',
      body: "You've been focused for {{duration}}. Maybe a quick stretch?",
    },
    {
      title: 'Gentle reminder',
      body: "It's been {{duration}}. How are you feeling?",
    },
    {
      title: 'Check in',
      body: '{{duration}} has passed. Remember to take care of yourself.',
    },
  ],
  neutral: [
    { title: 'Time: {{duration}}', body: 'Focus session in progress.' },
    { title: '{{duration}} elapsed', body: 'Timer update.' },
    { title: 'Time update', body: '{{duration}} since you started.' },
  ],
  playful: [
    {
      title: 'Whoa, time flies!',
      body: "It's been {{duration}}! You're in the zone!",
    },
    { title: 'Time warp!', body: '{{duration}} has zoomed by!' },
    { title: 'Did you blink?', body: '{{duration}} just happened!' },
  ],
};

// Gentle nudge templates (never guilt-inducing!)
const GENTLE_NUDGE_TEMPLATES: Record<
  NotificationTonality,
  { title: string; body: string }[]
> = {
  supportive: [
    {
      title: 'Welcome back',
      body: "No pressure, just here when you're ready.",
    },
    { title: 'Hey there', body: "Just checking in. Hope you're doing okay!" },
    {
      title: 'Thinking of you',
      body: 'The app misses you, but take all the time you need.',
    },
  ],
  neutral: [
    { title: 'Welcome back', body: 'Ready when you are.' },
    { title: 'Check in', body: "It's been a while. No worries!" },
    { title: 'Hello again', body: 'Good to see you.' },
  ],
  playful: [
    {
      title: 'Oh hey!',
      body: 'The app was just tidying up while you were away.',
    },
    { title: '*waves*', body: 'Your tasks have been practicing patience!' },
    { title: 'Long time no see!', body: 'We saved your spot!' },
  ],
};

/**
 * Get a notification message for a specific type and tonality
 */
export function getNotificationMessage(
  type: NotificationType,
  tonality: NotificationTonality,
  variables: Record<string, string | number> = {}
): { title: string; body: string } {
  let templates: Record<
    NotificationTonality,
    { title: string; body: string }[]
  >;

  switch (type) {
    case 'reminder':
      templates = REMINDER_TEMPLATES;
      break;
    case 'encouragement':
      templates = ENCOURAGEMENT_TEMPLATES;
      break;
    case 'achievement':
      templates = ACHIEVEMENT_TEMPLATES;
      break;
    case 'streak':
      templates = STREAK_TEMPLATES;
      break;
    case 'time_awareness':
      templates = TIME_AWARENESS_TEMPLATES;
      break;
    case 'gentle_nudge':
      templates = GENTLE_NUDGE_TEMPLATES;
      break;
    default:
      templates = ENCOURAGEMENT_TEMPLATES;
  }

  const variant = getRandomVariant(templates[tonality]);

  return {
    title: applyTemplate(variant.title, variables),
    body: applyTemplate(variant.body, variables),
  };
}

/**
 * Get all templates for a notification type
 */
export function getTemplatesForType(
  type: NotificationType
): NotificationTemplate {
  const allTonalities: NotificationTonality[] = [
    'supportive',
    'neutral',
    'playful',
  ];

  let templates: Record<
    NotificationTonality,
    { title: string; body: string }[]
  >;

  switch (type) {
    case 'reminder':
      templates = REMINDER_TEMPLATES;
      break;
    case 'encouragement':
      templates = ENCOURAGEMENT_TEMPLATES;
      break;
    case 'achievement':
      templates = ACHIEVEMENT_TEMPLATES;
      break;
    case 'streak':
      templates = STREAK_TEMPLATES;
      break;
    case 'time_awareness':
      templates = TIME_AWARENESS_TEMPLATES;
      break;
    case 'gentle_nudge':
      templates = GENTLE_NUDGE_TEMPLATES;
      break;
    default:
      templates = ENCOURAGEMENT_TEMPLATES;
  }

  return {
    id: type,
    type,
    variants: allTonalities.flatMap((tonality) =>
      templates[tonality].map((t) => ({
        tonality,
        title: t.title,
        body: t.body,
      }))
    ),
  };
}
