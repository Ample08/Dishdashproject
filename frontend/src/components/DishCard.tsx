import React, {useState} from 'react';
import {Image, Pressable, StyleSheet, Text, View} from 'react-native';
import Animated, {FadeInUp} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Ionicons';
import {colors, fontFamily} from '../theme';
import {Dirham} from './Dirham';

/**
 * Dish Card / Wide (Figma I1397:193;1401:55). 120px image + name + description +
 * dirham price, with discount (strikethrough + red), SOLD OUT, and qty-stepper
 * variants. Add button / stepper live in the card's bottom row.
 */
export type Dish = {
  id?: string;
  name: string;
  desc: string;
  image: ReturnType<typeof require>;
  price: number;
  oldPrice?: number;
  discountPct?: number;
  soldOut?: boolean;
  qty?: number;
};

/**
 * When cart callbacks are passed the card is fully driven by the cart (Add
 * actually adds); otherwise it falls back to a local counter (demo cards).
 */
export function DishCard({
  dish,
  qty: qtyProp,
  onAdd,
  onInc,
  onDec,
  onPress,
}: {
  dish: Dish;
  qty?: number;
  onAdd?: () => void;
  onInc?: () => void;
  onDec?: () => void;
  onPress?: () => void;
}) {
  const controlled = onAdd != null;
  const [localQty, setLocalQty] = useState(dish.qty ?? 0);
  const qty = controlled ? qtyProp ?? 0 : localQty;
  const addItem = controlled ? onAdd! : () => setLocalQty(1);
  const incItem = controlled ? onInc ?? (() => {}) : () => setLocalQty(q => q + 1);
  const decItem = controlled ? onDec ?? (() => {}) : () => setLocalQty(q => q - 1);
  const discounted = dish.oldPrice != null;

  return (
    <Pressable
      style={[styles.card, dish.soldOut && styles.soldOutCard]}
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}>
      <View style={styles.imageWrap}>
        <Image source={dish.image} style={styles.img} resizeMode="cover" />
        {dish.discountPct ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{dish.discountPct}% OFF</Text>
          </View>
        ) : null}
        {dish.soldOut ? <Text style={styles.soldOutTag}>SOLD OUT</Text> : null}
      </View>

      <View style={styles.info}>
        <View style={styles.head}>
          <View style={styles.textReveal}>
            <Animated.Text
              key={`name-${dish.name}`}
              entering={FadeInUp.duration(220)}
              style={styles.name}
              numberOfLines={2}
              ellipsizeMode="tail">
              {dish.name}
            </Animated.Text>
          </View>
          <View style={styles.textReveal}>
            <Animated.Text
              key={`desc-${dish.desc}`}
              entering={FadeInUp.delay(35).duration(220)}
              style={styles.desc}
              numberOfLines={2}
              ellipsizeMode="tail">
              {dish.desc}
            </Animated.Text>
          </View>
        </View>

        <View style={styles.bottomRow}>
          <Animated.View
            key={`price-${dish.oldPrice ?? 'regular'}-${dish.price}-${dish.discountPct ?? 0}`}
            entering={FadeInUp.delay(70).duration(220)}
            style={styles.priceRow}>
            {discounted ? (
              <>
                <Dirham size={11} color={colors.text.secondary} />
                <Text style={styles.priceOld}>{dish.oldPrice}</Text>
                <Dirham size={13} color={colors.status.error} />
                <Text style={styles.priceSale}>{dish.price}</Text>
              </>
            ) : (
              <>
                <Dirham size={13} color={colors.brand.navy} />
                <Text style={styles.price}>{dish.price}</Text>
              </>
            )}
          </Animated.View>

          {dish.soldOut ? (
            <View style={styles.addSpacer} />
          ) : qty > 0 ? (
            <View style={styles.stepper}>
              <Pressable onPress={decItem} hitSlop={6} style={styles.stepBtn}>
                <Icon
                  name={qty === 1 ? 'trash-outline' : 'remove'}
                  size={15}
                  color={colors.brand.navy}
                />
              </Pressable>
              <Text style={styles.qty}>{qty}</Text>
              <Pressable onPress={incItem} hitSlop={6} style={styles.stepBtn}>
                <Icon name="add" size={15} color={colors.brand.navy} />
              </Pressable>
            </View>
          ) : (
            <Pressable style={styles.addBtn} onPress={addItem} accessibilityRole="button">
              <Icon name="add" size={20} color={colors.brand.navy} />
            </Pressable>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    height: 120,
    backgroundColor: colors.brand.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    overflow: 'hidden',
    shadowColor: 'rgba(13,33,43,1)',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 3},
    elevation: 2,
  },
  soldOutCard: {opacity: 0.7},
  imageWrap: {width: 120, height: 120},
  img: {width: 120, height: 120, borderRadius: 12},
  badge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: colors.brand.pistachio,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 5,
  },
  badgeText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 9,
    letterSpacing: 0.54,
    color: colors.brand.navy,
  },
  soldOutTag: {
    position: 'absolute',
    top: 53,
    left: 26,
    fontFamily: fontFamily.bodyBold,
    fontSize: 11,
    letterSpacing: 1.54,
    color: '#ffffff',
  },
  info: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    justifyContent: 'space-between',
  },
  head: {gap: 2},
  textReveal: {
    overflow: 'hidden',
  },
  name: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 14,
    color: colors.text.primary,
  },
  desc: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 11,
    lineHeight: 14,
    color: colors.text.secondary,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceRow: {flexDirection: 'row', alignItems: 'center', gap: 6},
  price: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 14,
    color: colors.text.primary,
  },
  priceOld: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 11,
    color: colors.text.secondary,
    textDecorationLine: 'line-through',
  },
  priceSale: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 14,
    color: colors.status.error,
  },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.brand.pistachio,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addSpacer: {width: 32, height: 32},
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 76,
    height: 30,
    borderRadius: 99,
    borderWidth: 1.5,
    borderColor: colors.border.default,
    backgroundColor: colors.brand.white,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 3,
    shadowOffset: {width: 0, height: 2},
    elevation: 2,
  },
  stepBtn: {alignItems: 'center', justifyContent: 'center'},
  qty: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 13,
    color: colors.brand.navy,
    minWidth: 12,
    textAlign: 'center',
  },
});
