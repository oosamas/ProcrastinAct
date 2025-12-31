/**
 * Supabase client configuration
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// These will be set by the app that imports this package
let supabaseUrl: string | null = null;
let supabaseClient: SupabaseClient | null = null;

/**
 * Initialize Supabase client with credentials
 * Must be called before using any Supabase functions
 */
export function initSupabase(url: string, anonKey: string): SupabaseClient {
  supabaseUrl = url;
  supabaseClient = createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  });
  return supabaseClient;
}

/**
 * Get the Supabase client instance
 * Throws if not initialized
 */
export function getSupabase(): SupabaseClient {
  if (!supabaseClient) {
    throw new Error(
      'Supabase client not initialized. Call initSupabase() first.'
    );
  }
  return supabaseClient;
}

/**
 * Check if Supabase is initialized
 */
export function isSupabaseInitialized(): boolean {
  return supabaseClient !== null;
}

/**
 * Get Supabase URL (for auth redirects, etc.)
 */
export function getSupabaseUrl(): string {
  if (!supabaseUrl) {
    throw new Error('Supabase URL not set. Call initSupabase() first.');
  }
  return supabaseUrl;
}
