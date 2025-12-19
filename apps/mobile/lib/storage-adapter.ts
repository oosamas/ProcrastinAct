/**
 * React Native storage adapter using AsyncStorage
 * Can be replaced with MMKV for better performance if needed
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { StorageAdapter } from '@procrastinact/core';

export class ReactNativeStorageAdapter implements StorageAdapter {
  async getItem(key: string): Promise<string | null> {
    return AsyncStorage.getItem(key);
  }

  async setItem(key: string, value: string): Promise<void> {
    await AsyncStorage.setItem(key, value);
  }

  async removeItem(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  }

  async getAllKeys(): Promise<string[]> {
    const keys = await AsyncStorage.getAllKeys();
    return [...keys];
  }

  async clear(): Promise<void> {
    await AsyncStorage.clear();
  }

  async multiGet(keys: string[]): Promise<[string, string | null][]> {
    const results = await AsyncStorage.multiGet(keys);
    return results.map(([key, value]) => [key, value ?? null]);
  }

  async multiSet(entries: [string, string][]): Promise<void> {
    await AsyncStorage.multiSet(entries);
  }

  async multiRemove(keys: string[]): Promise<void> {
    await AsyncStorage.multiRemove(keys);
  }
}
