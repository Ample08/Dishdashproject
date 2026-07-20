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
import {BrandHeader, InfoRow} from '../../components/BookingSummary';
import {PrimaryButton} from '../../components/PrimaryButton';
import {ReservationHeader} from '../../components/ReservationHeader';
import {branchByKey} from '../../data/reservations';
import type {RootStackScreenProps} from '../../navigation/types';
import {seatingLabel, to12h, useReservations} from '../../state/ReservationContext';
import {useProfileGate} from '../../state/useProfileGate';
import {colors, fontFamily} from '../../theme';

/**
 * 44 · Confirm Booking — review of the draft before it is committed.
 * The review body is exported so the When screen can show it inside a sheet.
 */
export function ConfirmBookingScreen({
  navigation,
}: RootStackScreenProps<'ConfirmBooking'>) {
  const insets = useSafeAreaInsets();
  const {createBooking, resetDraft} = useReservations();
  const requireProfile = useProfileGate();

  const confirm = () =>
    requireProfile(() => {
      const booking = createBooking();
      resetDraft();
      navigation.replace('ReservationSuccess', {bookingId: booking.id});
    }, 'Add your name, email and date of birth to book a table.');

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />
      <ReservationHeader title="New Reservation" onBack={navigation.goBack} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}>
        <ConfirmBookingReview onEdit={() => navigation.navigate('WhenTable')} />
      </ScrollView>

      <View style={[styles.footer, {paddingBottom: insets.bottom + 12}]}>
        <PrimaryButton label="Confirm Booking" onPress={confirm} style={styles.cta} />
      </View>
    </View>
  );
}

export function ConfirmBookingReview({onEdit}: {onEdit: () => void}) {
  const {draft} = useReservations();
  const restaurant = draft.restaurant ?? 'Karaz';
  const branchName = branchByKey(draft.branch ?? 'dubai-mall').name;

  return (
    <>
      <Text style={styles.title}>Review your booking</Text>
      <Text style={styles.sub}>A quick look before we lock it in</Text>

      <View style={styles.card}>
        <BrandHeader restaurant={restaurant} branchName={branchName} />
        <InfoRow icon="calendar-outline" label="DATE" value={draft.dateFull ?? '-'} />
        <InfoRow
          icon="time-outline"
          label="TIME"
          value={draft.time ? to12h(draft.time) : '-'}
        />
        <InfoRow
          icon="people-outline"
          label="GUESTS"
          value={`${draft.guests} guests`}
        />
        <InfoRow
          icon="navigate-outline"
          label="SEATING"
          value={seatingLabel(draft.seating, draft.shisha)}
          last={!draft.note.trim()}
        />
        {draft.note.trim() ? (
          <InfoRow
            icon="document-text-outline"
            label="YOUR NOTE"
            value={draft.note.trim()}
            last
          />
        ) : null}
      </View>

      <Pressable style={styles.edit} onPress={onEdit} accessibilityRole="button">
        <Text style={styles.editText}>Edit details</Text>
      </Pressable>
    </>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: colors.brand.ivory},
  scroll: {paddingHorizontal: 24, paddingTop: 12, paddingBottom: 20},
  title: {
    fontFamily: fontFamily.displayBold,
    fontSize: 26,
    color: colors.brand.navy,
  },
  sub: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 13,
    color: colors.text.secondary,
    marginTop: 4,
    marginBottom: 20,
  },
  card: {
    backgroundColor: colors.brand.white,
    borderRadius: 20,
    overflow: 'hidden',
    borderColor: colors.brand.navy,
    borderWidth: 1,
    shadowColor: 'rgba(28,36,48,1)',
    shadowOpacity: 0.1,
    shadowRadius: 24,
    shadowOffset: {width: 0, height: 10},
    elevation: 4,
  },
  edit: {alignSelf: 'center', paddingVertical: 18},
  editText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 14,
    color: colors.brand.navy,
  },
  footer: {paddingHorizontal: 30, paddingTop: 6, backgroundColor: colors.brand.ivory},
  cta: {height: 54},
});
