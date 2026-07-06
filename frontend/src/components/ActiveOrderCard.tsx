import React from 'react';
import {Image, Pressable, StyleSheet, Text, View} from 'react-native';
import {BRANDS} from '../data/menu';
import {STATUS_META, type ActiveOrder} from '../state/OrderContext';
import {colors, fontFamily} from '../theme';

/**
 * Active Order Card (Figma 2382:2835) — shown on the Orders tab while an order
 * is live. The status chip + "ready in…" line swap with the order status.
 */
export function ActiveOrderCard({order, onView}: {order: ActiveOrder; onView: () => void}) {
  const meta = STATUS_META[order.status];
  const brand = BRANDS[order.brand];

  return (
    <View style={styles.card}>
      <Text style={styles.label}>ACTIVE ORDER</Text>

      <View style={styles.topRow}>
        <View style={styles.brandGroup}>
          <View style={[styles.mark, {backgroundColor: brand.color}]}>
            <Image source={brand.logo} style={styles.markLogo} resizeMode="contain" />
          </View>
          <View>
            <Text style={styles.brandName}>{brand.name}</Text>
            <Text style={styles.branch}>{order.branch}</Text>
          </View>
        </View>

        <View style={[styles.chip, meta.ready && styles.chipReady]}>
          <View style={[styles.chipDot, meta.ready && styles.chipDotReady]} />
          <Text style={[styles.chipText, meta.ready && styles.chipTextReady]}>{meta.chip}</Text>
        </View>
      </View>

      <View style={styles.midRow}>
        <View style={styles.midText}>
          <Text style={styles.orderId}>Order #{order.id}</Text>
          <Text style={styles.mid}>{meta.mid}</Text>
        </View>
        <Pressable style={styles.viewBtn} onPress={onView} accessibilityRole="button">
          <Text style={styles.viewText}>View order</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.brand.white,
    borderWidth: 1.5,
    borderColor: colors.brand.pistachio,
    borderRadius: 20,
    padding: 18,
    gap: 14,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 9,
    shadowOffset: {width: 0, height: 6},
    elevation: 3,
  },
  label: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 10,
    letterSpacing: 1.4,
    color: 'rgba(28,36,48,0.5)',
  },
  topRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  brandGroup: {flexDirection: 'row', alignItems: 'center', gap: 10},
  mark: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  markLogo: {width: 22, height: 22},
  brandName: {fontFamily: fontFamily.bodyBold, fontSize: 14, color: colors.brand.navy},
  branch: {fontFamily: fontFamily.bodyRegular, fontSize: 12, color: 'rgba(28,36,48,0.55)'},
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.brand.navy,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  chipReady: {backgroundColor: colors.brand.pistachio},
  chipDot: {width: 7, height: 7, borderRadius: 3.5, backgroundColor: colors.brand.pistachio},
  chipDotReady: {backgroundColor: colors.brand.navy},
  chipText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 11,
    letterSpacing: 0.8,
    color: colors.brand.white,
  },
  chipTextReady: {color: colors.brand.navy},
  midRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  midText: {flex: 1, gap: 2},
  orderId: {fontFamily: fontFamily.bodyRegular, fontSize: 12, color: 'rgba(28,36,48,0.55)'},
  mid: {fontFamily: fontFamily.bodyBold, fontSize: 16, color: colors.brand.navy},
  viewBtn: {
    backgroundColor: colors.brand.pistachio,
    borderRadius: 999,
    paddingHorizontal: 22,
    paddingVertical: 13,
  },
  viewText: {fontFamily: fontFamily.bodyBold, fontSize: 14, color: colors.brand.navy},
});
