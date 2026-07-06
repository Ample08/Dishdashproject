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
import {Dirham} from '../../components/Dirham';
import {GradientFill} from '../../components/GradientFill';
import {findItem} from '../../data/menu';
import type {RootStackScreenProps} from '../../navigation/types';
import {useCart} from '../../state/CartContext';
import {colors, fontFamily, radius} from '../../theme';

/**
 * 23 · Karaz Dish Detail (Figma 1812:1972)
 * Full-bleed hero image with a floating close button, an ivory panel that
 * overlaps the image with rounded top corners (name · price · description ·
 * meta chips · customisations) and a sticky bottom add-to-cart bar with a
 * quantity stepper and the live line total.
 */
const DISCOUNT_RED = '#f24d4d';

const SPICE_LEVELS = ['Mild', 'Medium', 'Spicy', 'Karaz Hot'];
const SIDES = [
  {name: 'Saffron rice', price: 12},
  {name: 'Garlic toum (extra)', price: 5},
  {name: 'Pita basket', price: 8},
  {name: 'Tabbouleh side', price: 14},
];
const META_CHIPS = ['Serves 2', '780 kcal', 'Halal'];

export function DishDetailScreen({
  navigation,
  route,
}: RootStackScreenProps<'DishDetail'>) {
  const insets = useSafeAreaInsets();
    const {width} = useWindowDimensions();
    const heroHeight = Math.min(330, Math.max(245, width * 0.72));
  const {add} = useCart();
  const item = findItem(route.params.itemId);

  const [qty, setQty] = useState(1);
  const [expanded, setExpanded] = useState(false);
  const [spice, setSpice] = useState('Medium');
  const [sides, setSides] = useState<string[]>(['Garlic toum (extra)']);
  // Full line count of the description (measured once, unclamped) so the
  // Read more/less toggle only shows when the text actually overflows 3 lines.
  const [descLines, setDescLines] = useState<number | null>(null);

  if (!item) {
    return null;
  }

  const total = item.price * qty;
  const discounted = item.oldPrice != null;

  const toggleSide = (name: string) =>
    setSides(prev =>
      prev.includes(name) ? prev.filter(s => s !== name) : [...prev, name],
    );

  const onAdd = () => {
    add(item, qty);
    navigation.goBack();
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: insets.bottom + 96}}>
        {/* Hero image */}
       <View style={[styles.hero, {height: heroHeight}]}>
  <Image source={item.image} style={styles.heroImage} resizeMode="cover" />

  <View style={styles.heroFade}>
    <GradientFill
      colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.25)']}
      locations={[0, 1]}
      start={{x: 0, y: 0}}
      end={{x: 0, y: 1}}
    />
  </View>
</View>

        {/* Overlapping panel */}
        <View style={styles.panel}>
          {/* Dish identity */}
          <View style={styles.identity}>
            <Text style={styles.name}>{item.name}</Text>

            <View style={styles.priceRow}>
              {discounted ? (
                <>
                  <Dirham size={11} color="rgba(28,36,48,0.4)" />
                  <Text style={styles.priceOld}>{item.oldPrice}</Text>
                </>
              ) : null}
              <Dirham size={15} color={colors.text.primary} />
              <Text style={styles.price}>{item.price}</Text>
              {item.discountPct ? (
                <View style={styles.discountChip}>
                  <Text style={styles.discountText}>−{item.discountPct}%</Text>
                </View>
              ) : null}
            </View>

            <Text
              style={styles.desc}
              numberOfLines={descLines == null ? undefined : expanded ? undefined : 3}
              onTextLayout={e => {
                if (descLines == null) {
                  setDescLines(e.nativeEvent.lines.length);
                }
              }}>
              {item.desc}
            </Text>
            {descLines != null && descLines > 3 ? (
              <Pressable onPress={() => setExpanded(e => !e)} hitSlop={8}>
                <Text style={styles.readMore}>
                  {expanded ? 'Read less ›' : 'Read more ›'}
                </Text>
              </Pressable>
            ) : null}

            <View style={styles.metaChips}>
              {META_CHIPS.map(chip => (
                <View key={chip} style={styles.chip}>
                  <Text style={styles.chipText}>{chip}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Customisations */}
          <View style={styles.customisations}>
            {/* Spice level */}
            <View style={styles.card}>
              <View style={styles.cardHead}>
                <Text style={styles.cardTitle}>Spice Level</Text>
                <View style={styles.requiredPill}>
                  <Text style={styles.requiredText}>Required</Text>
                </View>
              </View>
              <View>
                {SPICE_LEVELS.map((level, i) => (
                  <View key={level}>
                    {i > 0 ? <View style={styles.cardDivider} /> : null}
                    <Pressable style={styles.optionRow} onPress={() => setSpice(level)}>
                      <Text style={styles.optionLabel}>{level}</Text>
                      <View
                        style={[styles.radio, spice === level && styles.radioOn]}>
                        {spice === level ? <View style={styles.radioDot} /> : null}
                      </View>
                    </Pressable>
                  </View>
                ))}
              </View>
            </View>

            {/* Add a side */}
            <View style={styles.card}>
              <View style={styles.cardHead}>
                <Text style={styles.cardTitle}>Add a side</Text>
                <View style={styles.optionalPill}>
                  <Text style={styles.optionalText}>Optional</Text>
                </View>
              </View>
              <View>
                {SIDES.map((side, i) => {
                  const on = sides.includes(side.name);
                  return (
                    <View key={side.name}>
                      {i > 0 ? <View style={styles.cardDivider} /> : null}
                      <Pressable style={styles.optionRow} onPress={() => toggleSide(side.name)}>
                        <View style={styles.sideLabelRow}>
                          <Text style={styles.optionLabel}>{side.name}</Text>
                          <Text style={styles.sidePlus}>+</Text>
                          <Dirham size={11} color={colors.brand.karaz} />
                          <Text style={styles.sidePrice}>{side.price}</Text>
                        </View>
                        <View style={[styles.checkbox, on && styles.checkboxOn]}>
                          {on ? (
                            <Icon name="checkmark" size={14} color={colors.brand.ivory} />
                          ) : null}
                        </View>
                      </Pressable>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Floating close button */}
      <Pressable
        style={[styles.closeBtn, {top: insets.top + 8}]}
        onPress={() => navigation.goBack()}
        accessibilityRole="button"
        accessibilityLabel="Close">
        <Icon name="close" size={20} color={colors.text.primary} />
      </Pressable>

      {/* Sticky add-to-cart bar */}
      <View style={[styles.stickyBar, {paddingBottom: insets.bottom + 12}]}>
        <View style={styles.stepper}>
          <Pressable
            onPress={() => setQty(q => Math.max(1, q - 1))}
            hitSlop={8}
            style={styles.stepBtn}
            accessibilityLabel="Decrease quantity">
            <Text style={styles.stepSign}>−</Text>
          </Pressable>
          <Text style={styles.stepQty}>{qty}</Text>
          <Pressable
            onPress={() => setQty(q => q + 1)}
            hitSlop={8}
            style={styles.stepBtn}
            accessibilityLabel="Increase quantity">
            <Text style={styles.stepSign}>+</Text>
          </Pressable>
        </View>

        <Pressable style={styles.cta} onPress={onAdd} accessibilityRole="button">
          <Text style={styles.ctaText}>Add to cart  ·</Text>
          <Dirham size={15} color={colors.brand.navy} />
          <Text style={styles.ctaText}>{total}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: colors.brand.ivory},
 hero: {
  width: '100%',
  backgroundColor: colors.brand.navy,
  overflow: 'hidden',
},

heroImage: {
  width: '100%',
  height: '100%',
},

heroFade: {position: 'absolute', left: 0, right: 0, bottom: 0,},

panel: {
  marginTop: -28,
  backgroundColor: colors.brand.ivory,
  borderTopLeftRadius: 24,
  borderTopRightRadius: 24,
  paddingTop: 18,
},
  // heroFade: {position: 'absolute', left: 0, right: 0, bottom: 0, height: 80},
  // panel: {
  //   marginTop: -24,
  //   backgroundColor: colors.brand.ivory,
  //   borderTopLeftRadius: 24,
  //   borderTopRightRadius: 24,
  //   paddingTop: 18,
  // },
  identity: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 16,
    gap: 10,
  },
  name: {
    fontFamily: fontFamily.displayBold,
    fontSize: 32,
    lineHeight: 38,
    color: colors.text.primary,
  },
  priceRow: {flexDirection: 'row', alignItems: 'center', gap: 8},
  priceOld: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: 16,
    color: 'rgba(28,36,48,0.4)',
    textDecorationLine: 'line-through',
    marginLeft: 2,
  },
  price: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 18,
    color: colors.text.primary,
    marginLeft: 2,
  },
  discountChip: {
    backgroundColor: DISCOUNT_RED,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  discountText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 11,
    color: colors.brand.white,
  },
  desc: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 14,
    lineHeight: 22,
    color: colors.text.secondary,
  },
  readMore: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 13,
    color: colors.brand.karaz,
  },
  metaChips: {flexDirection: 'row', gap: 8, marginTop: 2},
  chip: {
    backgroundColor: colors.brand.white,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  chipText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 11,
    color: colors.text.secondary,
  },
  customisations: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    gap: 16,
  },
  card: {
    backgroundColor: colors.brand.white,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    borderRadius: 14,
    padding: 16,
    gap: 12,
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 16,
    color: colors.text.primary,
  },
  requiredPill: {
    backgroundColor: 'rgba(188,30,60,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  requiredText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 10,
    letterSpacing: 0.6,
    color: colors.brand.karaz,
  },
  optionalPill: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  optionalText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 10,
    letterSpacing: 0.6,
    color: colors.text.secondary,
  },
  cardDivider: {height: 1, backgroundColor: colors.border.subtle},
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  optionLabel: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 14,
    color: colors.text.primary,
  },
  sideLabelRow: {flexDirection: 'row', alignItems: 'center', gap: 8},
  sidePlus: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 13,
    color: colors.brand.karaz,
  },
  sidePrice: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 13,
    color: colors.brand.karaz,
    marginLeft: -4,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.border.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: {borderColor: colors.brand.navy},
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.brand.navy,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOn: {
    backgroundColor: colors.brand.navy,
    borderColor: colors.brand.navy,
  },
  closeBtn: {
    position: 'absolute',
    right: 16,
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 2},
    elevation: 4,
  },
  stickyBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: colors.brand.white,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: {width: 0, height: -4},
    elevation: 8,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 6,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.border.default,
  },
  stepBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepSign: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 18,
    color: colors.text.primary,
  },
  stepQty: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 16,
    color: colors.text.primary,
    minWidth: 14,
    textAlign: 'center',
  },
  cta: {
    flex: 1,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 16,
    borderRadius: radius.pill,
    backgroundColor: colors.brand.pistachio,
    overflow: 'hidden',
  },
  shimmer: {
    position: 'absolute',
    top: '-70%',
    width: 26,
    height: '240%',
  },
  ctaText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 16,
    color: colors.brand.navy,
  },
});
