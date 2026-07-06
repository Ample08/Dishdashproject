import React, {useMemo, useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {BottomSheet} from './BottomSheet';
import {colors, fontFamily} from '../theme';

const MONTHS_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];
const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const CONFIRM_WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const keyOf = (d: Date) =>
  `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const startOfDay = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate());

const addMonths = (d: Date, amount: number) =>
  new Date(d.getFullYear(), d.getMonth() + amount, 1);

const monthLabel = (y: number, m: number) => `${MONTHS_SHORT[m]} ${y}`;

const confirmDateLabel = (d: Date) =>
  `${CONFIRM_WEEKDAYS[d.getDay()]}, ${MONTHS_SHORT[d.getMonth()]} ${d.getDate()}`;

/**
 * Sheet · Calendar — compact month-chip date picker used by reservation flows,
 * catering date selection and profile DOB.
 */
export function CalendarSheet({
  visible,
  initial,
  onClose,
  onSelect,
  minDate,
  maxDate,
  title = 'Pick a date',
  subtitle,
  confirmLabel,
}: {
  visible: boolean;
  initial: Date;
  onClose: () => void;
  onSelect: (d: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  title?: string;
  subtitle?: string;
  confirmLabel?: string;
}) {
  const [view, setView] = useState({y: initial.getFullYear(), m: initial.getMonth()});
  const [picked, setPicked] = useState<Date>(initial);

  const today = useMemo(() => startOfDay(new Date()), []);
  const min = minDate ? startOfDay(minDate) : undefined;
  const max = maxDate ? startOfDay(maxDate) : undefined;

  const monthOptions = useMemo(() => {
    const base = new Date(view.y, view.m, 1);
    return [-1, 0, 1].map(offset => addMonths(base, offset));
  }, [view]);

  const first = new Date(view.y, view.m, 1).getDay();
  const days = new Date(view.y, view.m + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array.from({length: first}, () => null),
    ...Array.from({length: days}, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  const isDisabled = (day: number) => {
    const date = startOfDay(new Date(view.y, view.m, day));
    return (min != null && date < min) || (max != null && date > max);
  };

  const isPicked = (day: number) => sameDay(picked, new Date(view.y, view.m, day));
  const isToday = (day: number) => sameDay(today, new Date(view.y, view.m, day));
  const isPeak = (day: number) => [11, 13, 19, 20, 25, 26, 27].includes(day);

  const isMonthDisabled = (d: Date) => {
    const firstDay = startOfDay(new Date(d.getFullYear(), d.getMonth(), 1));
    const lastDay = startOfDay(new Date(d.getFullYear(), d.getMonth() + 1, 0));
    return (min != null && lastDay < min) || (max != null && firstDay > max);
  };

  const selectMonth = (d: Date) => {
    if (isMonthDisabled(d)) {
      return;
    }
    setView({y: d.getFullYear(), m: d.getMonth()});
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      sheetStyle={styles.sheet}>
      <View style={styles.wrap}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

        <View style={styles.monthTabs}>
          {monthOptions.map(month => {
            const active =
              month.getFullYear() === view.y && month.getMonth() === view.m;
            const disabled = isMonthDisabled(month);
            return (
              <Pressable
                key={keyOf(month)}
                disabled={disabled}
                style={[
                  styles.monthTab,
                  active && styles.monthTabActive,
                  disabled && styles.monthTabDisabled,
                ]}
                onPress={() => selectMonth(month)}>
                <Text
                  style={[
                    styles.monthText,
                    active && styles.monthTextActive,
                    disabled && styles.monthTextDisabled,
                  ]}>
                  {monthLabel(month.getFullYear(), month.getMonth())}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.week}>
          {WEEKDAYS.map(day => (
            <Text key={day} style={styles.weekday}>
              {day}
            </Text>
          ))}
        </View>

        <View style={styles.grid}>
          {cells.map((day, i) => (
            <View key={`${day ?? 'empty'}-${i}`} style={styles.cell}>
              {day == null ? null : (
                <Pressable
                  disabled={isDisabled(day)}
                  style={[
                    styles.day,
                    isToday(day) && styles.todayDay,
                    isPicked(day) && styles.dayPicked,
                    isDisabled(day) && styles.dayDisabled,
                  ]}
                  onPress={() => setPicked(new Date(view.y, view.m, day))}>
                  <Text
                    style={[
                      styles.dayText,
                      isPicked(day) && styles.dayTextPicked,
                      isDisabled(day) && styles.dayTextDisabled,
                    ]}>
                    {day}
                  </Text>
                  {!isPicked(day) && isToday(day) ? <View style={styles.todayDot} /> : null}
                  {!isPicked(day) && isPeak(day) && !isDisabled(day) ? (
                    <View style={styles.peakDot} />
                  ) : null}
                </Pressable>
              )}
            </View>
          ))}
        </View>

        <View style={styles.legend}>
          <LegendDot color={colors.brand.pistachio} label="Today" />
          <LegendDot color={colors.brand.karaz} label="Peak night" />
          <LegendDot color="#c9c9c9" label="Sold out" />
        </View>

        <Pressable
          style={styles.confirm}
          onPress={() => {
            onSelect(picked);
            onClose();
          }}
          accessibilityRole="button">
          <Text style={styles.confirmText}>
            {confirmLabel ?? `Confirm ${confirmDateLabel(picked)}`}
          </Text>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

function LegendDot({color, label}: {color: string; label: string}) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, {backgroundColor: color}]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    backgroundColor: colors.brand.ivory,
    paddingHorizontal: 24,
  },
  wrap: {
    backgroundColor: colors.brand.ivory,
    paddingBottom: 10,
  },
  title: {
    fontFamily: fontFamily.displayBold,
    fontSize: 24,
    color: colors.brand.navy,
  },
  subtitle: {
    marginTop: 3,
    fontFamily: fontFamily.bodyBold,
    fontSize: 12,
    color: colors.brand.navy,
  },
  monthTabs: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 22,
    marginBottom: 22,
  },
  monthTab: {
    paddingHorizontal: 16,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.brand.white,
    borderWidth: 1,
    borderColor: 'rgba(28,35,48,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthTabActive: {
    backgroundColor: colors.brand.navy,
    borderColor: colors.brand.navy,
  },
  monthTabDisabled: {
    opacity: 0.45,
  },
  monthText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 13,
    color: colors.brand.navy,
  },
  monthTextActive: {color: colors.brand.white},
  monthTextDisabled: {color: colors.text.tertiary},
  week: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  weekday: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fontFamily.bodyBold,
    fontSize: 11,
    color: colors.brand.navy,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: `${100 / 7}%`,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  day: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayDay: {
    borderWidth: 1.5,
    borderColor: colors.text.tertiary,
  },
  dayPicked: {
    backgroundColor: colors.brand.navy,
    borderColor: colors.brand.navy,
  },
  dayDisabled: {opacity: 0.35},
  dayText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 15,
    color: colors.brand.navy,
  },
  dayTextPicked: {color: colors.brand.white},
  dayTextDisabled: {color: colors.text.tertiary},
  todayDot: {
    position: 'absolute',
    bottom: 7,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.brand.pistachio,
  },
  peakDot: {
    position: 'absolute',
    bottom: 7,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.brand.karaz,
  },
  legend: {
    flexDirection: 'row',
    gap: 18,
    marginTop: 18,
    marginBottom: 24,
  },
  legendItem: {flexDirection: 'row', alignItems: 'center', gap: 6},
  legendDot: {width: 6, height: 6, borderRadius: 3},
  legendText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 10,
    color: colors.brand.navy,
  },
  confirm: {
    height: 56,
    borderRadius: 14,
    backgroundColor: colors.brand.pistachio,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 16,
    color: colors.text.onButton,
  },
});
