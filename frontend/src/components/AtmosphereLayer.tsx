import React from 'react';
import {StyleSheet, View} from 'react-native';
import Svg, {Circle, Defs, RadialGradient, Stop} from 'react-native-svg';

/**
 * Ambient atmosphere behind the Welcome voucher (Figma 992:671).
 * Three soft colour glows — pistachio, blush, champagne — each a radial gradient
 * that fades to transparent, so they blend into a smooth wash instead of the
 * hard-edged circles a plain blurless <View> produces. (react-native-svg's
 * feGaussianBlur is unreliable, so we fake the blur with the radial fade.)
 */
const BLOBS = [
  {cx: 30, cy: 90, r: 250, color: '#9ED387', op: 0.5}, // pistachio · top-left
  {cx: 382, cy: 178, r: 150, color: '#F4A9A9', op: 0.45}, // blush · top-right
  {cx: 372, cy: 730, r: 240, color: '#EBCA90', op: 0.55}, // champagne · bottom-right
];

export function AtmosphereLayer() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 390 844"
        preserveAspectRatio="xMidYMid slice">
        <Defs>
          {BLOBS.map((b, i) => (
            <RadialGradient
              key={i}
              id={`atmo${i}`}
              cx={b.cx}
              cy={b.cy}
              r={b.r}
              gradientUnits="userSpaceOnUse">
              <Stop offset="0" stopColor={b.color} stopOpacity={b.op} />
              <Stop offset="1" stopColor={b.color} stopOpacity={0} />
            </RadialGradient>
          ))}
        </Defs>
        {BLOBS.map((b, i) => (
          <Circle key={i} cx={b.cx} cy={b.cy} r={b.r} fill={`url(#atmo${i})`} />
        ))}
      </Svg>
    </View>
  );
}
