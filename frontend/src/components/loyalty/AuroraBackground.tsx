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
 * Aurora background (Figma BG Aurora set 4850:21, States Drift1/2/3).
 * Dark teal base gradient with slow-drifting blurred green blobs.
 */
function Blob({
  cx,
  cy,
  rx,
  ry,
  fill,
  dx,
  dy,
  op = 0.5,
}: {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  fill: string;
  dx: number;
  dy: number;
  op?: number;
}) {
  const t = useSharedValue(0);

  useEffect(() => {
    t.value = withRepeat(
      withSequence(
        withDelay(
          3500,
          withTiming(1, { duration: 2800, easing: Easing.inOut(Easing.quad) }),
        ),
        withDelay(
          3500,
          withTiming(0, { duration: 2800, easing: Easing.inOut(Easing.quad) }),
        ),
      ),
      -1,
      false,
    );
  }, [t]);

  const props = useAnimatedProps(() => ({
    cx: cx + dx * t.value,
    cy: cy + dy * t.value,
    opacity: op * (0.78 + 0.22 * t.value),
  }));

  return <AEllipse animatedProps={props} rx={rx} ry={ry} fill={fill} />;
}

export function AuroraBackground() {
  const { width, height } = useWindowDimensions();

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="base" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={loyaltyColors.bgTop} />
            <Stop offset="1" stopColor={loyaltyColors.bgBottom} />
          </LinearGradient>
          <RadialGradient id="mint" cx="0.5" cy="0.5" r="0.5">
            <Stop
              offset="0"
              stopColor={loyaltyColors.auroraMint}
              stopOpacity="0.8"
            />
            <Stop
              offset="1"
              stopColor={loyaltyColors.auroraMint}
              stopOpacity="0"
            />
          </RadialGradient>
          <RadialGradient id="jade" cx="0.5" cy="0.5" r="0.5">
            <Stop
              offset="0"
              stopColor={loyaltyColors.auroraJade}
              stopOpacity="0.9"
            />
            <Stop
              offset="1"
              stopColor={loyaltyColors.auroraJade}
              stopOpacity="0"
            />
          </RadialGradient>
          <RadialGradient id="gold" cx="0.5" cy="0.5" r="0.5">
            <Stop
              offset="0"
              stopColor={loyaltyColors.auroraGold}
              stopOpacity="0.9"
            />
            <Stop
              offset="1"
              stopColor={loyaltyColors.auroraGold}
              stopOpacity="0"
            />
          </RadialGradient>
        </Defs>

        <Rect x="0" y="0" width={width} height={height} fill="url(#base)" />

        <Blob
          cx={width * 0.5}
          cy={20}
          rx={280}
          ry={200}
          fill="url(#mint)"
          op={0.5}
          dx={-30}
          dy={20}
        />
        <Blob
          cx={width * 0.5}
          cy={70}
          rx={175}
          ry={160}
          fill="url(#gold)"
          op={0.7}
          dx={34}
          dy={-20}
        />
        <Blob
          cx={width * 0.51}
          cy={120}
          rx={360}
          ry={80}
          fill="url(#jade)"
          op={0.45}
          dx={22}
          dy={14}
        />
        <Blob
          cx={width * 0.59}
          cy={240}
          rx={200}
          ry={200}
          fill="url(#jade)"
          op={0.35}
          dx={36}
          dy={30}
        />
        <Blob
          cx={width * 0.5}
          cy={height * 0.86}
          rx={240}
          ry={150}
          fill="url(#jade)"
          op={0.5}
          dx={-24}
          dy={-20}
        />
      </Svg>
    </View>
  );
}
