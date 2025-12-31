import { Redirect } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useAppStore } from '../stores/app-store';

export default function Index() {
  const { isLoading, isAuthenticated, isOfflineMode } = useAuth();
  const darkMode = useAppStore((state) => state.darkMode);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: darkMode ? '#000000' : '#FFFFFF' },
        ]}
      >
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // If authenticated or in offline mode, go to main app
  if (isAuthenticated || isOfflineMode) {
    return <Redirect href="/(tabs)" />;
  }

  // Otherwise, go to sign in
  return <Redirect href="/(auth)/sign-in" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
