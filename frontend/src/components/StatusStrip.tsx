import React, {useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {colors, fontFamily} from '../theme';

/**
 * Status Strip (Figma 1570:407) — active-order strip pinned above the tab bar.
 * Full-width navy bar: solid pistachio icon chip, order text, Track pill,
 * dismiss, and the carousel paging dots.
 */
export function StatusStrip() {
  const [visible, setVisible] = useState(true);
  if (!visible) {
    return null;
  }

  return (
    <View style={styles.strip}>
      <View style={styles.row}>
        <View style={styles.icon}>
          <Icon name="restaurant" size={18} color={colors.brand.navy} />
        </View>
        <View style={styles.text}>
          <Text style={styles.title}>Jade · being prepared</Text>
          <Text style={styles.sub}>ETA 25 min · 4 items</Text>
        </View>
        <Pressable style={styles.track} accessibilityRole="button">
          <Text style={styles.trackText}>Track →</Text>
        </Pressable>
        <Pressable onPress={() => setVisible(false)} hitSlop={8} accessibilityLabel="Dismiss">
          <Icon name="close" size={18} color="rgba(249,240,234,0.7)" />
        </Pressable>
      </View>
      <View style={styles.dots}>
        <View style={[styles.dot, styles.dotActive]} />
        <View style={styles.dot} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  strip: {
    backgroundColor: colors.brand.navy,
    paddingLeft: 16,
    paddingRight: 14,
    paddingVertical: 12,
    gap: 8,
  },
  row: {flexDirection: 'row', alignItems: 'center', gap: 12},
  icon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.brand.pistachio,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {flex: 1},
  title: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 13,
    color: colors.brand.ivory,
  },
  sub: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 11,
    color: 'rgba(249,240,234,0.6)',
    marginTop: 1,
  },
  track: {
    backgroundColor: colors.brand.pistachio,
    borderRadius: 99,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  trackText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 11,
    letterSpacing: 0.66,
    color: colors.brand.navy,
  },
  dots: {flexDirection: 'row', alignSelf: 'center', gap: 4},
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(249,240,234,0.3)',
  },
  dotActive: {
    width: 8,
    backgroundColor: colors.brand.pistachio,
  },
});
