import React, {useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {ITEMS_BY_BRAND, type BrandKey} from '../data/menu';
import {useCart} from '../state/CartContext';
import {colors, fontFamily} from '../theme';
import {DishCard} from './DishCard';

const BRANDS = ['KARAZ', 'JADE'] as const;
const brandKeyOf = (b: (typeof BRANDS)[number]): BrandKey =>
  b === 'JADE' ? 'Jade' : 'Karaz';

export function TonightsPicks({
  branch = 'Dubai Mall',
  onSwitchBranch,
}: {
  branch?: string;
  onSwitchBranch?: () => void;
}) {
  const [brand, setBrand] = useState<(typeof BRANDS)[number]>('KARAZ');
  const navigation = useNavigation<any>();
  const cart = useCart();
  // Live menu items for this brand (hydrated from /api/app/menu).
  const dishes = ITEMS_BY_BRAND[brandKeyOf(brand)].slice(0, 6);
  const branchLabel = brand === 'JADE' ? 'Jade Dubai Mall' : `Karaz ${branch}`;

  const switchBrand = (next: (typeof BRANDS)[number]) => {
    if (next === brand) {
      return;
    }
    // new one — each card's `entering` then staggers in (see the list below).
    setBrand(next);
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.title}>Tonight's picks</Text>
        <Text style={styles.subtitle}>Curated for the evening · Pick a brand below</Text>
      </View>

      <View style={styles.controls}>
        <View style={styles.tabs}>
          {BRANDS.map(b => {
            const active = b === brand;
            return (
              <Pressable
                key={b}
                onPress={() => switchBrand(b)}
                style={[
                  styles.tab,
                  active && styles.tabActive,
                  active && b === 'JADE' && styles.tabActiveJade,
                ]}>
                <Text style={[styles.tabText, active && styles.tabTextActive]}>{b}</Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable style={styles.branchChip} onPress={onSwitchBranch} accessibilityRole="button">
          <View style={styles.branchDot} />
          <Text style={styles.branchText}>{branchLabel} · Switch ›</Text>
        </Pressable>
      </View>

      <View style={styles.list}>
        {dishes.map((item, index) => (
          <View key={`tonight-pick-slot-${index}`}>
            <DishCard
              key={`${brand}-${item.id}-${index}`}
              dish={{
                id: item.id,
                name: item.name,
                desc: item.desc,
                image: item.image,
                price: item.price,
                oldPrice: item.oldPrice,
                discountPct: item.discountPct,
                soldOut: item.soldOut,
              }}
              qty={cart.qtyOf(item.id)}
              onAdd={() => cart.add(item)}
              onInc={() => cart.inc(item.id)}
              onDec={() => cart.dec(item.id)}
              onPress={() => navigation.navigate('DishDetail', {itemId: item.id})}
            />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {gap: 14},
  header: {gap: 4},
  title: {
    fontFamily: fontFamily.displayBold,
    fontSize: 22,
    color: colors.text.primary,
  },
  subtitle: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 12,
    color: colors.text.secondary,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tabs: {flexDirection: 'row', gap: 6},
  tab: {
    width: 72,
    height: 36,
    borderRadius: 99,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border.strong,
  },
  tabActive: {
    backgroundColor: '#b52129',
    borderColor: '#b52129',
  },
  tabActiveJade: {
    backgroundColor: colors.brand.jade,
    borderColor: colors.brand.jade,
  },
  tabText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 12,
    letterSpacing: 0.72,
    color: colors.text.secondary,
  },
  tabTextActive: {color: '#ffffff'},
  branchChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 99,
    backgroundColor: colors.brand.white,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  branchDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.brand.teal,
  },
  branchText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 11,
    color: colors.text.primary,
  },
  list: {gap: 10},
});
