import React, {useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {dashboardImages} from '../assets/dashboardImages';
import {colors, fontFamily} from '../theme';
import {DishCard, type Dish} from './DishCard';

const KARAZ_DISHES: Dish[] = [
  {
    name: 'Mansaf Royale',
    desc: 'Lamb on jameed yogurt sauce · saffron rice almonds...',
    image: dashboardImages.dishes.mansaf,
    price: 78,
  },
  {
    name: 'Maklouba',
    desc: 'Upside-down spiced rice, chicken, eggplant pine nuts...',
    image: dashboardImages.dishes.maklouba,
    price: 55,
    oldPrice: 78,
    discountPct: 30,
  },
  {
    name: 'Shish Tawook',
    desc: 'Marinated chicken skewers · garlic toum · pickles...',
    image: dashboardImages.dishes.shish,
    price: 78,
  },
  {
    name: 'Hummus Beiruti',
    desc: 'Chickpea puree · tahini · parsley · pomegranate...',
    image: dashboardImages.dishes.hummus,
    price: 78,
    qty: 1,
  },
  {
    name: 'Kibbeh Nayyeh',
    desc: 'Raw spiced lamb · bulgur · mint · onion · olive oil...',
    image: dashboardImages.dishes.kibbeh,
    price: 78,
  },
  {
    name: 'Fattoush Salad',
    desc: 'Mixed greens · sumac · pomegranate molasses · pita...',
    image: dashboardImages.dishes.fattoush,
    price: 78,
    soldOut: true,
  },
];

const JADE_DISHES: Dish[] = [
  {
    name: 'Creamy Phyllo with Pistachio and Almond',
    desc: 'Slow-braised lamb shoulder · saffron rice · pickled onions...',
    image: dashboardImages.dishes.phyllo,
    price: 55,
    oldPrice: 78,
    discountPct: 30,
  },
  {
    name: 'Cardamom Lamb',
    desc: 'Arborio rice · saffron · parmesan · golden raisins...',
    image: dashboardImages.dishes.mansaf,
    price: 78,
  },
  {
    name: 'Creamy Phyllo with Pistachio and Almond',
    desc: 'Chickpea cream · black truffle · tahini · pita crackers...',
    image: dashboardImages.dishes.phyllo,
    price: 55,
    oldPrice: 78,
    discountPct: 30,
  },
  {
    name: 'Date Tagine',
    desc: 'Medjool dates · warm spices · toasted almonds...',
    image: dashboardImages.dishes.kanafeh,
    price: 78,
  },
];

const BRANDS = ['KARAZ', 'JADE'] as const;

export function TonightsPicks({
  branch = 'Dubai Mall',
  onSwitchBranch,
}: {
  branch?: string;
  onSwitchBranch?: () => void;
}) {
  const [brand, setBrand] = useState<(typeof BRANDS)[number]>('KARAZ');
  const dishes = brand === 'JADE' ? JADE_DISHES : KARAZ_DISHES;
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
        {dishes.map((dish, index) => (
          <View key={`tonight-pick-slot-${index}`}>
            <DishCard key={`${brand}-${dish.name}-${index}`} dish={dish} />
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
