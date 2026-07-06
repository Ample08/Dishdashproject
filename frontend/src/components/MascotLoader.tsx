import React, {useEffect} from 'react';
import {StyleSheet, View} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import {colors} from '../theme';
import {Mascot} from './Mascot';

/**
 * Mascot loader (Figma dev-note: `mascot_loader_v2.json`).
 * Lottie not exported via MCP — replicated with Reanimated: the mascot
 * "breathes" (scale 1→1.04) with a gentle ±3° tilt on a ~1.4s loop.
 */
type Props = {
  size?: number;
  mascotWidth?: number;
};

export function MascotLoader({size = 142, mascotWidth = 84}: Props) {
  const t = useSharedValue(0);

  useEffect(() => {
    t.value = withRepeat(
      withSequence(
        withTiming(1, {duration: 700, easing: Easing.inOut(Easing.quad)}),
        withTiming(0, {duration: 700, easing: Easing.inOut(Easing.quad)}),
      ),
      -1,
    );
  }, [t]);

  const style = useAnimatedStyle(() => ({
    transform: [
      {scale: 1 + t.value * 0.04},
      {rotate: `${(t.value - 0.5) * 6}deg`},
    ],
  }));

  return (
    <View style={[styles.wrap, {width: size, height: size}]}>
      <Animated.View style={style}>
        <Mascot width={mascotWidth} color={colors.brand.navy} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
