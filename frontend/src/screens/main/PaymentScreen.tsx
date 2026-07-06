import React, {useState} from 'react';
import {
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
import {Shimmer} from '../../components/Shimmer';
import {BRANDS} from '../../data/menu';
import type {RootStackScreenProps} from '../../navigation/types';
import {useCart} from '../../state/CartContext';
import {useOrders} from '../../state/OrderContext';
import {colors, fontFamily, radius} from '../../theme';
import { Coin } from '../../components';

/**
 * 25 · Payment (Figma 2015:2359)
 * Order recap + points-earn strip, a "PAY WITH" radio list (Apple Pay /
 * Google Pay / New card with inline card form), a security note and a sticky
 * pistachio "Pay · {total}" bar. Total = cart subtotal + static fees/VAT.
 */
type Method = 'apple' | 'google' | 'card';

// Static fees/VAT layered on top of the live cart subtotal (matches design).
const SERVICE_FEE = 6.0;
const VAT_RATE = 0.05;

export function PaymentScreen({navigation}: RootStackScreenProps<'Payment'>) {
  const insets = useSafeAreaInsets();
  const {subtotal, count, lines} = useCart();
  const {placeOrder} = useOrders();
  const [method, setMethod] = useState<Method>('card');
  const [saveCard, setSaveCard] = useState(false);

  const vat = subtotal * VAT_RATE;
  const total = subtotal + SERVICE_FEE + vat;
  const totalLabel = total.toFixed(2);

  const onPay = () => {
    const brandKey = lines[0]?.brand ?? 'Karaz';
    placeOrder({
      brand: brandKey,
      branch: BRANDS[brandKey].branch,
      itemCount: count,
      total,
      items: lines.map(l => ({qty: l.qty, name: l.name, price: l.price})),
    });
    navigation.navigate('OrderSuccess');
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />

      {/* TopBar */}
      <View style={[styles.topBar, {paddingTop: insets.top + 8}]}>
        <Pressable
          style={styles.backBtn}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={24} color={colors.text.primary} />
        </Pressable>
        <Text style={styles.title}>Payment</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}>
        {/* Order recap */}
        <View style={styles.recap}>
          <Text style={styles.recapBrand}>Karaz</Text>
          <View style={styles.dot} />
          <Text style={styles.recapMuted}>Dubai Mall</Text>
          <View style={styles.dot} />
          <Text style={styles.recapMuted}>{count} items</Text>
          <View style={styles.dot} />
          <View style={styles.recapTotal}>
            <Dirham size={11} color={colors.text.primary} />
            <Text style={styles.recapTotalText}>{totalLabel}</Text>
            <Icon name="chevron-down" size={14} color={colors.text.primary} />
          </View>
        </View>

        <View style={styles.hairline} />

        {/* Points earn strip */}
        <View style={styles.earnStrip}>
        
          <Coin size={16}  />
          <Text style={styles.earnText}>
            Earn <Text style={styles.earnBold}>+12 pts</Text> on this order
          </Text>
        </View>

        {/* Methods */}
        <View style={styles.methods}>
          <Text style={styles.sectionLabel}>PAY WITH</Text>

          <MethodCard
            icon={<Icon name="logo-apple" size={22} color={colors.text.primary} />}
            label="Apple Pay"
            sub="One-tap with Touch ID / Face ID"
            selected={method === 'apple'}
            onPress={() => setMethod('apple')}
          />

          <MethodCard
            icon={<Icon name="logo-google" size={20} color={colors.text.primary} />}
            label="Google Pay"
            sub="One-tap with your Google account"
            selected={method === 'google'}
            onPress={() => setMethod('google')}
          />

          <MethodCard
            icon={<Icon name="card-outline" size={22} color={colors.text.primary} />}
            label="New card"
            sub="Pay with Visa, Mastercard, or Amex"
            selected={method === 'card'}
            onPress={() => setMethod('card')}>
            {method === 'card' && (
              <View style={styles.cardForm}>
                <TextInput
                  style={styles.input}
                  placeholder="Card number"
                  placeholderTextColor={colors.text.tertiary}
                  keyboardType="number-pad"
                />
                <View style={styles.inputRow}>
                  <TextInput
                    style={[styles.input, styles.inputHalf]}
                    placeholder="MM / YY"
                    placeholderTextColor={colors.text.tertiary}
                    keyboardType="number-pad"
                  />
                  <TextInput
                    style={[styles.input, styles.inputHalf]}
                    placeholder="CVC"
                    placeholderTextColor={colors.text.tertiary}
                    keyboardType="number-pad"
                  />
                </View>
                <Pressable
                  style={styles.saveRow}
                  onPress={() => setSaveCard(s => !s)}>
                  <View
                    style={[styles.checkbox, saveCard && styles.checkboxOn]}>
                    {saveCard && (
                      <Icon name="checkmark" size={14} color={colors.brand.white} />
                    )}
                  </View>
                  <Text style={styles.saveText}>Save card for next time</Text>
                </Pressable>
              </View>
            )}
          </MethodCard>
        </View>

        {/* Trust note */}
        <View style={styles.trustNote}>
          <Icon name="lock-closed-outline" size={16} color={colors.text.secondary} />
          <Text style={styles.trustText}>
            Encrypted via Network International. Card details never stored on our
            servers.
          </Text>
        </View>
      </ScrollView>

      {/* Sticky pay bar */}
      <View style={[styles.payBar, {paddingBottom: insets.bottom + 12}]}>
        <Pressable style={styles.payBtn} accessibilityRole="button" onPress={onPay}>
          <Text style={styles.payBtnText}>Pay ·</Text>
          <View style={styles.payBtnIcon}>
            <Dirham size={16} color={colors.brand.navy} />
          </View>
          <Text style={styles.payBtnText}>{totalLabel}</Text>
          <Shimmer />
        </Pressable>
        <Text style={styles.terms}>
          By tapping Pay, you accept our Terms of Service.
        </Text>
      </View>
    </View>
  );
}

function MethodCard({
  icon,
  label,
  sub,
  selected,
  onPress,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  sub: string;
  selected: boolean;
  onPress: () => void;
  children?: React.ReactNode;
}) {
  return (
    <Pressable
      style={[styles.methodCard, selected && styles.methodCardSelected]}
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{selected}}>
      <View style={styles.methodRow}>
        <View style={styles.methodIcon}>{icon}</View>
        <View style={styles.methodTextCol}>
          <Text style={styles.methodLabel}>{label}</Text>
          <Text style={styles.methodSub}>{sub}</Text>
        </View>
        <View style={[styles.radio, selected && styles.radioOn]}>
          {selected && <View style={styles.radioDot} />}
        </View>
      </View>
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: colors.brand.ivory},
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 18,
    color: colors.text.primary,
  },
  scroll: {paddingBottom: 24},
  recap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 12,
  },
  recapBrand: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 13,
    color: colors.text.primary,
  },
  recapMuted: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 13,
    color: colors.text.secondary,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.text.tertiary,
  },
  recapTotal: {flexDirection: 'row', alignItems: 'center', gap: 4},
  recapTotalText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 13,
    color: colors.text.primary,
  },
  hairline: {height: 1, backgroundColor: colors.border.subtle},
  earnStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 20,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(237,199,128,0.22)',
  },
  earnText: {
    flex: 1,
    fontFamily: fontFamily.bodyRegular,
    fontSize: 13,
    color: colors.brand.navy,
  },
  earnBold: {fontFamily: fontFamily.bodyBold},
  methods: {paddingHorizontal: 20, paddingTop: 20, gap: 12},
  sectionLabel: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 10,
    letterSpacing: 0.8,
    color: colors.text.tertiary,
  },
  methodCard: {
    backgroundColor: colors.brand.white,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    borderRadius: radius.input,
    overflow: 'hidden',
  },
  methodCardSelected: {borderColor: colors.brand.navy},
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
  },
  methodIcon: {
    width: 40,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodTextCol: {flex: 1, gap: 2},
  methodLabel: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 15,
    color: colors.text.primary,
  },
  methodSub: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 12,
    color: colors.text.secondary,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: {
    borderColor: colors.brand.navy,
    backgroundColor: colors.brand.navy,
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.brand.white,
  },
  cardForm: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 16,
    gap: 10,
  },
  input: {
    height: 40,
    backgroundColor: colors.surface.input,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontFamily: fontFamily.bodyRegular,
    fontSize: 14,
    color: colors.text.primary,
  },
  inputRow: {flexDirection: 'row', gap: 10},
  inputHalf: {flex: 1},
  saveRow: {flexDirection: 'row', alignItems: 'center', gap: 10, paddingTop: 4},
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: colors.border.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOn: {
    borderColor: colors.brand.navy,
    backgroundColor: colors.brand.navy,
  },
  saveText: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 13,
    color: colors.text.primary,
  },
  trustNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  trustText: {
    flex: 1,
    fontFamily: fontFamily.bodyRegular,
    fontSize: 11,
    lineHeight: 16,
    color: colors.text.secondary,
  },
  payBar: {
    backgroundColor: colors.brand.white,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 8,
  },
  payBtn: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: radius.pill,
    overflow: 'hidden',
    backgroundColor: colors.brand.pistachio,
  },
  payBtnText: {
    zIndex: 2,
    fontFamily: fontFamily.bodyBold,
    fontSize: 16,
    color: colors.brand.navy,
  },
  payBtnIcon: {zIndex: 2},
  terms: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 11,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
});
