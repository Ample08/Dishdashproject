import React, {useState} from 'react';
import {
  Linking,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {FadeInDown} from 'react-native-reanimated';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import {BottomSheet} from '../../components';
import {BookingReviewSheet} from '../../components/loyalty/BookingReviewSheet';
import {LoyaltyHeader} from '../../components/loyalty/LoyaltyHeader';
import {
  BOOKING_STATUS_META,
  bookingById,
  loyaltyColors,
  type LoyaltyBooking,
} from '../../data/loyalty';
import type {RootStackScreenProps} from '../../navigation/types';
import {colors, fontFamily} from '../../theme';

/**
 * 38 · Booking Detail (Figma 6522:24633) — status-aware experience booking.
 * Hero + status pill, booking-id card, a status-specific card (empathy for
 * no-show, review for completed, notice for cancelled), details, branch +
 * open-maps, and a "Need help?" footer. Cards fade/slide in on mount.
 */
type Props = RootStackScreenProps<'LoyaltyBookingDetail'>;

/** Points row label reads differently per lifecycle stage. */
function pointsLabel(status: LoyaltyBooking['status']): string {
  if (status === 'upcoming') {
    return 'Points to earn';
  }
  if (status === 'cancelled') {
    return 'Points refunded';
  }
  return 'Points deducted';
}

export function LoyaltyBookingDetailScreen({navigation, route}: Props) {
  const insets = useSafeAreaInsets();
  const [reviewOpen, setReviewOpen] = useState(false);
  const booking = bookingById(route.params.bookingId);

  if (!booking) {
    return (
      <View style={styles.root}>
        <StatusBar barStyle="light-content" />
        <LoyaltyHeader title="Booking Detail" onBack={navigation.goBack} />
        <Text style={styles.missing}>Booking not found.</Text>
      </View>
    );
  }

  const meta = BOOKING_STATUS_META[booking.status];

  const openMaps = () => {
    const query = encodeURIComponent(`${booking.brand} ${booking.address}`);
    Linking.openURL(
      `https://www.google.com/maps/search/?api=1&query=${query}`,
    ).catch(() => {});
  };
  // Completed bookings open the review overlay (Figma BookingReviewOverlay).
  const leaveReview = () => setReviewOpen(true);
  const contactUs = () => Linking.openURL('tel:+97144000000').catch(() => {});

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <LoyaltyHeader title="Booking Detail" onBack={navigation.goBack} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          {paddingBottom: insets.bottom + 28},
        ]}>
        {/* Hero */}
        <Animated.View entering={FadeInDown.duration(380)} style={styles.hero}>
          <Text style={styles.heroBrand}>
            {booking.brand} · {booking.location}
          </Text>
          <Text style={styles.heroTitle}>{booking.title}</Text>
          <View style={styles.heroPillRow}>
            <StatusPill status={booking.status} />
          </View>
        </Animated.View>

        {/* Booking ID card */}
        <Animated.View
          entering={FadeInDown.delay(80).duration(380)}
          style={styles.idCard}>
          <Text style={styles.idLabel}>BOOKING ID</Text>
          <Text style={styles.idValue}>{booking.bookingId}</Text>
          <Text style={styles.idSub}>Show this code at the restaurant</Text>
        </Animated.View>

        {/* Status-specific card */}
        {booking.status === 'no-show' && (
          <Animated.View
            entering={FadeInDown.delay(140).duration(380)}
            style={styles.statusCard}>
            <Text style={styles.statusCardTitle}>Sorry we missed you</Text>
            <Text style={styles.statusCardBody}>
              Your table was held but went unused. Hope to see you soon.
            </Text>
          </Animated.View>
        )}

        {booking.status === 'completed' && (
          <Animated.View
            entering={FadeInDown.delay(140).duration(380)}
            // style={styles.statusCard}
            >
            <Pressable
              style={({pressed}) => [
                styles.reviewBtn,
                pressed && styles.pressed,
              ]}
              onPress={leaveReview}
              accessibilityRole="button">
              <Icon name="logo-google" size={15} color={colors.brand.navy} />
              <Text style={styles.reviewBtnText}>Leave a Google review</Text>
            </Pressable>       
          </Animated.View>
        )}

        {booking.status === 'cancelled' && (
          <Animated.View
            entering={FadeInDown.delay(140).duration(380)}
            style={styles.statusCard}>
            <Text style={styles.statusCardTitle}>Booking cancelled</Text>
            <Text style={styles.statusCardBody}>
              This booking was cancelled. Any points held for it have been
              refunded to your balance.
            </Text>
          </Animated.View>
        )}

        {/* Details card */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(380)}
          style={styles.detailsCard}>
          <DetailRow label="Date" value={booking.date} />
          <DetailRow label="Time" value={booking.time} />
          <DetailRow label="Guests" value={String(booking.guests)} />
          <View style={styles.detailsDivider} />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{pointsLabel(booking.status)}</Text>
            <Text style={styles.pointsValue}>{booking.points} pts</Text>
          </View>
        </Animated.View>

        {/* Branch card */}
        <Animated.View
          entering={FadeInDown.delay(260).duration(380)}
          style={styles.branchCard}>
          <View style={styles.branchRow}>
            <Icon
              name="location-outline"
              size={22}
              color={colors.brand.champagne}
            />
            <View style={styles.branchText}>
              <Text style={styles.branchName}>
                {booking.brand} · {booking.location}
              </Text>
              <Text style={styles.branchAddr}>{booking.address}</Text>
            </View>
          </View>
          <Pressable
            style={({pressed}) => [styles.mapsBtn, pressed && styles.pressed]}
            onPress={openMaps}
            accessibilityRole="button">
            <Icon name="map-outline" size={16} color={loyaltyColors.bgall} />
            <Text style={styles.mapsBtnText}>Open in Google Maps</Text>
          </Pressable>
        </Animated.View>

        {/* Need help */}
        <Animated.View
          entering={FadeInDown.delay(320).duration(380)}
          style={styles.needHelp}>
          <Text style={styles.needHelpText}>Need help?</Text>
          <Pressable onPress={contactUs} hitSlop={8} accessibilityRole="button">
            <Text style={styles.needHelpLink}>Contact us</Text>
          </Pressable>
        </Animated.View>
      </ScrollView>

      <BottomSheet
        visible={reviewOpen}
        onClose={() => setReviewOpen(false)}
        sheetStyle={styles.reviewSheet}>
        <BookingReviewSheet
          brand={booking.brand}
          location={booking.location}
          onClose={() => setReviewOpen(false)}
        />
      </BottomSheet>
    </View>
  );
}

function StatusPill({status}: {status: LoyaltyBooking['status']}) {
  const m = BOOKING_STATUS_META[status];
  return (
    <View style={[styles.pill, {backgroundColor: m.tint, borderColor: m.border}]}>
      <View style={[styles.pillDot, {backgroundColor: m.dot}]} />
      <Text style={styles.pillText}>{m.label}</Text>
    </View>
  );
}

function DetailRow({label, value}: {label: string; value: string}) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const IVORY = colors.brand.ivory;

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: loyaltyColors.bgall},
  missing: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    paddingVertical: 32,
  },
  scroll: {paddingHorizontal: 20, paddingTop: 8, gap: 19},

  // Hero
  hero: {gap: 8, paddingHorizontal: 4, paddingVertical: 14},
  heroBrand: {fontFamily: fontFamily.bodyBold, fontSize: 13, color: IVORY},
  heroTitle: {
    fontFamily: fontFamily.displayBold,
    fontSize: 28,
    color: IVORY,
  },
  heroPillRow: {flexDirection: 'row', paddingTop: 4},

  // Status pill
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderRadius: 999,
    paddingLeft: 8,
    paddingRight: 10,
    paddingVertical: 4,
  },
  pillDot: {width: 6, height: 6, borderRadius: 3},
  pillText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 10,
    letterSpacing: 0.5,
    color: 'rgba(249,240,234,0.95)',
  },

  // Booking id card
  idCard: {
    backgroundColor: '#325b61',
    borderWidth: 1,
    borderColor: '#5f7b78',
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  idLabel: {fontFamily: fontFamily.bodyBold, fontSize: 11, color: IVORY},
  idValue: {
    fontFamily: fontFamily.bodyBlack,
    fontSize: 32,
    letterSpacing: 2,
    color: colors.brand.champagne,
  },
  idSub: {fontFamily: fontFamily.bodyMedium, fontSize: 12, color: IVORY},

  // Status-specific card
  statusCard: {
    backgroundColor: '#28545e',
    borderWidth: 1,
    borderColor: '#3c636b',
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingVertical: 18,
    gap: 8,
  },
  statusCardTitle: {fontFamily: fontFamily.bodyBold, fontSize: 15, color: IVORY},
  statusCardBody: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 12,
    lineHeight: 18,
    color: IVORY,
  },
  reviewBtn: {
    marginTop: 4,
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 999,
    backgroundColor: colors.brand.champagne,
  },
  reviewBtnText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 13,
    color: colors.brand.navy,
  },
  maybeLater: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: 12,
    color: 'rgba(249,240,234,0.7)',
    textAlign: 'center',
    paddingTop: 4,
  },

  // Details card
  detailsCard: {
    backgroundColor: '#365e69',
    borderWidth: 1,
    borderColor: '#5c7d85',
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingVertical: 18,
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detailLabel: {fontFamily: fontFamily.bodyMedium, fontSize: 12, color: IVORY},
  detailValue: {fontFamily: fontFamily.bodyBold, fontSize: 14, color: IVORY},
  detailsDivider: {height: 1, backgroundColor: 'rgba(249,240,234,0.18)'},
  pointsValue: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 18,
    color: colors.brand.champagne,
  },

  // Branch card
  branchCard: {
    backgroundColor: '#365e69',
    borderWidth: 1,
    borderColor: '#5c7d85',
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingVertical: 18,
    gap: 12,
  },
  branchRow: {flexDirection: 'row', alignItems: 'center', gap: 10},
  branchText: {flex: 1},
  branchName: {fontFamily: fontFamily.bodyBold, fontSize: 14, color: IVORY},
  branchAddr: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: 11,
    color: IVORY,
    marginTop: 2,
  },
  mapsBtn: {
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 999,
    backgroundColor: IVORY,
  },
  mapsBtnText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 13,
    color: loyaltyColors.bgall,
  },

  // Need help
  needHelp: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingTop: 4,
  },
  needHelpText: {fontFamily: fontFamily.bodyMedium, fontSize: 12, color: IVORY},
  needHelpLink: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 12,
    color: colors.brand.champagne,
  },

  pressed: {opacity: 0.7},

  // Review overlay sheet — dark surface (Figma BookingReviewOverlay #143842).
  reviewSheet: {backgroundColor: '#143842'},
});
