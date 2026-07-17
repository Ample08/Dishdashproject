import React, {useRef, useState} from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {BottomSheet} from './BottomSheet';
import {CalendarSheet} from './CalendarSheet';
import {BRANDS, type BrandKey} from '../data/menu';
import {
  BRANCHES,
  MAX_GUESTS,
  MIN_GUESTS,
  SLOTS_BY_SEGMENT,
  branchByKey,
  type Booking,
  type BranchKey,
} from '../data/reservations';
import {colors, fontFamily, radius} from '../theme';

const WD_FULL = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
];
const WD_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * 46b · Modify Booking Sheet (Figma 4619:6) — inline edit of an existing
 * booking (restaurant, branch, date, time, guests, seating, shisha, note).
 */
export function ModifyBookingSheet({
  visible,
  booking,
  onClose,
  onSave,
}: {
  visible: boolean;
  booking: Booking;
  onClose: () => void;
  onSave: (patch: Partial<Booking>) => void;
}) {
  const scrollRef = useRef<ScrollView>(null);
  const [restaurant, setRestaurant] = useState<BrandKey>(booking.restaurant);
  const [branch, setBranch] = useState<BranchKey>(booking.branch);
  const [time, setTime] = useState(booking.timeLabel);
  const [guests, setGuests] = useState(booking.guests);
  const [indoor, setIndoor] = useState(booking.seatingLabel.startsWith('Indoor'));
  const [shisha, setShisha] = useState(
    booking.seatingLabel.includes('Non-Shisha') ? false : booking.seatingLabel.includes('Shisha'),
  );
  const [note, setNote] = useState(booking.note ?? '');
  const [dateLabel, setDateLabel] = useState(booking.dateLabel);
  const [dateFull, setDateFull] = useState(booking.dateFull);
  const [calendar, setCalendar] = useState(false);

  const save = () => {
    const seatingLabel = `${indoor ? 'Indoor' : 'Terrace'} · ${
      shisha ? 'Shisha Lounge' : 'Non-Shisha Lounge'
    }`;
    onSave({
      restaurant,
      branch,
      branchName: branchByKey(branch).name,
      timeLabel: time,
      guests,
      seatingLabel,
      note: note.trim() || undefined,
      dateLabel,
      dateFull,
    });
    onClose();
  };

  const scrollNoteIntoView = () => {
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({animated: true});
    }, 260);
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      sheetStyle={styles.sheet}>
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}>
        <View style={styles.panel}>
        <Text style={styles.title}>Modify booking</Text>

        <Text style={styles.label}>RESTAURANT</Text>
        <View style={styles.radioRow}>
          {(Object.keys(BRANDS) as BrandKey[]).map(k => (
            <Radio key={k} label={BRANDS[k].name} on={restaurant === k} onPress={() => setRestaurant(k)} />
          ))}
        </View>

        <Text style={styles.label}>BRANCH</Text>
        <View style={styles.radioRow}>
          {BRANCHES.map(b => (
            <Radio key={b.key} label={b.name} on={branch === b.key} onPress={() => setBranch(b.key)} />
          ))}
        </View>

        <Text style={styles.label}>DATE</Text>
        <Pressable style={styles.dateField} onPress={() => setCalendar(true)}>
          <Icon name="calendar-outline" size={16} color={colors.brand.navy} />
          <Text style={styles.dateFieldText}>{dateFull}</Text>
          <Icon name="chevron-forward" size={16} color={colors.text.tertiary} />
        </Pressable>

        <Text style={styles.label}>TIME</Text>
        <View style={styles.chips}>
          {SLOTS_BY_SEGMENT.Dinner.map(s => {
            const on = s.label === time || `${time}`.includes(s.label);
            return (
              <Pressable
                key={s.label}
                style={[styles.chip, on && styles.chipOn]}
                onPress={() => setTime(s.label)}>
                <Text style={[styles.chipText, on && styles.onDark]}>{s.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.label}>GUESTS</Text>
        <View style={styles.stepper}>
          <Pressable
            style={[styles.stepBtn, guests <= MIN_GUESTS && styles.stepDim]}
            onPress={() => guests > MIN_GUESTS && setGuests(guests - 1)}>
            <Icon name="remove" size={18} color={colors.brand.white} />
          </Pressable>
          <Text style={styles.stepCount}>{guests} guests</Text>
          <Pressable
            style={[styles.stepBtn, guests >= MAX_GUESTS && styles.stepDim]}
            onPress={() => guests < MAX_GUESTS && setGuests(guests + 1)}>
            <Icon name="add" size={18} color={colors.brand.white} />
          </Pressable>
        </View>

        <Text style={styles.label}>SEATING</Text>
        <View style={styles.radioRow}>
          <Radio label="Indoor" on={indoor} onPress={() => setIndoor(true)} />
          <Radio label="Terrace" on={!indoor} onPress={() => setIndoor(false)} />
        </View>

        <Text style={styles.label}>SHISHA</Text>
        <View style={styles.radioRow}>
          <Radio label="Shisha Lounge" on={shisha} onPress={() => setShisha(true)} />
          <Radio label="Non-Shisha" on={!shisha} onPress={() => setShisha(false)} />
        </View>

        <Text style={styles.label}>NOTE</Text>
        <TextInput
          style={styles.note}
          value={note}
          onChangeText={setNote}
          multiline
          placeholder="Add a note…"
          placeholderTextColor={colors.text.tertiary}
          textAlignVertical="top"
          onFocus={scrollNoteIntoView}
        />

        <Pressable style={styles.save} onPress={save} accessibilityRole="button">
          <Text style={styles.saveText}>Save changes</Text>
        </Pressable>
        </View>
      </ScrollView>

      <CalendarSheet
        visible={calendar}
        initial={new Date()}
        onClose={() => setCalendar(false)}
        onSelect={d => {
          setDateLabel(`${WD_SHORT[d.getDay()]}, ${MON[d.getMonth()]} ${d.getDate()}`);
          setDateFull(`${WD_FULL[d.getDay()]}, ${MON[d.getMonth()]} ${d.getDate()} · ${d.getFullYear()}`);
        }}
      />
    </BottomSheet>
  );
}

function Radio({label, on, onPress}: {label: string; on: boolean; onPress: () => void}) {
  return (
    <Pressable style={styles.radio} onPress={onPress} accessibilityRole="radio" accessibilityState={{selected: on}}>
      <View style={[styles.radioDot, on && styles.radioDotOn]}>
        {on && <View style={styles.radioInner} />}
      </View>
      <Text style={styles.radioLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  sheet: {
    backgroundColor: colors.brand.ivory,
    maxHeight: '82%',
  },
  scroll: {flexGrow: 0},
  scrollContent: {paddingBottom: 96},
  panel: {
    backgroundColor: colors.brand.ivory,
    borderRadius: radius.card,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 18,
  },
  title: {
    fontFamily: fontFamily.displayBold,
    fontSize: 24,
    color: colors.brand.navy,
    marginBottom: 14,
  },
  label: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 11,
    letterSpacing: 0.6,
    color: 'rgba(28,35,48,0.5)',
    marginTop: 16,
    marginBottom: 8,
  },
  radioRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 18},
  radio: {flexDirection: 'row', alignItems: 'center', gap: 8},
  radioDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.text.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDotOn: {borderColor: colors.brand.navy},
  radioInner: {width: 10, height: 10, borderRadius: 5, backgroundColor: colors.brand.navy},
  radioLabel: {fontFamily: fontFamily.bodyBold, fontSize: 14, color: colors.brand.navy},

  dateField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 50,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: 'rgba(28,35,48,0.15)',
    paddingHorizontal: 14,
  },
  dateFieldText: {flex: 1, fontFamily: fontFamily.bodyBold, fontSize: 14, color: colors.brand.navy},

  chips: {flexDirection: 'row', flexWrap: 'wrap', gap: 8},
  chip: {
    paddingHorizontal: 14,
    height: 40,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: 'rgba(28,35,48,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipOn: {backgroundColor: colors.brand.navy, borderColor: colors.brand.navy},
  chipText: {fontFamily: fontFamily.bodyBold, fontSize: 14, color: colors.brand.navy},
  onDark: {color: colors.brand.white},

  stepper: {flexDirection: 'row', alignItems: 'center', gap: 18},
  stepBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.brand.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDim: {opacity: 0.4},
  stepCount: {fontFamily: fontFamily.bodyBold, fontSize: 16, color: colors.brand.navy},

  note: {
    minHeight: 96,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: 'rgba(28,35,48,0.15)',
    backgroundColor: colors.brand.white,
    padding: 12,
    fontFamily: fontFamily.bodyRegular,
    fontSize: 14,
    color: colors.brand.navy,
  },
  save: {
    marginTop: 22,
    height: 52,
    borderRadius: 999,
    backgroundColor: colors.brand.pistachio,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveText: {fontFamily: fontFamily.bodyBold, fontSize: 14, color: colors.text.onButton},
});
