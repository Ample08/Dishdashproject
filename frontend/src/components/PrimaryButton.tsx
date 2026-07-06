import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import {colors, fontFamily} from '../theme';
import {Shimmer} from './Shimmer';

/**
 * Button / Primary (Figma 2651:886 / instance 2664:1641)
 * Pistachio-500 pill, navy label, warm drop shadow. The one primary action
 * per screen. States: default, loading, disabled.
 */
type Props = {
  label: string;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function PrimaryButton({label, onPress, loading, disabled, style}: Props) {
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
      {!inactive ? <Shimmer /> : null}
      {loading ? (
        <ActivityIndicator color={colors.text.onButton} />
      ) : (
        <View style={styles.inner}>
          <Text style={styles.label}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 45,
    width: '100%',
    borderRadius: 999,
    paddingHorizontal: 24,
    paddingVertical: 14,
    backgroundColor: colors.brand.pistachio,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    // drop-shadow 0px 6px 7px rgba(107,77,26,0.22)
    shadowColor: 'rgba(107,77,26,1)',
    shadowOpacity: 0.22,
    shadowRadius: 7,
    shadowOffset: {width: 0, height: 6},
    elevation: 4,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  label: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 14,
    color: colors.text.onButton,
  },
  pressed: {
    opacity: 0.9,
  },
  disabled: {
    opacity: 0.5,
  },
});
