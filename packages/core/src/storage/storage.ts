/**
 * Cross-platform storage service
 */

import type { StorageAdapter, StorageOptions, TypedStorage } from './types';

const DEFAULT_PREFIX = '@procrastinact:';

export class Storage {
  private adapter: StorageAdapter;
  private prefix: string;
  private serialize: (value: unknown) => string;
  private deserialize: (value: string) => unknown;

  constructor(options: StorageOptions) {
    this.adapter = options.adapter;
    this.prefix = options.prefix ?? DEFAULT_PREFIX;
    this.serialize = options.serialize ?? JSON.stringify;
    this.deserialize = options.deserialize ?? JSON.parse;
  }

  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  async get<T>(key: string): Promise<T | null> {
    const value = await this.adapter.getItem(this.getKey(key));
    if (value === null) return null;
    try {
      return this.deserialize(value) as T;
    } catch {
      return null;
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    const serialized = this.serialize(value);
    await this.adapter.setItem(this.getKey(key), serialized);
  }

  async remove(key: string): Promise<void> {
    await this.adapter.removeItem(this.getKey(key));
  }

  async update<T>(
    key: string,
    updater: (current: T | null) => T
  ): Promise<void> {
    const current = await this.get<T>(key);
    const updated = updater(current);
    await this.set(key, updated);
  }

  async getAllKeys(): Promise<string[]> {
    const allKeys = await this.adapter.getAllKeys();
    return allKeys
      .filter((k) => k.startsWith(this.prefix))
      .map((k) => k.slice(this.prefix.length));
  }

  async clear(): Promise<void> {
    const keys = await this.getAllKeys();
    const prefixedKeys = keys.map((k) => this.getKey(k));
    await this.adapter.multiRemove(prefixedKeys);
  }

  async multiGet<T>(keys: string[]): Promise<Map<string, T | null>> {
    const prefixedKeys = keys.map((k) => this.getKey(k));
    const results = await this.adapter.multiGet(prefixedKeys);
    const map = new Map<string, T | null>();

    results.forEach(([, value], index) => {
      const key = keys[index];
      if (key !== undefined) {
        try {
          map.set(key, value ? (this.deserialize(value) as T) : null);
        } catch {
          map.set(key, null);
        }
      }
    });

    return map;
  }

  async multiSet<T>(entries: [string, T][]): Promise<void> {
    const serializedEntries: [string, string][] = entries.map(
      ([key, value]) => [this.getKey(key), this.serialize(value)]
    );
    await this.adapter.multiSet(serializedEntries);
  }

  /**
   * Create a typed storage accessor for a specific key
   */
  typed<T>(key: string): TypedStorage<T> {
    return {
      get: () => this.get<T>(key),
      set: (value: T) => this.set(key, value),
      remove: () => this.remove(key),
      update: (updater: (current: T | null) => T) => this.update(key, updater),
    };
  }
}
