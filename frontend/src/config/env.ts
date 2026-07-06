import Config from 'react-native-config';

export const env = {
  apiBaseUrl: Config.API_BASE_URL ?? 'https://api.example.com',
  appEnv: Config.APP_ENV ?? 'development',
};
