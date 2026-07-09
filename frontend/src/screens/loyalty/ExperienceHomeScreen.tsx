import React, {useEffect, useMemo, useRef, useState} from 'react';
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
import Icon from 'react-native-vector-icons/Ionicons';
import {ExperienceCard} from '../../components/loyalty/ExperienceCard';
import {LoyaltyHeader} from '../../components/loyalty/LoyaltyHeader';
import {EXPERIENCES, loyaltyColors} from '../../data/loyalty';
import type {RootStackScreenProps} from '../../navigation/types';
import {useLoyalty} from '../../state/LoyaltyContext';
import {colors, fontFamily} from '../../theme';

type Filter = 'All' | 'Jade' | 'Karaz';

function FlippingCoin() {
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
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
  }, [spin]);

  const rotateX = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View style={[styles.coinFlip, {transform: [{perspective: 600}, {rotateX}]}]}>
      <View style={styles.coin}>
        <Icon name="star" size={13} color={colors.brand.navy} />
      </View>
    </Animated.View>
  );
}

/** 34 · Experience Home (Figma 3528:6) — the full experiences catalogue. */
export function ExperienceHomeScreen({
  navigation,
}: RootStackScreenProps<'ExperienceHome'>) {
  const insets = useSafeAreaInsets();
  const {points} = useLoyalty();
  const [filter, setFilter] = useState<Filter>('All');

  const experiences = useMemo(
    () => EXPERIENCES.filter(e => (filter === 'All' ? true : e.brand === filter)),
    [filter],
  );

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <LoyaltyHeader title="Experiences" onBack={navigation.goBack} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, {paddingBottom: insets.bottom + 24}]}>
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>REDEEM YOUR POINTS</Text>
          <Text style={styles.title}>Tables that money can't book</Text>
          <Text style={styles.lead}>
            Hand-picked moments at Karaz and Jade. Claim with your points.
          </Text>
        </View>

        <View style={styles.actions}>
          <View style={styles.pointsPill}>
            <FlippingCoin />
            <Text style={styles.points}>{points.toLocaleString()} pts</Text>
            <Text style={styles.pointsSub} numberOfLines={1}>
              available to redeem
            </Text>
          </View>

          <Pressable
            style={styles.bookingPill}
            onPress={() => navigation.navigate('LoyaltyBookings')}
            accessibilityRole="button">
            <Icon name="calendar-outline" size={13} color={colors.brand.white} />
            <Text style={styles.bookingText}>View Bookings</Text>
          </Pressable>
        </View>

        <View style={styles.filters}>
          {(['All', 'Jade', 'Karaz'] as Filter[]).map(item => {
            const active = filter === item;
            return (
              <Pressable
                key={item}
                style={[styles.filter, active && styles.filterActive]}
                onPress={() => setFilter(item)}
                accessibilityRole="button">
                <Text style={[styles.filterText, active && styles.filterTextActive]}>
                  {item}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.cards}>
          {experiences.map(e => (
            <ExperienceCard
              key={e.id}
              experience={e}
              onPress={() =>
                navigation.navigate('ExperienceDetail', {experienceId: e.id})
              }
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: loyaltyColors.bgall},
  scroll: {paddingHorizontal: 20, paddingTop: 18},
  hero: {gap: 10},
  eyebrow: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 11,
    letterSpacing: 1.8,
    color: colors.brand.champagne,
  },
  title: {
    fontFamily: fontFamily.displayBold,
    fontSize: 25,
    lineHeight: 31,
    color: colors.brand.white,
  },
  lead: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 13,
    lineHeight: 19,
    color: colors.brand.white,
  },
  actions: {flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 18},
  pointsPill: {
    flex: 1,
    minHeight: 38,
    borderRadius: 999,
    backgroundColor: colors.brand.champagne,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    gap: 7,
  },
  coin: {
    width: 23,
    height: 23,
    borderRadius: 12,
    backgroundColor: '#f0b429',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coinFlip: {width: 23, height: 23, alignItems: 'center', justifyContent: 'center'},
  points: {
    fontFamily: fontFamily.bodyBlack,
    fontSize: 13,
    color: colors.brand.navy,
  },
  pointsSub: {
    flex: 1,
    fontFamily: fontFamily.bodyRegular,
    fontSize: 11,
    color: colors.brand.navy,
  },
  bookingPill: {
    minHeight: 38,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.45)',
    backgroundColor: 'rgba(255,255,255,0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
    gap: 6,
  },
  bookingText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 12,
    color: colors.brand.white,
  },
  filters: {flexDirection: 'row', gap: 10, marginTop: 20, marginBottom: 18},
  filter: {
    minHeight: 32,
    borderRadius: 999,
    backgroundColor: colors.brand.white,
    paddingHorizontal: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterActive: {backgroundColor: colors.brand.champagne},
  filterText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 13,
    color: colors.brand.navy,
  },
  filterTextActive: {color: colors.brand.navy},
  cards: {gap: 12},
});
