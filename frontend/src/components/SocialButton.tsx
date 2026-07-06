import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {colors, fontFamily} from '../theme';

/**
 * White card auth button with a leading brand glyph (Figma "Continue with
 * Google / Apple", 697:28 / 697:35). White bg, subtle warm border, radius 14.
 */
type Props = {
  label: string;
  icon: React.ReactNode;
  onPress?: () => void;
};

export function SocialButton({label, icon, onPress}: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({pressed}) => [styles.button, pressed && styles.pressed]}>
      <View style={styles.icon}>{icon}</View>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    backgroundColor: colors.surface.elevated,
  },
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 15,
    color: colors.text.primary,
  },
  pressed: {
    opacity: 0.85,
  },
});
