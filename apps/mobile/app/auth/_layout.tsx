import { Stack } from 'expo-router';
import { useAppStore } from '../../stores/app-store';

export default function AuthCallbackLayout() {
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
      <Stack.Screen name="callback" />
      <Stack.Screen name="reset-password" />
    </Stack>
  );
}
