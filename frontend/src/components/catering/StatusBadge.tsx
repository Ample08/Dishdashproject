import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {colors, fontFamily} from '../../theme';
import type {InquiryStatus} from '../../data/catering';

/**
 * Inquiry status pill (Figma UA5 6522:27441). Champagne "Awaiting Response"
 * with a navy dot, pale-pistachio "Response Received" with a green dot.
 */
export function StatusBadge({status}: {status: InquiryStatus}) {
  const awaiting = status === 'awaiting';
  return (
    <View style={[styles.pill, awaiting ? styles.amber : styles.green]}>
      <View style={[styles.dot, awaiting ? styles.dotAmber : styles.dotGreen]} />
      <Text style={styles.label}>
        {awaiting ? 'Awaiting Response' : 'Response Received'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 20,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  amber: {backgroundColor: colors.brand.champagne},
  green: {backgroundColor: 'rgba(158,211,135,0.25)'},
  dot: {width: 6, height: 6, borderRadius: 3},
  dotAmber: {backgroundColor: '#e0a83c'},
  dotGreen: {backgroundColor: colors.brand.pistachio},
  label: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 10,
    letterSpacing: 0.4,
    color: colors.text.primary,
  },
});
