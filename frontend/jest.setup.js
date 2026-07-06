require('react-native-gesture-handler/jestSetup');

jest.mock('react-native-reanimated', () =>
  require('react-native-reanimated/mock'),
);

jest.mock('react-native-config', () => ({
  API_BASE_URL: 'https://api.example.com',
  APP_ENV: 'test',
}));

jest.mock('react-native-permissions', () => ({
  PERMISSIONS: {
    IOS: {CAMERA: 'ios.permission.CAMERA'},
    ANDROID: {CAMERA: 'android.permission.CAMERA'},
  },
  RESULTS: {
    GRANTED: 'granted',
    DENIED: 'denied',
  },
  check: jest.fn(async () => 'denied'),
  request: jest.fn(async () => 'granted'),
}));

jest.mock('react-native-fast-image', () => 'FastImage');
jest.mock('react-native-webview', () => ({
  WebView: 'WebView',
}));
jest.mock('lottie-react-native', () => 'LottieView');
