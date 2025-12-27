/**
 * Storage initialization for the mobile app
 * Uses core Storage class with ReactNativeStorageAdapter
 */

import { Storage, STORAGE_KEYS } from '@procrastinact/core';
import { ReactNativeStorageAdapter } from './storage-adapter';

// Initialize storage with React Native adapter
const storageAdapter = new ReactNativeStorageAdapter();
export const storage = new Storage({ adapter: storageAdapter });

// Re-export storage keys for convenience
export { STORAGE_KEYS };

// Zustand persist storage interface with error handling
export const zustandStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      return await storageAdapter.getItem(name);
    } catch (error) {
      if (__DEV__) {
        console.error(`[ZustandStorage] getItem(${name}) failed:`, error);
      }
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      await storageAdapter.setItem(name, value);
    } catch (error) {
      if (__DEV__) {
        console.error(`[ZustandStorage] setItem(${name}) failed:`, error);
      }
      // Silently fail to prevent app crashes
      // Data will be lost but app remains functional
    }
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      await storageAdapter.removeItem(name);
    } catch (error) {
      if (__DEV__) {
        console.error(`[ZustandStorage] removeItem(${name}) failed:`, error);
      }
      // Silently fail for remove operations
    }
  },
};
