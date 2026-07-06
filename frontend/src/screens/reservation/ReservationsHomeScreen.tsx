import React, {useMemo, useState} from 'react';
import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import {BookingCard} from '../../components/BookingCard';
import {
  RESERVE_BENEFITS,
  tabForStatus,
  type BookingTab,
} from '../../data/reservations';
import type {TabScreenProps} from '../../navigation/types';
import {useReservations} from '../../state/ReservationContext';
import {colors, fontFamily, radius} from '../../theme';

const TABS: BookingTab[] = ['Upcoming', 'Completed', 'Cancelled'];

/**
 * 40 · Reservations (Figma 4081:4439) — the Reserve TAB.
 * Reserve-a-table CTA → segmented Upcoming/Completed/Cancelled list →
 * "Why reserve?" benefits card.
 */
export function ReservationsHomeScreen({
  navigation,
}: TabScreenProps<'Reserve'>) {
  const insets = useSafeAreaInsets();
  const {bookings, resetDraft} = useReservations();
  const [tab, setTab] = useState<BookingTab>('Upcoming');

  const counts = useMemo(() => {
    const c: Record<BookingTab, number> = {
      Upcoming: 0,
      Completed: 0,
      Cancelled: 0,
    };
    bookings.forEach(b => {
      c[tabForStatus(b.status)] += 1;
    });
    return c;
  }, [bookings]);

  const visible = useMemo(
    () => bookings.filter(b => tabForStatus(b.status) === tab),
    [bookings, tab],
  );

  const startBooking = () => {
    resetDraft();
    navigation.navigate('NewReservation');
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />

      <View style={[styles.topBar, {paddingTop: insets.top + 8}]}>
        <Text style={styles.title}>Reservations</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          {paddingBottom: insets.bottom + 96},
        ]}>
        {/* Reserve a table CTA */}
        <Pressable
          style={({pressed}) => [styles.cta, pressed && styles.ctaPressed]}
          onPress={startBooking}
          accessibilityRole="button"
          accessibilityLabel="Reserve a table">
          <Text style={styles.ctaText}>Reserve a table</Text>
        </Pressable>

        {/* Filter tabs */}
        <View style={styles.tabs}>
          {TABS.map(t => {
            const active = t === tab;
            return (
              <Pressable
                key={t}
                style={[styles.tab, active ? styles.tabActive : styles.tabIdle]}
                onPress={() => setTab(t)}
                accessibilityRole="tab"
                accessibilityState={{selected: active}}>
                <Text
                  style={[
                    styles.tabText,
                    {color: active ? colors.brand.white : colors.brand.navy},
                  ]}>
                  {t}
                </Text>
                <View
                  style={[
                    styles.badge,
                    {
                      backgroundColor: active
                        ? colors.brand.champagne
                        : colors.brand.navy,
                    },
                  ]}>
                  <Text
                    style={[
                      styles.badgeText,
                      {color: active ? colors.brand.navy : colors.brand.champagne},
                    ]}>
                    {counts[t]}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Bookings */}
        <View style={styles.list}>
          {visible.length > 0 ? (
            visible.map(b => (
              <BookingCard
                key={b.id}
                booking={b}
                onPress={() =>
                  navigation.navigate('BookingDetail', {bookingId: b.id})
                }
              />
            ))
          ) : (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>Nothing here yet</Text>
              <Text style={styles.emptyBody}>
                Your {tab.toLowerCase()} reservations will appear here.
              </Text>
            </View>
          )}
        </View>

        {/* Why reserve */}
        <View style={styles.benefits}>
          <View style={styles.benefitsHead}>
            <Text style={styles.eyebrow}>WHY RESERVE?</Text>
            <Text style={styles.benefitsTitle}>Premium dining starts here</Text>
          </View>
          <View style={styles.benefitsCard}>
            {RESERVE_BENEFITS.map((b, i) => (
              <View
                key={b.title}
                style={[styles.benefitRow, i > 0 && styles.benefitDivider]}>
                <View style={styles.benefitIcon}>
                  <Icon name={b.icon} size={20} color={colors.brand.navy} />
                </View>
                <View style={styles.benefitText}>
                  <Text style={styles.benefitTitle}>{b.title}</Text>
                  <Text style={styles.benefitBody}>{b.body}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: colors.brand.ivory},
  topBar: {paddingHorizontal: 20, paddingBottom: 12},
  title: {
    fontFamily: fontFamily.displayBold,
    fontSize: 32,
    color: colors.brand.navy,
  },
  scroll: {gap: 20},

  cta: {
    marginTop: 12,
    marginHorizontal: 17.5,
    height: 45,
    borderRadius: radius.pill,
    backgroundColor: colors.brand.pistachio,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(107,77,26,1)',
    shadowOpacity: 0.22,
    shadowRadius: 7,
    shadowOffset: {width: 0, height: 6},
    elevation: 4,
  },
  ctaPressed: {opacity: 0.9},
  ctaText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 14,
    color: colors.text.onButton,
  },

  tabs: {flexDirection: 'row', gap: 8, paddingHorizontal: 20},
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 32,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
  },
  tabActive: {backgroundColor: colors.brand.navy,color: colors.brand.champagne},
  tabIdle: {
    backgroundColor: colors.brand.white,
    borderWidth: 1,
    borderColor: colors.brand.navy,
  },
  tabText: {fontFamily: fontFamily.bodyBold, fontSize: 13},
  badge: {
    minWidth: 18,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 5,
    alignItems: 'center', 
    justifyContent: 'center',
  },
  badgeText: {fontFamily: fontFamily.bodyBold, fontSize: 11},

  list: {paddingHorizontal: 20, gap: 12},
  empty: {
    backgroundColor: colors.brand.white,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    paddingVertical: 36,
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 6,
  },
  emptyTitle: {
    fontFamily: fontFamily.displayBold,
    fontSize: 18,
    color: colors.brand.navy,
  },
  emptyBody: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 13,
    color: colors.text.secondary,
    textAlign: 'center',
  },

  benefits: {gap: 16},
  benefitsHead: {paddingHorizontal: 20, gap: 4},
  eyebrow: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 10,
    letterSpacing: 1.6,
    color: colors.brand.karaz,
  },
  benefitsTitle: {
    fontFamily: fontFamily.displayBold,
    fontSize: 22,
    color: colors.brand.navy,
  },
  benefitsCard: {
    marginHorizontal: 20,
    backgroundColor: colors.brand.white,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.brand.navy,
    overflow: 'hidden',
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  benefitDivider: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(28,35,48,0.08)',
  },
  benefitIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.brand.pistachio,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitText: {flex: 1, gap: 2},
  benefitTitle: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 14,
    color: colors.brand.navy,
  },
  benefitBody: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 12,
    lineHeight: 15,
    color: colors.brand.navy,
  },
});
