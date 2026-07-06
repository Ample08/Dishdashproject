import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import Icon from 'react-native-vector-icons/Ionicons';
import type { Tier } from '../../data/loyalty';
import { colors, fontFamily } from '../../theme';

const ACircle = Animated.createAnimatedComponent(Circle);

type Props = {
  size?: number;
  stroke?: number;
  points: number;
  tier: Tier;
  progress: number; // 0–1 within the tier band
  subtitle: string; // 'X pts to Feast' | 'Maximum Flavor Unlocked'
};

/**
 * ProgressRing (Figma ProgressCircle 4838:10) — white track + tier-coloured
 * arc that fills by tier progress, a glowing head dot, a gold coin at the
 * 6-o'clock anchor, and the centre tier/points stack.
 */
export function ProgressRing({
  size = 260,
  stroke = 22,
  points,
  tier,
  progress,
  subtitle,
}: Props) {
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const C = 2 * Math.PI * r;

  const prog = useSharedValue(0);
  useEffect(() => {
    prog.value = withTiming(progress, {
      duration: 1200,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress, prog]);

  // Arc starts at 6 o'clock (rotate +90°) and fills clockwise.
  const arcProps = useAnimatedProps(() => ({
    strokeDashoffset: C * (1 - prog.value),
  }));

  // Glowing head dot follows the arc end.
  const headProps = useAnimatedProps(() => {
    const theta = (Math.PI / 180) * (90 + prog.value * 360);
    return {
      cx: cx + r * Math.cos(theta),
      cy: cy + r * Math.sin(theta),
    };
  });

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        {/* Track */}
        <Circle
          cx={cx}
          cy={cy}
          r={r}
          stroke={colors.brand.white}
          strokeWidth={stroke}
          fill="none"
        />
        {/* Tier arc */}
        <ACircle
          cx={cx}
          cy={cy}
          r={r}
          stroke={tier.color}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={C}
          animatedProps={arcProps}
          transform={`rotate(90 ${cx} ${cy})`}
        />
        {/* Head glow + dot */}
        <ACircle
          animatedProps={headProps}
          r={11}
          fill={tier.color}
          opacity={0.35}
        />
        <ACircle animatedProps={headProps} r={6} fill={colors.brand.white} />
      </Svg>

      {/* Centre text stack */}
      <View style={styles.center} pointerEvents="none">
        <Text style={styles.member}>{tier.name.toUpperCase()} MEMBER</Text>
        <Text style={[styles.points, { color: tier.color }]}>
          {points.toLocaleString()}
        </Text>
        <Text style={styles.unit}>POINTS</Text>
        <View style={styles.divider} />
        <Text style={styles.sub}>{subtitle}</Text>
      </View>

      {/* Gold coin anchor at 6 o'clock */}
      <View style={[styles.coin, { left: cx - 25, top: cy + r - 25 }]}>
        <Icon name="star" size={22} color={colors.brand.navy} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  member: {
    fontFamily: fontFamily.bodySemibold,
    fontSize: 10,
    letterSpacing: 1.4,
    color: colors.brand.white,
  },
  points: {
    fontFamily: fontFamily.bodyBlack,
    fontSize: 48,
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 7,
  },
  unit: {
    fontFamily: fontFamily.bodySemibold,
    fontSize: 9,
    letterSpacing: 1.26,
    color: colors.brand.white,
  },
  divider: {
    width: 32,
    height: 1,
    backgroundColor: colors.brand.white,
    marginVertical: 3,
  },
  sub: {
    fontFamily: fontFamily.bodySemibold,
    fontSize: 11,
    color: colors.brand.white,
  },
  coin: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0b429',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.12)',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
});
