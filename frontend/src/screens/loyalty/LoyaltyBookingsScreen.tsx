import React, {useState} from 'react';
import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {Easing, FadeInLeft, FadeInRight} from 'react-native-reanimated';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {LoyaltyHeader} from '../../components/loyalty/LoyaltyHeader';
<<<<<<< HEAD
import {loyaltyColors} from '../../data/loyalty';
=======
import {
  BOOKING_STATUS_META,
  LOYALTY_BOOKINGS,
  loyaltyColors,
} from '../../data/loyalty';
>>>>>>> fac1606450bc6042e910ffbe7f2657c8e26be969
import type {RootStackScreenProps} from '../../navigation/types';
import {useLoyalty} from '../../state/LoyaltyContext';
import {colors, fontFamily} from '../../theme';

type Tab = 'Upcoming' | 'Past';

/** 37 · My Bookings (Figma 3772:6) — experience bookings, upcoming/past. */
export function LoyaltyBookingsScreen({
  navigation,
}: RootStackScreenProps<'LoyaltyBookings'>) {
  const insets = useSafeAreaInsets();
  const {loyaltyBookings} = useLoyalty();
  const [tab, setTab] = useState<Tab>('Upcoming');

  const visible = loyaltyBookings.filter(b =>
    tab === 'Past' ? b.past : !b.past,
  );

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <LoyaltyHeader title="MY BOOKINGS" onBack={navigation.goBack} caps />

      <View style={styles.toggleWrap}>
        <View style={styles.toggle}>
          {(['Upcoming', 'Past'] as Tab[]).map(t => (
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
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, {paddingBottom: insets.bottom + 24}]}>
        {visible.length === 0 ? (
          <Text style={styles.empty}>No {tab.toLowerCase()} bookings.</Text>
        ) : (
          visible.map(b => {
            const sm = BOOKING_STATUS_META[b.status];
            return (
              <View key={`${tab}-${b.id}`} style={styles.cardShell}>
                <Pressable
                  style={({pressed}) => [styles.card, pressed && styles.cardPressed]}
                  onPress={() =>
                    navigation.navigate('LoyaltyBookingDetail', {
                      bookingId: b.id,
                    })
                  }
                  accessibilityRole="button"
                  accessibilityLabel={`${b.title}, ${sm.label.toLowerCase()}`}>
                  <Animated.View
                    key={`${tab}-${b.id}-content`}
                    entering={(tab === 'Past' ? FadeInRight : FadeInLeft)
                      .duration(300)
                      .easing(Easing.out(Easing.cubic))}>
                  <View style={styles.cardHead}>
                    <Text style={styles.brand}>{b.brand}</Text>
                    {b.past ? (
                      <View
                        style={[
                          styles.statusPill,
                          {backgroundColor: sm.tint, borderColor: sm.border},
                        ]}>
                        <View
                          style={[styles.statusDot, {backgroundColor: sm.dot}]}
                        />
                        <Text style={styles.statusText}>{sm.label}</Text>
                      </View>
                    ) : (
                      <View style={styles.daysChip}>
                        <Text style={styles.daysText}>IN {b.inDays} DAYS</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.title}>{b.title}</Text>
                  <Text style={styles.meta}>
                    {b.dateLabel} · {b.location}
                  </Text>
                  </Animated.View>
                </Pressable>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: loyaltyColors.bgall},
  toggleWrap: {paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8},
  toggle: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    gap: 8,
  },
  toggleBtn: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  toggleOn: {backgroundColor: colors.brand.champagne, borderColor: colors.brand.champagne},
  toggleText: {fontFamily: fontFamily.bodyBold, fontSize: 13, color: colors.brand.white},
  toggleTextOn: {color: colors.brand.navy},

  scroll: {paddingHorizontal: 20, paddingTop: 8, gap: 14},
  empty: {fontFamily: fontFamily.bodyRegular, fontSize: 14, color: 'rgba(255,255,255,0.7)', textAlign: 'center', paddingVertical: 24},
  cardShell: {borderRadius: 18, overflow: 'hidden'},
  card: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(92,125,133,0.6)',
    backgroundColor: 'rgba(54,94,105,0.6)',
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  cardPressed: {opacity: 0.8},
  cardHead: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  brand: {fontFamily: fontFamily.bodyBold, fontSize: 12, color: 'rgba(249,240,234,0.85)'},
  daysChip: {borderRadius: 999, borderWidth: 1, borderColor: colors.brand.pistachio, paddingHorizontal: 10, paddingVertical: 3},
  daysText: {fontFamily: fontFamily.bodyBold, fontSize: 9, letterSpacing: 0.5, color: colors.brand.pistachio},
  // Past status pill (Figma dot-pill): tint fill + border + leading dot.
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderRadius: 999,
    paddingLeft: 8,
    paddingRight: 10,
    paddingVertical: 4,
  },
  statusDot: {width: 6, height: 6, borderRadius: 3},
  statusText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 10,
    letterSpacing: 0.3,
    color: 'rgba(249,240,234,0.95)',
  },
  title: {fontFamily: fontFamily.displayBold, fontSize: 20, color: colors.brand.white, marginTop: 8},
  meta: {fontFamily: fontFamily.bodyMedium, fontSize: 12, color: 'rgba(249,240,234,0.55)', marginTop: 6},
});
