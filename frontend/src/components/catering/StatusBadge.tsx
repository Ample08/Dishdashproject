import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {colors, fontFamily} from '../../theme';
import {INQUIRY_STATUS_META, type InquiryStatus} from '../../data/catering';

/**
 * Inquiry status pill (Figma UA5 6522:27441) — colour + label driven by the
 * inquiry's workflow status (New → Contacted → Quoted → Confirmed → …).
 */
export function StatusBadge({status}: {status: InquiryStatus}) {
  const meta = INQUIRY_STATUS_META[status] ?? INQUIRY_STATUS_META.awaiting;
  return (
    <View style={[styles.pill, {backgroundColor: meta.tint}]}>
      <View style={[styles.dot, {backgroundColor: meta.dot}]} />
      <Text style={styles.label}>{meta.label}</Text>
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
  dot: {width: 6, height: 6, borderRadius: 3},
  label: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 10,
    letterSpacing: 0.4,
    color: colors.text.primary,
  },
});
