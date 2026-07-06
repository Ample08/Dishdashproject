import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import {colors, fontFamily} from '../theme';
import Icon from 'react-native-vector-icons/FontAwesome6';
/** Back chevron used on Auth sub-screens (Figma 679:83). */
export function BackButton({
  onPress,
  style,
}: {
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Go back"
      hitSlop={12}
      style={[styles.button, style]}>
      {/* <Text style={styles.arrow}>←</Text> */}
      <Icon name="arrow-left-long" size={28} color={colors.text.primary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignSelf: 'flex-start',
  },
  arrow: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 24,
    color: colors.text.primary,
  },
});
