import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {colors, fontFamily} from '../theme';
import {GradientFill} from './GradientFill';
import Icon from 'react-native-vector-icons/Ionicons';
import {Shimmer} from './Shimmer';

/**
 * GoldenOrderButton (Figma 1304:8 / 1304:12 — "ORDER NOW" Idle→Shine variant).
 * Gold gradient pill with a white shine band that sweeps left→right on a loop,
 * recreating the Figma component's "Shine" state as a live animation.
 */
export function GoldenOrderButton({
  onPress,
  height = 36,
  label = 'ORDER NOW',
}: {
  onPress?: () => void;
  height?: number;
  label?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={[styles.btn, {height}]}>
      <GradientFill colors={['#d4a866', '#ebc98f', '#c7995c']} locations={[0, 0.5, 1]} />
      <Shimmer />

      <View style={styles.labelRow}>
  <Text style={styles.label}>{label}</Text>
  <Icon name="arrow-forward" size={13} color={colors.brand.navy} />
</View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: '100%',
    borderRadius: 99,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelRow: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 5,
  zIndex: 2,
},
  label: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 12,
    letterSpacing: 0.96,
    color: colors.brand.navy,
  },
});
