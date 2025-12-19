/**
 * Response cache with similarity matching for task shrinking
 */

import type { CacheEntry } from './types';

export interface CacheOptions {
  maxSize?: number;
  ttl?: number; // milliseconds
  similarityThreshold?: number; // 0-1, for fuzzy matching
}

export class ResponseCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private maxSize: number;
  private ttl: number;
  private similarityThreshold: number;

  constructor(options: CacheOptions = {}) {
    this.maxSize = options.maxSize ?? 100;
    this.ttl = options.ttl ?? 1000 * 60 * 60; // 1 hour default
    this.similarityThreshold = options.similarityThreshold ?? 0.8;
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    entry.hitCount++;
    return entry.data;
  }

  /**
   * Get cached value with fuzzy key matching
   * Useful for task titles that may be similar but not exact
   */
  getSimilar(key: string): T | null {
    const normalizedKey = this.normalizeKey(key);

    // First try exact match
    const exact = this.get(normalizedKey);
    if (exact) return exact;

    // Try fuzzy match
    for (const [cachedKey, entry] of this.cache.entries()) {
      if (Date.now() > entry.expiresAt) {
        this.cache.delete(cachedKey);
        continue;
      }

      const similarity = this.calculateSimilarity(normalizedKey, cachedKey);
      if (similarity >= this.similarityThreshold) {
        entry.hitCount++;
        return entry.data;
      }
    }

    return null;
  }

  set(key: string, value: T, customTtl?: number): void {
    const normalizedKey = this.normalizeKey(key);

    // Evict oldest entries if at capacity
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }

    const now = Date.now();
    this.cache.set(normalizedKey, {
      data: value,
      timestamp: now,
      expiresAt: now + (customTtl ?? this.ttl),
      hitCount: 0,
    });
  }

  delete(key: string): boolean {
    return this.cache.delete(this.normalizeKey(key));
  }

  clear(): void {
    this.cache.clear();
  }

  get size(): number {
    return this.cache.size;
  }

  getStats(): { size: number; hitRate: number; totalHits: number } {
    let totalHits = 0;
    for (const entry of this.cache.values()) {
      totalHits += entry.hitCount;
    }

    return {
      size: this.cache.size,
      hitRate: this.cache.size > 0 ? totalHits / this.cache.size : 0,
      totalHits,
    };
  }

  /**
   * Clean up expired entries
   */
  prune(): number {
    const now = Date.now();
    let removed = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        removed++;
      }
    }

    return removed;
  }

  private normalizeKey(key: string): string {
    return key
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s]/g, '');
  }

  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      // Consider both age and hit count (LRU-like with usage)
      const effectiveAge = entry.timestamp - entry.hitCount * 1000;
      if (effectiveAge < oldestTime) {
        oldestTime = effectiveAge;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Calculate similarity between two strings using Levenshtein distance
   */
  private calculateSimilarity(a: string, b: string): number {
    if (a === b) return 1;
    if (a.length === 0 || b.length === 0) return 0;

    // Quick check: if lengths are very different, likely not similar
    const lengthRatio =
      Math.min(a.length, b.length) / Math.max(a.length, b.length);
    if (lengthRatio < 0.5) return lengthRatio;

    const distance = this.levenshteinDistance(a, b);
    const maxLength = Math.max(a.length, b.length);
    return 1 - distance / maxLength;
  }

  private levenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = [];

    // Initialize matrix
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
      matrix[0]![j] = j;
    }

    // Fill matrix
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        const cost = a[j - 1] === b[i - 1] ? 0 : 1;
        matrix[i]![j] = Math.min(
          matrix[i - 1]![j]! + 1, // deletion
          matrix[i]![j - 1]! + 1, // insertion
          matrix[i - 1]![j - 1]! + cost // substitution
        );
      }
    }

    return matrix[b.length]![a.length]!;
  }
}
