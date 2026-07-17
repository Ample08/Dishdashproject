import React, {useState} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import {TextField} from '../../components/TextField';
import {CalendarSheet} from '../../components/CalendarSheet';
import {CateringButton} from '../../components/catering/CateringButton';
import {EventTypeCard} from '../../components/catering/EventTypeCard';
import {StepHeader} from '../../components/catering/StepHeader';
import {EVENT_TYPES} from '../../data/catering';
import {useCatering} from '../../state/CateringContext';
import type {RootStackScreenProps} from '../../navigation/types';
import {colors, fontFamily} from '../../theme';

const MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];
const formatDate = (d: Date) =>
  `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`;

// Catering rules (SRS · 8.1): event date min 48h out, guests 20–500.
const MIN_EVENT_DATE = new Date(Date.now() + 48 * 60 * 60 * 1000);
const MIN_GUESTS = 20;
const MAX_GUESTS = 500;

/**
 * UA2 · Catering Inquiry — Step 1/2 ("Tell us about the event").
 * Event-type grid + date, guest count and optional budget.
 */
export function CateringInquiryStep1Screen({
  navigation,
}: RootStackScreenProps<'CateringStep1'>) {
  const insets = useSafeAreaInsets();
  const {draft, patchDraft} = useCatering();
  const [showCalendar, setShowCalendar] = useState(false);
  const [errors, setErrors] = useState<{
    type?: string;
    date?: string;
    guests?: string;
  }>({});

  const onContinue = () => {
    const g = Number(draft.guests);
    const next: {type?: string; date?: string; guests?: string} = {};
    if (!draft.eventType) {
      next.type = 'Please choose an event type.';
    }
    if (!draft.dateLabel) {
      next.date = 'Please choose an event date.';
    }
    if (!draft.guests) {
      next.guests = 'Guest count is required.';
    } else if (g < MIN_GUESTS || g > MAX_GUESTS) {
      next.guests = `Guest count must be between ${MIN_GUESTS} and ${MAX_GUESTS}.`;
    }
    setErrors(next);
    if (Object.keys(next).length === 0) {
      navigation.navigate('CateringStep2');
    }
  };

  return (
    <View style={styles.root}>
      <StepHeader step={1} total={2} onBack={() => navigation.goBack()} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        contentContainerStyle={styles.scroll}>
        <Text style={styles.kicker}>EVENT BASICS</Text>
        <Text style={styles.heading}>Tell us about the event</Text>
        <Text style={styles.sub}>We use this to match the right team & timeline.</Text>

        {/* Event type grid */}
        <Text style={styles.label}>Event Type *</Text>
        <View style={styles.grid}>
          {EVENT_TYPES.map(t => (
            <EventTypeCard
              key={t.key}
              icon={t.icon}
              label={t.label}
              selected={draft.eventType === t.key}
              onPress={() => {
                patchDraft({eventType: t.key});
                if (errors.type) setErrors(e => ({...e, type: undefined}));
              }}
            />
          ))}
        </View>
        {errors.type ? <Text style={styles.errText}>{errors.type}</Text> : null}

        <View style={styles.fields}>
          <TextField
            label="Event Date *"
            value={draft.dateLabel}
            onChangeText={() => {}}
            placeholder="Choose a date (48h+ notice)"
            onPress={() => setShowCalendar(true)}
            error={errors.date}
            trailing={
              <Icon name="calendar-outline" size={20} color={colors.text.tertiary} />
            }
          />
          <TextField
            label="Number of Guests *"
            value={draft.guests}
            onChangeText={v => {
              patchDraft({guests: v.replace(/[^0-9]/g, '')});
              if (errors.guests) setErrors(e => ({...e, guests: undefined}));
            }}
            placeholder="20–500 guests"
            keyboardType="number-pad"
            helper="Catering serves parties of 20 to 500."
            error={errors.guests}
          />
          <TextField
            label="Budget (Optional)"
            value={draft.budget}
            onChangeText={v => patchDraft({budget: v})}
            placeholder="AED amount"
            keyboardType="number-pad"
          />
        </View>
      </ScrollView>

      <View style={[styles.ctaBar, {paddingBottom: insets.bottom + 12}]}>
        <CateringButton label="Continue" onPress={onContinue} />
      </View>
      </KeyboardAvoidingView>

      <CalendarSheet
        visible={showCalendar}
        initial={MIN_EVENT_DATE}
        minDate={MIN_EVENT_DATE}
        plain
        title="Event date"
        onClose={() => setShowCalendar(false)}
        onSelect={d => {
          patchDraft({dateLabel: formatDate(d)});
          if (errors.date) setErrors(e => ({...e, date: undefined}));
        }}
        confirmLabel="Select date"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: colors.brand.ivory},
  flex: {flex: 1},
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 40,
  },
  kicker: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 11,
    letterSpacing: 1.32,
    color: colors.brand.umabdallah,
  },
  heading: {
    fontFamily: fontFamily.displayBold,
    fontSize: 26,
    lineHeight: 32,
    color: colors.text.primary,
    marginTop: 6,
  },
  sub: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 13,
    color: 'rgba(28,35,48,0.55)',
    marginTop: 6,
  },
  label: {
    fontFamily: fontFamily.bodySemibold,
    fontSize: 13,
    color: 'rgba(28,35,48,0.85)',
    marginTop: 22,
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  errText: {
    marginTop: 8,
    fontFamily: fontFamily.bodyRegular,
    fontSize: 12,
    color: colors.status.error,
  },
  fields: {
    marginTop: 22,
    gap: 18,
  },
  ctaBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: colors.brand.ivory,
    borderTopWidth: 1,
    borderTopColor: 'rgba(28,35,48,0.06)',
  },
});
