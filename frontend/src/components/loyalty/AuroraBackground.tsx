import React, { useEffect } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, {
  Defs,
  Ellipse,
  LinearGradient,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';
import { loyaltyColors } from '../../data/loyalty';

const AEllipse = Animated.createAnimatedComponent(Ellipse);

/**
 * Aurora background: a static dark-teal base with soft ambient glows, and a
 * single CIRCULAR gradient near the top that gently drifts to the bottom.
 * Only the top circle moves — everything else stays put.
 */
function MovingCircle({
  cx,
  cy,
  r,
  travelY,
  fill,
  op = 0.6,
}: {
  cx: number;
  cy: number;
  r: number;
  travelY: number;
  fill: string;
  op?: number;
}) {
  const t = useSharedValue(0);

  useEffect(() => {
    // Figma motion timing, slowed down for a calmer full-screen drift.
    t.value = withRepeat(
      withSequence(
        withDelay(
          3500,
          withTiming(1, { duration: 5600, easing: Easing.inOut(Easing.quad) }),
        ),
        withDelay(
          3500,
          withTiming(0, { duration: 5600, easing: Easing.inOut(Easing.quad) }),
        ),
      ),
      -1,
      false,
    );
  }, [t]);

  // Only cx/cy/opacity are animated (radius stays static so the SVG circle
  // updates reliably). rx === ry keeps it a perfect circle.
  const props = useAnimatedProps(() => ({
    cx,
    cy: cy + travelY * t.value,
    opacity: op * (0.7 + 0.3 * t.value),
  }));

  return <AEllipse animatedProps={props} rx={r} ry={r} fill={fill} />;
}

export function AuroraBackground() {
  const { width, height } = useWindowDimensions();

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="auroraBase" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={loyaltyColors.bgTop} />
            <Stop offset="1" stopColor={loyaltyColors.bgBottom} />
          </LinearGradient>
          <RadialGradient id="mint" cx="0.5" cy="0.5" r="0.5">
            <Stop offset="0" stopColor={loyaltyColors.auroraMint} stopOpacity="0.85" />
            <Stop offset="1" stopColor={loyaltyColors.auroraMint} stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="jade" cx="0.5" cy="0.5" r="0.5">
            <Stop offset="0" stopColor={loyaltyColors.auroraJade} stopOpacity="0.9" />
            <Stop offset="1" stopColor={loyaltyColors.auroraJade} stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="gold" cx="0.5" cy="0.5" r="0.5">
            <Stop offset="0" stopColor={loyaltyColors.auroraGold} stopOpacity="0.9" />
            <Stop offset="1" stopColor={loyaltyColors.auroraGold} stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {/* Static dark base */}
        <Rect x="0" y="0" width={width} height={height} fill="url(#auroraBase)" />

        {/* Static ambient glows (do not move) */}
        <Ellipse cx={width * 0.5} cy={height * 0.16} rx={300} ry={230} fill="url(#jade)" opacity={0.32} />
        <Ellipse cx={width * 0.5} cy={height * 0.88} rx={280} ry={210} fill="url(#jade)" opacity={0.35} />

        {/* The one moving CIRCULAR gradient near the top */}
        <MovingCircle
          cx={width * 0.5}
          cy={height * 0.08}
          r={190}
          travelY={height * 0.84}
          fill="url(#gold)"
          op={0.7}
        />
      </Svg>
    </View>
  );
}
