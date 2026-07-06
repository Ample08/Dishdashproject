import React, { useEffect, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Ionicons';
import { MAX_GUESTS, MIN_GUESTS } from '../data/reservations';
import { colors, fontFamily } from '../theme';

/**
 * TableViz (Figma component set 4273:202) - animated guest/table picker.
 * 2-6 guests use the round table variants; 7-10 use banquet variants.
 */

const CANVAS_W = 350;
const TABLE_CX = 175;
const TABLE_CY = 95;
const CHAIR_W = 25.5;
const CHAIR_H = 31;
const DUR = 360;
const EASE = Easing.bezier(0.22, 1, 0.36, 1);

type Slot = { x: number; y: number; rot: number };

function roundSlot(angle: number, radius = 76): Slot {
  const r = (angle * Math.PI) / 180;
  return {
    x: TABLE_CX + radius * Math.sin(r),
    y: TABLE_CY - radius * Math.cos(r),
    rot: angle,
  };
}

const ROUND_LAYOUTS: Record<number, Slot[]> = {
  2: [roundSlot(0), roundSlot(180)],
  3: [roundSlot(0), roundSlot(120), roundSlot(240)],
  4: [roundSlot(0), roundSlot(90), roundSlot(180), roundSlot(270)],
  5: [
    roundSlot(0),
    roundSlot(72),
    roundSlot(144),
    roundSlot(216),
    roundSlot(288),
  ],
  6: [
    roundSlot(0),
    roundSlot(60),
    roundSlot(120),
    roundSlot(180),
    roundSlot(240),
    roundSlot(300),
  ],
};

const BANQUET_LAYOUTS: Record<number, Slot[]> = {
  7: [
    { x: 114, y: 47.5, rot: 0 },
    { x: 175, y: 47.5, rot: 0 },
    { x: 236, y: 47.5, rot: 0 },
    { x: 114, y: 142.5, rot: 180 },
    { x: 175, y: 142.5, rot: 180 },
    { x: 236, y: 142.5, rot: 180 },
    { x: 292, y: TABLE_CY, rot: 90 },
  ],
  8: [
    { x: 114, y: 47.5, rot: 0 },
    { x: 175, y: 47.5, rot: 0 },
    { x: 236, y: 47.5, rot: 0 },
    { x: 114, y: 142.5, rot: 180 },
    { x: 175, y: 142.5, rot: 180 },
    { x: 236, y: 142.5, rot: 180 },
    { x: 292, y: TABLE_CY, rot: 90 },
    { x: 58, y: TABLE_CY, rot: -90 },
  ],
  9: [
    { x: 92, y: 47.5, rot: 0 },
    { x: 147, y: 47.5, rot: 0 },
    { x: 203, y: 47.5, rot: 0 },
    { x: 258, y: 47.5, rot: 0 },
    { x: 118, y: 142.5, rot: 180 },
    { x: 175, y: 142.5, rot: 180 },
    { x: 232, y: 142.5, rot: 180 },
    { x: 292, y: TABLE_CY, rot: 90 },
    { x: 58, y: TABLE_CY, rot: -90 },
  ],
  10: [
    { x: 92, y: 47.5, rot: 0 },
    { x: 147, y: 47.5, rot: 0 },
    { x: 203, y: 47.5, rot: 0 },
    { x: 258, y: 47.5, rot: 0 },
    { x: 92, y: 142.5, rot: 180 },
    { x: 147, y: 142.5, rot: 180 },
    { x: 203, y: 142.5, rot: 180 },
    { x: 258, y: 142.5, rot: 180 },
    { x: 292, y: TABLE_CY, rot: 90 },
    { x: 58, y: TABLE_CY, rot: -90 },
  ],
};

function layoutFor(count: number): Slot[] {
  return count <= 6 ? ROUND_LAYOUTS[count] : BANQUET_LAYOUTS[count];
}

function Chair({ slot }: { slot: Slot }) {
  const tx = useSharedValue(slot.x - CHAIR_W / 2);
  const ty = useSharedValue(slot.y - CHAIR_H / 2);
  const rot = useSharedValue(slot.rot);

  useEffect(() => {
    const cfg = { duration: DUR, easing: EASE };
    tx.value = withTiming(slot.x - CHAIR_W / 2, cfg);
    ty.value = withTiming(slot.y - CHAIR_H / 2, cfg);
    rot.value = withTiming(slot.rot, cfg);
  }, [slot, tx, ty, rot]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: tx.value },
      { translateY: ty.value },
      { rotate: `${rot.value}deg` },
    ],
  }));

  return (
    <Animated.View style={[styles.chair, style]} pointerEvents="none">
      <View style={styles.chairBack} />
      <View style={styles.chairSeat} />
    </Animated.View>
  );
}

export function TableViz({
  count,
  onChange,
}: {
  count: number;
  onChange: (delta: number) => void;
}) {
  const safeCount = Math.min(MAX_GUESTS, Math.max(MIN_GUESTS, count));
  const morph = useSharedValue(safeCount >= 7 ? 1 : 0);
  const slots = useMemo(() => layoutFor(safeCount), [safeCount]);

  useEffect(() => {
    morph.value = withTiming(safeCount >= 7 ? 1 : 0, {
      duration: DUR,
      easing: EASE,
    });
  }, [safeCount, morph]);

  const tableStyle = useAnimatedStyle(() => {
    const banquetWidth = safeCount >= 9 ? 208 : 190;
    const w = 101 + (banquetWidth - 101) * morph.value;
    const h = 101 + (56 - 101) * morph.value;
    const r = 50.5 + (7 - 50.5) * morph.value;
    return {
      width: w,
      height: h,
      borderRadius: r,
      left: TABLE_CX - w / 2,
      top: TABLE_CY - h / 2,
    };
  });

  const atMin = safeCount <= MIN_GUESTS;
  const atMax = safeCount >= MAX_GUESTS;

  return (
    <View style={styles.root}>
      {atMax && (
        <View style={styles.tooltip}>
          <Text style={styles.tooltipPlus}>+</Text>
          <Text style={styles.tooltipText}>
            Hosting 10+? Don't Forget to Generate a Celebration voucher in
            Loyalty.
          </Text>
          <Icon name="close" size={14} color="rgba(28,35,48,0.45)" />
        </View>
      )}

      <View style={styles.canvas} pointerEvents="none">
        <Animated.View style={[styles.table, tableStyle]} />
        {slots.map((slot, i) => (
          <Chair key={`${safeCount}-${i}`} slot={slot} />
        ))}
      </View>

      <View style={styles.stepper}>
        <Pressable
          style={[styles.btn, atMin ? styles.btnMinus : styles.btnOutline]}
          onPress={() => onChange(-1)}
          disabled={atMin}
          android_ripple={undefined}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Remove a guest"
        >
          <Icon name="remove" size={18} color={colors.brand.navy} />
        </Pressable>

        <View style={styles.countCol}>
          <Text style={styles.count}>{safeCount}</Text>
          <Text style={styles.countLabel}>guests</Text>
        </View>

        <Pressable
          style={[styles.btn, styles.btnPlus, atMax && styles.btnDisabled]}
          onPress={() => onChange(1)}
          disabled={atMax}
          android_ripple={undefined}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Add a guest"
        >
          <Icon name="add" size={18} color={colors.brand.white} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { alignItems: 'center' },
  tooltip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: 290,
    backgroundColor: colors.brand.champagne,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
    shadowColor: 'rgba(28,36,48,1)',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  tooltipPlus: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 16,
    lineHeight: 18,
    color: '#DC2F35',
  },
  tooltipText: {
    flex: 1,
    fontFamily: fontFamily.bodyBold,
    fontSize: 10,
    lineHeight: 12,
    color: colors.brand.navy,
  },
  canvas: { width: CANVAS_W, height: 190 },
  table: {
    position: 'absolute',
    backgroundColor: 'rgba(204,204,214,0.9)',
  },
  chair: {
    position: 'absolute',
    width: CHAIR_W,
    height: CHAIR_H,
  },
  chairBack: {
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(140,140,158,0.5)',
  },
  chairSeat: {
    marginTop: 2,
    height: 12,
    borderRadius: 4,
    backgroundColor: colors.brand.navy,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 30,
    marginTop: -2,
    zIndex: 3,
  },
  btn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnOutline: {
    backgroundColor: colors.brand.white,
    borderWidth: 1,
    borderColor: 'rgba(28,35,48,0.2)',
  },
  btnMinus: {
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderWidth: 1,
    borderColor: 'rgba(28,35,48,0.1)',
    opacity: 0.5,
  },
  btnPlus: {
    backgroundColor: colors.brand.navy,
    // shadowColor: 'rgba(28,36,48,1)',
    // shadowOpacity: 0.2,
    // shadowRadius: 10,
    // shadowOffset: { width: 0, height: 4 },
    // elevation: 4,
  },
  btnDisabled: {
    backgroundColor: 'rgba(28,35,48,0.48)',
    opacity: 1,
  },
  countCol: { alignItems: 'center', width: 80 },
  count: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 48,
    lineHeight: 52,
    color: colors.brand.navy,
  },
  countLabel: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 11,
    color: colors.brand.navy,
    marginTop: -2,
  },
});
