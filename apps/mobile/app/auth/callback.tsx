/**
 * Auth Callback Handler
 * Handles deep links for OAuth, email verification, and password reset
 */

import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { router, useLocalSearchParams, Href } from 'expo-router';
import * as Linking from 'expo-linking';
import { getSupabaseClient } from '../../lib/supabase';
import { useAppStore } from '../../stores/app-store';

export default function AuthCallback() {
  const darkMode = useAppStore((state) => state.darkMode);
  const params = useLocalSearchParams();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>(
    'processing'
  );
  const [message, setMessage] = useState('Processing...');

  useEffect(() => {
    handleCallback();
  }, []);

  const handleCallback = async () => {
    try {
      const client = getSupabaseClient();
      if (!client) {
        setStatus('error');
        setMessage('Unable to connect. Please try again.');
        return;
      }

      // Get the full URL to extract tokens
      const url = await Linking.getInitialURL();

      if (url) {
        // Parse URL for tokens (Supabase sends access_token and refresh_token in fragment)
        const parsedUrl = Linking.parse(url);
        const fragment = url.split('#')[1];

        if (fragment) {
          const fragmentParams = new URLSearchParams(fragment);
          const accessToken = fragmentParams.get('access_token');
          const refreshToken = fragmentParams.get('refresh_token');
          const type = fragmentParams.get('type');

          if (accessToken && refreshToken) {
            // Set the session with the tokens
            const { error } = await client.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (error) {
              setStatus('error');
              setMessage(error.message);
              setTimeout(() => router.replace('/(auth)/sign-in'), 2000);
              return;
            }

            // Handle different auth types
            if (type === 'recovery') {
              // Password reset - redirect to reset password screen
              setStatus('success');
              setMessage('Redirecting to reset password...');
              setTimeout(
                () => router.replace('/auth/reset-password' as Href),
                1000
              );
              return;
            }

            // Email verification or OAuth success
            setStatus('success');
            setMessage('Authentication successful!');
            setTimeout(() => router.replace('/(tabs)'), 1000);
            return;
          }
        }

        // Check for error in query params
        const errorDescription = parsedUrl.queryParams?.error_description;
        if (errorDescription) {
          setStatus('error');
          setMessage(String(errorDescription));
          setTimeout(() => router.replace('/(auth)/sign-in'), 2000);
          return;
        }
      }

      // Check if we have an active session from OAuth
      const {
        data: { session },
      } = await client.auth.getSession();
      if (session) {
        setStatus('success');
        setMessage('Authentication successful!');
        setTimeout(() => router.replace('/(tabs)'), 1000);
        return;
      }

      // No valid tokens or session found
      setStatus('error');
      setMessage('Authentication failed. Please try again.');
      setTimeout(() => router.replace('/(auth)/sign-in'), 2000);
    } catch (error) {
      setStatus('error');
      setMessage('An error occurred. Please try again.');
      setTimeout(() => router.replace('/(auth)/sign-in'), 2000);
    }
  };

  const theme = {
    bg: darkMode ? '#000000' : '#FFFFFF',
    text: darkMode ? '#FFFFFF' : '#000000',
    textSecondary: darkMode ? '#888888' : '#666666',
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      {status === 'processing' && (
        <>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={[styles.message, { color: theme.textSecondary }]}>
            {message}
          </Text>
        </>
      )}
      {status === 'success' && (
        <>
          <Text style={styles.icon}>✓</Text>
          <Text style={[styles.message, { color: '#22c55e' }]}>{message}</Text>
        </>
      )}
      {status === 'error' && (
        <>
          <Text style={styles.icon}>✗</Text>
          <Text style={[styles.message, { color: '#ef4444' }]}>{message}</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
  },
});
