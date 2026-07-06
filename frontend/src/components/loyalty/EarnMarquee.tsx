import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import {EARN_MARQUEE} from '../../data/loyalty';
import {colors, fontFamily} from '../../theme';

/**
 * EarnMarquee (Figma 4039:178) — the looping ticker under the loyalty header.
 * Two copies of the same text scroll left seamlessly.
 */
const TEXT = EARN_MARQUEE.join('     ✦     ') + '     ✦     ';

export function EarnMarquee() {
  const [w, setW] = useState(0);
  const x = useSharedValue(0);

  useEffect(() => {
    if (w > 0) {
      x.value = 0;
      x.value = withRepeat(
        withTiming(-w, {duration: w * 28, easing: Easing.linear}),
        -1,
        false,
      );
    }
  }, [w, x]);

  const style = useAnimatedStyle(() => ({transform: [{translateX: x.value}]}));

  return (
    <View style={styles.root} pointerEvents="none">
      <Animated.View style={[styles.row, style]}>
        <Text
          style={styles.text}
          numberOfLines={1}
          onLayout={e => setW(e.nativeEvent.layout.width)}>
          {TEXT}
        </Text>
        <Text style={styles.text} numberOfLines={1}>
          {TEXT}
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {height: 24, overflow: 'hidden', justifyContent: 'center'},
  row: {flexDirection: 'row'},
  text: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: 11,
    color: colors.brand.ivory,
  },
});
