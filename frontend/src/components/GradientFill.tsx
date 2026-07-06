import React from 'react';
import {StyleSheet} from 'react-native';
import Svg, {Defs, LinearGradient, RadialGradient, Rect, Stop} from 'react-native-svg';

type Point = {x: number; y: number};

type Props = {
  colors: string[];
  /** Gradient start (0..1 of the box). Default left. */
  start?: Point;
  /** Gradient end (0..1 of the box). Default right. */
  end?: Point;
  /** Optional explicit stop offsets (0..1). Defaults to even distribution. */
  locations?: number[];
  /** Render a centred radial gradient instead of a linear one. */
  radial?: boolean;
};

/**
 * Absolute-fill gradient backing, rendered with react-native-svg (no extra
 * native dependency). Place inside a parent with the desired borderRadius +
 * overflow:'hidden' to get rounded gradients. Pass `radial` for a centre-out
 * fill (first colour at centre → last colour at the edges).
 */
export function GradientFill({
  colors,
  start = {x: 0, y: 0},
  end = {x: 1, y: 0},
  locations,
  radial,
}: Props) {
  const stops = colors.map((c, i) => (
    <Stop
      key={i}
      offset={locations ? locations[i] : i / (colors.length - 1)}
      stopColor={c}
    />
  ));

  return (
    <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
      <Defs>
        {radial ? (
          <RadialGradient id="grad" cx="50%" cy="50%" r="50%">
            {stops}
          </RadialGradient>
        ) : (
          <LinearGradient id="grad" x1={start.x} y1={start.y} x2={end.x} y2={end.y}>
            {stops}
          </LinearGradient>
        )}
      </Defs>
      <Rect x="0" y="0" width="100%" height="100%" fill="url(#grad)" />
    </Svg>
  );
}
