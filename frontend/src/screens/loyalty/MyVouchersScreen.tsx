import React, {useState} from 'react';
import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {Easing, FadeIn, FadeOut} from 'react-native-reanimated';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Svg, {Defs, LinearGradient, Rect, Stop} from 'react-native-svg';
import Icon1 from 'react-native-vector-icons/Octicons';
import {BottomSheet} from '../../components/BottomSheet';
import {LoyaltyHeader} from '../../components/loyalty/LoyaltyHeader';
import {VoucherCard} from '../../components/loyalty/Voucher';
import {REDEEM_STEPS, loyaltyColors, type Voucher} from '../../data/loyalty';
import type {RootStackScreenProps} from '../../navigation/types';
import {useLoyalty} from '../../state/LoyaltyContext';
import {colors, fontFamily} from '../../theme';

type Tab = 'Active' | 'Used';

const CARD_W = 320;

export function MyVouchersScreen({
  navigation,
}: RootStackScreenProps<'MyVouchers'>) {
  const insets = useSafeAreaInsets();
  const {vouchers, redeemVoucher} = useLoyalty();
  const [tab, setTab] = useState<Tab>('Active');
  const [redeemOpen, setRedeemOpen] = useState(false);
  const [redeemTarget, setRedeemTarget] = useState<Voucher | null>(null);

  const visible = vouchers.filter(v =>
    tab === 'Used' ? v.status === 'used' : v.status !== 'used',
  );

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <LoyaltyHeader title="My Vouchers" onBack={navigation.goBack} />

      <View style={styles.toolbar}>
        <View style={styles.toggle}>
          {(['Active', 'Used'] as Tab[]).map(t => (
            <Pressable
              key={t}
              style={[styles.toggleBtn, tab === t && styles.toggleOn]}
              onPress={() => setTab(t)}>
              <Text style={[styles.toggleText, tab === t && styles.toggleTextOn]}>
                {t}
              </Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          onPress={() => setRedeemOpen(true)}
          accessibilityRole="button"
          accessibilityLabel="How to redeem">
          <Text style={styles.howTo}>How to redeem ›</Text>
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          {paddingBottom: insets.bottom + 24},
        ]}>
        <Animated.View
          key={tab}
          entering={FadeIn.duration(250).easing(Easing.out(Easing.cubic))}
          exiting={FadeOut.duration(250).easing(Easing.out(Easing.cubic))}>
          {visible.length === 0 ? (
            <Text style={styles.empty}>No {tab.toLowerCase()} vouchers yet.</Text>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={CARD_W + 12}
              snapToAlignment="start"
              decelerationRate="fast"
              contentContainerStyle={styles.rail}>
              {visible.map(v => (
                <VoucherCard
                  key={v.id}
                  voucher={v}
                  width={CARD_W}
                  notchColor={loyaltyColors.bgall}
                  onRedeem={() => setRedeemTarget(v)}
                />
              ))}
            </ScrollView>
          )}
        </Animated.View>

        <View style={styles.promo}>
          <View style={styles.promosub}>
            <View style={styles.promoGift}>
              <Icon1 name="gift" size={24} color="#1C2330" />
            </View>

            <View style={styles.promoContent}>
              <Text style={styles.promoTitle}>Celebration Voucher</Text>
              <Text style={styles.promoBody}>
                For your next big table — 20% off dine-in at any brand for 10+
                guests.
              </Text>
            </View>
          </View>

          <View style={styles.buttonShadow}>
            <Pressable
              style={styles.promoBtn}
              onPress={() => navigation.navigate('GenerateCelebration')}
              accessibilityRole="button">
              <ChampagneGradient />
              <Text style={styles.promoBtnText}>+  Generate a code</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <BottomSheet
        visible={redeemOpen}
        onClose={() => setRedeemOpen(false)}
        enterDuration={300}
        exitDuration={300}
        sheetStyle={styles.howSheet}>
        <Text style={styles.howTitle}>How to Redeem</Text>
        <Text style={styles.howSubtitle}>
          Show your code to staff at the restaurant
        </Text>

        {REDEEM_STEPS.map((step, i) => (
          <View key={i} style={styles.howStepRow}>
            <View style={styles.howStepNum}>
              <Text style={styles.howStepNumText}>{i + 1}</Text>
            </View>
            <Text style={styles.howStepText}>{step}</Text>
          </View>
        ))}

        <Pressable
          style={styles.howGotItBtn}
          onPress={() => setRedeemOpen(false)}
          accessibilityRole="button">
          <Text style={styles.howGotItText}>Got it</Text>
        </Pressable>
      </BottomSheet>

      <BottomSheet
        visible={redeemTarget !== null}
        onClose={() => setRedeemTarget(null)}>
        {redeemTarget ? (
          <View>
            <Text style={styles.sheetTitle}>Redeem {redeemTarget.title}</Text>

            <Text style={styles.redeemScope}>
              {redeemTarget.discount} OFF · {redeemTarget.scope}
            </Text>

            <View style={styles.redeemCodeBox}>
              <Text style={styles.redeemCodeLabel}>YOUR CODE</Text>
              <Text style={styles.redeemCode}>{redeemTarget.code}</Text>
            </View>

            <Text style={styles.redeemNote}>
              Show this code to the staff. Once they apply the discount, mark it
              redeemed — it will move to your Used tab.
            </Text>

            <Pressable
              style={styles.redeemPrimary}
              onPress={() => {
                redeemVoucher(redeemTarget.id);
                setRedeemTarget(null);
                setTab('Used');
              }}
              accessibilityRole="button">
              <Text style={styles.redeemPrimaryText}>Mark as redeemed</Text>
            </Pressable>

            <Pressable
              style={styles.redeemSecondary}
              onPress={() => setRedeemTarget(null)}
              accessibilityRole="button">
              <Text style={styles.redeemSecondaryText}>Not now</Text>
            </Pressable>
          </View>
        ) : null}
      </BottomSheet>
    </View>
  );
}

function ChampagneGradient() {
  return (
    <View style={styles.gradientFill} pointerEvents="none">
      <Svg width="100%" height="100%" preserveAspectRatio="none">
        <Defs>
          <LinearGradient id="champagne" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#F7DBA6" />
            <Stop offset="0.5" stopColor="#EBC98F" />
            <Stop offset="1" stopColor="#D1A86B" />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#champagne)" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: loyaltyColors.bgall},

  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },

  toggle: {
    flexDirection: 'row',
    backgroundColor: colors.brand.white,
    borderRadius: 999,
    padding: 3,
  },
  toggleBtn: {
    paddingHorizontal: 18,
    paddingVertical: 7,
    borderRadius: 999,
  },
  toggleOn: {
    backgroundColor: colors.brand.champagne,
  },
  toggleText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 13,
    color: 'rgba(28,35,48,0.55)',
  },
  toggleTextOn: {
    color: colors.brand.navy,
  },
  howTo: {
    fontFamily: fontFamily.bodySemibold,
    fontSize: 12,
    color: colors.brand.white,
  },

  scroll: {
    paddingHorizontal: 24,
    paddingTop: 12,
    gap: 16,
  },
  rail: {
    gap: 10,
    paddingRight: 18,
  },
  empty: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    paddingVertical: 24,
  },

  promo: {
    borderWidth: 1.5,
    borderColor: 'rgba(235,201,143,0.45)',
    borderRadius: 28,
    padding: 20,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  promosub: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  promoGift: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F7DBA6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  promoContent: {
    flex: 1,
  },
  promoTitle: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 15,
    color: colors.brand.white,
    marginBottom: 6,
  },
  promoBody: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 13,
    lineHeight: 21,
    color: colors.brand.white,
  },

  buttonShadow: {
    marginTop: 22,
    borderRadius: 999,
    backgroundColor: '#EBC98F',
    shadowColor: '#EBC98F',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 10,
  },
  promoBtn: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  promoBtnText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 14,
    color: colors.brand.navy,
  },

  howSheet: {
    backgroundColor: '#103f48',
    paddingHorizontal: 25,
    paddingTop: 12,
    paddingBottom: 26,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowOffset: {width: 0, height: 12},
    shadowRadius: 22,
    elevation: 14,
  },
  howTitle: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 21,
    lineHeight: 26,
    color: colors.brand.white,
    marginBottom: 2,
  },
  howSubtitle: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 12,
    lineHeight: 16,
    color: 'rgba(255,255,255,0.62)',
    marginBottom: 18,
  },
  howStepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 15,
  },
  howStepNum: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.brand.champagne,
    alignItems: 'center',
    justifyContent: 'center',
  },
  howStepNumText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 12,
    color: colors.brand.navy,
  },
  howStepText: {
    flex: 1,
    fontFamily: fontFamily.bodyRegular,
    fontSize: 13,
    lineHeight: 19,
    color: 'rgba(255,255,255,0.82)',
  },
  howGotItBtn: {
    marginTop: 14,
    height: 42,
    borderRadius: 8,
    backgroundColor: colors.brand.pistachio,
    alignItems: 'center',
    justifyContent: 'center',
  },
  howGotItText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 13,
    color: colors.brand.navy,
  },

  sheetTitle: {
    fontFamily: fontFamily.displayBold,
    fontSize: 24,
    color: colors.brand.navy,
    marginBottom: 18,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  stepNum: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.brand.champagne,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 12,
    color: colors.brand.navy,
  },
  stepText: {
    flex: 1,
    fontFamily: fontFamily.bodyMedium,
    fontSize: 14,
    lineHeight: 19,
    color: colors.brand.navy,
  },

  gotItBtn: {
    marginTop: 8,
    height: 50,
    borderRadius: 999,
    backgroundColor: colors.brand.champagne,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gotItText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 15,
    color: colors.brand.navy,
  },

  redeemScope: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 12,
    letterSpacing: 0.8,
    color: 'rgba(28,35,48,0.6)',
    marginTop: -12,
    marginBottom: 16,
  },
  redeemCodeBox: {
    backgroundColor: loyaltyColors.surfaceTeal,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    gap: 6,
  },
  redeemCodeLabel: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 10,
    letterSpacing: 1.2,
    color: 'rgba(255,255,255,0.7)',
  },
  redeemCode: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 22,
    letterSpacing: 3,
    color: colors.brand.white,
  },
  redeemNote: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(28,35,48,0.65)',
    marginTop: 14,
    marginBottom: 16,
  },
  redeemPrimary: {
    height: 52,
    borderRadius: 999,
    backgroundColor: colors.brand.champagne,
    alignItems: 'center',
    justifyContent: 'center',
  },
  redeemPrimaryText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 15,
    color: colors.brand.navy,
  },
  redeemSecondary: {
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  redeemSecondaryText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 14,
    color: 'rgba(28,35,48,0.6)',
  },

  gradientFill: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
});
