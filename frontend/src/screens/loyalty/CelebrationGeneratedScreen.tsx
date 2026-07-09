import React, {useEffect, useRef, useState} from 'react';
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Svg, {Defs, LinearGradient, Rect, Stop} from 'react-native-svg';
import {Confetti} from '../../components/Confetti';
import {VoucherCard} from '../../components/loyalty/Voucher';
import {loyaltyColors} from '../../data/loyalty';
import type {RootStackScreenProps} from '../../navigation/types';
import {useLoyalty} from '../../state/LoyaltyContext';
import {colors, fontFamily} from '../../theme';

/**
 * 32 Celebration Generated - "Bring the crew" reveal with the generated code card.
 */
export function CelebrationGeneratedScreen({
  navigation,
  route,
}: RootStackScreenProps<'CelebrationGenerated'>) {
  const insets = useSafeAreaInsets();
  const {getVoucher} = useLoyalty();
  const voucher = getVoucher(route.params.voucherId);
  const confettiY = useRef(new Animated.Value(-220)).current;
  const confettiOpacity = useRef(new Animated.Value(1)).current;
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(confettiY, {
        toValue: 720,
        duration: 2600,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(confettiOpacity, {
        toValue: 0.35,
        duration: 2600,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowConfetti(false);
    });
  }, [confettiOpacity, confettiY]);

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
          {paddingTop: insets.top + 36, paddingBottom: insets.bottom + 24},
        ]}
      >
        <Text style={styles.eyebrow}>YOUR CODE IS READY</Text>
        <Text style={styles.title}>Bring the crew</Text>
        <Text style={styles.sub}>
          Show this code at any Karaz or Jade dine-in
        </Text>

        <View style={styles.card}>
          <VoucherCard
            voucher={voucher}
            initiallyRevealed
            notchColor={loyaltyColors.bgTop}
          />
        </View>
      </ScrollView>

      <View style={[styles.footer, {paddingBottom: insets.bottom + 20}]}>
        <View style={styles.ctaShadow}>
          <Pressable
            style={styles.cta}
            onPress={() => navigation.navigate('MyVouchers')}
            accessibilityRole="button">
            <ChampagneGradient />
            <Text style={styles.ctaText}>View in My Vouchers</Text>
          </Pressable>
        </View>
      </View>

      {showConfetti ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.confettiLayer,
            {
              opacity: confettiOpacity,
              transform: [{translateY: confettiY}],
            },
          ]}>
          <Confetti count={60} />
        </Animated.View>
      ) : null}
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
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#champagne)" />
      </Svg>
    </View>
  );
}
const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: loyaltyColors.bgall},
  scroll: {paddingHorizontal: 24, alignItems: 'center'},
  eyebrow: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 11,
    letterSpacing: 1.4,
    color: colors.brand.champagne,
  },
  title: {
    fontFamily: fontFamily.displayBoldItalic,
    fontSize: 34,
    color: colors.brand.white,
    marginTop: 6,
  },
  sub: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 6,
    textAlign: 'center',
  },
  card: {width: '100%', marginTop: 28},
  confettiLayer: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 99,
    elevation: 99,
  },
  footer: {paddingHorizontal: 24, paddingTop: 6},
  ctaShadow: {
    borderRadius: 27,
    backgroundColor: '#EBC98F',
    shadowColor: '#EBC98F',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 10,
  },
  cta: {
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.brand.champagne,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  ctaText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 15,
    color: colors.brand.navy,
  },
  gradientFill: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
});
