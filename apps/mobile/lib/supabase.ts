/**
 * Supabase initialization for mobile app
 */

import 'react-native-url-polyfill/auto';
import { initSupabase, isSupabaseInitialized } from '@procrastinact/supabase';
import * as SecureStore from 'expo-secure-store';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variables
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Secure storage adapter for auth tokens
const ExpoSecureStoreAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {
      // Ignore errors
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {
      // Ignore errors
    }
  },
};

// Create Supabase client with secure storage
let supabaseClient: SupabaseClient | null = null;

/**
 * Initialize Supabase for the mobile app
 * Call this once at app startup
 */
export function initializeSupabase(): SupabaseClient | null {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn(
      'Supabase credentials not configured. Running in offline mode.'
    );
    return null;
  }

  if (isSupabaseInitialized()) {
    return supabaseClient;
  }

  supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      storage: ExpoSecureStoreAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });

  // Also initialize the shared package client
  initSupabase(SUPABASE_URL, SUPABASE_ANON_KEY);

  return supabaseClient;
}

/**
 * Get the Supabase client
 * Returns null if not initialized (offline mode)
 */
export function getSupabaseClient(): SupabaseClient | null {
  return supabaseClient;
}

/**
 * Check if Supabase is available
 */
export function isSupabaseAvailable(): boolean {
  return supabaseClient !== null;
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  if (!supabaseClient) return false;

  const { data } = await supabaseClient.auth.getSession();
  return data.session !== null;
}

/**
 * Get current user ID
 */
export async function getCurrentUserId(): Promise<string | null> {
  if (!supabaseClient) return null;

  const { data } = await supabaseClient.auth.getUser();
  return data.user?.id ?? null;
}
