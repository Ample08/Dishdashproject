import React, {useMemo, useState} from 'react';
import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import {CalendarSheet} from '../../components/CalendarSheet';
import {BottomSheet} from '../../components/BottomSheet';
import {PrimaryButton} from '../../components/PrimaryButton';
import {ReservationHeader} from '../../components/ReservationHeader';
import {StepNav} from '../../components/StepNav';
import {
  SLOTS_BY_SEGMENT,
  TIME_SEGMENTS,
  type TimeSegment,
} from '../../data/reservations';
import type {RootStackScreenProps} from '../../navigation/types';
import {useReservations} from '../../state/ReservationContext';
import {useProfileGate} from '../../state/useProfileGate';
import {colors, fontFamily, radius} from '../../theme';
import {ConfirmBookingReview} from './ConfirmBookingScreen';

const WD_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WD_FULL = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
];
const MON_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const keyOf = (d: Date) =>
  `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
const shortLabel = (d: Date) =>
  `${WD_SHORT[d.getDay()]}, ${MON_SHORT[d.getMonth()]} ${d.getDate()}`;
const fullLabel = (d: Date) =>
  `${WD_FULL[d.getDay()]}, ${MON_SHORT[d.getMonth()]} ${d.getDate()} · ${d.getFullYear()}`;

const addDays = (d: Date, days: number) => {
  const next = new Date(d);
  next.setDate(next.getDate() + days);
  return next;
};

/**
 * 43 · When (Figma 4396:6) — date chips (+ calendar sheet), day-part time
 * segments with slot chips, and an optional note.
 */
export function WhenScreen({navigation}: RootStackScreenProps<'ReservationWhen'>) {
  const insets = useSafeAreaInsets();
  const {patchDraft, createBooking, resetDraft} = useReservations();
  const requireProfile = useProfileGate();

  const quickDays = useMemo(() => {
    const base = new Date();
    return [0, 1, 2].map(off => {
      const d = new Date(base);
      d.setDate(base.getDate() + off);
      return d;
    });
  }, []);

  const [picked, setPicked] = useState<Date>(quickDays[0]);
  const [calendar, setCalendar] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [segment, setSegment] = useState<TimeSegment>('Dinner');
  const [slot, setSlot] = useState<string | null>(null);
  const [note, setNote] = useState('');

  const pickedKey = keyOf(picked);
  const onQuickKeys = quickDays.map(keyOf);
  const customPicked = !onQuickKeys.includes(pickedKey);

  const saveDraft = () => {
    patchDraft({
      dateLabel: shortLabel(picked),
      dateFull: fullLabel(picked),
      segment,
      time: slot ?? SLOTS_BY_SEGMENT[segment][0].label,
      note,
    });
  };

  const onContinue = () => {
    saveDraft();
    setConfirmOpen(true);
  };

  const confirmBooking = () =>
    requireProfile(() => {
      saveDraft();
      const booking = createBooking();
      resetDraft();
      setConfirmOpen(false);
      navigation.replace('ReservationSuccess', {bookingId: booking.id});
    }, 'Add your name, email and date of birth to book a table.');

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />
      <ReservationHeader title="New Reservation" onBack={navigation.goBack} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scroll}>
        <Text style={styles.h1}>When shall we host you?</Text>

        {/* Date */}
        <Text style={styles.section}>DATE</Text>
        <View style={styles.dateRow}>
          {quickDays.map((d, i) => {
            const active = keyOf(d) === pickedKey;
            return (
              <Pressable
                key={i}
                style={[styles.dateChip, active && styles.dateChipActive]}
                onPress={() => setPicked(d)}>
                <Text style={[styles.dateTop, active && styles.dateOnDark]}>
                  {i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : WD_FULL[d.getDay()].slice(0, 3)}
                </Text>
                <Text style={[styles.dateBig, active && styles.dateOnDark]}>
                  {MON_SHORT[d.getMonth()]} {d.getDate()}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Pressable
          style={[styles.pickAnother, customPicked && styles.pickAnotherActive]}
          onPress={() => setCalendar(true)}>
          <Icon
            name="calendar-outline"
            size={16}
            color={customPicked ? colors.brand.navy : colors.text.secondary}
          />
          <Text
            style={[styles.pickText, customPicked && {color: colors.brand.navy}]}>
            {customPicked ? `Picked: ${shortLabel(picked)}` : 'Pick another date'}
          </Text>
        </Pressable>

        {/* Time */}
        <Text style={[styles.section, {marginTop: 24}]}>TIME</Text>
        <View style={styles.segments}>
          {TIME_SEGMENTS.map(s => {
            const active = s === segment;
            return (
              <Pressable
                key={s}
                onPress={() => {
                  setSegment(s);
                  setSlot(null);
                }}
                style={styles.segment}>
                <Text style={[styles.segmentText, active && styles.segmentActive]}>
                  {s}
                </Text>
                {active && <View style={styles.segmentBar} />}
              </Pressable>
            );
          })}
        </View>
        <View style={styles.slots}>
          {SLOTS_BY_SEGMENT[segment].map(s => {
            const active = s.label === slot;
            return (
              <Pressable
                key={s.label}
                style={[styles.slotChip, active && styles.slotActive]}
                onPress={() => setSlot(s.label)}>
                <Text style={[styles.slotText, active && styles.dateOnDark]}>
                  {s.label}
                </Text>
                {s.popular && <View style={styles.slotDot} />}
              </Pressable>
            );
          })}
        </View>

        {/* Note */}
        <Text style={[styles.section, {marginTop: 24}]}>ANYTHING ELSE?</Text>
        <TextInput
          style={styles.note}
          value={note}
          onChangeText={setNote}
          multiline
          placeholder="Birthday? Anniversary? Allergies, seating preference, surprises — tell us anything…"
          placeholderTextColor={colors.text.tertiary}
          textAlignVertical="top"
        />
      </ScrollView>

      <View style={[styles.footer, {paddingBottom: insets.bottom + 8}]}>
        <View style={styles.ctaWrap}>
          <PrimaryButton
            label="Continue to Confirm"
            onPress={onContinue}
            style={styles.cta}
          />
        </View>
        <StepNav current="When" />
      </View>

      <CalendarSheet
        visible={calendar}
        initial={picked}
        minDate={new Date()}
        maxDate={addDays(new Date(), 60)}
        subtitle="Available within next 60 days"
        onClose={() => setCalendar(false)}
        onSelect={setPicked}
      />

      <BottomSheet
        visible={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        sheetStyle={styles.confirmSheet}>
        <ConfirmBookingReview
          onEdit={() => {
            setConfirmOpen(false);
            navigation.navigate('WhenTable');
          }}
        />
        <PrimaryButton
          label="Confirm Booking"
          onPress={confirmBooking}
          style={styles.confirmCta}
        />
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: colors.brand.ivory},
  scroll: {paddingHorizontal: 20, paddingTop: 18, paddingBottom: 28},
  h1: {
    fontFamily: fontFamily.displayBold,
    fontSize: 28,
    color: colors.brand.navy,
    marginBottom: 20,
  },
  section: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 11,
    letterSpacing: 0.8,
    color: 'rgba(28,35,48,0.5)',
    marginBottom: 10,
  },

  dateRow: {flexDirection: 'row', gap: 10},
  dateChip: {
    flex: 1,
    height: 64,
    borderRadius: radius.card,
    backgroundColor: colors.brand.white,
    borderWidth: 1,
    borderColor: 'rgba(28,35,48,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  dateChipActive: {backgroundColor: colors.brand.navy, borderColor: colors.brand.navy},
  dateTop: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: 11,
    color: colors.text.secondary,
  },
  dateBig: {
    fontFamily: fontFamily.displayBold,
    fontSize: 16,
    color: colors.brand.navy,
  },
  dateOnDark: {color: colors.brand.champagne},
  pickAnother: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    backgroundColor: '#ffffff',
    borderStyle: 'dashed',
    borderColor: 'rgba(28,35,48,0.3)',
  },
  pickAnotherActive: {
    borderStyle: 'solid',
    borderColor: colors.brand.navy,
    backgroundColor: '#ffffff',
  },
  pickText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 13,
    color: colors.text.secondary,
  },

  segments: {flexDirection: 'row', gap: 18, marginBottom: 14},
  segment: {alignItems: 'center', gap: 4},
  segmentText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 14,
    color: colors.text.secondary,
  },
  segmentActive: {color: colors.brand.navy},
  segmentBar: {
    height: 2,
    width: 18,
    borderRadius: 1,
    backgroundColor: colors.brand.navy,
  },
  slots: {flexDirection: 'row', flexWrap: 'wrap', gap: 10},
  slotChip: {
    minWidth: 64,
    paddingHorizontal: 14,
    height: 42,
    borderRadius: radius.card,
    backgroundColor: colors.brand.white,
    borderWidth: 1,
    borderColor: 'rgba(28,35,48,0.12)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  slotActive: {backgroundColor: colors.brand.navy, borderColor: colors.brand.navy},
  slotText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 14,
    color: colors.brand.navy,
  },
  slotDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.status.error,
  },

  note: {
    minHeight: 110,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: 'rgba(28,35,48,0.15)',
    backgroundColor: colors.brand.white,
    padding: 14,
    fontFamily: fontFamily.bodyRegular,
    fontSize: 14,
    color: colors.brand.navy,
  },

  footer: {backgroundColor: colors.brand.ivory, paddingTop: 6},
  ctaWrap: {paddingHorizontal: 30, marginBottom: 4},
  cta: {height: 54},
  confirmSheet: {backgroundColor: colors.brand.ivory},
  confirmCta: {height: 54, marginTop: 4},
});
