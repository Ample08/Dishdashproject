import React from 'react';
import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import {VoucherCard} from '../../components/loyalty/Voucher';
import {REDEEM_STEPS, loyaltyColors} from '../../data/loyalty';
import type {RootStackScreenProps} from '../../navigation/types';
import {useLoyalty} from '../../state/LoyaltyContext';
import {colors, fontFamily} from '../../theme';

/**
 * WelcomeRevealOverlay (Figma 4068:345) — voucher reveal sheet with the
 * tap-to-reveal card and a "How to Redeem" walkthrough.
 */
export function WelcomeRevealScreen({
  navigation,
  route,
}: RootStackScreenProps<'WelcomeReveal'>) {
  const insets = useSafeAreaInsets();
  const {getVoucher} = useLoyalty();
  const voucher = getVoucher(route.params.voucherId);

  if (!voucher) {
    return <View style={styles.root} />;
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          {paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24},
        ]}>
        <Pressable
          style={styles.close}
          onPress={navigation.goBack}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Close">
          <Icon name="close" size={24} color={colors.brand.white} />
        </Pressable>

        <VoucherCard voucher={voucher} initiallyRevealed notchColor={loyaltyColors.bgTop} />

        <Text style={styles.title}>How to Redeem</Text>
        <Text style={styles.sub}>Show your code to staff at the restaurant</Text>

        <View style={styles.steps}>
          {REDEEM_STEPS.map((s, i) => (
            <View key={i} style={styles.step}>
              <View style={styles.num}>
                <Text style={styles.numText}>{i + 1}</Text>
              </View>
              <Text style={styles.stepText}>{s}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: loyaltyColors.bgTop},
  scroll: {paddingHorizontal: 24, gap: 16},
  close: {alignSelf: 'flex-start', marginBottom: 8},
  title: {
    fontFamily: fontFamily.displayBold,
    fontSize: 24,
    color: colors.brand.white,
    marginTop: 8,
  },
  sub: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginTop: -8,
  },
  steps: {gap: 16, marginTop: 4},
  step: {flexDirection: 'row', alignItems: 'center', gap: 14},
  num: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.brand.champagne,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numText: {fontFamily: fontFamily.bodyBold, fontSize: 13, color: colors.brand.champagne},
  stepText: {flex: 1, fontFamily: fontFamily.bodyMedium, fontSize: 14, color: colors.brand.white},
});
