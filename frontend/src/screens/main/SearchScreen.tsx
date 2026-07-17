import React, {useEffect, useState} from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import {Dirham} from '../../components/Dirham';
import {ITEMS_BY_BRAND, type MenuItem} from '../../data/menu';
import {fetchMenu} from '../../services/menuService';
import type {RootStackScreenProps} from '../../navigation/types';
import {useCart} from '../../state/CartContext';
import {colors, fontFamily, radius} from '../../theme';

/**
 * 21 · Karaz Search (Figma 1706:1866) — search field + Cancel, recent-search
 * chips (persisted, removable), and live-filtered results from /api/app/menu.
 */
const RECENTS_KEY = '@dishdash/recent-searches';
const MAX_RECENTS = 7;
const DEFAULT_RESULTS_LIMIT = 7;

export function SearchScreen({navigation, route}: RootStackScreenProps<'Search'>) {
  const insets = useSafeAreaInsets();
  const brand = route.params.brand;
  const cart = useCart();
  const [query, setQuery] = useState('');
  // Live menu for this brand, from /api/app/menu (mock fallback on failure).
  const [items, setItems] = useState<MenuItem[]>(ITEMS_BY_BRAND[brand]);
  const [recents, setRecents] = useState<string[]>([]);

  // Fetch the brand's menu from the API, and restore recent searches.
  useEffect(() => {
    let cancelled = false;
    fetchMenu({brand})
      .then(list => {
        if (!cancelled && list.length) setItems(list);
      })
      .catch(() => {});
    AsyncStorage.getItem(RECENTS_KEY)
      .then(raw => {
        if (!cancelled && raw) setRecents(JSON.parse(raw));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [brand]);

  const persistRecents = (next: string[]) => {
    const clean = next
      .map(r => r.trim())
      .filter(Boolean)
      .filter((r, i, arr) => arr.findIndex(x => x.toLowerCase() === r.toLowerCase()) === i)
      .slice(0, MAX_RECENTS);
    setRecents(clean);
    AsyncStorage.setItem(RECENTS_KEY, JSON.stringify(clean)).catch(() => {});
  };

  // Remember a term when the user submits a search.
  const addRecent = (term: string) => {
    const t = term.trim();
    if (!t) return;
    const next = [t, ...recents.filter(r => r.toLowerCase() !== t.toLowerCase())].slice(
      0,
      MAX_RECENTS,
    );
    persistRecents(next);
  };

  const submitSearch = () => addRecent(query);

  const selectRecent = (term: string) => {
    setQuery(term);
    addRecent(term);
  };

  const removeRecent = (term: string) =>
    persistRecents(recents.filter(r => r.toLowerCase() !== term.toLowerCase()));

  const q = query.trim().toLowerCase();
  const filteredResults = items.filter(
    i =>
      q === '' ||
      (i.name ?? '').toLowerCase().includes(q) ||
      (i.desc ?? '').toLowerCase().includes(q),
  );
  const results = q === '' ? filteredResults.slice(0, DEFAULT_RESULTS_LIMIT) : filteredResults;

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
            onSubmitEditing={submitSearch}
            onBlur={submitSearch}
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
        {/* Recent searches (hidden while actively typing a query) */}
        {recents.length > 0 && q === '' ? (
          <>
            <View style={styles.recentHeader}>
              <Text style={styles.recentLabel}>Recent searches</Text>
              <Pressable onPress={() => persistRecents([])} hitSlop={6}>
                <Text style={styles.clearAll}>Clear all</Text>
              </Pressable>
            </View>
            <View style={styles.chips}>
              {recents.map(r => (
                <View key={r} style={styles.chip}>
                  <Pressable
                    onPress={() => selectRecent(r)}
                    hitSlop={4}
                    accessibilityRole="button">
                    <Text style={styles.chipText} numberOfLines={1}>
                      {r}
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => removeRecent(r)}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel={`Remove ${r} from recent searches`}>
                    <Icon name="close" size={12} color={colors.text.secondary} />
                  </Pressable>
                </View>
              ))}
            </View>
          </>
        ) : null}

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
              onOpen={() => {
                addRecent(query || item.name);
                navigation.navigate('DishDetail', {itemId: item.id});
              }}
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
            <Text style={styles.dishName} numberOfLines={2} ellipsizeMode="tail">
              {item.name}
            </Text>
            <Text style={styles.dishDesc} numberOfLines={2} ellipsizeMode="tail">
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
  recentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recentLabel: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 12,
    color: colors.text.tertiary,
  },
  clearAll: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 12,
    color: colors.brand.karaz,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingTop: 2,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    maxWidth: '46%',
    minHeight: 31,
    backgroundColor: colors.brand.white,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    borderRadius: radius.pill,
    paddingLeft: 12,
    paddingRight: 9,
    paddingVertical: 7,
  },
  chipText: {
    maxWidth: 112,
    fontFamily: fontFamily.bodyBold,
    fontSize: 11,
    color: colors.text.primary,
  },

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
