/**
 * Task Categories System
 *
 * Lightweight categorization that doesn't feel like work.
 * Categories are suggested, not required.
 */

import type { TaskCategory } from '@procrastinact/types';

// ============================================================================
// DEFAULT CATEGORIES
// ============================================================================

export const DEFAULT_CATEGORIES: TaskCategory[] = [
  { id: 'work', name: 'Work', color: '#6366f1', emoji: '💼' },
  { id: 'home', name: 'Home', color: '#f59e0b', emoji: '🏠' },
  { id: 'health', name: 'Health', color: '#22c55e', emoji: '💪' },
  { id: 'personal', name: 'Personal', color: '#ec4899', emoji: '✨' },
  { id: 'finance', name: 'Finance', color: '#14b8a6', emoji: '💰' },
  { id: 'social', name: 'Social', color: '#f97316', emoji: '👥' },
  { id: 'learning', name: 'Learning', color: '#8b5cf6', emoji: '📚' },
  { id: 'errands', name: 'Errands', color: '#64748b', emoji: '🛒' },
];

// ============================================================================
// CATEGORY COLORS
// ============================================================================

export const CATEGORY_COLORS = [
  '#6366f1', // Indigo
  '#f59e0b', // Amber
  '#22c55e', // Green
  '#ec4899', // Pink
  '#14b8a6', // Teal
  '#f97316', // Orange
  '#8b5cf6', // Purple
  '#64748b', // Slate
  '#ef4444', // Red
  '#3b82f6', // Blue
  '#84cc16', // Lime
  '#06b6d4', // Cyan
] as const;

// ============================================================================
// CATEGORY EMOJIS
// ============================================================================

export const CATEGORY_EMOJIS = [
  '💼',
  '🏠',
  '💪',
  '✨',
  '💰',
  '👥',
  '📚',
  '🛒',
  '🎯',
  '📧',
  '📞',
  '🧹',
  '🍳',
  '🏃',
  '🧘',
  '💊',
  '🚗',
  '✈️',
  '🎨',
  '🎮',
  '📝',
  '🔧',
  '🌱',
  '❤️',
] as const;

// ============================================================================
// KEYWORD MAPPINGS FOR AUTO-SUGGESTION
// ============================================================================

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  work: [
    'work',
    'job',
    'meeting',
    'email',
    'report',
    'project',
    'boss',
    'office',
    'deadline',
    'client',
    'presentation',
    'colleague',
    'invoice',
    'contract',
    'proposal',
    'review',
    'task',
    'schedule',
  ],
  home: [
    'home',
    'house',
    'clean',
    'laundry',
    'dishes',
    'vacuum',
    'cook',
    'grocery',
    'repair',
    'fix',
    'organize',
    'declutter',
    'trash',
    'bed',
    'kitchen',
    'bathroom',
    'room',
    'furniture',
    'plant',
  ],
  health: [
    'health',
    'doctor',
    'exercise',
    'gym',
    'workout',
    'run',
    'walk',
    'medication',
    'prescription',
    'appointment',
    'dentist',
    'therapy',
    'mental',
    'sleep',
    'diet',
    'nutrition',
    'weight',
    'stretch',
  ],
  personal: [
    'personal',
    'hobby',
    'relax',
    'self',
    'care',
    'journal',
    'read',
    'meditation',
    'mindfulness',
    'creative',
    'art',
    'music',
    'write',
    'gratitude',
    'reflection',
    'goals',
    'dreams',
    'plan',
  ],
  finance: [
    'finance',
    'money',
    'bank',
    'bill',
    'pay',
    'tax',
    'budget',
    'invest',
    'savings',
    'expense',
    'receipt',
    'insurance',
    'loan',
    'credit',
    'account',
    'transfer',
    'statement',
  ],
  social: [
    'social',
    'friend',
    'family',
    'call',
    'text',
    'message',
    'birthday',
    'party',
    'dinner',
    'lunch',
    'coffee',
    'meet',
    'visit',
    'gift',
    'thank',
    'invite',
    'rsvp',
    'reply',
  ],
  learning: [
    'learn',
    'study',
    'course',
    'class',
    'book',
    'tutorial',
    'practice',
    'research',
    'homework',
    'assignment',
    'exam',
    'test',
    'certificate',
    'skill',
    'language',
    'online',
    'lesson',
  ],
  errands: [
    'errand',
    'shop',
    'store',
    'buy',
    'pick',
    'drop',
    'return',
    'mail',
    'post',
    'package',
    'delivery',
    'appointment',
    'renew',
    'register',
    'dmv',
    'pharmacy',
    'dry',
    'cleaner',
  ],
};

// ============================================================================
// CATEGORY MANAGEMENT
// ============================================================================

export interface CategoryManager {
  categories: TaskCategory[];
  customCategories: TaskCategory[];
}

/**
 * Create a new category manager with default categories
 */
export function createCategoryManager(): CategoryManager {
  return {
    categories: [...DEFAULT_CATEGORIES],
    customCategories: [],
  };
}

/**
 * Add a custom category
 */
export function addCategory(
  manager: CategoryManager,
  category: Omit<TaskCategory, 'id'>
): CategoryManager {
  const id = `custom_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const newCategory: TaskCategory = { ...category, id };

  return {
    ...manager,
    categories: [...manager.categories, newCategory],
    customCategories: [...manager.customCategories, newCategory],
  };
}

/**
 * Update an existing category
 */
export function updateCategory(
  manager: CategoryManager,
  id: string,
  updates: Partial<Omit<TaskCategory, 'id'>>
): CategoryManager {
  const updateCategories = (cats: TaskCategory[]): TaskCategory[] =>
    cats.map((cat) => (cat.id === id ? { ...cat, ...updates } : cat));

  return {
    ...manager,
    categories: updateCategories(manager.categories),
    customCategories: updateCategories(manager.customCategories),
  };
}

/**
 * Delete a custom category
 */
export function deleteCategory(
  manager: CategoryManager,
  id: string
): CategoryManager {
  // Can only delete custom categories
  if (!manager.customCategories.find((c) => c.id === id)) {
    return manager;
  }

  return {
    ...manager,
    categories: manager.categories.filter((c) => c.id !== id),
    customCategories: manager.customCategories.filter((c) => c.id !== id),
  };
}

/**
 * Get a category by ID
 */
export function getCategoryById(
  manager: CategoryManager,
  id: string
): TaskCategory | undefined {
  return manager.categories.find((c) => c.id === id);
}

// ============================================================================
// AUTO-SUGGESTION
// ============================================================================

interface CategorySuggestion {
  category: TaskCategory;
  confidence: number; // 0-1
  matchedKeywords: string[];
}

/**
 * Suggest a category based on task text
 * Returns suggestions sorted by confidence (highest first)
 */
export function suggestCategory(
  text: string,
  manager: CategoryManager
): CategorySuggestion[] {
  const lowerText = text.toLowerCase();
  const words = lowerText.split(/\s+/);
  const suggestions: CategorySuggestion[] = [];

  for (const category of manager.categories) {
    const keywords = CATEGORY_KEYWORDS[category.id] ?? [];
    const matchedKeywords: string[] = [];

    // Check for keyword matches
    for (const keyword of keywords) {
      // Exact word match
      if (words.includes(keyword)) {
        matchedKeywords.push(keyword);
      }
      // Partial match (word contains keyword)
      else if (lowerText.includes(keyword)) {
        matchedKeywords.push(keyword);
      }
    }

    if (matchedKeywords.length > 0) {
      // Calculate confidence based on number of matches and uniqueness
      const confidence = Math.min(matchedKeywords.length * 0.3, 0.95);

      suggestions.push({
        category,
        confidence,
        matchedKeywords,
      });
    }
  }

  // Sort by confidence (highest first)
  suggestions.sort((a, b) => b.confidence - a.confidence);

  return suggestions;
}

/**
 * Get the best category suggestion, or null if confidence is too low
 */
export function getBestCategorySuggestion(
  text: string,
  manager: CategoryManager,
  minConfidence: number = 0.3
): TaskCategory | null {
  const suggestions = suggestCategory(text, manager);

  if (suggestions.length === 0) return null;

  const best = suggestions[0];
  if (best.confidence < minConfidence) return null;

  return best.category;
}

// ============================================================================
// FILTERING
// ============================================================================

/**
 * Filter tasks by category
 */
export function filterByCategory<T extends { category?: TaskCategory }>(
  items: T[],
  categoryId: string | null
): T[] {
  if (!categoryId) return items;
  return items.filter((item) => item.category?.id === categoryId);
}

/**
 * Group tasks by category
 */
export function groupByCategory<T extends { category?: TaskCategory }>(
  items: T[]
): Map<string | null, T[]> {
  const groups = new Map<string | null, T[]>();

  // Initialize with "uncategorized"
  groups.set(null, []);

  for (const item of items) {
    const categoryId = item.category?.id ?? null;
    if (!groups.has(categoryId)) {
      groups.set(categoryId, []);
    }
    groups.get(categoryId)?.push(item);
  }

  return groups;
}

// ============================================================================
// SERIALIZATION
// ============================================================================

export interface SerializedCategoryManager {
  categories: TaskCategory[];
  customCategories: TaskCategory[];
}

export function serializeCategoryManager(
  manager: CategoryManager
): SerializedCategoryManager {
  return {
    categories: manager.categories,
    customCategories: manager.customCategories,
  };
}

export function deserializeCategoryManager(
  data: SerializedCategoryManager
): CategoryManager {
  // Merge default categories with stored custom categories
  const allCategories = [
    ...DEFAULT_CATEGORIES,
    ...data.customCategories.filter(
      (c) => !DEFAULT_CATEGORIES.find((d) => d.id === c.id)
    ),
  ];

  return {
    categories: allCategories,
    customCategories: data.customCategories,
  };
}

// ============================================================================
// ANALYTICS HELPERS
// ============================================================================

export interface CategoryStats {
  categoryId: string;
  categoryName: string;
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  averageTimeToComplete: number; // in minutes
}

/**
 * Calculate statistics for each category
 */
export function calculateCategoryStats<
  T extends {
    category?: TaskCategory;
    status: string;
    createdAt: Date;
    completedAt?: Date;
  },
>(items: T[], manager: CategoryManager): CategoryStats[] {
  const stats: CategoryStats[] = [];

  for (const category of manager.categories) {
    const categoryTasks = items.filter((i) => i.category?.id === category.id);
    const completedTasks = categoryTasks.filter(
      (i) => i.status === 'completed'
    );

    const timesToComplete = completedTasks
      .filter((t) => t.completedAt)
      .map((t) => {
        const start = t.createdAt.getTime();
        const end = t.completedAt?.getTime() ?? start;
        return (end - start) / (1000 * 60); // minutes
      });

    const averageTime =
      timesToComplete.length > 0
        ? timesToComplete.reduce((a, b) => a + b, 0) / timesToComplete.length
        : 0;

    stats.push({
      categoryId: category.id,
      categoryName: category.name,
      totalTasks: categoryTasks.length,
      completedTasks: completedTasks.length,
      completionRate:
        categoryTasks.length > 0
          ? completedTasks.length / categoryTasks.length
          : 0,
      averageTimeToComplete: Math.round(averageTime),
    });
  }

  // Sort by total tasks (descending)
  stats.sort((a, b) => b.totalTasks - a.totalTasks);

  return stats;
}
