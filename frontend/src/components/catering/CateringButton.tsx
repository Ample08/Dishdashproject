import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import {Shimmer} from '../Shimmer';
import {colors, fontFamily} from '../../theme';

/**
 * Primary CTA for the catering flow:
 * pistachio pill, navy label, shadow, plus diagonal shimmer sweep.
 */
export function CateringButton({
  label,
  onPress,
  disabled,
  loading,
  shimmer = true,
  style,
}: {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  shimmer?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const inactive = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityState={{disabled: inactive, busy: loading}}
      style={({pressed}) => [
        styles.button,
        inactive && styles.disabled,
        pressed && !inactive && styles.pressed,
        style,
      ]}>
      {shimmer && !inactive ? <Shimmer /> : null}

      {loading ? (
        <ActivityIndicator color={colors.brand.navy} style={styles.content} />
      ) : (
        <Text style={styles.label}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 45,
    width: '100%',
    borderRadius: 999,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: colors.brand.pistachio,
    shadowColor: 'rgba(107,77,26,1)',
    shadowOpacity: 0.22,
    shadowRadius: 7,
    shadowOffset: {width: 0, height: 6},
    elevation: 4,
  },
  content: {
    zIndex: 2,
  },
  label: {
    zIndex: 2,
    fontFamily: fontFamily.bodyBold,
    fontSize: 16,
    color: colors.brand.navy,
  },
  pressed: {
    opacity: 0.9,
  },
  disabled: {
    opacity: 0.5,
  },
});