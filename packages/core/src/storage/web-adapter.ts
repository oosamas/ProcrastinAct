/**
 * Web localStorage adapter
 */

import type { StorageAdapter } from './types';

export class WebStorageAdapter implements StorageAdapter {
  private storage: globalThis.Storage;

  constructor(storage: globalThis.Storage = localStorage) {
    this.storage = storage;
  }

  async getItem(key: string): Promise<string | null> {
    return this.storage.getItem(key);
  }

  async setItem(key: string, value: string): Promise<void> {
    this.storage.setItem(key, value);
  }

  async removeItem(key: string): Promise<void> {
    this.storage.removeItem(key);
  }

  async getAllKeys(): Promise<string[]> {
    const keys: string[] = [];
    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i);
      if (key !== null) {
        keys.push(key);
      }
    }
    return keys;
  }

  async clear(): Promise<void> {
    this.storage.clear();
  }

  async multiGet(keys: string[]): Promise<[string, string | null][]> {
    return keys.map((key) => [key, this.storage.getItem(key)]);
  }

  async multiSet(entries: [string, string][]): Promise<void> {
    entries.forEach(([key, value]) => {
      this.storage.setItem(key, value);
    });
  }

  async multiRemove(keys: string[]): Promise<void> {
    keys.forEach((key) => {
      this.storage.removeItem(key);
    });
  }
}
