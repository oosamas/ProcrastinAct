/**
 * React Native storage adapter using AsyncStorage
 * Can be replaced with MMKV for better performance if needed
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { StorageAdapter } from '@procrastinact/core';

/**
 * Log storage errors in development
 */
function logStorageError(operation: string, error: unknown): void {
  if (__DEV__) {
    console.error(`[Storage] ${operation} failed:`, error);
  }
}

export class ReactNativeStorageAdapter implements StorageAdapter {
  async getItem(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      logStorageError(`getItem(${key})`, error);
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      logStorageError(`setItem(${key})`, error);
      // Re-throw to let caller know the operation failed
      throw error;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      logStorageError(`removeItem(${key})`, error);
      // Silently fail for remove operations - item may already be gone
    }
  }

  async getAllKeys(): Promise<string[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      return [...keys];
    } catch (error) {
      logStorageError('getAllKeys', error);
      return [];
    }
  }

  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      logStorageError('clear', error);
      throw error;
    }
  }

  async multiGet(keys: string[]): Promise<[string, string | null][]> {
    try {
      const results = await AsyncStorage.multiGet(keys);
      return results.map(([key, value]) => [key, value ?? null]);
    } catch (error) {
      logStorageError('multiGet', error);
      // Return empty results for failed keys
      return keys.map((key) => [key, null]);
    }
  }

  async multiSet(entries: [string, string][]): Promise<void> {
    try {
      await AsyncStorage.multiSet(entries);
    } catch (error) {
      logStorageError('multiSet', error);
      throw error;
    }
  }

  async multiRemove(keys: string[]): Promise<void> {
    try {
      await AsyncStorage.multiRemove(keys);
    } catch (error) {
      logStorageError('multiRemove', error);
      // Silently fail for remove operations
    }
  }
}
