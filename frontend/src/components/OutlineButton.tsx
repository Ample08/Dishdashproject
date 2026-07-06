import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import {colors, fontFamily} from '../theme';

/**
 * Generic bordered (ghost) button. Used for the biometric action (697:39,
 * radius 12) and other secondary outline CTAs.
 */
type Props = {
  label: string;
  onPress?: () => void;
  radius?: number;
  borderWidth?: number;
  borderColor?: string;
  fontSize?: number;
  style?: StyleProp<ViewStyle>;
};

export function OutlineButton({
  label,
  onPress,
  radius = 12,
  borderWidth = 1,
  borderColor = colors.border.subtle,
  fontSize = 14,
  style,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({pressed}) => [
        styles.button,
        {borderRadius: radius, borderWidth, borderColor},
        pressed && styles.pressed,
        style,
      ]}>
      <Text style={[styles.label, {fontSize}]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: fontFamily.bodyBold,
    color: colors.text.primary,
  },
  pressed: {
    opacity: 0.7,
  },
});
