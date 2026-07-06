import React from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import {ActiveOrderCard} from '../../components/ActiveOrderCard';
import {Dirham} from '../../components/Dirham';
import {
  BRANDS,
  ITEMS_BY_BRAND,
  type BrandKey,
  type MenuItem,
} from '../../data/menu';
import type {TabScreenProps} from '../../navigation/types';
import {useCart} from '../../state/CartContext';
import {useOrders} from '../../state/OrderContext';
import {colors, fontFamily, radius} from '../../theme';

/**
 * 28 · Orders Home (Figma 2378:2824) — the Orders TAB.
 * "Hungry? Pick a brand." card (Karaz + Jade tiles) over two horizontal
 * "POPULAR AT" dish rails, each with a See-all chip → BrandPage.
 */
export function OrdersHomeScreen({navigation}: TabScreenProps<'Orders'>) {
  const insets = useSafeAreaInsets();
  const {add} = useCart();
  const {active} = useOrders();

  const openBrand = (brand: BrandKey) => navigation.navigate('BrandPage', {brand});

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />

      <View style={[styles.topBar, {paddingTop: insets.top + 8}]}>
        <Text style={styles.title}>Orders</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          {paddingBottom: insets.bottom + 96},
        ]}>
        {/* Active order card (when an order is live) or pick-a-brand */}
        <View style={styles.cardWrap}>
          {active ? (
            <ActiveOrderCard
              order={active}
              onView={() => navigation.navigate('OrderStatus')}
            />
          ) : (
            <View style={styles.pickCard}>
              <View style={styles.pickHead}>
                <Text style={styles.pickTitle}>Hungry? Pick a brand.</Text>
                <Text style={styles.pickSub}>
                  No active order. Order fresh from any of our kitchens.
                </Text>
              </View>
              <View style={styles.brandRow}>
                <BrandTile brandKey="Karaz" onPress={() => openBrand('Karaz')} />
                <BrandTile brandKey="Jade" onPress={() => openBrand('Jade')} />
              </View>
            </View>
          )}
        </View>

        {/* POPULAR AT rails */}
        <Rail
          brandKey="Karaz"
          onSeeAll={() => openBrand('Karaz')}
          onOpenItem={item => openBrand(item.brand)}
          onAdd={add}
        />
        <Rail
          brandKey="Jade"
          onSeeAll={() => openBrand('Jade')}
          onOpenItem={item => openBrand(item.brand)}
          onAdd={add}
        />
      </ScrollView>
    </View>
  );
}

function BrandTile({
  brandKey,
  onPress,
}: {
  brandKey: BrandKey;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.brandTile, {backgroundColor: BRANDS[brandKey].color}]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Order from ${BRANDS[brandKey].name}`}>
      <Image
        source={BRANDS[brandKey].logo}
        style={styles.brandLogo}
        resizeMode="contain"
      />
    </Pressable>
  );
}

function Rail({
  brandKey,
  onSeeAll,
  onOpenItem,
  onAdd,
}: {
  brandKey: BrandKey;
  onSeeAll: () => void;
  onOpenItem: (item: MenuItem) => void;
  onAdd: (item: MenuItem) => void;
}) {
  const items = ITEMS_BY_BRAND[brandKey].slice(0, 5);
  return (
    <View style={styles.rail}>
      <View style={styles.railHead}>
        <View>
          <Text style={styles.eyebrow}>POPULAR AT</Text>
          <Text style={styles.railTitle}>{BRANDS[brandKey].name}</Text>
        </View>
        <Pressable
          style={styles.seeAll}
          onPress={onSeeAll}
          accessibilityRole="button"
          accessibilityLabel={`See all ${BRANDS[brandKey].name} dishes`}>
          <Text style={styles.seeAllText}>See all</Text>
          <Icon name="arrow-forward" size={12} color={colors.brand.navy} />
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.railItems}>
        {items.map(item => (
          <DishCard
            key={item.id}
            item={item}
            onPress={() => onOpenItem(item)}
            onAdd={() => onAdd(item)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

function DishCard({
  item,
  onPress,
  onAdd,
}: {
  item: MenuItem;
  onPress: () => void;
  onAdd: () => void;
}) {
  return (
    <Pressable
      style={[styles.card, item.soldOut && styles.cardSoldOut]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={item.name}>
      <View style={styles.cardImageWrap}>
        <Image source={item.image} style={styles.cardImage} resizeMode="cover" />

        {item.discountPct ? (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{item.discountPct}% OFF</Text>
          </View>
        ) : null}

        {item.soldOut ? (
          <>
            <View style={styles.soldOutScrim} />
            <Text style={styles.soldOutText}>SOLD OUT</Text>
          </>
        ) : (
          <Pressable
            style={styles.addBtn}
            onPress={onAdd}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={`Add ${item.name} to cart`}>
            <Text style={styles.addPlus}>+</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.cardBody}>
        <View style={styles.priceRow}>
          <Dirham
            size={12}
            color={item.oldPrice ? colors.text.secondary : colors.text.primary}
          />
          <Text style={[styles.price, item.oldPrice ? styles.priceStrike : null]}>
            {item.oldPrice ?? item.price}
          </Text>
          {item.oldPrice ? (
            <>
              <Dirham size={12} color={colors.status.error} />
              <Text style={styles.priceNow}>{item.price}</Text>
            </>
          ) : null}
        </View>
        <Text style={styles.cardName} numberOfLines={2}>
          {item.name}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: colors.brand.ivory},
  topBar: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  title: {
    fontFamily: fontFamily.displayBlack,
    fontSize: 28,
    color: colors.brand.navy,
  },
  scroll: {gap: 20},

  cardWrap: {paddingHorizontal: 16},
  pickCard: {
    backgroundColor: colors.brand.white,
    borderWidth: 1,
    borderColor: '#ebebf0',
    borderRadius: 20,
    padding: 18,
    gap: 14,
  },
  pickHead: {gap: 4},
  pickTitle: {
    fontFamily: fontFamily.displayBlack,
    fontSize: 20,
    color: colors.brand.navy,
  },
  pickSub: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 13,
    color: 'rgba(28,36,48,0.6)',
  },
  brandRow: {flexDirection: 'row', gap: 14},
  brandTile: {
    flex: 1,
    height: 78,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  brandLogo: {width: '78%', height: 54},

  rail: {gap: 10},
  railHead: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  eyebrow: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 10,
    letterSpacing: 1.6,
    color: 'rgba(28,36,48,0.45)',
  },
  railTitle: {
    fontFamily: fontFamily.displayBlack,
    fontSize: 22,
    color: colors.brand.navy,
    marginTop: 2,
  },
  seeAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.brand.pistachio,
    borderRadius: radius.pill,
    paddingLeft: 12,
    paddingRight: 10,
    paddingVertical: 6,
  },
  seeAllText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 12,
    color: colors.brand.navy,
  },
  railItems: {paddingHorizontal: 20, gap: 12},

  card: {
    width: 170,
    height: 204,
    backgroundColor: colors.surface.elevated,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    borderRadius: radius.card,
    paddingBottom: 12,
    overflow: 'hidden',
  },
  cardSoldOut: {opacity: 0.7},
  cardImageWrap: {height: 130, width: '100%', overflow: 'hidden'},
  cardImage: {width: '100%', height: '100%'},
  addBtn: {
    position: 'absolute',
    left: 124,
    top: 84,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.brand.pistachio,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 6,
    elevation: 3,
  },
  addPlus: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 22,
    lineHeight: 24,
    color: colors.brand.navy,
  },
  discountBadge: {
    position: 'absolute',
    left: 10,
    top: 10,
    backgroundColor: colors.status.error,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  discountText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 10,
    letterSpacing: 0.6,
    color: colors.brand.white,
  },
  soldOutScrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  soldOutText: {
    position: 'absolute',
    left: 50,
    top: 56,
    fontFamily: fontFamily.bodyBold,
    fontSize: 12,
    letterSpacing: 1.68,
    color: colors.brand.white,
  },
  cardBody: {paddingHorizontal: 12, paddingTop: 10, gap: 4},
  priceRow: {flexDirection: 'row', alignItems: 'center', gap: 6},
  price: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 14,
    color: colors.text.primary,
  },
  priceStrike: {
    fontFamily: fontFamily.bodyRegular,
    color: colors.text.secondary,
    textDecorationLine: 'line-through',
  },
  priceNow: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 14,
    color: colors.status.error,
  },
  cardName: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 13,
    lineHeight: 17,
    color: colors.text.primary,
  },
});
