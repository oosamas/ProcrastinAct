import { Stack } from 'expo-router';
import { useAppStore } from '../../stores/app-store';

export default function AuthLayout() {
  const darkMode = useAppStore((state) => state.darkMode);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: darkMode ? '#000000' : '#FFFFFF',
        },
      }}
    >
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
      <Stack.Screen name="forgot-password" />
    </Stack>
  );
}
