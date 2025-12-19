import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'ProcrastinAct',
  slug: 'procrastinact',
  extra: {
    ...config.extra,
    apiUrl: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000',
    environment: process.env.EXPO_PUBLIC_ENVIRONMENT ?? 'development',
  },
});
