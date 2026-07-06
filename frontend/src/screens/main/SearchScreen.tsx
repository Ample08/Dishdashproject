import React, {useState} from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import {Dirham} from '../../components/Dirham';
import {ITEMS_BY_BRAND, type MenuItem} from '../../data/menu';
import type {RootStackScreenProps} from '../../navigation/types';
import {useCart} from '../../state/CartContext';
import {colors, fontFamily, radius} from '../../theme';

/**
 * 21 · Karaz Search (Figma 1706:1866) — search field + Cancel, recent-search
 * chips, and live-filtered dish results (wide cards with add buttons).
 */
const RECENT = ['Mixed Grill', 'Hummus', 'Shawarma', 'Falafel', 'Knafeh'];

export function SearchScreen({navigation, route}: RootStackScreenProps<'Search'>) {
  const insets = useSafeAreaInsets();
  const brand = route.params.brand;
  const cart = useCart();
  const [query, setQuery] = useState('');

  const q = query.trim().toLowerCase();
  const results = ITEMS_BY_BRAND[brand].filter(
    i => q === '' || i.name.toLowerCase().includes(q) || i.desc.toLowerCase().includes(q),
  );

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />

      {/* Search bar */}
      <View style={[styles.searchBar, {paddingTop: insets.top + 8}]}>
        <View style={styles.field}>
          <Icon name="search" size={18} color={colors.text.secondary} />
          <TextInput
            style={styles.input}
            value={query}
            onChangeText={setQuery}
            placeholder="Search dishes"
            placeholderTextColor={colors.text.tertiary}
            autoFocus
            returnKeyType="search"
          />
          {query.length > 0 ? (
            <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <Icon name="close-circle" size={18} color={colors.text.tertiary} />
            </Pressable>
          ) : null}
        </View>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Text style={styles.cancel}>Cancel</Text>
        </Pressable>
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, {paddingBottom: insets.bottom + 24}]}>
        {/* Recent searches */}
        <Text style={styles.recentLabel}>Recent searches</Text>
        <View style={styles.chips}>
          {RECENT.map(r => (
            <Pressable key={r} style={styles.chip} onPress={() => setQuery(r)}>
              <Text style={styles.chipText}>{r}</Text>
              <Icon name="close" size={13} color={colors.text.secondary} />
            </Pressable>
          ))}
        </View>

        {/* Results */}
        <View style={styles.results}>
          {results.map(item => (
            <ResultCard
              key={item.id}
              item={item}
              qty={cart.qtyOf(item.id)}
              onAdd={() => cart.add(item)}
              onInc={() => cart.inc(item.id)}
              onDec={() => cart.dec(item.id)}
              onOpen={() => navigation.navigate('DishDetail', {itemId: item.id})}
            />
          ))}
          {results.length === 0 ? (
            <Text style={styles.noResults}>No dishes match “{query}”.</Text>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

function ResultCard({
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
    <View style={styles.card}>
      <Pressable style={styles.cardTap} onPress={onOpen}>
        <View style={styles.imageWrap}>
          <Image source={item.image} style={styles.img} resizeMode="cover" />
          {item.discountPct ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.discountPct}% OFF</Text>
            </View>
          ) : null}
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
      </Pressable>

      <View style={styles.actionWrap}>
        {qty > 0 ? (
          <View style={styles.stepper}>
            <Pressable onPress={onDec} hitSlop={6} style={styles.stepBtn}>
              <Icon name={qty === 1 ? 'trash-outline' : 'remove'} size={15} color={colors.brand.navy} />
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: colors.brand.ivory,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  field: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.brand.white,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    paddingHorizontal: 14,
  },
  input: {
    flex: 1,
    fontFamily: fontFamily.bodyMedium,
    fontSize: 15,
    color: colors.text.primary,
    padding: 0,
  },
  cancel: {fontFamily: fontFamily.bodyBold, fontSize: 14, color: colors.brand.karaz},

  scroll: {paddingHorizontal: 20, paddingTop: 16, gap: 12},
  recentLabel: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 12,
    color: colors.text.tertiary,
  },
  chips: {flexDirection: 'row', flexWrap: 'wrap', gap: 8},
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.brand.white,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  chipText: {fontFamily: fontFamily.bodyBold, fontSize: 12, color: colors.text.primary},

  results: {gap: 12, paddingTop: 4},
  noResults: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 13,
    color: colors.text.secondary,
    paddingVertical: 20,
    textAlign: 'center',
  },

  // result card
  card: {
    flexDirection: 'row',
    height: 110,
    backgroundColor: colors.brand.white,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    overflow: 'hidden',
  },
  cardTap: {flex: 1, flexDirection: 'row'},
  imageWrap: {width: 110, height: 110},
  img: {width: 110, height: 110, borderRadius: radius.cell},
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
  cardInfo: {flex: 1, paddingHorizontal: 14, paddingVertical: 12, justifyContent: 'space-between'},
  cardHead: {gap: 2},
  dishName: {fontFamily: fontFamily.bodyBold, fontSize: 14, color: colors.text.primary},
  dishDesc: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 11,
    lineHeight: 14,
    color: colors.text.secondary,
  },
  priceRow: {flexDirection: 'row', alignItems: 'center', gap: 6},
  price: {fontFamily: fontFamily.bodyBold, fontSize: 14, color: colors.text.primary},
  priceOld: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 11,
    color: colors.text.secondary,
    textDecorationLine: 'line-through',
  },
  priceSale: {fontFamily: fontFamily.bodyBold, fontSize: 14, color: colors.status.error},

  actionWrap: {position: 'absolute', right: 14, bottom: 12},
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.brand.pistachio,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
