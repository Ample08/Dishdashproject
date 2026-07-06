/**
 * @format
 */

import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import App from './App';
import { name as appName } from './app.json';

// Preload icon fonts so glyphs (e.g. the shisha icon) render on first paint
// instead of briefly showing a "?" while the font streams in over Metro.
Ionicons.loadFont();
MaterialCommunityIcons.loadFont();

AppRegistry.registerComponent(appName, () => App);
