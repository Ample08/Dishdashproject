import React, {useMemo, useState} from 'react';
import {Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {colors, fontFamily} from '../theme';

/**
 * Schedule Pickup Sheet (Figma · Schedule Pickup Overlay) — rendered as
 * BottomSheet children. Horizontal day chips + a wrapped time-slot grid and a
 * "Confirm — <day>, <time>" CTA. Returns the chosen "<day>, <time>" summary.
 */
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];
const TIMES = [
  '6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM',
  '8:30 PM', '9:00 PM', '9:30 PM', '10:00 PM',
  '10:30 PM', '11:00 PM', '11:30 PM', '12:00 AM',
];

export function SchedulePickupSheet({
  initialLabel,
  onClose,
  onConfirm,
}: {
  initialLabel?: string;
  onClose: () => void;
  onConfirm: (summary: string) => void;
}) {
  const days = useMemo(() => {
    const base = new Date();
    return Array.from({length: 7}, (_, i) => {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      const label = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : WEEKDAYS[d.getDay()];
      return {label, sub: `${d.getDate()} ${MONTHS[d.getMonth()]}`};
    });
  }, []);

  const initialTime = initialLabel?.split(', ')[1];
  const [dayIdx, setDayIdx] = useState(0);
  const [time, setTime] = useState(
    initialTime && TIMES.includes(initialTime) ? initialTime : '7:30 PM',
  );

  const summary = `${days[dayIdx].label}, ${time}`;

  return (
    <View>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>PICKUP</Text>
          <Text style={styles.title}>Schedule pickup</Text>
        </View>
        <Pressable style={styles.close} onPress={onClose} accessibilityLabel="Close">
          <Icon name="close" size={18} color={colors.text.primary} />
        </Pressable>
      </View>

      <Text style={styles.sectionLabel}>PICK A DATE</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.dateRow}>
        {days.map((d, i) => {
          const active = i === dayIdx;
          return (
            <Pressable
              key={d.sub}
              style={[styles.dateChip, active && styles.dateChipActive]}
              onPress={() => setDayIdx(i)}>
              <Text style={[styles.dateLabel, active && styles.dateTextActive]}>
                {d.label}
              </Text>
              <Text style={[styles.dateSub, active && styles.dateSubActive]}>
                {d.sub}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <Text style={styles.sectionLabel}>PICK A TIME</Text>
      <View style={styles.timeGrid}>
        {TIMES.map(t => {
          const active = t === time;
          return (
            <Pressable
              key={t}
              style={[styles.timeChip, active && styles.timeChipActive]}
              onPress={() => setTime(t)}>
              <Text style={[styles.timeText, active && styles.timeTextActive]}>{t}</Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        style={styles.confirm}
        onPress={() => onConfirm(summary)}
        accessibilityRole="button">
        <Text style={styles.confirmText}>Confirm — {summary}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerText: {flex: 1, gap: 2},
  eyebrow: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 11,
    letterSpacing: 1.2,
    color: colors.text.tertiary,
  },
  title: {
    fontFamily: fontFamily.displayBold,
    fontSize: 26,
    color: colors.text.primary,
  },
  close: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.brand.white,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  sectionLabel: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 11,
    letterSpacing: 1.2,
    color: colors.text.tertiary,
    marginTop: 18,
    marginBottom: 10,
  },
  dateRow: {gap: 10, paddingRight: 4},
  dateChip: {
    minWidth: 84,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    backgroundColor: colors.brand.white,
    alignItems: 'center',
    gap: 2,
  },
  dateChipActive: {
    backgroundColor: colors.brand.navy,
    borderColor: colors.brand.navy,
  },
  dateLabel: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 15,
    color: colors.text.primary,
  },
  dateSub: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 12,
    color: colors.text.secondary,
  },
  dateTextActive: {color: colors.brand.white},
  dateSubActive: {color: 'rgba(255,255,255,0.7)'},
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  timeChip: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    backgroundColor: colors.brand.white,
  },
  timeChipActive: {
    backgroundColor: colors.brand.pistachio,
    borderColor: colors.brand.pistachio,
  },
  timeText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 14,
    color: colors.text.primary,
  },
  timeTextActive: {color: colors.brand.navy},
  confirm: {
    marginTop: 24,
    height: 56,
    borderRadius: 999,
    backgroundColor: colors.brand.pistachio,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 15,
    color: colors.brand.navy,
  },
});
