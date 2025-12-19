/**
 * Privacy Policy Content - Issue #119
 * Human-readable privacy policy and data collection transparency
 */

// ============================================================================
// TYPES
// ============================================================================

export interface PrivacySection {
  id: string;
  title: string;
  emoji: string;
  content: string;
  details?: string[];
}

export interface DataCollectionItem {
  id: string;
  category: 'essential' | 'functional' | 'analytics' | 'optional';
  name: string;
  description: string;
  purpose: string;
  storedLocally: boolean;
  sentToServer: boolean;
  canOptOut: boolean;
  retentionPeriod: string;
}

export interface OpenSourceCredit {
  name: string;
  license: string;
  url: string;
  description: string;
}

export interface TrustBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  verified: boolean;
}

// ============================================================================
// PRIVACY POLICY CONTENT
// ============================================================================

/**
 * Human-readable privacy policy sections
 */
export const PRIVACY_POLICY_SECTIONS: PrivacySection[] = [
  {
    id: 'intro',
    title: 'Our Promise to You',
    emoji: '🤝',
    content:
      "Your privacy matters. ProcrastinAct is designed with your privacy in mind. We believe you should have full control over your data, and we're committed to being transparent about what we collect and why.",
    details: [
      'We will never sell your personal data to advertisers or third parties',
      'We collect only what we need to make the app work for you',
      'You can export or delete your data anytime',
      'We use encryption to protect your information',
    ],
  },
  {
    id: 'no-ads',
    title: 'No Ads, Ever',
    emoji: '🚫',
    content:
      'We will never show you advertisements. Period. We believe ads are distracting, especially for people with ADHD. Our app is supported through optional donations from users who find it valuable.',
    details: [
      'No banner ads, video ads, or sponsored content',
      'No selling your data to advertisers',
      'No tracking for advertising purposes',
      'Our revenue comes from voluntary donations only',
    ],
  },
  {
    id: 'local-first',
    title: 'Your Data Lives on Your Device',
    emoji: '📱',
    content:
      "By default, all your tasks, preferences, and progress stay on your device. We don't require an account or cloud sync to use the app. Your data is yours.",
    details: [
      'Tasks and notes are stored locally on your device',
      'No account required to use core features',
      'Optional cloud sync is encrypted end-to-end',
      'You can use the app completely offline',
    ],
  },
  {
    id: 'optional-sync',
    title: 'Optional Cloud Sync',
    emoji: '☁️',
    content:
      'If you choose to create an account for backup and sync across devices, we take extra care to protect your data. Sync is always optional, never required.',
    details: [
      'End-to-end encryption for synced data',
      'We cannot read your tasks or notes',
      'You can delete your account and all data anytime',
      'Sync happens only when you choose',
    ],
  },
  {
    id: 'analytics',
    title: 'Anonymous Usage Analytics',
    emoji: '📊',
    content:
      'We collect anonymous usage statistics to improve the app. This helps us understand which features are useful and where people get stuck. We never collect personal information through analytics.',
    details: [
      'No names, emails, or personal identifiers collected',
      'No content of your tasks or notes is ever sent',
      'Statistics are aggregated and anonymized',
      'You can opt out of analytics completely',
    ],
  },
  {
    id: 'ai-features',
    title: 'AI Features & Your Data',
    emoji: '🤖',
    content:
      'Our AI features (like task suggestions) work locally on your device when possible. When cloud AI is used, your data is never stored or used for training.',
    details: [
      'Local AI processing when available',
      'Cloud AI requests are not logged or stored',
      'Your data is never used to train AI models',
      'AI features can be disabled entirely',
    ],
  },
  {
    id: 'third-parties',
    title: 'Third-Party Services',
    emoji: '🔗',
    content:
      'We use a minimal number of third-party services, and we choose them carefully based on their privacy practices.',
    details: [
      'Payment processing through secure providers (Stripe)',
      'Optional cloud sync through privacy-focused services',
      'Crash reporting to fix bugs (no personal data)',
      'No social media trackers or advertising networks',
    ],
  },
  {
    id: 'your-rights',
    title: 'Your Rights',
    emoji: '⚖️',
    content:
      "You have full control over your data. Here's what you can do at any time:",
    details: [
      'Export all your data in a portable format',
      'Delete your data from our servers',
      'Opt out of any optional data collection',
      'Request a copy of any data we have about you',
      'Close your account and remove all data',
    ],
  },
  {
    id: 'gdpr-ccpa',
    title: 'GDPR & CCPA Compliance',
    emoji: '🌍',
    content:
      'We comply with GDPR (European Union) and CCPA (California) privacy regulations. Your privacy rights are protected regardless of where you live.',
    details: [
      'Right to access your personal data',
      'Right to correct inaccurate data',
      'Right to delete your data (right to be forgotten)',
      'Right to data portability',
      'Right to object to processing',
      'No discrimination for exercising your rights',
    ],
  },
  {
    id: 'contact',
    title: 'Questions?',
    emoji: '💬',
    content:
      "We're happy to answer any questions about your privacy. Reach out to us at privacy@procrastinact.app. We typically respond within 48 hours.",
  },
];

// ============================================================================
// DATA COLLECTION TRANSPARENCY
// ============================================================================

/**
 * Detailed breakdown of data collection
 */
export const DATA_COLLECTION_ITEMS: DataCollectionItem[] = [
  // Essential data
  {
    id: 'tasks',
    category: 'essential',
    name: 'Tasks & Notes',
    description: 'Your to-do items, notes, and task details',
    purpose: 'Core functionality of the app',
    storedLocally: true,
    sentToServer: false,
    canOptOut: false,
    retentionPeriod: 'Until you delete them',
  },
  {
    id: 'preferences',
    category: 'essential',
    name: 'App Preferences',
    description: 'Theme, notification settings, accessibility options',
    purpose: 'Personalize your experience',
    storedLocally: true,
    sentToServer: false,
    canOptOut: false,
    retentionPeriod: 'Until you reset settings',
  },
  {
    id: 'progress',
    category: 'essential',
    name: 'Progress & Streaks',
    description: 'Completion history, streaks, achievements',
    purpose: 'Track your progress and provide encouragement',
    storedLocally: true,
    sentToServer: false,
    canOptOut: false,
    retentionPeriod: 'Until you delete them',
  },

  // Functional data (for optional features)
  {
    id: 'account',
    category: 'functional',
    name: 'Account Information',
    description: 'Email address (if you create an account)',
    purpose: 'Enable sync and account recovery',
    storedLocally: false,
    sentToServer: true,
    canOptOut: true,
    retentionPeriod: 'Until you delete your account',
  },
  {
    id: 'sync-data',
    category: 'functional',
    name: 'Synced Data',
    description: 'Encrypted copy of tasks and preferences',
    purpose: 'Backup and sync across devices',
    storedLocally: false,
    sentToServer: true,
    canOptOut: true,
    retentionPeriod: 'Until you delete your account',
  },

  // Analytics (optional)
  {
    id: 'feature-usage',
    category: 'analytics',
    name: 'Feature Usage',
    description: 'Which features you use (not content)',
    purpose: 'Improve app features',
    storedLocally: false,
    sentToServer: true,
    canOptOut: true,
    retentionPeriod: '90 days',
  },
  {
    id: 'crash-reports',
    category: 'analytics',
    name: 'Crash Reports',
    description: 'Error information when app crashes',
    purpose: 'Fix bugs and improve stability',
    storedLocally: false,
    sentToServer: true,
    canOptOut: true,
    retentionPeriod: '30 days',
  },
  {
    id: 'device-info',
    category: 'analytics',
    name: 'Device Type',
    description: 'Phone model and OS version (no unique IDs)',
    purpose: 'Ensure compatibility',
    storedLocally: false,
    sentToServer: true,
    canOptOut: true,
    retentionPeriod: '90 days',
  },

  // Optional data
  {
    id: 'donation-history',
    category: 'optional',
    name: 'Donation History',
    description: 'Record of donations (if you donate)',
    purpose: 'Provide donation receipts',
    storedLocally: true,
    sentToServer: true,
    canOptOut: true,
    retentionPeriod: '7 years (legal requirement)',
  },
];

// ============================================================================
// OPEN SOURCE CREDITS
// ============================================================================

/**
 * Open source components used in the app
 */
export const OPEN_SOURCE_CREDITS: OpenSourceCredit[] = [
  {
    name: 'React',
    license: 'MIT',
    url: 'https://github.com/facebook/react',
    description: 'JavaScript library for building user interfaces',
  },
  {
    name: 'React Native',
    license: 'MIT',
    url: 'https://github.com/facebook/react-native',
    description: 'Framework for building native apps with React',
  },
  {
    name: 'Next.js',
    license: 'MIT',
    url: 'https://github.com/vercel/next.js',
    description: 'React framework for web applications',
  },
  {
    name: 'Expo',
    license: 'MIT',
    url: 'https://github.com/expo/expo',
    description: 'Platform for universal React applications',
  },
  {
    name: 'TypeScript',
    license: 'Apache-2.0',
    url: 'https://github.com/microsoft/TypeScript',
    description: 'Typed JavaScript programming language',
  },
  {
    name: 'Turborepo',
    license: 'MPL-2.0',
    url: 'https://github.com/vercel/turbo',
    description: 'High-performance build system for JavaScript',
  },
  {
    name: 'Zustand',
    license: 'MIT',
    url: 'https://github.com/pmndrs/zustand',
    description: 'Lightweight state management',
  },
];

// ============================================================================
// TRUST BADGES
// ============================================================================

/**
 * Trust and transparency badges
 */
export const TRUST_BADGES: TrustBadge[] = [
  {
    id: 'no-ads',
    name: 'Ad-Free Forever',
    description: 'We will never show advertisements',
    icon: '🚫',
    verified: true,
  },
  {
    id: 'privacy-first',
    name: 'Privacy First',
    description: 'Your data stays on your device by default',
    icon: '🔒',
    verified: true,
  },
  {
    id: 'open-source',
    name: 'Open Source Friendly',
    description: 'Built with open source components',
    icon: '💚',
    verified: true,
  },
  {
    id: 'gdpr-compliant',
    name: 'GDPR Compliant',
    description: 'Meets European privacy standards',
    icon: '🌍',
    verified: true,
  },
  {
    id: 'ccpa-compliant',
    name: 'CCPA Compliant',
    description: 'Meets California privacy standards',
    icon: '🇺🇸',
    verified: true,
  },
  {
    id: 'no-tracking',
    name: 'No Ad Tracking',
    description: 'No advertising trackers or cookies',
    icon: '👁️‍🗨️',
    verified: true,
  },
  {
    id: 'encrypted',
    name: 'End-to-End Encrypted',
    description: 'Optional sync is fully encrypted',
    icon: '🔐',
    verified: true,
  },
  {
    id: 'community-supported',
    name: 'Community Supported',
    description: 'Funded by voluntary donations',
    icon: '❤️',
    verified: true,
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get privacy policy section by ID
 */
export function getPrivacySection(id: string): PrivacySection | undefined {
  return PRIVACY_POLICY_SECTIONS.find((section) => section.id === id);
}

/**
 * Get data collection items by category
 */
export function getDataCollectionByCategory(
  category: DataCollectionItem['category']
): DataCollectionItem[] {
  return DATA_COLLECTION_ITEMS.filter((item) => item.category === category);
}

/**
 * Get items that can be opted out
 */
export function getOptionalDataCollection(): DataCollectionItem[] {
  return DATA_COLLECTION_ITEMS.filter((item) => item.canOptOut);
}

/**
 * Get items that are sent to server
 */
export function getServerDataCollection(): DataCollectionItem[] {
  return DATA_COLLECTION_ITEMS.filter((item) => item.sentToServer);
}

/**
 * Get the plain text privacy policy
 */
export function getPrivacyPolicyText(): string {
  return PRIVACY_POLICY_SECTIONS.map((section) => {
    let text = `${section.emoji} ${section.title}\n\n${section.content}`;
    if (section.details) {
      text += '\n\n' + section.details.map((d) => `• ${d}`).join('\n');
    }
    return text;
  }).join('\n\n---\n\n');
}

/**
 * Get last updated date for privacy policy
 */
export function getPrivacyPolicyLastUpdated(): Date {
  return new Date('2025-01-01'); // Update when policy changes
}

/**
 * Get privacy policy version
 */
export function getPrivacyPolicyVersion(): string {
  return '1.0.0';
}
