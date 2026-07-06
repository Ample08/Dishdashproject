import React, {useEffect, useRef, useState} from 'react';
import {Animated, Easing, Pressable, StyleSheet, Text, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {colors, fontFamily} from '../theme';
import {GradientFill} from './GradientFill';

/**
 * HeroRewardsCard (Figma 2563:3110).
 * Champagne gradient card: points + Benefits, a centered "banner tab" header on
 * the inner panel, 4 tier chips (Taste active → Gourmet), "See your ways to
 * earn", and the earn-rate ticker.
 */
type Tier = {top: string; name: string; active?: boolean; filled?: boolean};

const TIERS: Tier[] = [
  {top: 'Now', name: 'Taste', active: true},
  {top: '+1000', name: 'Savor'},
  {top: '+2500', name: 'Feast'},
  {top: '+5000', name: 'Gourmet', filled: true},
];

const TICKER_MSGS = [
  'Order food and earn points',
  'Dine in any branch 5 AED = 1 pt',
  'Refer a friend both get 100 pts',
];

function Coin({size = 24, animated = false}: {size?: number; animated?: boolean}) {
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!animated) {
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(1600),
        Animated.timing(spin, {
          toValue: 1,
          duration: 1300,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(spin, {toValue: 0, duration: 0, useNativeDriver: true}),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [animated, spin]);

  const inner = (
    <View style={[styles.coin, {width: size, height: size, borderRadius: size / 2}]}>
      <Icon name="star" size={size * 0.5} color={colors.brand.navy} />
    </View>
  );

  if (!animated) {
    return inner;
  }

  const rotateX = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={[
        styles.coinFlip,
        {width: size, height: size, transform: [{perspective: 600}, {rotateX}]},
      ]}>
      {inner}
    </Animated.View>
  );
}

export function HeroRewardsCard({
  onEarnPress,
  onBenefitsPress,
}: {
  onEarnPress?: () => void;
  onBenefitsPress?: () => void;
}) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 3000);
    return () => clearInterval(id);
  }, []);

  return (
    <View style={styles.card}>
      <GradientFill colors={['#EDD4A6', '#edd4a6']} radial />

      <View style={styles.topRow}>
        <View style={styles.pointsRow}>
          <Coin size={28} animated />
          <Text style={styles.points}>100</Text>
        </View>
        <Pressable
          style={styles.benefits}
          onPress={onBenefitsPress}
          accessibilityRole="button">
          <Text style={styles.benefitsText}>Benefits</Text>
          <Icon name="chevron-forward" size={14} color={colors.text.primary} />
        </Pressable>
      </View>

      <View style={styles.innerPanel}>
        <View style={styles.bannerTab}>
          <Text style={styles.bannerText}>900 more to reach savor</Text>
        </View>

        <View style={styles.panelBody}>
          <View style={styles.tierRow}>
            {TIERS.map(tier => (
              <View
                key={tier.name}
                style={[
                  styles.tier,
                  tier.filled && styles.tierFilled,
                  tier.active && styles.tierActive,
                ]}>
                <Text style={[styles.tierTop, tier.filled && styles.tierTextLight]}>
                  {tier.top}
                </Text>
                <Coin size={26} />
                <Text
                  style={[
                    styles.tierName,
                    !tier.active && styles.tierNameMuted,
                    tier.filled && styles.tierTextLight,
                  ]}>
                  {tier.name}
                </Text>
              </View>
            ))}
          </View>

          <Pressable style={styles.earnBtn} onPress={onEarnPress} accessibilityRole="button">
            <Text style={styles.earnText}>See your ways to earn</Text>
          </Pressable>

          <Text style={styles.ticker}>{TICKER_MSGS[tick % TICKER_MSGS.length]}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: 18,
    overflow: 'hidden',
    padding: 14,
    paddingTop:5,
    gap: 8,
    shadowColor: 'rgba(107,77,26,1)',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: {width: 0, height: 8},
    elevation: 4,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    paddingTop: 2,
  },
  pointsRow: {flexDirection: 'row', alignItems: 'center', gap: 10, height: 40,},
  points: {
    fontFamily: fontFamily.displayBlack,
    fontSize: 32,
    color: colors.brand.navy,
    includeFontPadding: false,
    textAlignVertical: 'center',
    top: 0,
    marginTop: -10,
  },
  coin: {
    backgroundColor: '#f0b429',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coinFlip: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefits: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: colors.brand.white,
    borderWidth: 1.2,
    borderColor: 'rgba(255,255,255,0.6)',
    paddingLeft: 12,
    paddingRight: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  benefitsText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 12,
    color: colors.text.primary,
  },
  innerPanel: {
    backgroundColor: '#f7e8c7',
    borderRadius: 14,
    overflow: 'hidden',
    alignItems: 'stretch',
  },
  bannerTab: {
    alignSelf: 'center',
    backgroundColor: '#ECDAB2',
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    paddingHorizontal: 24,
    paddingVertical: 10,
    minWidth: 240,
    alignItems: 'center',
  },
  bannerText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 15,
    color: colors.brand.navy,
  },
  panelBody: {padding: 14, gap: 10},
  tierRow: {flexDirection: 'row', gap: 6},
  tier: {
    flex: 1,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    paddingVertical: 5,
    paddingHorizontal: 6,
    alignItems: 'center',
    gap: 4,
  },
  tierActive: {
    borderWidth: 5,
    borderColor: colors.brand.pistachio,
  },
  tierFilled: {
    backgroundColor: colors.brand.navy,
    borderColor: colors.brand.navy,
  },
  tierTop: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 11,
    color: colors.brand.navy,
  },
  tierName: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 11,
    color: colors.brand.navy,
  },
  tierNameMuted: {
    fontFamily: fontFamily.bodyMedium,
    color: 'rgba(28,36,48,0.65)',
  },
  tierTextLight: {color: colors.brand.white},
  earnBtn: {
    backgroundColor: colors.brand.pistachio,
    borderRadius: 999,
    height: 45,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(107,77,26,1)',
    shadowOpacity: 0.22,
    shadowRadius: 7,
    shadowOffset: {width: 0, height: 6},
    elevation: 3,
  },
  earnText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 14,
    color: colors.text.onButton,
  },
  ticker: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: 12,
    color: 'rgba(28,36,48,0.7)',
    textAlign: 'center',
  },
});
