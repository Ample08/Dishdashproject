import Config from 'react-native-config';
import {Platform} from 'react-native';

/**
 * Android emulator reaches the host machine's localhost via 10.0.2.2,
 * iOS simulator can use localhost directly. Override with API_BASE_URL in .env
 * (e.g. your LAN IP http://192.168.x.x:3000 when running on a real device).
 */
const defaultBaseUrl =
  Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';

export const env = {
  apiBaseUrl: Config.API_BASE_URL ?? defaultBaseUrl,
  // Must match the backend JWT_SECRET (used as the `api-key` header).
  apiKey: Config.API_KEY ?? 'dishdash_jwt_secret_key_2026_secure',
  appEnv: Config.APP_ENV ?? 'development',
};
