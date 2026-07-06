import React, { useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { BottomSheet, Coin, ConfirmDialog, SchedulePickupSheet } from '../../components';
import { BranchPickerSheet } from '../../components/BranchPickerSheet';
import { Dirham } from '../../components/Dirham';
import { Shimmer } from '../../components/Shimmer';
import { dashboardImages } from '../../assets/dashboardImages';
import { BRANDS, type MenuItem } from '../../data/menu';
import type { RootStackScreenProps } from '../../navigation/types';
import { useCart } from '../../state/CartContext';
import { colors, fontFamily, radius } from '../../theme';

/**
 * 24 · Cart (Figma 1853:2055) — top bar, ordering-from card with pickup-timing
 * radios, line items, "Pair with your order" cross-sell rail, order note,
 * skip-cutlery toggle, tip selector, promo code, bill summary, sticky CTA.
 */
const VAT_RATE = 0.05;
const TIP_OPTIONS = [10, 20];

type Pickup = 'now' | 'later';
type Sheet = null | 'branch' | 'schedule';

const ADDONS: MenuItem[] = [
  {
    id: 'addon-garlic',
    brand: 'Karaz',
    name: 'Garlic toum',
    desc: 'Whipped garlic dip',
    price: 14,
    category: 'Sides',
    image: dashboardImages.dishes.hummus,
  },
  {
    id: 'addon-lemonade',
    brand: 'Karaz',
    name: 'Mint lemonade',
    desc: 'Fresh mint · lemon',
    price: 14,
    category: 'Drinks',
    image: dashboardImages.dishes.ayran,
  },
  {
    id: 'addon-fries',
    brand: 'Karaz',
    name: 'Side fries',
    desc: 'Crispy fries',
    price: 18,
    category: 'Sides',
    image: dashboardImages.dishes.fattoush,
  },
  {
    id: 'addon-baklava',
    brand: 'Karaz',
    name: 'Baklava (3 pcs)',
    desc: 'Pistachio · honey',
    price: 22,
    category: 'Desserts',
    image: dashboardImages.dishes.kanafeh,
  },
];

export function CartScreen({ navigation }: RootStackScreenProps<'Cart'>) {
  const insets = useSafeAreaInsets();
  const { lines, inc, dec, add, qtyOf, subtotal, clear } = useCart();

  const brand = BRANDS[lines[0]?.brand ?? 'Karaz'];
  const [sheet, setSheet] = useState<Sheet>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [branchName, setBranchName] = useState(brand.branch);
  const [pickup, setPickup] = useState<Pickup>('now');
  const [scheduleLabel, setScheduleLabel] = useState('Today, 7:30 PM');
  const [tip, setTip] = useState(20);
  const [skipCutlery, setSkipCutlery] = useState(false);
  const [note, setNote] = useState('');
  const [promo, setPromo] = useState('');

  // Confirmation dialog: remove a single item or clear the whole cart.
  const [confirm, setConfirm] = useState<
    null | { kind: 'remove'; id: string; name: string } | { kind: 'clear' }
  >(null);

  const empty = lines.length === 0;
  const vat = subtotal * VAT_RATE;
  const total = empty ? 0 : subtotal + tip + vat;
  const fmt = (n: number) => (Number.isInteger(n) ? `${n}` : n.toFixed(2));

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />

      {/* Top bar */}
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <Pressable
          style={styles.iconBtn}
          hitSlop={8}
          accessibilityLabel="Go back"
          onPress={() => navigation.goBack()}
        >
          <Icon name="chevron-back" size={24} color={colors.text.primary} />
        </Pressable>
        <Text style={styles.topTitle}>Your cart</Text>
        <Pressable
          style={styles.iconBtn}
          hitSlop={8}
          accessibilityLabel="More"
          onPress={() => setMenuOpen(true)}
        >
          <Icon
            name="ellipsis-horizontal"
            size={20}
            color={colors.text.primary}
          />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + 120 },
        ]}
      >
        {/* Ordering-from + pickup timing */}
        <View style={styles.card}>
          <View style={styles.gap4}>
            <Text style={styles.eyebrow}>ORDERING FROM</Text>
            <Text style={styles.brandName}>{brand.name}</Text>
            <View style={styles.branchRow}>
              <Icon
                name="location-outline"
                size={16}
                color={colors.text.secondary}
              />
              <View style={styles.branchText}>
                <Text style={styles.branchTitle}>
                  {branchName} · {brand.distance}
                </Text>
                <Text style={styles.branchSub}>{brand.address}</Text>
              </View>
              <Pressable hitSlop={8} onPress={() => setSheet('branch')}>
                <Text style={styles.switchLink}>Switch</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.cardDivider} />

          <Pressable style={styles.radioRow} onPress={() => setPickup('now')}>
            <View style={[styles.radio, pickup === 'now' && styles.radioOn]}>
              {pickup === 'now' ? <View style={styles.radioDot} /> : null}
            </View>
            <View style={styles.radioText}>
              <Text style={styles.radioTitle}>Prepare now</Text>
              <Text style={styles.radioSub}>Ready in 15–20 mins</Text>
            </View>
          </Pressable>

          <Pressable
            style={styles.radioRow}
            onPress={() => {
              setPickup('later');
              setSheet('schedule');
            }}>
            <View style={[styles.radio, pickup === 'later' && styles.radioOn]}>
              {pickup === 'later' ? <View style={styles.radioDot} /> : null}
            </View>
            <View style={styles.radioText}>
              <Text style={styles.radioTitle}>Schedule for later</Text>
              <Text style={styles.radioSub}>{scheduleLabel}</Text>
            </View>
            <Pressable hitSlop={8} onPress={() => setSheet('schedule')}>
              <Text style={styles.changeLink}>Change</Text>
            </Pressable>
          </Pressable>
        </View>

        {/* Line items */}
        <View style={styles.itemsHeader}>
          <Text style={styles.sectionTitle}>Your items</Text>
          <Pressable style={styles.addMore} onPress={() => navigation.goBack()}>
            <Text style={styles.addMoreText}>+ Add more</Text>
          </Pressable>
        </View>

        {empty ? (
          <View style={styles.empty}>
            <Icon
              name="bag-handle-outline"
              size={40}
              color={colors.text.tertiary}
            />
            <Text style={styles.emptyTitle}>Your cart is empty</Text>
            <Text style={styles.emptySub}>
              Add a few dishes to get started.
            </Text>
          </View>
        ) : (
          <View style={styles.itemsList}>
            {lines.map(line => (
              <View key={line.id} style={styles.lineCard}>
                <Image
                  source={line.image}
                  style={styles.cardImg}
                  resizeMode="cover"
                />
                <View style={styles.cardInfo}>
                  <View style={styles.cardHead}>
                    <Text style={styles.cardName} numberOfLines={1}>
                      {line.name}
                    </Text>
                    <Text style={styles.cardDesc} numberOfLines={1}>
                      {line.desc}
                    </Text>
                  </View>
                  <View style={styles.cardBottom}>
                    <View style={styles.priceRow}>
                      <Dirham size={13} color={colors.text.primary} />
                      <Text style={styles.price}>{line.price * line.qty}</Text>
                    </View>
                    <View style={styles.stepper}>
                      <Pressable
                        onPress={() =>
                          line.qty === 1
                            ? setConfirm({
                                kind: 'remove',
                                id: line.id,
                                name: line.name,
                              })
                            : dec(line.id)
                        }
                        hitSlop={6}
                        style={styles.stepBtn}
                      >
                        <Icon
                          name={line.qty === 1 ? 'trash-outline' : 'remove'}
                          size={15}
                          color={colors.brand.navy}
                        />
                      </Pressable>
                      <Text style={styles.qty}>{line.qty}</Text>
                      <Pressable
                        onPress={() => inc(line.id)}
                        hitSlop={6}
                        style={styles.stepBtn}
                      >
                        <Icon name="add" size={15} color={colors.brand.navy} />
                      </Pressable>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Cross-sell rail */}
        {!empty && (
          <View style={styles.crossSell}>
            <Text style={styles.sectionTitle}>Pair with your order</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.railRow}
            >
              {ADDONS.map(a => {
                const q = qtyOf(a.id);
                return (
                  <View key={a.id} style={styles.squareCard}>
                    <View style={styles.squareImgWrap}>
                      <Image
                        source={a.image}
                        style={styles.squareImg}
                        resizeMode="cover"
                      />
                      {q > 0 ? (
                        <View style={styles.squareStepper}>
                          <Pressable
                            onPress={() => dec(a.id)}
                            hitSlop={6}
                            style={styles.stepBtn}
                          >
                            <Icon
                              name={q === 1 ? 'trash-outline' : 'remove'}
                              size={14}
                              color={colors.brand.navy}
                            />
                          </Pressable>
                          <Text style={styles.qty}>{q}</Text>
                          <Pressable
                            onPress={() => inc(a.id)}
                            hitSlop={6}
                            style={styles.stepBtn}
                          >
                            <Icon
                              name="add"
                              size={14}
                              color={colors.brand.navy}
                            />
                          </Pressable>
                        </View>
                      ) : (
                        <Pressable
                          style={styles.squareAdd}
                          onPress={() => add(a)}
                        >
                          <Icon
                            name="add"
                            size={20}
                            color={colors.brand.navy}
                          />
                        </Pressable>
                      )}
                    </View>
                    <View style={styles.squareInfo}>
                      <View style={styles.priceRow}>
                        <Dirham size={11} color={colors.text.primary} />
                        <Text style={styles.price}>{a.price}</Text>
                      </View>
                      <Text style={styles.squareName} numberOfLines={1}>
                        {a.name}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Order note */}
        <View style={styles.card}>
          <Text style={styles.noteTitle}>Order note</Text>
          <Text style={styles.noteSub}>
            {brand.name} will try to honour your request — flag allergies, prep
            style, or pickup timing.
          </Text>
          <TextInput
            style={styles.noteInput}
            value={note}
            onChangeText={t => setNote(t.slice(0, 120))}
            placeholder="No onion, allergies, ready by 7…"
            placeholderTextColor={colors.text.tertiary}
            multiline
          />
          <Text style={styles.noteCount}>{note.length} / 120</Text>
        </View>

        {/* Skip cutlery */}
        <View style={[styles.card, styles.cutleryCard]}>
          <View style={styles.cutleryIcon}>
            <Icon
              name="restaurant-outline"
              size={22}
              color={colors.brand.navy}
            />
          </View>
          <View style={styles.cutleryText}>
            <Text style={styles.cutleryTitle}>Skip the cutlery?</Text>
            <Text style={styles.cutlerySub}>
              Skip the single-use cutlery — small step for you, big love for the
              planet.
            </Text>
          </View>
          <Switch
            value={skipCutlery}
            onValueChange={setSkipCutlery}
            trackColor={{
              false: colors.border.default,
              true: colors.brand.pistachio,
            }}
            thumbColor={colors.brand.white}
          />
        </View>

        {/* Tip */}
        <View style={styles.card}>
          <Text style={styles.tipTitle}>Tip the kitchen</Text>
          <Text style={styles.tipSub}>
            100% goes to the team who cooked your meal.
          </Text>
          <View style={styles.tipRow}>
            {TIP_OPTIONS.map(t => {
              const active = tip === t;
              return (
                <Pressable
                  key={t}
                  style={[styles.tipBtn, active && styles.tipBtnActive]}
                  onPress={() => setTip(t)}
                >
                  <Dirham
                    size={12}
                    color={active ? colors.brand.ivory : colors.text.primary}
                  />
                  <Text
                    style={[
                      styles.tipBtnText,
                      active && styles.tipBtnTextActive,
                    ]}
                  >
                    {t}
                  </Text>
                </Pressable>
              );
            })}
            <Pressable
              style={[
                styles.tipBtn,
                !TIP_OPTIONS.includes(tip) && styles.tipBtnActive,
              ]}
              onPress={() => setTip(30)}
            >
              <Text
                style={[
                  styles.tipBtnText,
                  !TIP_OPTIONS.includes(tip) && styles.tipBtnTextActive,
                ]}
              >
                Custom
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Promo code */}
        <View style={styles.card}>
          <Text style={styles.eyebrow}>PROMO CODE</Text>
          <View style={styles.promoRow}>
            <View style={styles.promoField}>
              <Icon
                name="pricetag-outline"
                size={16}
                color={colors.text.tertiary}
              />
              <TextInput
                style={styles.promoInput}
                value={promo}
                onChangeText={setPromo}
                placeholder="Enter promo code"
                placeholderTextColor={colors.text.tertiary}
                autoCapitalize="characters"
              />
            </View>
            <Pressable style={styles.promoApply}>
              <Text style={styles.promoApplyText}>Apply</Text>
            </Pressable>
          </View>
        </View>

        {/* Bill summary */}
        {!empty && (
          <View style={styles.card}>
            <Text style={styles.eyebrow}>BILL SUMMARY</Text>
            <BillRow label="Subtotal" value={fmt(subtotal)} />
            <BillRow label="Tip" value={fmt(tip)} />
            <BillRow label="VAT (5%)" value={fmt(vat)} />
            <View style={styles.cardDivider} />
            <View style={styles.pointsStrip}>
              {/* <Icon
                name="sparkles-outline"
                size={16}
                color={colors.brand.navy}
              /> */}
              <Coin size={16}  />
              <Text style={styles.pointsText}>
                Earn <Text style={styles.pointsBold}>+12 pts</Text> on this
                order
              </Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <View style={styles.priceRow}>
                <Dirham size={15} color={colors.text.primary} />
                <Text style={styles.totalValue}>{fmt(total)}</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Sticky place-order bar */}
      <View
        style={[styles.stickyBar, { paddingBottom: insets.bottom + 12 }]}
        pointerEvents="box-none"
      >
        <Pressable
          style={[styles.cta, empty && styles.ctaDisabled]}
          disabled={empty}
          accessibilityRole="button"
          onPress={() => navigation.navigate('Payment')}
        >
          {!empty ? <Shimmer /> : null}
          <Text style={styles.ctaText}>Place order ·</Text>
          <View style={styles.ctaIcon}>
            <Dirham size={14} color={colors.brand.navy} />
          </View>
          <Text style={styles.ctaText}>{fmt(total)}</Text>
        </Pressable>
      </View>

      {/* Switch-branch sheet */}
      <BottomSheet visible={sheet === 'branch'} onClose={() => setSheet(null)}>
        <BranchPickerSheet
          selected={branchName}
          onSelect={b => {
            setBranchName(b);
            setSheet(null);
          }}
          onClose={() => setSheet(null)}
        />
      </BottomSheet>

      {/* Schedule pickup sheet */}
      <BottomSheet visible={sheet === 'schedule'} onClose={() => setSheet(null)}>
        <SchedulePickupSheet
          initialLabel={scheduleLabel}
          onClose={() => setSheet(null)}
          onConfirm={summary => {
            setScheduleLabel(summary);
            setPickup('later');
            setSheet(null);
          }}
        />
      </BottomSheet>

      {/* Top-right "Clear cart" dropdown menu */}
      <Modal
        visible={menuOpen}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setMenuOpen(false)}
      >
        <Pressable
          style={styles.menuBackdrop}
          onPress={() => setMenuOpen(false)}
        >
          <View style={[styles.menu, { top: insets.top + 52 }]}>
            <Pressable
              style={styles.menuItem}
              onPress={() => {
                setMenuOpen(false);
                setConfirm({ kind: 'clear' });
              }}
              accessibilityRole="button"
            >
              <Icon
                name="trash-outline"
                size={18}
                color={colors.status.error}
              />
              <Text style={styles.menuText}>Clear cart</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* Remove-item / clear-cart confirmation */}
      <ConfirmDialog
        visible={confirm !== null}
        title={
          confirm?.kind === 'clear' ? 'Clear your cart?' : 'Remove this item?'
        }
        message={
          confirm?.kind === 'clear'
            ? 'All items will be removed. You can always add them back.'
            : `"${
                confirm?.name ?? 'This item'
              }" will be taken off your cart. You can always add it back.`
        }
        confirmLabel={confirm?.kind === 'clear' ? 'Clear cart' : 'Remove'}
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          if (confirm?.kind === 'clear') {
            clear();
          } else if (confirm?.kind === 'remove') {
            dec(confirm.id);
          }
          setConfirm(null);
        }}
      />
    </View>
  );
}

function BillRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.billRow}>
      <Text style={styles.billLabel}>{label}</Text>
      <View style={styles.priceRow}>
        <Dirham size={12} color={colors.text.primary} />
        <Text style={styles.billValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.brand.ivory },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTitle: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 18,
    color: colors.text.primary,
  },
  scroll: { paddingHorizontal: 20, paddingTop: 12, gap: 12 },

  card: {
    backgroundColor: colors.brand.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
  },
  gap4: { gap: 4 },
  cardDivider: { height: 1, backgroundColor: colors.border.subtle },
  eyebrow: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 10,
    letterSpacing: 0.8,
    color: colors.text.tertiary,
  },
  brandName: {
    fontFamily: fontFamily.displayBold,
    fontSize: 28,
    color: colors.text.primary,
  },
  branchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  branchText: { flex: 1 },
  branchTitle: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 13,
    color: colors.text.primary,
  },
  branchSub: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 11,
    color: colors.text.secondary,
  },
  switchLink: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 12,
    color: colors.text.primary,
  },

  // pickup radios
  radioRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: { borderColor: colors.brand.navy },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.brand.navy,
  },
  radioText: { flex: 1, gap: 2 },
  radioTitle: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 14,
    color: colors.text.primary,
  },
  radioSub: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 12,
    color: colors.text.secondary,
  },
  changeLink: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 12,
    color: colors.text.primary,
  },

  itemsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  sectionTitle: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 16,
    color: colors.text.primary,
  },
  addMore: {
    backgroundColor: colors.brand.pistachio,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  addMoreText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 12,
    color: colors.brand.navy,
  },
  itemsList: { gap: 12 },

  // line item
  lineCard: {
    flexDirection: 'row',
    height: 120,
    backgroundColor: colors.brand.white,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    overflow: 'hidden',
  },
  cardImg: { width: 120, height: 120, borderRadius: 12 },
  cardInfo: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    justifyContent: 'space-between',
  },
  cardHead: { gap: 2 },
  cardName: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 14,
    color: colors.text.primary,
  },
  cardDesc: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 11,
    color: colors.text.secondary,
  },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  price: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 14,
    color: colors.text.primary,
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
  stepBtn: { alignItems: 'center', justifyContent: 'center' },
  qty: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 13,
    color: colors.brand.navy,
    minWidth: 12,
    textAlign: 'center',
  },

  // cross-sell
  crossSell: { gap: 12, paddingVertical: 4 },
  railRow: { gap: 12, paddingRight: 4 },
  squareCard: {
    width: 150,
    backgroundColor: colors.brand.white,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    overflow: 'hidden',
    paddingBottom: 12,
  },
  squareImgWrap: { height: 120, width: '100%' },
  squareImg: { width: '100%', height: 120 },
  squareAdd: {
    position: 'absolute',
    right: 10,
    bottom: -16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.brand.pistachio,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  squareStepper: {
    position: 'absolute',
    right: 10,
    bottom: -15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 80,
    height: 32,
    borderRadius: 99,
    borderWidth: 1.5,
    borderColor: colors.border.default,
    backgroundColor: colors.brand.white,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  squareInfo: { paddingHorizontal: 12, paddingTop: 20, gap: 4 },
  squareName: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 13,
    color: colors.text.primary,
  },

  // order note
  noteTitle: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 14,
    color: colors.text.primary,
  },
  noteSub: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 11,
    color: colors.text.secondary,
  },
  noteInput: {
    height: 88,
    borderRadius: 10,
    backgroundColor: colors.surface.input,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: fontFamily.bodyRegular,
    fontSize: 14,
    color: colors.text.primary,
    textAlignVertical: 'top',
  },
  noteCount: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 11,
    color: colors.text.tertiary,
  },

  // cutlery
  cutleryCard: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  cutleryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.brand.pistachio,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cutleryText: { flex: 1, gap: 2 },
  cutleryTitle: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 14,
    color: colors.text.primary,
  },
  cutlerySub: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 11,
    lineHeight: 16,
    color: colors.text.secondary,
  },

  // tip
  tipTitle: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 16,
    color: colors.text.primary,
  },
  tipSub: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 12,
    color: colors.text.secondary,
  },
  tipRow: { flexDirection: 'row', gap: 8 },
  tipBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 12,
    borderRadius: 99,
    borderWidth: 1.5,
    borderColor: colors.border.default,
    backgroundColor: colors.brand.white,
  },
  tipBtnActive: {
    backgroundColor: colors.brand.navy,
    borderColor: colors.brand.navy,
  },
  tipBtnText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 14,
    color: colors.text.primary,
  },
  tipBtnTextActive: { color: colors.brand.ivory },

  // promo
  promoRow: { flexDirection: 'row', gap: 8 },
  promoField: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surface.input,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  promoInput: {
    flex: 1,
    fontFamily: fontFamily.bodyRegular,
    fontSize: 14,
    color: colors.text.primary,
    padding: 0,
  },
  promoApply: {
    backgroundColor: colors.brand.navy,
    borderRadius: 99,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promoApplyText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 14,
    color: colors.brand.ivory,
  },

  // bill
  billRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  billLabel: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 14,
    color: colors.text.secondary,
  },
  billValue: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 14,
    color: colors.text.primary,
  },
  pointsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 36,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(237,199,128,0.22)',
  },
  pointsText: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 13,
    color: colors.brand.navy,
  },
  pointsBold: { fontFamily: fontFamily.bodyBold },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalLabel: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 16,
    color: colors.text.primary,
  },
  totalValue: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 18,
    color: colors.text.primary,
  },

  // empty
  empty: { alignItems: 'center', gap: 8, paddingVertical: 48 },
  emptyTitle: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 16,
    color: colors.text.primary,
  },
  emptySub: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 13,
    color: colors.text.secondary,
  },

  // sticky
  stickyBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 88,
    backgroundColor: colors.brand.white,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
    paddingHorizontal: 20,
    paddingTop: 12,
    shadowColor: '#000000',
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -4 },
    elevation: 8,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: colors.brand.pistachio,
    overflow: 'hidden',
  },
  ctaDisabled: { opacity: 0.5 },
  ctaText: {
    zIndex: 2,
    fontFamily: fontFamily.bodyBold,
    fontSize: 16,
    color: colors.brand.navy,
  },
  ctaIcon: { zIndex: 2 },

  // top-right dropdown menu
  menuBackdrop: { flex: 1 },
  menu: {
    position: 'absolute',
    right: 12,
    minWidth: 150,
    backgroundColor: colors.brand.white,
    borderRadius: 14,
    padding: 6,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  menuText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 15,
    color: colors.status.error,
  },
});
