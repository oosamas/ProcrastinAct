/**
 * Auth Context - Manages authentication state for the mobile app
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import type { User, Session, AuthError } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import { getSupabaseClient, initializeSupabase } from '../lib/supabase';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isOfflineMode: boolean;
}

interface AuthContextType extends AuthState {
  signIn: (
    email: string,
    password: string
  ) => Promise<{ error: AuthError | null }>;
  signUp: (
    email: string,
    password: string,
    displayName?: string
  ) => Promise<{ error: AuthError | null }>;
  signInWithOAuth: (
    provider: 'google' | 'apple',
    redirectTo?: string
  ) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  skipAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    isAuthenticated: false,
    isOfflineMode: false,
  });

  // Initialize Supabase and check auth state on mount
  useEffect(() => {
    const init = async () => {
      const client = initializeSupabase();

      // If no client, we're in offline mode
      if (!client) {
        setState({
          user: null,
          session: null,
          isLoading: false,
          isAuthenticated: false,
          isOfflineMode: true,
        });
        return;
      }

      // Get current session
      const {
        data: { session },
      } = await client.auth.getSession();

      setState({
        user: session?.user ?? null,
        session,
        isLoading: false,
        isAuthenticated: !!session,
        isOfflineMode: false,
      });

      // Listen for auth changes
      const {
        data: { subscription },
      } = client.auth.onAuthStateChange((_event, session) => {
        setState((prev) => ({
          ...prev,
          user: session?.user ?? null,
          session,
          isAuthenticated: !!session,
        }));
      });

      return () => {
        subscription.unsubscribe();
      };
    };

    init();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const client = getSupabaseClient();
    if (!client) {
      return {
        error: {
          message: 'Supabase not available',
          name: 'offline',
        } as AuthError,
      };
    }

    const { error } = await client.auth.signInWithPassword({
      email,
      password,
    });

    return { error };
  }, []);

  const signUp = useCallback(
    async (email: string, password: string, displayName?: string) => {
      const client = getSupabaseClient();
      if (!client) {
        return {
          error: {
            message: 'Supabase not available',
            name: 'offline',
          } as AuthError,
        };
      }

      const { error } = await client.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName || email.split('@')[0],
          },
          emailRedirectTo: Linking.createURL('auth/callback'),
        },
      });

      return { error };
    },
    []
  );

  const signInWithOAuth = useCallback(
    async (provider: 'google' | 'apple', redirectTo?: string) => {
      const client = getSupabaseClient();
      if (!client) {
        return {
          error: {
            message: 'Supabase not available',
            name: 'offline',
          } as AuthError,
        };
      }

      const { error } = await client.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectTo || Linking.createURL('auth/callback'),
          skipBrowserRedirect: false,
        },
      });

      return { error };
    },
    []
  );

  const signOut = useCallback(async () => {
    const client = getSupabaseClient();
    if (!client) {
      return {
        error: {
          message: 'Supabase not available',
          name: 'offline',
        } as AuthError,
      };
    }

    const { error } = await client.auth.signOut();
    return { error };
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    const client = getSupabaseClient();
    if (!client) {
      return {
        error: {
          message: 'Supabase not available',
          name: 'offline',
        } as AuthError,
      };
    }

    const { error } = await client.auth.resetPasswordForEmail(email, {
      redirectTo: Linking.createURL('auth/callback'),
    });
    return { error };
  }, []);

  const skipAuth = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isOfflineMode: true,
      isLoading: false,
    }));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signIn,
        signUp,
        signInWithOAuth,
        signOut,
        resetPassword,
        skipAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
