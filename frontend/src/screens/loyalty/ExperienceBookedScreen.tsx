import React from 'react';
import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {FadeInDown, ZoomIn} from 'react-native-reanimated';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import Svg, {Defs, LinearGradient, Rect, Stop} from 'react-native-svg';
import {Confetti} from '../../components/Confetti';
import {Shimmer} from '../../components/Shimmer';
import {EXPERIENCES, LOYALTY_BOOKINGS, loyaltyColors} from '../../data/loyalty';
import type {RootStackScreenProps} from '../../navigation/types';
import {colors, fontFamily} from '../../theme';

/** 36 - Experience Booked: confetti enter state settling into booking summary. */
export function ExperienceBookedScreen({
  navigation,
  route,
}: RootStackScreenProps<'ExperienceBooked'>) {
  const insets = useSafeAreaInsets();
  const exp = EXPERIENCES.find(e => e.id === route.params.experienceId);
  const booking =
    LOYALTY_BOOKINGS.find(item => item.title === exp?.title) ?? LOYALTY_BOOKINGS[0];

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <Confetti count={72} speed={1.1} startBand={18} driftRange={120} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          {paddingTop: insets.top + 88, paddingBottom: insets.bottom + 116},
        ]}>
        <Animated.View entering={ZoomIn.delay(50).duration(700)} style={styles.badge}>
          <Icon name="checkmark" size={44} color={colors.brand.navy} />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(180).duration(700)} style={styles.heading}>
          <Text style={styles.eyebrow}>BOOKING CONFIRMED</Text>
          <Text style={styles.title}>You're booked!</Text>
          <Text style={styles.sub}>See you at the table</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(280).duration(700)} style={styles.card}>
          <Text style={styles.cardTitle}>{exp?.title ?? booking.title}</Text>
          <View style={styles.cardDivider} />
          <DetailRow label="Booking ID" value={booking.bookingId} />
          <DetailRow label="Branch" value={`${booking.brand} · ${booking.location}`} />
          <DetailRow label="Date" value={booking.date} />
          <DetailRow label="Time" value={booking.time} />
          <DetailRow label="Guests" value={String(booking.guests)} />
          <View style={styles.cardDivider} />
          <DetailRow label="Points deducted" value={`${booking.points} pts`} strong />
        </Animated.View>
      </ScrollView>

      <View style={[styles.footer, {paddingBottom: insets.bottom + 12}]}>
        <View style={styles.ctaShadow}>
          <Pressable
            style={styles.cta}
            onPress={() => navigation.navigate('LoyaltyBookings')}
            accessibilityRole="button">
            <ChampagneGradient />
            <Shimmer />
            <Text style={styles.ctaText}>View in My Bookings</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function DetailRow({label, value, strong}: {label: string; value: string; strong?: boolean}) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={[styles.detailValue, strong && styles.detailStrong]}>{value}</Text>
    </View>
  );
}

function ChampagneGradient() {
  return (
    <View style={styles.gradientFill} pointerEvents="none">
      <Svg width="100%" height="100%" preserveAspectRatio="none">
        <Defs>
          <LinearGradient id="bookedChampagne" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#F8E0AA" />
            <Stop offset="0.55" stopColor="#EBC98F" />
            <Stop offset="1" stopColor="#C6954F" />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#bookedChampagne)" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: loyaltyColors.bgTop},
  scroll: {paddingHorizontal: 28, alignItems: 'center'},
  badge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.brand.pistachio,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  heading: {alignItems: 'center'},
  eyebrow: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 11,
    letterSpacing: 1.7,
    color: colors.brand.champagne,
  },
  title: {
    fontFamily: fontFamily.displayBold,
    fontSize: 30,
    color: colors.brand.white,
    marginTop: 8,
  },
  sub: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 12,
    lineHeight: 18,
    color: 'rgba(255,255,255,0.65)',
    textAlign: 'center',
    marginTop: 4,
  },
  card: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    backgroundColor: loyaltyColors.surfaceTeal,
    padding: 16,
    marginTop: 24,
  },
  cardTitle: {
    fontFamily: fontFamily.displayBold,
    fontSize: 20,
    color: colors.brand.white,
  },
  cardDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
    marginVertical: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 18,
    marginVertical: 5,
  },
  detailLabel: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 11,
    color: 'rgba(255,255,255,0.48)',
  },
  detailValue: {
    flex: 1,
    fontFamily: fontFamily.bodyBold,
    fontSize: 12,
    color: colors.brand.white,
    textAlign: 'right',
  },
  detailStrong: {
    fontFamily: fontFamily.bodyBlack,
    fontSize: 16,
    color: colors.brand.champagne,
  },
  footer: {paddingHorizontal: 46, paddingTop: 6},
  ctaShadow: {
    borderRadius: 999,
    backgroundColor: colors.brand.champagne,
    shadowColor: colors.brand.champagne,
    shadowOpacity: 0.34,
    shadowRadius: 14,
    shadowOffset: {width: 0, height: 7},
    elevation: 10,
  },
  cta: {
    height: 54,
    borderRadius: 999,
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
