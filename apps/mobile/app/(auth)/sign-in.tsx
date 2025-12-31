import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, router } from 'expo-router';
import * as Linking from 'expo-linking';
import { useAuth } from '../../contexts/AuthContext';
import { useAppStore } from '../../stores/app-store';
import { Icon } from '../../components/Icon';

export default function SignInScreen() {
  const { signIn, signInWithOAuth, skipAuth, isOfflineMode } = useAuth();
  const darkMode = useAppStore((state) => state.darkMode);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState<
    'google' | 'apple' | null
  >(null);

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter your email and password');
      return;
    }

    setIsLoading(true);
    const { error } = await signIn(email.trim(), password);
    setIsLoading(false);

    if (error) {
      Alert.alert('Sign In Failed', error.message);
    } else {
      router.replace('/(tabs)');
    }
  };

  const handleSkip = () => {
    skipAuth();
    router.replace('/(tabs)');
  };

  const handleOAuthSignIn = async (provider: 'google' | 'apple') => {
    setIsOAuthLoading(provider);
    const redirectUrl = Linking.createURL('auth/callback');
    const { error } = await signInWithOAuth(provider, redirectUrl);
    setIsOAuthLoading(null);

    if (error) {
      Alert.alert('Sign In Failed', error.message);
    }
    // The OAuth flow will redirect back to the app via deep link
  };

  const theme = {
    bg: darkMode ? '#000000' : '#FFFFFF',
    text: darkMode ? '#FFFFFF' : '#000000',
    textSecondary: darkMode ? '#888888' : '#666666',
    inputBg: darkMode ? '#1C1C1E' : '#F5F5F5',
    inputBorder: darkMode ? '#333333' : '#E0E0E0',
    accent: '#007AFF',
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>
              ProcrastinAct
            </Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Sign in to sync your tasks
            </Text>
          </View>

          <View style={styles.form}>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.inputBg,
                  borderColor: theme.inputBorder,
                  color: theme.text,
                },
              ]}
              placeholder="Email"
              placeholderTextColor={theme.textSecondary}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              textContentType="emailAddress"
              accessibilityLabel="Email input"
            />

            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.inputBg,
                  borderColor: theme.inputBorder,
                  color: theme.text,
                },
              ]}
              placeholder="Password"
              placeholderTextColor={theme.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              textContentType="password"
              accessibilityLabel="Password input"
            />

            <Link href="/(auth)/forgot-password" asChild>
              <TouchableOpacity
                style={styles.forgotButton}
                accessibilityLabel="Forgot password"
                accessibilityRole="link"
              >
                <Text style={[styles.forgotText, { color: theme.accent }]}>
                  Forgot password?
                </Text>
              </TouchableOpacity>
            </Link>

            <TouchableOpacity
              style={[styles.signInButton, { backgroundColor: theme.accent }]}
              onPress={handleSignIn}
              disabled={isLoading}
              accessibilityLabel="Sign in button"
              accessibilityRole="button"
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.signInButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            <View style={styles.divider}>
              <View
                style={[
                  styles.dividerLine,
                  { backgroundColor: theme.inputBorder },
                ]}
              />
              <Text
                style={[styles.dividerText, { color: theme.textSecondary }]}
              >
                or
              </Text>
              <View
                style={[
                  styles.dividerLine,
                  { backgroundColor: theme.inputBorder },
                ]}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.oauthButton,
                {
                  backgroundColor: theme.inputBg,
                  borderColor: theme.inputBorder,
                },
              ]}
              onPress={() => handleOAuthSignIn('google')}
              disabled={isOAuthLoading !== null}
              accessibilityLabel="Sign in with Google"
              accessibilityRole="button"
            >
              {isOAuthLoading === 'google' ? (
                <ActivityIndicator color={theme.text} />
              ) : (
                <>
                  <Icon name="logo-google" size={20} color="#DB4437" />
                  <Text style={[styles.oauthButtonText, { color: theme.text }]}>
                    Continue with Google
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {Platform.OS === 'ios' && (
              <TouchableOpacity
                style={[
                  styles.oauthButton,
                  {
                    backgroundColor: darkMode ? '#FFFFFF' : '#000000',
                    borderColor: darkMode ? '#FFFFFF' : '#000000',
                  },
                ]}
                onPress={() => handleOAuthSignIn('apple')}
                disabled={isOAuthLoading !== null}
                accessibilityLabel="Sign in with Apple"
                accessibilityRole="button"
              >
                {isOAuthLoading === 'apple' ? (
                  <ActivityIndicator color={darkMode ? '#000000' : '#FFFFFF'} />
                ) : (
                  <>
                    <Icon
                      name="logo-apple"
                      size={20}
                      color={darkMode ? '#000000' : '#FFFFFF'}
                    />
                    <Text
                      style={[
                        styles.oauthButtonText,
                        { color: darkMode ? '#000000' : '#FFFFFF' },
                      ]}
                    >
                      Continue with Apple
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.textSecondary }]}>
              {"Don't have an account? "}
            </Text>
            <Link href="/(auth)/sign-up" asChild>
              <TouchableOpacity
                accessibilityLabel="Create account"
                accessibilityRole="link"
              >
                <Text style={[styles.linkText, { color: theme.accent }]}>
                  Sign Up
                </Text>
              </TouchableOpacity>
            </Link>
          </View>

          {isOfflineMode && (
            <TouchableOpacity
              style={[styles.skipButton, { borderColor: theme.inputBorder }]}
              onPress={handleSkip}
              accessibilityLabel="Continue without signing in"
              accessibilityRole="button"
            >
              <Text style={[styles.skipText, { color: theme.textSecondary }]}>
                Continue without signing in
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.skipButton, { borderColor: theme.inputBorder }]}
            onPress={handleSkip}
            accessibilityLabel="Use offline mode"
            accessibilityRole="button"
          >
            <Text style={[styles.skipText, { color: theme.textSecondary }]}>
              Use offline mode
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  form: {
    gap: 16,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  forgotButton: {
    alignSelf: 'flex-end',
  },
  forgotText: {
    fontSize: 14,
  },
  signInButton: {
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  signInButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 14,
  },
  oauthButton: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  oauthButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '600',
  },
  skipButton: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  skipText: {
    fontSize: 14,
  },
});
