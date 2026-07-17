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
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import {BottomSheet} from '../../components/BottomSheet';
import {BrandHeader, InfoRow} from '../../components/BookingSummary';
import {ModifyBookingSheet} from '../../components/ModifyBookingSheet';
import {PrimaryButton} from '../../components/PrimaryButton';
import {ReservationHeader} from '../../components/ReservationHeader';
import type {BookingStatus} from '../../data/reservations';
import type {RootStackScreenProps} from '../../navigation/types';
import {useReservations} from '../../state/ReservationContext';
import {colors, fontFamily, radius} from '../../theme';

type Banner = {bg: string; icon: string; title: string; sub: string};

const BANNERS: Record<BookingStatus, Banner> = {
  confirmed: {
    bg: colors.brand.pistachio,
    icon: 'checkmark-circle',
    title: 'Booking confirmed',
    sub: "We're expecting you in 3 days",
  },
  awaiting: {
    bg: colors.brand.champagne,
    icon: 'hourglass-outline',
    title: 'Awaiting confirmation',
    sub: 'Usually approved within 2 hours',
  },
  completed: {
    bg: colors.brand.pistachio,
    icon: 'star',
    title: 'Visit completed',
    sub: 'We hope it was wonderful',
  },
  cancelled: {
    bg: '#e7e3df',
    icon: 'close-circle-outline',
    title: 'Booking cancelled',
    sub: 'This reservation was cancelled',
  },
};

const CANCEL_REASONS = [
  {title: 'Plans changed'},
  {title: 'Schedule conflict came up'},
  {title: 'Wrong time or date'},
  {title: 'Group size changed'},
  {title: 'Found another restaurant'},
  {title: 'Something else', sub: 'Your feedback helps us improve at Flavours.'},
];

const BRANCH_PHONE = '+97180034743274';

/**
 * 46 · Booking Detail (Figma 4582:6 / 4724:6622) — full booking with status
 * banner, Directions/Call, and Modify/Cancel (or Rebook once past/cancelled).
 */
export function BookingDetailScreen({
  navigation,
  route,
}: RootStackScreenProps<'BookingDetail'>) {
  const insets = useSafeAreaInsets();
  const {getBooking, cancelBooking, modifyBooking, resetDraft} = useReservations();
  const booking = getBooking(route.params.bookingId);
  const [modify, setModify] = useState(false);
  const [cancelSheet, setCancelSheet] = useState(false);
  const [cancelReason, setCancelReason] = useState(CANCEL_REASONS[0].title);

  if (!booking) {
    return (
      <View style={styles.root}>
        <ReservationHeader title="Booking Details" onBack={navigation.goBack} />
      </View>
    );
  }

  const banner = BANNERS[booking.status];
  const isUpcoming = booking.status === 'awaiting' || booking.status === 'confirmed';

  const onCancel = () => {
    setCancelSheet(true);
  };

  const confirmCancel = () => {
    cancelBooking(booking.id);
    setCancelSheet(false);
  };

  const onRebook = () => {
    resetDraft();
    navigation.navigate('NewReservation');
  };

  const openDirections = () => {
    const query = encodeURIComponent(`${booking.restaurant} ${booking.branchName} UAE`);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`).catch(() => {});
  };

  const callBranch = () => {
    Linking.openURL(`tel:${BRANCH_PHONE}`).catch(() => {});
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />
      <ReservationHeader title="Booking Details" onBack={navigation.goBack} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}>
        <View style={[styles.banner, {backgroundColor: banner.bg}]}>
          <Icon name={banner.icon} size={22} color={colors.brand.navy} />
          <View style={styles.bannerText}>
            <Text style={styles.bannerTitle}>{banner.title}</Text>
            <Text style={styles.bannerSub}>{banner.sub}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <BrandHeader
            restaurant={booking.restaurant}
            branchName={booking.branchName}
          />
          <InfoRow icon="receipt-outline" label="BOOKING ID" value={`#${booking.id}`} />
          <InfoRow icon="calendar-outline" label="DATE" value={booking.dateFull} />
          <InfoRow icon="time-outline" label="TIME" value={booking.timeLabel} />
          <InfoRow icon="people-outline" label="GUESTS" value={`${booking.guests} guests`} />
          <InfoRow
            icon="navigate-outline"
            label="SEATING"
            value={booking.seatingLabel}
            last={!booking.note}
          />
          {booking.note ? (
            <InfoRow icon="document-text-outline" label="YOUR NOTE" value={`"${booking.note}"`} last />
          ) : null}
        </View>

        <View style={styles.actions}>
          <ActionButton icon="navigate-outline" label="Directions" onPress={openDirections} />
          <ActionButton icon="call-outline" label="Call" onPress={callBranch} />
        </View>

        {isUpcoming && (
          <View style={styles.policy}>
            <Icon name="information-circle-outline" size={16} color={colors.brand.navy} />
            <Text style={styles.policyText}>
              Free to modify or cancel up to 6 hours before your slot.
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={[styles.footer, {paddingBottom: insets.bottom + 12}]}>
        {isUpcoming ? (
          <View style={styles.footerRow}>
            <PrimaryButton
              label="Modify Booking"
              onPress={() => setModify(true)}
              style={styles.modifyBtn}
            />
            <Pressable style={styles.cancelBtn} onPress={onCancel} accessibilityRole="button">
              <Text style={styles.cancelText}>Cancel Booking</Text>
            </Pressable>
          </View>
        ) : (
          <PrimaryButton label="Rebook a table" onPress={onRebook} style={styles.cta} />
        )}
      </View>

      <ModifyBookingSheet
        visible={modify}
        booking={booking}
        onClose={() => setModify(false)}
        onSave={patch => modifyBooking(booking.id, patch)}
      />

      <BottomSheet visible={cancelSheet} onClose={() => setCancelSheet(false)}>
        <View style={styles.cancelSheet}>
          <Text style={styles.cancelSheetTitle}>Hang on a moment.</Text>
          <Text style={styles.cancelSheetSub}>Are you sure? Help us understand why.</Text>

          <View style={styles.reasonList}>
            {CANCEL_REASONS.map(reason => {
              const selected = cancelReason === reason.title;
              return (
                <Pressable
                  key={reason.title}
                  style={styles.reasonRow}
                  onPress={() => setCancelReason(reason.title)}
                  accessibilityRole="radio"
                  accessibilityState={{checked: selected}}>
                  <View style={[styles.radio, selected && styles.radioSelected]}>
                    {selected ? <View style={styles.radioDot} /> : null}
                  </View>
                  <View style={styles.reasonText}>
                    <Text style={styles.reasonTitle}>{reason.title}</Text>
                    {reason.sub ? <Text style={styles.reasonSub}>{reason.sub}</Text> : null}
                  </View>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.cancelActions}>
            <Pressable
              style={styles.keepBtn}
              onPress={() => setCancelSheet(false)}
              accessibilityRole="button">
              <Text style={styles.keepText}>Keep my booking</Text>
            </Pressable>
            <Pressable
              style={styles.cancelAnywayBtn}
              onPress={confirmCancel}
              accessibilityRole="button">
              <Text style={styles.cancelAnywayText}>Cancel anyway</Text>
            </Pressable>
          </View>
        </View>
      </BottomSheet>
    </View>
  );
}

function ActionButton({
  icon,
  label,
  onPress,
}: {
  icon: string;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={styles.action}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}>
      <Icon name={icon} size={20} color={colors.brand.navy} />
      <Text style={styles.actionLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: colors.brand.ivory},
  scroll: {paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24, gap: 16},

  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: radius.card,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  bannerText: {flex: 1},
  bannerTitle: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 14,
    color: colors.brand.navy,
  },
  bannerSub: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: 12,
    color: 'rgba(28,35,48,0.7)',
    marginTop: 1,
  },

  card: {
    backgroundColor: colors.brand.white,
    borderRadius: 20,
    borderColor: 'rgba(28,35,48,0.12)',
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: 'rgba(28,36,48,1)',
    shadowOpacity: 0.1,
    shadowRadius: 24,
    shadowOffset: {width: 0, height: 10},
    elevation: 4,
  },

  actions: {flexDirection: 'row', gap: 14},
  action: {
    flex: 1,
    height: 64,
    borderRadius: radius.card,
    backgroundColor: colors.brand.white,
    borderWidth: 1,
    borderColor: 'rgba(28,35,48,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  actionLabel: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 12,
    color: colors.brand.navy,
  },

  policy: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.brand.champagne,
    borderRadius: radius.card,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  policyText: {
    flex: 1,
    fontFamily: fontFamily.bodyMedium,
    fontSize: 12,
    color: colors.brand.navy,
  },

  footer: {paddingHorizontal: 20, paddingTop: 6, backgroundColor: colors.brand.ivory},
  footerRow: {flexDirection: 'row', gap: 12},
  modifyBtn: {flex: 1, height: 54},
  cancelBtn: {
    flex: 1,
    height: 54,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: colors.status.error,
    backgroundColor: colors.brand.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 14,
    color: colors.status.error,
  },
  cta: {height: 54},

  cancelSheet: {paddingBottom: 8},
  cancelSheetTitle: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 18,
    color: colors.brand.navy,
  },
  cancelSheetSub: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 13,
    color: colors.text.secondary,
    marginTop: 6,
    marginBottom: 14,
  },
  reasonList: {
    marginHorizontal: -24,
  },
  reasonRow: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(28,35,48,0.08)',
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: colors.border.strong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: colors.brand.pistachio,
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.brand.pistachio,
  },
  reasonText: {flex: 1},
  reasonTitle: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: 14,
    color: '#1C2330',
  },
  reasonSub: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 11,
    color: colors.text.onButton,
    marginTop: 2,
  },
  cancelActions: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 16,
  },
  keepBtn: {
    flex: 1,
    height: 48,
    borderRadius: 999,
    backgroundColor: colors.brand.pistachio,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(28,35,48,1)',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 8},
    elevation: 3,
  },
  keepText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 13,
    color: colors.brand.navy,
  },
  cancelAnywayBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#f3f1f3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelAnywayText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 13,
    color: colors.status.error,
  },
});
