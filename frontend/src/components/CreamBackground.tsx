import React from 'react';
import {StyleSheet} from 'react-native';
import Svg, {Defs, RadialGradient, Rect, Stop} from 'react-native-svg';

/**
 * Radial cream background used across the Auth flow (#fff8f2 → #f9f0ea).
 * `spread` controls the radial radius as a fraction of the screen — Sign In
 * uses a tighter radial (≈0.42w / 0.36h) than the Welcome screen.
 */
type Props = {
  width: number;
  height: number;
  cx?: number;
  cy?: number;
  rx?: number;
  ry?: number;
};

export function CreamBackground({width, height, cx, cy, rx, ry}: Props) {
  return (
    <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
      <Defs>
        <RadialGradient
          id="cream"
          cx={cx ?? width / 2}
          cy={cy ?? height * 0.5}
          rx={rx ?? width * 0.42}
          ry={ry ?? height * 0.36}
          gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#fff8f2" />
          <Stop offset="1" stopColor="#f9f0ea" />
        </RadialGradient>
      </Defs>
      <Rect x="0" y="0" width="100%" height="100%" fill="url(#cream)" />
    </Svg>
  );
}
