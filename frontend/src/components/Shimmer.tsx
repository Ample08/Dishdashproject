import React, {useEffect, useRef} from 'react';
import {Animated, Easing, StyleSheet, View} from 'react-native';

/**
 * Narrow glossy sweep for CTA buttons.
 * The button keeps its own background color; this only adds a moving highlight.
 */
export function Shimmer({duration = 1800}: {duration?: number}) {
  const x = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // const loop = Animated.loop(
    //   Animated.sequence([
    //     Animated.timing(x, {
    //       toValue: 1,
    //       duration,
    //       easing: Easing.inOut(Easing.cubic),
    //       useNativeDriver: true,
    //     }),
    //     Animated.delay(900),
    //     Animated.timing(x, {
    //       toValue: 0,
    //       duration: 0,
    //       useNativeDriver: true,
    //     }),
    //   ]),
    // );
const loop = Animated.loop(
  Animated.sequence([
    // Left -> Right
    Animated.timing(x, {
      toValue: 1,
      duration,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: true,
    }),

    Animated.delay(300),

    // Right -> Left
    Animated.timing(x, {
      toValue: 0,
      duration,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: true,
    }),

    Animated.delay(300),
  ]),
);
    loop.start();
    return () => loop.stop();
  }, [duration, x]);

  // const translateX = x.interpolate({
  //   inputRange: [0, 1],
  //   outputRange: [-130, 390],
  // });
const translateX = x.interpolate({
  inputRange: [0, 1],
  outputRange: [-130, 390],
});
  return (
    <View pointerEvents="none" style={styles.wrap}>
      <Animated.View
        style={[
          styles.sweep,
          {transform: [{translateX}, {rotate: '16deg'}]},
        ]}>
        <View style={styles.edge} />
        <View style={styles.core} />
        <View style={styles.edge} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 1,
  },
  sweep: {
    position: 'absolute',
    top: -46,
    left: 0,
    width: 96,
    height: 148,
    flexDirection: 'row',
    opacity: 0.42,
  },
  edge: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  core: {
    width: 24,
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
});
