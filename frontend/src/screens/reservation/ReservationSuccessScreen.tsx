import React, { useEffect, useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { BrandHeader, InfoRow } from '../../components/BookingSummary';
import { PartyPopper } from '../../components/PartyPopper';
import { PrimaryButton } from '../../components/PrimaryButton';
import { BRANDS } from '../../data/menu';
import type { RootStackScreenProps } from '../../navigation/types';
import { useReservations } from '../../state/ReservationContext';
import { colors, fontFamily, radius } from '../../theme';

/**
 * 45 · Reservation Success (Figma 4545:6) — confetti + "On its way" request
 * confirmation with the booking summary and a 2-hour approval note.
 */
export function ReservationSuccessScreen({
  navigation,
  route,
}: RootStackScreenProps<'ReservationSuccess'>) {
  const insets = useSafeAreaInsets();
  const { getBooking, bookings } = useReservations();
  // After the backend responds the optimistic record's id becomes the real
  // booking ref, so fall back to the latest booking rather than going blank.
  const booking = getBooking(route.params.bookingId) ?? bookings[0];
  const [showPopper, setShowPopper] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowPopper(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (!booking) {
    return <View style={styles.root} />;
  }

  const restaurantName = BRANDS[booking.restaurant].name;

  return (
    <View style={styles.root}>
      <StatusBar
        barStyle="dark-content"
        translucent
        backgroundColor="transparent"
      />
      {showPopper ? <PartyPopper /> : null}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + 28, paddingBottom: insets.bottom + 24 },
        ]}
      >
        <View style={styles.badge}>
          <Icon name="time-outline" size={40} color={colors.brand.navy} />
        </View>

        <Text style={styles.eyebrow}>REQUEST SENT</Text>
        <Text style={styles.title}>On its way</Text>
        <Text style={styles.subtitle}>
          {restaurantName} {booking.branchName} is reviewing your booking
        </Text>

        <View style={styles.card}>
          <BrandHeader
            restaurant={booking.restaurant}
            branchName={booking.branchName}
            oneLine
          />
          <InfoRow align="split" label="BOOKING ID" value={`#${booking.id}`} />
          <InfoRow align="split" label="DATE" value={booking.dateFull} />
          <InfoRow align="split" label="TIME" value={booking.timeLabel} />
          <InfoRow
            align="split"
            label="GUESTS"
            value={`${booking.guests} guests`}
          />
          <InfoRow
            align="split"
            label="SEATING"
            value={booking.seatingLabel}
            last
          />
        </View>

        <View style={styles.banner}>
          <Icon
            name="alert-circle-outline"
            size={18}
            color={colors.status.error}
          />
          <Text style={styles.bannerText}>
            We've sent your request to {restaurantName}. You'll get a
            confirmation message once approved — usually within 2 hours.
          </Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <PrimaryButton
          label="View in My Bookings"
          onPress={() => navigation.navigate('MainTabs', { screen: 'Reserve' })}
          style={styles.cta}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.brand.ivory },
  scroll: { paddingHorizontal: 24, alignItems: 'center' },
  badge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.brand.champagne,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  eyebrow: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 11,
    letterSpacing: 1.4,
    color: colors.brand.karaz,
  },
  title: {
    fontFamily: fontFamily.displayBold,
    fontSize: 34,
    color: colors.brand.navy,
    marginTop: 6,
  },
  subtitle: {
    fontFamily: fontFamily.displayItalic,
    fontSize: 13,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 24,
  },
  card: {
    width: '100%',
    backgroundColor: colors.brand.white,
    borderRadius: 20,
    overflow: 'hidden',
    borderColor: colors.brand.navy,
    borderWidth: 1,

    shadowColor: 'rgba(28,36,48,1)',
    shadowOpacity: 0.1,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  banner: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    backgroundColor: colors.brand.champagne,
    borderRadius: radius.card,
    padding: 14,
    marginTop: 16,
  },
  bannerText: {
    flex: 1,
    fontFamily: fontFamily.bodyMedium,
    fontSize: 12,
    lineHeight: 17,
    color: colors.brand.navy,
  },
  footer: {
    paddingHorizontal: 30,
    paddingTop: 6,
    backgroundColor: colors.brand.ivory,
  },
  cta: { height: 54 },
});
