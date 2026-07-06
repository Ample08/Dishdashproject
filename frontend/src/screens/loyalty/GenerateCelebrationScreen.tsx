import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { AuroraBackground } from '../../components/loyalty/AuroraBackground';
import { LoyaltyHeader } from '../../components/loyalty/LoyaltyHeader';
import { CELEBRATION_STEPS, loyaltyColors } from '../../data/loyalty';
import type { RootStackScreenProps } from '../../navigation/types';
import { useLoyalty } from '../../state/LoyaltyContext';
import { colors, fontFamily } from '../../theme';

const MIN = 10;

/**
 * 31 · Generate Celebration (Figma 3286:6) — 20% party voucher generator with
 * a guest stepper (min 10) and a "How It Works" walkthrough.
 */
export function GenerateCelebrationScreen({
  navigation,
}: RootStackScreenProps<'GenerateCelebration'>) {
  const insets = useSafeAreaInsets();
  const { generateCelebration } = useLoyalty();
  const [guests, setGuests] = useState(MIN);

  const generate = () => {
    const v = generateCelebration(guests);
    navigation.replace('CelebrationGenerated', { voucherId: v.id });
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      {/* <AuroraBackground /> */}
      <LoyaltyHeader title="Celebration Voucher" onBack={navigation.goBack} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <ChampagneGradient />
          <Text style={styles.heroLabel}>CELEBRATION OFFER</Text>
          <Text style={styles.heroPct}>20% OFF</Text>
          <Text style={styles.heroSub}>Dine-in for parties of 10 or more</Text>
        </View>

        <Text style={styles.section}>
          Party size{'  '}
          <Text style={styles.sectionHint}>Min 10 guests · No upper limit</Text>
        </Text>
        <View style={styles.stepper}>
          <Pressable
            style={[
              styles.stepBtn,
              styles.stepGhost,
              guests <= MIN && styles.dim,
            ]}
            onPress={() => guests > MIN && setGuests(guests - 1)}
            disabled={guests <= MIN}
          >
            <Icon name="remove-outline" size={20} color={'#000000'} />
          </Pressable>
          <View style={styles.countCol}>
            <Text style={styles.count}>{guests}</Text>
            <Text style={styles.countLabel}>guests</Text>
          </View>
          <Pressable
            style={[styles.stepBtn, styles.stepGold]}
            onPress={() => setGuests(guests + 1)}
          >
            <ChampagneGradient />
            <Icon name="add-outline" size={20} color={'#000000'} />
          </Pressable>
        </View>

        <Text style={styles.howTitle}>How It Works</Text>
        <View style={styles.steps}>
          {CELEBRATION_STEPS.map((s, i) => (
            <View key={i} style={styles.step}>
              <View style={styles.num}>
                <Text style={styles.numText}>{i + 1}</Text>
              </View>
              <Text style={styles.stepText}>{s}</Text>
            </View>
          ))}
        </View>
       <View style={styles.footer}>
  <View style={styles.ctaShadow}>
    <Pressable
      style={styles.cta}
      onPress={generate}
      accessibilityRole="button"
    >
      <ChampagneGradient />
      <Text style={styles.ctaText}>Generate Voucher</Text>
    </Pressable>
  </View>
</View>
      </ScrollView>

      
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
  root: { flex: 1, backgroundColor: loyaltyColors.bgall },
  scroll: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24 },

  hero: {
    backgroundColor: colors.brand.champagne,
    borderRadius: 18,
    paddingHorizontal: 22,
    paddingVertical: 22,
    gap: 4,
    overflow: 'hidden',
  },
  heroLabel: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 11,
    letterSpacing: 1,
    color: colors.brand.navy,
  },
  heroPct: {
    fontFamily: fontFamily.displayBold,
    fontSize: 40,
    color: colors.brand.navy,
  },
  heroSub: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 13,
    color: colors.brand.navy,
  },

  section: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 15,
    color: colors.brand.white,
    marginTop: 24,
  },
  sectionHint: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 12,
    color: colors.brand.white,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: loyaltyColors.surfaceTeal,
    borderRadius: 16,
    paddingHorizontal: 22,
    paddingVertical: 18,
    marginTop: 12,
  },
  stepBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepGhost: { backgroundColor: 'rgba(255,255,255,0.85)' },
  stepGold: { backgroundColor: colors.brand.champagne, overflow: 'hidden' },
  dim: { opacity: 0.9 },
  countCol: { alignItems: 'center' },
  count: {
    fontFamily: fontFamily.bodyBlack,
    fontSize: 34,
    color: colors.brand.white,
  },
  countLabel: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: 12,
    color: '#ffffff',
  },

  howTitle: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 17,
    color: colors.brand.white,
    marginTop: 26,
    marginBottom: 14,
  },
  steps: { gap: 16 },
  step: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  num: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.brand.champagne,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 13,
    color: colors.brand.navy,
  },
  stepText: {
    flex: 1,
    fontFamily: fontFamily.bodyRegular,
    fontSize: 13,
    color: colors.brand.white,
  },

 footer: {
  paddingTop: 25,
  backgroundColor: 'transparent',
},

ctaShadow: {
  borderRadius: 27,
  backgroundColor: '#EBC98F',

  shadowColor: '#EBC98F',
  shadowOffset: {
    width: 0,
    height: 6,
  },
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
