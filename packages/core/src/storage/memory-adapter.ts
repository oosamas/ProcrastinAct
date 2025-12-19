/**
 * In-memory storage adapter for testing and SSR
 */

import type { StorageAdapter } from './types';

export class MemoryAdapter implements StorageAdapter {
  private store: Map<string, string> = new Map();

  async getItem(key: string): Promise<string | null> {
    return this.store.get(key) ?? null;
  }

  async setItem(key: string, value: string): Promise<void> {
    this.store.set(key, value);
  }

  async removeItem(key: string): Promise<void> {
    this.store.delete(key);
  }

  async getAllKeys(): Promise<string[]> {
    return Array.from(this.store.keys());
  }

  async clear(): Promise<void> {
    this.store.clear();
  }

  async multiGet(keys: string[]): Promise<[string, string | null][]> {
    return keys.map((key) => [key, this.store.get(key) ?? null]);
  }

  async multiSet(entries: [string, string][]): Promise<void> {
    entries.forEach(([key, value]) => {
      this.store.set(key, value);
    });
  }

  async multiRemove(keys: string[]): Promise<void> {
    keys.forEach((key) => {
      this.store.delete(key);
    });
  }
}
