import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import Animated, {FadeIn} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Ionicons';
import {colors, fontFamily} from '../../theme';

/**
 * L1 · First-Time Coach Mark (Figma 4011:6) — dim scrim + champagne tooltip
 * explaining the auto-applied tier perk. Shown once on the loyalty home.
 */
export function CoachMark({
  tierName,
  perk,
  onDismiss,
}: {
  tierName: string;
  perk: string;
  onDismiss: () => void;
}) {
  return (
    <Animated.View entering={FadeIn.duration(250)} style={styles.scrim}>
      <Pressable style={styles.fill} onPress={onDismiss} />
      <View style={styles.tooltip}>
        <View style={styles.trophy}>
          <Icon name="trophy" size={22} color={colors.brand.navy} />
        </View>
        <Text style={styles.title}>You unlocked {tierName}</Text>
        <Text style={styles.body}>
          {perk} every dine-in, auto-applied at any branch — no code needed.
        </Text>
        <Pressable style={styles.btn} onPress={onDismiss} accessibilityRole="button">
          <Text style={styles.btnText}>Got it</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(6,20,22,0.78)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  fill: {position: 'absolute', top: 0, left: 0, right: 0, bottom: 0},
  tooltip: {
    backgroundColor: colors.brand.champagne,
    borderRadius: 20,
    padding: 24,
    gap: 10,
  },
  trophy: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(28,35,48,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {fontFamily: fontFamily.displayBold, fontSize: 22, color: colors.brand.navy, marginTop: 4},
  body: {fontFamily: fontFamily.bodyRegular, fontSize: 14, lineHeight: 20, color: 'rgba(28,35,48,0.8)'},
  btn: {
    marginTop: 8,
    height: 50,
    borderRadius: 999,
    backgroundColor: colors.brand.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {fontFamily: fontFamily.bodyBold, fontSize: 14, color: colors.brand.white},
});
