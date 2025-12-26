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

// Zustand persist storage interface
export const zustandStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return storageAdapter.getItem(name);
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await storageAdapter.setItem(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await storageAdapter.removeItem(name);
  },
};
