import React, {useMemo, useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
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
const MONTHS_FULL = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const CONFIRM_WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const LOYALTY_UNAVAILABLE_DAYS = [
  1, 2, 3, 4, 5, 8, 9, 10, 11, 12, 15, 16, 17, 18, 19, 22, 23, 24, 25,
  26, 29, 30, 31,
];

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
  variant = 'default',
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
  variant?: 'default' | 'loyalty';
}) {
  const [view, setView] = useState({y: initial.getFullYear(), m: initial.getMonth()});
  const [picked, setPicked] = useState<Date>(initial);
  const loyalty = variant === 'loyalty';

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
  const isLoyaltyBooked = (day: number) => loyalty && day === 14;
  const isLoyaltyUnavailable = (day: number) =>
    loyalty && LOYALTY_UNAVAILABLE_DAYS.includes(day);

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
      sheetStyle={[styles.sheet, loyalty && styles.loyaltySheet]}>
      <View style={[styles.wrap, loyalty && styles.loyaltyWrap]}>
        <View style={loyalty && styles.loyaltyHeader}>
          <Text style={[styles.title, loyalty && styles.loyaltyTitle]}>{title}</Text>
          {loyalty ? (
            <View style={styles.loyaltyMonthNav}>
              <Pressable
                hitSlop={10}
                onPress={() => setView(v => ({y: addMonths(new Date(v.y, v.m, 1), -1).getFullYear(), m: addMonths(new Date(v.y, v.m, 1), -1).getMonth()}))}
                accessibilityRole="button">
                <Icon name="chevron-back" size={18} color="rgba(255,255,255,0.82)" />
              </Pressable>
              <Text style={styles.loyaltyMonthText}>
                {MONTHS_FULL[view.m]} {view.y}
              </Text>
              <Pressable
                hitSlop={10}
                onPress={() => setView(v => ({y: addMonths(new Date(v.y, v.m, 1), 1).getFullYear(), m: addMonths(new Date(v.y, v.m, 1), 1).getMonth()}))}
                accessibilityRole="button">
                <Icon name="chevron-forward" size={18} color="rgba(255,255,255,0.82)" />
              </Pressable>
            </View>
          ) : null}
        </View>
        {subtitle && !loyalty ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

        {!loyalty ? (
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
        ) : null}

        <View style={[styles.week, loyalty && styles.loyaltyWeek]}>
          {WEEKDAYS.map(day => (
            <Text key={day} style={[styles.weekday, loyalty && styles.loyaltyWeekday]}>
              {loyalty ? day[0] : day}
            </Text>
          ))}
        </View>

        <View style={[styles.grid, loyalty && styles.loyaltyGrid]}>
          {cells.map((day, i) => (
            <View key={`${day ?? 'empty'}-${i}`} style={[styles.cell, loyalty && styles.loyaltyCell]}>
              {day == null ? null : (
                <Pressable
                  disabled={
                    isDisabled(day) ||
                    isLoyaltyBooked(day) ||
                    isLoyaltyUnavailable(day)
                  }
                  style={[
                    styles.day,
                    loyalty && styles.loyaltyDay,
                    !loyalty && isToday(day) && styles.todayDay,
                    isLoyaltyBooked(day) && styles.loyaltyBookedDay,
                    isLoyaltyUnavailable(day) && styles.loyaltyUnavailableDay,
                    isPicked(day) && styles.dayPicked,
                    loyalty && isPicked(day) && styles.loyaltyDayPicked,
                    isDisabled(day) && styles.dayDisabled,
                  ]}
                  onPress={() => setPicked(new Date(view.y, view.m, day))}>
                  <Text
                    style={[
                      styles.dayText,
                      loyalty && styles.loyaltyDayText,
                      isLoyaltyBooked(day) && styles.loyaltyBookedText,
                      isLoyaltyUnavailable(day) && styles.loyaltyUnavailableText,
                      isPicked(day) && styles.dayTextPicked,
                      loyalty && isPicked(day) && styles.loyaltyDayTextPicked,
                      isDisabled(day) && styles.dayTextDisabled,
                    ]}>
                    {isLoyaltyBooked(day) ? 'Booked' : day}
                  </Text>
                  {isLoyaltyUnavailable(day) && !isPicked(day) ? (
                    <View style={styles.loyaltySlash} />
                  ) : null}
                  {!loyalty && !isPicked(day) && isToday(day) ? <View style={styles.todayDot} /> : null}
                  {!loyalty && !isPicked(day) && isPeak(day) && !isDisabled(day) ? (
                    <View style={styles.peakDot} />
                  ) : null}
                </Pressable>
              )}
            </View>
          ))}
        </View>

        {!loyalty ? <View style={styles.legend}>
          <LegendDot color={colors.brand.pistachio} label="Today" />
          <LegendDot color={colors.brand.karaz} label="Peak night" />
          <LegendDot color="#c9c9c9" label="Sold out" />
        </View> : null}

        <Pressable
          style={[styles.confirm, loyalty && styles.loyaltyConfirm]}
          onPress={() => {
            onSelect(picked);
            onClose();
          }}
          accessibilityRole="button">
          <Text style={[styles.confirmText, loyalty && styles.loyaltyConfirmText]}>
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
  loyaltySheet: {
    backgroundColor: '#123f49',
    paddingHorizontal: 28,
    paddingBottom: 34,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    minHeight: 520,
  },
  wrap: {
    backgroundColor: colors.brand.ivory,
    paddingBottom: 10,
  },
  loyaltyWrap: {
    backgroundColor: '#123f49',
    paddingBottom: 0,
  },
  loyaltyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    marginBottom: 24,
  },
  title: {
    fontFamily: fontFamily.displayBold,
    fontSize: 24,
    color: colors.brand.navy,
  },
  loyaltyTitle: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 18,
    color: colors.brand.white,
  },
  loyaltyMonthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  loyaltyMonthText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 12,
    color: colors.brand.white,
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
  loyaltyWeek: {
    marginBottom: 12,
  },
  weekday: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fontFamily.bodyBold,
    fontSize: 11,
    color: colors.brand.navy,
  },
  loyaltyWeekday: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.55)',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  loyaltyGrid: {
    alignSelf: 'stretch',
    width: '100%',
  },
  cell: {
    width: '14.2857%',
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loyaltyCell: {
    height: 41,
    overflow: 'visible',
  },
  day: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loyaltyDay: {
    width: 34,
    height: 34,
    borderRadius: 17,
  },
  todayDay: {
    borderWidth: 1.5,
    borderColor: colors.text.tertiary,
  },
  dayPicked: {
    backgroundColor: colors.brand.navy,
    borderColor: colors.brand.navy,
  },
  loyaltyDayPicked: {
    backgroundColor: colors.brand.champagne,
    borderColor: colors.brand.champagne,
  },
  dayDisabled: {opacity: 0.35},
  dayText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 15,
    color: colors.brand.navy,
  },
  loyaltyDayText: {
    fontSize: 13,
    lineHeight: 16,
    textAlign: 'center',
    color: colors.brand.white,
  },
  loyaltyBookedDay: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  loyaltyBookedText: {
    fontSize: 5,
    color: 'rgba(255,255,255,0.65)',
  },
  loyaltyUnavailableDay: {
    opacity: 1,
  },
  loyaltyUnavailableText: {
    color: 'rgba(255,255,255,0.38)',
  },
  dayTextPicked: {color: colors.brand.white},
  loyaltyDayTextPicked: {color: colors.brand.navy},
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
  loyaltySlash: {
    position: 'absolute',
    width: 18,
    height: 1,
    borderRadius: 1,
    backgroundColor: '#bc1e3c',
    transform: [{rotate: '25deg'}],
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
  loyaltyConfirm: {
    height: 44,
    borderRadius: 10,
    marginTop: 30,
  },
  confirmText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 16,
    color: colors.text.onButton,
  },
  loyaltyConfirmText: {
    fontSize: 14,
    color: colors.brand.navy,
  },
});
