import React, { useEffect, useMemo } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

/**
 * One-shot confetti rain (Figma "26 · Order Success / Enter" 6522:22021).
 * Chips spread across the full width, start just above the top edge and fall
 * straight down to past the bottom once, then fade out and stay hidden. Pure
 * Reanimated, no asset. Palette + shape mix mirror Figma: pistachio, karaz red,
 * champagne, teal and orange chips as squares, tall strips and wide strips with
 * 1–2px rounded corners, each spinning as it falls.
 */
const PIECE_COLORS = [
  '#9ed387', // brand pistachio-500
  '#bc1e3c', // brand karaz-500
  '#ffefcb', // brand champagne-500
  '#1b4a55', // brand teal-500
  '#e26949', // brand orange-500
];

type PieceCfg = {
  color: string;
  width: number;
  height: number;
  radius: number;
  startX: number;
  drift: number;
  delay: number;
  duration: number;
  rotate: number;
  startY: number;
};

function Piece({
  index,
  width,
  height,
  speed = 1,
  startBand = 36,
  driftRange = 160,
}: {
  index: number;
  width: number;
  height: number;
  speed?: number;
  startBand?: number;
  driftRange?: number;
}) {
  const p = useSharedValue(0);

  const cfg = useMemo<PieceCfg>(() => {
    // Deterministic per-index jitter (stable across renders).
    const rand = (s: number) => {
      const x = Math.sin((index + 1) * s) * 10000;
      return x - Math.floor(x);
    };

    // Three chip silhouettes, matching the Figma spread of aspect ratios.
    const kind = Math.floor(rand(1.1) * 3);
    let w: number;
    let h: number;
    if (kind === 0) {
      // square-ish chip
      w = 6 + rand(2.2) * 12;
      h = w * (0.85 + rand(3.3) * 0.3);
    } else if (kind === 1) {
      // tall strip
      w = 3 + rand(4.4) * 4;
      h = 12 + rand(5.5) * 18;
    } else {
      // wide strip
      w = 12 + rand(6.6) * 16;
      h = 3 + rand(7.7) * 5;
    }

    return {
      color: PIECE_COLORS[index % PIECE_COLORS.length],
      width: w,
      height: h,
      radius: rand(8.8) > 0.5 ? 2 : 1,
      startX: rand(12.9898) * width,
      drift: (rand(78.233) - 0.5) * driftRange,
      delay: rand(3.7) * 45 * speed,
      duration: (950 + rand(9.1) * 450) * speed,
      rotate: (rand(5.5) > 0.5 ? 1 : -1) * (360 + rand(2.3) * 720),
      // Start near the top edge so the burst is visible immediately.
      startY: rand(6.1) * startBand,
    };
  }, [driftRange, index, speed, startBand, width]);

  useEffect(() => {
    // Fall from top to bottom once, then fade out and stay hidden.
    p.value = withDelay(
      cfg.delay,
      withTiming(1, { duration: cfg.duration, easing: Easing.linear }),
    );
  }, [p, cfg]);

  const style = useAnimatedStyle(() => {
    const travel = height + 180 - cfg.startY;
    return {
      width: cfg.width,
      height: cfg.height,
      borderRadius: cfg.radius,
      backgroundColor: cfg.color,
      transform: [
        { translateX: cfg.startX + cfg.drift * p.value },
        { translateY: cfg.startY + p.value * travel },
        { rotate: `${cfg.rotate * p.value}deg` },
      ],
      opacity: p.value > 0.96 ? (1 - p.value) / 0.04 : 1,
    };
  });

  return <Animated.View style={[styles.piece, style]} />;
}

export function Confetti({
  count = 60,
  speed = 1,
  startBand = 36,
  driftRange = 160,
}: {
  count?: number;
  speed?: number;
  startBand?: number;
  driftRange?: number;
}) {
  const { width, height } = useWindowDimensions();
  return (
    <View pointerEvents="none" style={styles.layer}>
      {Array.from({ length: count }).map((_, i) => (
        <Piece
          key={i}
          index={i}
          width={width}
          height={height}
          speed={speed}
          startBand={startBand}
          driftRange={driftRange}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 20,
    elevation: 20,
  },
  piece: {
    position: 'absolute',
  },
});
