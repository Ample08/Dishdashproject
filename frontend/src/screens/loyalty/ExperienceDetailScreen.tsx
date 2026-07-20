import React, {useEffect, useRef, useState} from 'react';
import {
  Animated,
  Easing,
  Image,
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
import {CalendarSheet} from '../../components/CalendarSheet';
import {Shimmer} from '../../components/Shimmer';
import {loyaltyColors} from '../../data/loyalty';
import type {RootStackScreenProps} from '../../navigation/types';
import {useLoyalty} from '../../state/LoyaltyContext';
import {useProfileGate} from '../../state/useProfileGate';
import {colors, fontFamily} from '../../theme';

const DATES = ['Sat 6 Jun', 'Sun 7 Jun', 'Sat 13 Jun', 'Sun 20 Jun'];
const TIMES = ['7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM'];

/** `-1` marks the custom "Other" date picked from the calendar sheet. */
const OTHER = -1;
const WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function FlippingCoin({size = 26}: {size?: number}) {
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(1600),
        Animated.timing(spin, {
          toValue: 1,
          duration: 1300,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(spin, {toValue: 0, duration: 0, useNativeDriver: true}),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [spin]);

  const rotateX = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={[
        styles.coinFlip,
        {width: size, height: size, transform: [{perspective: 600}, {rotateX}]},
      ]}>
      <View style={[styles.coin, {width: size, height: size, borderRadius: size / 2}]}>
        <Icon name="star" size={size * 0.5} color={colors.brand.navy} />
      </View>
    </Animated.View>
  );
}

/**
 * 35 · Experience Detail (Figma 3547:6) — hero image + points cost, date/time
 * pickers and "Book with X pts".
 */
export function ExperienceDetailScreen({
  navigation,
  route,
}: RootStackScreenProps<'ExperienceDetail'>) {
  const insets = useSafeAreaInsets();
  const {bookExperience, points, getExperience} = useLoyalty();
  const requireProfile = useProfileGate();
  const exp = getExperience(route.params.experienceId);
  const [date, setDate] = useState(0);
  const [time, setTime] = useState(1);
  const [guests, setGuests] = useState(2);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [customDate, setCustomDate] = useState<Date | null>(null);
  const [booking, setBooking] = useState(false);
  const [descTruncated, setDescTruncated] = useState(false);

  if (!exp) {
    return <View style={styles.root} />;
  }

  // SRS §11.3 — eligibility from the backend (falls back to a local balance
  // check), so the detail CTA matches the "LOCKED / Need X more" list state.
  const canBook = exp.eligible ?? points >= exp.pts;
  const shortBy = exp.needMore ?? Math.max(0, exp.pts - points);

  const onConfirmBook = () =>
    requireProfile(async () => {
      if (booking) {
        return;
      }
      setBooking(true);
      const ok = await bookExperience(exp.id);
      setBooking(false);
      if (ok) {
        setConfirmOpen(false);
        navigation.replace('ExperienceBooked', {experienceId: exp.id});
      }
    }, 'Add your name, email and date of birth to book an experience.');

  const expLocation = exp.location ?? '';
  const branch = expLocation.split(/Â·|·/).pop()?.trim() || expLocation || 'Branch TBC';
  const displayLocation = expLocation.split(/Â·|·/)[1]?.trim() || expLocation.trim();
  const desc = exp.desc?.trim();
  const customLabel = customDate
    ? `${WD[customDate.getDay()]} ${customDate.getDate()} ${MON[customDate.getMonth()]} ${customDate.getFullYear()}`
    : '';
  const selectedDate =
    date === OTHER && customDate
      ? customLabel
      : DATES[date] === 'Sat 6 Jun'
      ? 'Sat 6 Jun 2026'
      : `${DATES[date]} 2026`;
  const selectedTime = TIMES[time];

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: insets.bottom + 90}}>
        {/* Hero */}
        <View style={styles.hero}>
          <Image source={exp.photo} style={styles.heroImg} resizeMode="cover" />
          <View style={[styles.heroBtns, {top: insets.top + 8}]}>
            <Pressable style={styles.circleBtn} onPress={navigation.goBack} hitSlop={8}>
              <Icon name="chevron-back" size={22} color={colors.brand.white} />
            </Pressable>
            <Pressable style={styles.circleBtnLight} onPress={navigation.goBack} hitSlop={8}>
              <Icon name="close" size={20} color={colors.brand.navy} />
            </Pressable>
          </View>
        </View>

        {/* Sheet */}
        <View style={styles.sheet}>
          <Text style={styles.title}>{exp.title}</Text>
          <View style={styles.locationRow}>
            <Text style={styles.brand}>{exp.brand.toLowerCase()}</Text>
            {displayLocation ? (
              <>
                <Icon name="location-outline" size={13} color="rgba(255,255,255,0.7)" />
                <Text style={styles.location}>{displayLocation}</Text>
              </>
            ) : null}
          </View>

          <View style={styles.ptsRow}>
            <FlippingCoin />
            <Text style={styles.pts}>{exp.pts} pts</Text>
            <Text style={styles.value}>{exp.value}</Text>
          </View>

          {desc ? (
            <>
              <Text
                style={styles.desc}
                numberOfLines={3}
                onTextLayout={e => setDescTruncated(e.nativeEvent.lines.length > 3)}>
                {desc}
              </Text>
              {descTruncated ? <Text style={styles.readMore}>Read more ›</Text> : null}
            </>
          ) : null}

          <View style={styles.tags}>
            {(exp.tags ?? []).map(t => (
              <View key={t} style={styles.tag}>
                <Text style={styles.tagText}>{t}</Text>
              </View>
            ))}
          </View>

          <View style={styles.divider} />
          <Text style={styles.pick}>Pick a date</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            {DATES.map((d, i) => {
              const on = i === date;
              const [wd, ...rest] = d.split(' ');
              return (
                <Pressable key={d} style={[styles.dateChip, on && styles.chipOn]} onPress={() => setDate(i)}>
                  <Text style={[styles.dateWd, on && styles.onNavy]}>{wd}</Text>
                  <Text style={[styles.dateNum, on && styles.onNavy]}>{rest[0]}</Text>
                  <Text style={[styles.dateMonth, on && styles.onNavy]}>{rest[1]}</Text>
                </Pressable>
              );
            })}
            <Pressable
              style={[styles.dateChip, styles.otherChip, date === OTHER && styles.chipOn]}
              onPress={() => setCalendarOpen(true)}
              accessibilityRole="button"
              accessibilityLabel="Pick another date">
              {date === OTHER && customDate ? (
                <>
                  <Text style={[styles.dateWd, styles.onNavy]}>
                    {WD[customDate.getDay()]}
                  </Text>
                  <Text style={[styles.dateNum, styles.onNavy]}>
                    {customDate.getDate()}
                  </Text>
                  <Text style={[styles.dateMonth, styles.onNavy]}>
                    {MON[customDate.getMonth()]}
                  </Text>
                </>
              ) : (
                <>
                  <Icon name="calendar-outline" size={16} color={colors.brand.white} />
                  <Text style={styles.other}>Other</Text>
                </>
              )}
            </Pressable>
          </ScrollView>

          <View style={styles.divider} />
          <Text style={styles.pick}>Pick a time</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.timeRow}>
            {TIMES.map((t, i) => {
              const on = i === time;
              return (
                <Pressable key={t} style={[styles.timeChip, on && styles.chipOn]} onPress={() => setTime(i)}>
                  <Text style={[styles.timeText, on && styles.onNavy]}>{t}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={styles.divider} />
          <Text style={styles.pick}>How many guests?</Text>
          <View style={styles.guestStepper}>
            <Pressable
              style={styles.guestBtn}
              onPress={() => setGuests(g => Math.max(2, g - 1))}
              accessibilityRole="button">
              <Icon name="remove" size={20} color="rgba(255,255,255,0.8)" />
            </Pressable>
            <Text style={styles.guestCount}>{guests}</Text>
            <Pressable
              style={[styles.guestBtn, styles.guestAdd]}
              onPress={() => setGuests(g => Math.min(4, g + 1))}
              accessibilityRole="button">
              <Icon name="add" size={24} color={colors.brand.navy} />
            </Pressable>
          </View>
          <Text style={styles.seatsText}>This experience seats 2-4 guests</Text>

          <View style={styles.divider} />
          <View style={styles.totalBox}>
            <View>
              <Text style={styles.totalLabel}>Total to redeem</Text>
              <Text style={styles.totalValue}>{exp.pts} pts · {exp.value}</Text>
            </View>
            <View style={styles.balancePill}>
              <Text style={styles.balanceText}>
                You have {points.toLocaleString()}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, {paddingBottom: insets.bottom + 12}]}>
        <Pressable

          style={[styles.cta, !canBook && styles.ctaDisabled]}
          onPress={() => setConfirmOpen(true)}
          disabled={!canBook}
          accessibilityRole="button">
          {canBook ? <Shimmer /> : null}
          <Text style={styles.ctaText}>
            {canBook
              ? `Book with ${exp.pts} pts`
              : `Need ${shortBy.toLocaleString()} more pts`}
          </Text>
        </Pressable>
      </View>

      <BottomSheet
        visible={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        sheetStyle={styles.confirmSheet}>
        <Text style={styles.confirmTitle}>Confirm your booking</Text>
        <View style={styles.warnBox}>
          <Icon name="warning-outline" size={20} color="#ffb3a8" />
          <Text style={styles.warnText}>
            Points are deducted immediately. Bookings cannot be cancelled or rescheduled.
          </Text>
        </View>

        <View style={styles.summaryBox}>
          <SummaryRow label="Experience" value={exp.title} />
          <SummaryRow label="Branch" value={`${exp.brand} · ${branch}`} />
          <SummaryRow label="Date" value={selectedDate} />
          <SummaryRow label="Time" value={selectedTime} />
          <SummaryRow label="Guests" value={`${guests}`} />
          <View style={styles.summaryDivider} />
          <SummaryRow label="Points to deduct" value={`${exp.pts} pts`} strong />
        </View>

        <View style={styles.confirmActions}>
          <Pressable style={styles.cancelBtn} onPress={() => setConfirmOpen(false)}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
          <Pressable
            style={[styles.confirmBtn, booking && styles.ctaDisabled]}
            onPress={onConfirmBook}
            disabled={booking}>
            <Text style={styles.confirmText}>
              {booking ? 'Booking…' : 'Confirm & Book'}
            </Text>
          </Pressable>
        </View>
      </BottomSheet>

      <CalendarSheet
        visible={calendarOpen}
        initial={customDate ?? new Date(2026, 5, 6)}
        variant="loyalty"
        title="Pick a date"
        confirmLabel="Confirm date"
        onClose={() => setCalendarOpen(false)}
        onSelect={d => {
          setCustomDate(d);
          setDate(OTHER);
        }}
      />
    </View>
  );
}

function SummaryRow({label, value, strong}: {label: string; value: string; strong?: boolean}) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={[styles.summaryValue, strong && styles.summaryStrong]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: loyaltyColors.bgTop},
  hero: {height: 320},
  heroImg: {width: '100%', height: '100%'},
  heroBtns: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  circleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleBtnLight: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.brand.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheet: {
    marginTop: -44,
    backgroundColor: loyaltyColors.bgTop,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
    paddingTop: 28,
  },
  title: {fontFamily: fontFamily.displayBold, fontSize: 28, lineHeight: 34, color: colors.brand.white},
  locationRow: {flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10},
  brand: {fontFamily: fontFamily.displayItalic, fontSize: 26, color: colors.brand.white},
  location: {fontFamily: fontFamily.bodyMedium, fontSize: 12, color: 'rgba(255,255,255,0.7)'},
  ptsRow: {flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 14},
  coin: {width: 26, height: 26, borderRadius: 13, backgroundColor: '#f0b429', alignItems: 'center', justifyContent: 'center'},
  coinFlip: {alignItems: 'center', justifyContent: 'center'},
  pts: {fontFamily: fontFamily.bodyBlack, fontSize: 20, color: colors.brand.white},
  value: {fontFamily: fontFamily.bodyMedium, fontSize: 13, color: 'rgba(255,255,255,0.7)'},
  desc: {fontFamily: fontFamily.bodyRegular, fontSize: 12, lineHeight: 17, color: 'rgba(255,255,255,0.9)', marginTop: 14},
  readMore: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 12,
    color: colors.brand.white,
    marginTop: 8,
  },
  tags: {flexDirection: 'row', gap: 8, marginTop: 14},
  tag: {borderRadius: 999, backgroundColor: loyaltyColors.chipBg, paddingHorizontal: 12, paddingVertical: 6},
  tagText: {fontFamily: fontFamily.bodyBold, fontSize: 11, color: colors.brand.white},

  divider: {height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginTop: 16},
  pick: {fontFamily: fontFamily.bodyBold, fontSize: 13, color: colors.brand.white, marginTop: 14, marginBottom: 12},
  chipRow: {gap: 10, paddingRight: 24},
  dateChip: {
    width: 48,
    height: 54,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: loyaltyColors.chipBorder,
    backgroundColor: loyaltyColors.chipBg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  otherChip: {gap: 4},
  chipOn: {backgroundColor: colors.brand.champagne},
  dateWd: {fontFamily: fontFamily.bodyMedium, fontSize: 9, lineHeight: 11, color: 'rgba(255,255,255,0.75)'},
  dateNum: {fontFamily: fontFamily.bodyBold, fontSize: 14, lineHeight: 16, color: colors.brand.white},
  dateMonth: {fontFamily: fontFamily.bodyMedium, fontSize: 9, lineHeight: 11, color: 'rgba(255,255,255,0.75)'},
  onNavy: {color: colors.brand.navy},
  other: {fontFamily: fontFamily.bodyBold, fontSize: 11, color: colors.brand.white},
  timeRow: {gap: 10, paddingRight: 24},
  timeChip: {
    paddingHorizontal: 16,
    height: 32,
    borderRadius: 999,
    borderWidth: 1,
    borderColor:loyaltyColors.chipBorder,
    backgroundColor: loyaltyColors.chipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeText: {fontFamily: fontFamily.bodyBold, fontSize: 12, color: colors.brand.white},
  guestStepper: {
    width: 196,
    height: 44,
    borderRadius: 14,
    backgroundColor: loyaltyColors.chipBg,
    borderWidth: 1,
    borderColor: loyaltyColors.chipBorder,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  guestBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestAdd: {backgroundColor: colors.brand.pistachio},
  guestCount: {
    fontFamily: fontFamily.bodyBlack,
    fontSize: 16,
    color: colors.brand.white,
  },
  seatsText: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: 11,
    color: 'rgba(255,255,255,0.78)',
    marginTop: 12,
  },
  totalBox: {
    marginTop: 18,
    borderTopWidth: 1,
    
    borderWidth: 1,
    borderColor: loyaltyColors.chipBorder,
    backgroundColor: loyaltyColors.chipBg,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalLabel: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 11,
    color: 'rgba(255,255,255,0.78)',
  },
  totalValue: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 14,
    color: colors.brand.white,
    marginTop: 3,
  },
  balancePill: {
    borderRadius: 999,
    backgroundColor: colors.brand.white,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  balanceText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 11,
    color: colors.brand.navy,
  },

  footer: {position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 24, paddingTop: 10, backgroundColor: loyaltyColors.bgTop},
  cta: {height: 54, borderRadius: 999, backgroundColor: colors.brand.pistachio, alignItems: 'center', justifyContent: 'center', overflow: 'hidden'},
  ctaDisabled: {opacity: 0.5},
  ctaText: {fontFamily: fontFamily.bodyBold, fontSize: 15, color: colors.brand.navy},
  confirmSheet: {
    backgroundColor: '#123f49',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
  },
  confirmTitle: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 20,
    color: colors.brand.white,
    marginBottom: 14,
  },
  warnBox: {
    minHeight: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(238, 156, 156, 0.27)',
    backgroundColor:loyaltyColors.surfaceTeal,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  warnText: {
    flex: 1,
    fontFamily: fontFamily.bodyRegular,
    fontSize: 11,
    lineHeight: 15,
    color: 'rgba(255,255,255,0.86)',
  },
  summaryBox: {
    borderRadius: 14,
    backgroundColor: loyaltyColors.chipBg,
    borderWidth: 1,
    borderColor: loyaltyColors.chipBorder,
    padding: 14,
    gap: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  summaryLabel: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 12,
    color: 'rgba(255,255,255,0.55)',
  },
  summaryValue: {
    flex: 1,
    fontFamily: fontFamily.bodyBold,
    fontSize: 12,
    color: colors.brand.white,
    textAlign: 'right',
  },
  summaryStrong: {
    fontFamily: fontFamily.bodyBlack,
    fontSize: 16,
    color: colors.brand.champagne,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  confirmActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  cancelBtn: {
    width: 98,
    height: 42,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 13,
    color: colors.brand.white,
  },
  confirmBtn: {
    flex: 1,
    height: 42,
    borderRadius: 999,
    backgroundColor: colors.brand.pistachio,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 14,
    color: colors.brand.navy,
  },
});
