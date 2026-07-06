import React, {useState} from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import {BottomSheet, Coin} from '../../components';
import {BranchPickerSheet} from '../../components/BranchPickerSheet';
import {DeliverySheet} from '../../components/DeliverySheet';
import {Dirham} from '../../components/Dirham';
import {
  BRANDS,
  itemsForCategory,
  type MenuItem,
} from '../../data/menu';
import type {RootStackScreenProps} from '../../navigation/types';
import {useCart} from '../../state/CartContext';
import {colors, fontFamily, radius} from '../../theme';

/**
 * 20 · Karaz Brand Page (Figma 1603:1656). Tapped after ORDER NOW — full-bleed
 * brand hero photo, identity block (cuisine · title · rating · earn chip),
 * Takeaway/Delivery toggle, location + prep-time, sticky category tabs and the
 * brand menu as wide dish cards. A floating cart pill appears once items are in.
 */
const HERO = require('../../../assets/images/order/karaz_herotop.png');
type Mode = 'Takeaway' | 'Delivery';
type Sheet = null | 'branch' | 'delivery';

export function BrandPageScreen({navigation, route}: RootStackScreenProps<'BrandPage'>) {
  const insets = useSafeAreaInsets();
  const {width} = useWindowDimensions();
  const heroHeight = Math.min(330, Math.max(245, width * 0.72));
  const brandKey = route.params.brand;
  const brand = BRANDS[brandKey];
  const cart = useCart();

  const [mode, setMode] = useState<Mode>('Takeaway');
  const [category, setCategory] = useState(brand.categories[0]);
  const [sheet, setSheet] = useState<Sheet>(null);
  const [branchName, setBranchName] = useState(brand.branch);

  const items = itemsForCategory(brandKey, category);

 const onModePress = (m: Mode) => {
  if (m === 'Delivery') {
    setMode('Delivery');
    setSheet('delivery');
    return;
  }

  setMode('Takeaway');
  setSheet(null);
};

const closeSheet = () => {
  if (sheet === 'delivery') {
    setMode('Takeaway');
  }
  setSheet(null);
};
  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: insets.bottom + 100}}>
        {/* Hero photo */}
      <View style={[styles.hero, {height: heroHeight}]}>
     <Image source={HERO} style={styles.heroImage} resizeMode="cover" />
          {/* <View style={styles.heroFade}>
            <GradientFill
              colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.45)']}
              start={{x: 0, y: 0}}
              end={{x: 0, y: 1}}
            />
          </View> */}
        </View>

        {/* Panel */}
        <View style={styles.panel}>
          {/* Brand identity */}
          <View style={styles.identity}>
            <View style={styles.iconRow}>
              <Pressable
                style={styles.chip}
                onPress={() => navigation.goBack()}
                accessibilityRole="button"
                accessibilityLabel="Go back">
                <Icon name="chevron-back" size={16} color={colors.brand.navy} />
                <Text style={styles.chipText}>Back</Text>
              </Pressable>
              <Pressable
                style={styles.chip}
                onPress={() => navigation.navigate('Search', {brand: brandKey})}
                accessibilityRole="button"
                accessibilityLabel="Search">
                <Text style={styles.chipText}>Search</Text>
                <Icon name="search" size={15} color={colors.brand.navy} />
              </Pressable>
            </View>

            <View style={styles.cuisinePill}>
              <Text style={styles.cuisineText}>{brand.cuisine}</Text>
            </View>

            <View style={styles.titleRow}>
              <Text style={styles.title}>{brand.name}</Text>
              <View style={styles.openChip}>
                <View style={styles.openDot} />
                <Text style={styles.openText}>Open</Text>
              </View>
            </View>

            <Text style={styles.tagline}>{brand.tagline}</Text>

            <View style={styles.ratingRow}>
              <Icon name="star" size={13} color="#BC1E3C" />
              <Text style={styles.ratingNum}>{brand.rating}</Text>
              <Text style={styles.ratingMeta}>({brand.ratingCount} ratings)</Text>
              <View style={styles.metaDot} />
              <Text style={styles.ratingNum}>{brand.priceLevel}</Text>
              <View style={styles.metaDot} />
              <Text style={styles.ratingMeta}>{brand.tags}</Text>
            </View>

            <View style={styles.earnChip}>
              <Coin size={16} />
              <Text style={styles.earnText}>Earn 1 point per</Text>
              <Dirham size={10} color={colors.brand.navy} />
              <Text style={styles.earnText}>5 here</Text>
            </View>
          </View>

          {/* Info section: toggle + location + prep time */}
          <View style={styles.info}>
            <View style={styles.segmented}>
              {(['Takeaway', 'Delivery'] as Mode[]).map(m => {
                const active = mode === m;
                return (
                  <Pressable
                    key={m}
                    style={[styles.segment, active && styles.segmentActive]}
                    onPress={() => onModePress(m)}
                    accessibilityRole="button">
                    <Icon
                      name={m === 'Takeaway' ? 'bag-handle-outline' : 'bicycle-outline'}
                      size={18}
                      color={active ? colors.brand.navy : colors.text.primary}
                    />
                    <Text style={styles.segmentText}>{m}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Pressable
              style={styles.locationRow}
              onPress={() => setSheet('branch')}
              accessibilityRole="button">
              <Icon name="location-outline" size={22} color={colors.brand.navy} />
              <View style={styles.locationText}>
                <Text style={styles.locationTitle}>
                  {branchName} · {brand.distance}
                </Text>
                <Text style={styles.locationSub}>{brand.address}</Text>
              </View>
              <Text style={styles.switchText}>Switch</Text>
            </Pressable>

            <View style={styles.divider} />

            <View style={styles.prepRow}>
              <Icon name="time-outline" size={22} color={colors.brand.navy} />
              <Text style={styles.prepText}>{brand.prepTime}</Text>
            </View>
          </View>

          {/* Sticky category tabs */}
          <View style={styles.tabsWrap}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tabsRow}>
              {brand.categories.map(c => {
                const active = c === category;
                return (
                  <Pressable
                    key={c}
                    style={styles.tab}
                    onPress={() => setCategory(c)}
                    accessibilityRole="button">
                    <Text style={[styles.tabText, active && styles.tabTextActive]}>{c}</Text>
                    <View style={[styles.tabUnderline, active && styles.tabUnderlineActive]} />
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.tabsDivider} />

          {/* Dish list */}
          <View style={styles.list}>
            {items.map(item => (
              <DishRow
                key={item.id}
                item={item}
                qty={cart.qtyOf(item.id)}
                onAdd={() => cart.add(item)}
                onInc={() => cart.inc(item.id)}
                onDec={() => cart.dec(item.id)}
                onOpen={() => navigation.navigate('DishDetail', {itemId: item.id})}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Floating cart pill */}
      {cart.count > 0 ? (
        <Pressable
          style={[styles.cartPill, {bottom: insets.bottom + 16}]}
          onPress={() => navigation.navigate('Cart')}
          accessibilityRole="button"
          accessibilityLabel="View cart">
          <View style={styles.cartIconWrap}>
            <Icon name="cart" size={18} color={colors.brand.navy} />
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cart.count}</Text>
            </View>
          </View>
          <View style={styles.cartPriceRow}>
            <Dirham size={15} color={colors.brand.pistachio} />
            <Text style={styles.cartPrice}>{cart.subtotal}</Text>
          </View>
          <Icon name="chevron-forward" size={16} color={colors.brand.ivory} />
        </Pressable>
      ) : null}

      {/* Switch-branch bottom sheet */}
      <BottomSheet visible={sheet === 'branch'} onClose={closeSheet}>
        <BranchPickerSheet
          selected={branchName}
          onSelect={b => {
            setBranchName(b);
            setSheet(null);
          }}
          onClose={() => setSheet(null)}
        />
      </BottomSheet>

      {/* Delivery partners — full-screen modal */}
      <DeliverySheet visible={sheet === 'delivery'} onClose={closeSheet} />
    </View>
  );
}

function DishRow({
  item,
  qty,
  onAdd,
  onInc,
  onDec,
  onOpen,
}: {
  item: MenuItem;
  qty: number;
  onAdd: () => void;
  onInc: () => void;
  onDec: () => void;
  onOpen: () => void;
}) {
  const discounted = item.oldPrice != null;

  return (
    <View style={[styles.card, item.soldOut && styles.soldOutCard]}>
      <Pressable style={styles.cardTap} onPress={onOpen} disabled={item.soldOut}>
        <View style={styles.imageWrap}>
          <Image source={item.image} style={styles.img} resizeMode="cover" />
          {item.discountPct ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.discountPct}% OFF</Text>
            </View>
          ) : null}
          {item.soldOut ? <Text style={styles.soldOutTag}>SOLD OUT</Text> : null}
        </View>

        <View style={styles.cardInfo}>
          <View style={styles.cardHead}>
            <Text style={styles.dishName} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.dishDesc} numberOfLines={2}>
              {item.desc}
            </Text>
          </View>

          <View style={styles.bottomRow}>
            <View style={styles.priceRow}>
              {discounted ? (
                <>
                  <Dirham size={11} color={colors.text.secondary} />
                  <Text style={styles.priceOld}>{item.oldPrice}</Text>
                  <Dirham size={13} color={colors.status.error} />
                  <Text style={styles.priceSale}>{item.price}</Text>
                </>
              ) : (
                <>
                  <Dirham size={13} color={colors.brand.navy} />
                  <Text style={styles.price}>{item.price}</Text>
                </>
              )}
            </View>
          </View>
        </View>
      </Pressable>

      {/* Add / stepper (outside the open-press target) */}
      <View style={styles.actionWrap}>
        {item.soldOut ? (
          <View style={styles.addSpacer} />
        ) : qty > 0 ? (
          <View style={styles.stepper}>
            <Pressable onPress={onDec} hitSlop={6} style={styles.stepBtn}>
              <Icon
                name={qty === 1 ? 'trash-outline' : 'remove'}
                size={15}
                color={colors.brand.navy}
              />
            </Pressable>
            <Text style={styles.qty}>{qty}</Text>
            <Pressable onPress={onInc} hitSlop={6} style={styles.stepBtn}>
              <Icon name="add" size={15} color={colors.brand.navy} />
            </Pressable>
          </View>
        ) : (
          <Pressable style={styles.addBtn} onPress={onAdd} accessibilityRole="button">
            <Icon name="add" size={20} color={colors.brand.navy} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: colors.brand.ivory},
sheet: {
  maxHeight: '100%',
  height: '100%',
 backgroundColor: colors.brand.ivory,
},
 hero: {
  width: '100%',
  backgroundColor: colors.brand.navy,
  overflow: 'hidden',
},

heroImage: {
  width: '100%',
  height: '100%',
},
  heroFade: {position: 'absolute', left: 0, right: 0, bottom: 0, height: 90},

  panel: {
    backgroundColor: colors.brand.ivory,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    marginTop: -radius.sheet,
    paddingTop: 18,
  },

  identity: {paddingHorizontal: 20, paddingVertical: 12, gap: 8},
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.brand.white,
    borderWidth: 1,
    borderColor: 'rgba(28,35,48,0.1)',
    borderRadius: radius.pill,
    paddingLeft: 12,
    paddingRight: 14,
    paddingVertical: 8,
  },
  chipText: {fontFamily: fontFamily.bodyBold, fontSize: 12, color: colors.brand.navy},

  cuisinePill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(188,30,60,0.1)',
    borderRadius: 99,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  cuisineText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 10,
    letterSpacing: 0.8,
    color: colors.brand.karaz,
  },

  titleRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  title: {
    fontFamily: fontFamily.displayBold,
    fontSize: 44,
    lineHeight: 48,
    color: colors.text.primary,
  },
  openChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(22,163,74,0.12)',
    borderRadius: 99,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  openDot: {width: 7, height: 7, borderRadius: 3.5, backgroundColor: colors.status.success},
  openText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 11,
    letterSpacing: 0.88,
    color: colors.status.success,
  },

  tagline: {
    fontFamily: fontFamily.displayItalic,
    fontSize: 13,
    color: 'rgba(28,36,48,0.65)',
  },

  ratingRow: {flexDirection: 'row', alignItems: 'center', gap: 8, paddingTop: 4},
  ratingNum: {fontFamily: fontFamily.bodyBold, fontSize: 13, color: colors.text.primary},
  ratingMeta: {fontFamily: fontFamily.bodyRegular, fontSize: 13, color: colors.text.secondary},
  metaDot: {width: 3, height: 3, borderRadius: 1.5, backgroundColor: colors.text.tertiary},

  earnChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(237,199,128,0.28)',
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  earnText: {fontFamily: fontFamily.bodyBold, fontSize: 11, color: colors.brand.navy},

  info: {paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16},
  segmented: {
    flexDirection: 'row',
    backgroundColor: colors.brand.white,
    borderRadius: 99,
    padding: 4,
  },
  segment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 99,
  },
  segmentActive: {backgroundColor: colors.brand.pistachio},
  segmentText: {fontFamily: fontFamily.bodyBold, fontSize: 14, color: colors.text.primary},

  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    marginTop: 8,
  },
  locationText: {flex: 1, gap: 2},
  locationTitle: {fontFamily: fontFamily.bodyBold, fontSize: 14, color: colors.text.primary},
  locationSub: {fontFamily: fontFamily.bodyRegular, fontSize: 12, color: colors.text.secondary},
  switchText: {fontFamily: fontFamily.bodyBold, fontSize: 12, color: colors.brand.karaz},

  divider: {height: 1, backgroundColor: colors.border.subtle},

  prepRow: {flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14},
  prepText: {fontFamily: fontFamily.bodyBold, fontSize: 14, color: colors.text.primary},

  tabsWrap: {backgroundColor: colors.brand.ivory, paddingHorizontal: 20, paddingTop: 4},
  tabsRow: {gap: 20},
  tab: {alignItems: 'center', paddingTop: 10},
  tabText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 14,
    color: colors.text.tertiary,
    marginBottom: 6,
  },
  tabTextActive: {color: colors.text.primary},
  tabUnderline: {height: 2, alignSelf: 'stretch', backgroundColor: 'transparent'},
  tabUnderlineActive: {backgroundColor: colors.brand.karaz},

  tabsDivider: {height: 1, backgroundColor: colors.border.subtle},

  list: {paddingHorizontal: 20, paddingVertical: 16, gap: 12},

  // Dish card (wide)
  card: {
    flexDirection: 'row',
    height: 120,
    backgroundColor: colors.brand.white,
    borderRadius: radius.card,
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
  cardTap: {flex: 1, flexDirection: 'row'},
  imageWrap: {width: 120, height: 120},
  img: {width: 120, height: 120, borderRadius: radius.cell},
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
    color: colors.brand.white,
  },
  cardInfo: {flex: 1, paddingHorizontal: 14, paddingVertical: 12, justifyContent: 'space-between'},
  cardHead: {gap: 2},
  dishName: {fontFamily: fontFamily.bodyBold, fontSize: 14, color: colors.text.primary},
  dishDesc: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 11,
    lineHeight: 14,
    color: colors.text.secondary,
  },
  bottomRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  priceRow: {flexDirection: 'row', alignItems: 'center', gap: 6},
  price: {fontFamily: fontFamily.bodyBold, fontSize: 14, color: colors.text.primary},
  priceOld: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 11,
    color: colors.text.secondary,
    textDecorationLine: 'line-through',
  },
  priceSale: {fontFamily: fontFamily.bodyBold, fontSize: 14, color: colors.status.error},

  actionWrap: {
    position: 'absolute',
    right: 14,
    bottom: 12,
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

  // Floating cart pill
  cartPill: {
    position: 'absolute',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.brand.navy,
    borderRadius: radius.pill,
    paddingLeft: 8,
    paddingRight: 16,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 24,
    shadowOffset: {width: 0, height: 8},
    elevation: 8,
  },
  cartIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.brand.pistachio,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: colors.brand.navy,
    backgroundColor: colors.brand.karaz,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {fontFamily: fontFamily.bodyBold, fontSize: 11, color: colors.brand.ivory},
  cartPriceRow: {flexDirection: 'row', alignItems: 'center', gap: 4},
  cartPrice: {fontFamily: fontFamily.bodyBold, fontSize: 18, color: colors.brand.pistachio},
});
