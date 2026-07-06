import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Ionicons';
import {colors, fontFamily} from '../../theme';

/**
 * TierPerkPill (Figma 4850:70) — champagne pill stating the auto-applied
 * dine-in discount, with a repeating white shimmer sweep.
 */
export function TierPerkPill({label}: {label: string}) {
  const [w, setW] = useState(0);
  const x = useSharedValue(-80);

  useEffect(() => {
    if (w > 0) {
      x.value = withRepeat(
        withDelay(
          1400,
          withTiming(w + 80, {duration: 900, easing: Easing.inOut(Easing.quad)}),
        ),
        -1,
        false,
      );
    }
  }, [w, x]);

  const shimmer = useAnimatedStyle(() => ({transform: [{translateX: x.value}, {rotate: '18deg'}]}));

  return (
    <View
      style={styles.pill}
      onLayout={e => setW(e.nativeEvent.layout.width)}>
      <Icon name="pricetag-outline" size={15} color={colors.brand.navy} />
      <Text style={styles.text}>{label}</Text>
      <Animated.View style={[styles.shimmer, shimmer]} pointerEvents="none" />
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.brand.champagne,
    borderRadius: 999,
    paddingLeft: 14,
    paddingRight: 16,
    paddingVertical: 8,
    overflow: 'hidden',
  },
  text: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 12,
    color: colors.brand.navy,
  },
  shimmer: {
    position: 'absolute',
    top: -20,
    left: 0,
    width: 40,
    height: 80,
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
});
