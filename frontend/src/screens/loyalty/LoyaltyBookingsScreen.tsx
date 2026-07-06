import React, {useState} from 'react';
import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {AuroraBackground} from '../../components/loyalty/AuroraBackground';
import {LoyaltyHeader} from '../../components/loyalty/LoyaltyHeader';
import {LOYALTY_BOOKINGS, loyaltyColors} from '../../data/loyalty';
import type {RootStackScreenProps} from '../../navigation/types';
import {colors, fontFamily} from '../../theme';

type Tab = 'Upcoming' | 'Past';

/** 37 · My Bookings (Figma 3772:6) — experience bookings, upcoming/past. */
export function LoyaltyBookingsScreen({
  navigation,
}: RootStackScreenProps<'LoyaltyBookings'>) {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<Tab>('Upcoming');

  const visible = LOYALTY_BOOKINGS.filter(b =>
    tab === 'Past' ? b.past : !b.past,
  );

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <AuroraBackground />
      <LoyaltyHeader title="MY BOOKINGS" onBack={navigation.goBack} caps />

      <View style={styles.toggleWrap}>
        <View style={styles.toggle}>
          {(['Upcoming', 'Past'] as Tab[]).map(t => (
            <Pressable
              key={t}
              style={[styles.toggleBtn, tab === t && styles.toggleOn]}
              onPress={() => setTab(t)}>
              <Text style={[styles.toggleText, tab === t && styles.toggleTextOn]}>
                {t}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, {paddingBottom: insets.bottom + 24}]}>
        {visible.length === 0 ? (
          <Text style={styles.empty}>No {tab.toLowerCase()} bookings.</Text>
        ) : (
          visible.map(b => (
            <View key={b.id} style={styles.card}>
              <View style={styles.cardHead}>
                <Text style={styles.brand}>{b.brand}</Text>
                {!b.past && (
                  <View style={styles.daysChip}>
                    <Text style={styles.daysText}>IN {b.inDays} DAYS</Text>
                  </View>
                )}
              </View>
              <Text style={styles.title}>{b.title}</Text>
              <Text style={styles.meta}>
                {b.dateLabel} · {b.location}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: loyaltyColors.bgBottom},
  toggleWrap: {paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8},
  toggle: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    backgroundColor: colors.brand.white,
    borderRadius: 999,
    padding: 3,
  },
  toggleBtn: {paddingHorizontal: 18, paddingVertical: 7, borderRadius: 999},
  toggleOn: {backgroundColor: colors.brand.champagne},
  toggleText: {fontFamily: fontFamily.bodyBold, fontSize: 13, color: 'rgba(28,35,48,0.55)'},
  toggleTextOn: {color: colors.brand.navy},

  scroll: {paddingHorizontal: 20, paddingTop: 8, gap: 14},
  empty: {fontFamily: fontFamily.bodyRegular, fontSize: 14, color: 'rgba(255,255,255,0.7)', textAlign: 'center', paddingVertical: 24},
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 18,
  },
  cardHead: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  brand: {fontFamily: fontFamily.bodyBold, fontSize: 13, color: 'rgba(255,255,255,0.85)'},
  daysChip: {borderRadius: 999, borderWidth: 1, borderColor: colors.brand.pistachio, paddingHorizontal: 10, paddingVertical: 3},
  daysText: {fontFamily: fontFamily.bodyBold, fontSize: 9, letterSpacing: 0.5, color: colors.brand.pistachio},
  title: {fontFamily: fontFamily.displayBold, fontSize: 22, color: colors.brand.white, marginTop: 8},
  meta: {fontFamily: fontFamily.bodyMedium, fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 6},
});
