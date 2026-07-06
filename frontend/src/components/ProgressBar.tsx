import React, {useEffect} from 'react';
import {StyleSheet, View, type StyleProp, type ViewStyle} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {colors} from '../theme';

/**
 * Thin progress bar (Figma 847:104/105). Track #e5d6c6, fill pistachio.
 * The fill animates in to its target on mount.
 */
type Props = {
  /** 0..1 */
  progress: number;
  style?: StyleProp<ViewStyle>;
  /** Fill colour (defaults to pistachio). */
  color?: string;
  /** Track colour (defaults to the warm #e5d6c6). */
  trackColor?: string;
};

export function ProgressBar({progress, style, color, trackColor}: Props) {
  const value = useSharedValue(0);

  useEffect(() => {
    value.value = withTiming(Math.max(0, Math.min(1, progress)), {
      duration: 600,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress, value]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${value.value * 100}%`,
  }));

  return (
    <View style={[styles.track, trackColor ? {backgroundColor: trackColor} : null, style]}>
      <Animated.View
        style={[styles.fill, color ? {backgroundColor: color} : null, fillStyle]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 4,
    borderRadius: 2,
    backgroundColor: '#e5d6c6',
    overflow: 'hidden',
  },
  fill: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.brand.pistachio,
  },
});
