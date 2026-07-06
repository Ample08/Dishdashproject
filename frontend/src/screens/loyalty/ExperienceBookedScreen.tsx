import React from 'react';
import {
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import {Confetti} from '../../components/Confetti';
import {EXPERIENCES, loyaltyColors} from '../../data/loyalty';
import type {RootStackScreenProps} from '../../navigation/types';
import {colors, fontFamily} from '../../theme';

/** 36 · Experience Booked (Figma 3721) — confirmation after redeeming. */
export function ExperienceBookedScreen({
  navigation,
  route,
}: RootStackScreenProps<'ExperienceBooked'>) {
  const insets = useSafeAreaInsets();
  const exp = EXPERIENCES.find(e => e.id === route.params.experienceId);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <Confetti count={48} />

      <View style={[styles.body, {paddingTop: insets.top}]}>
        <View style={styles.badge}>
          <Icon name="checkmark" size={44} color={colors.brand.navy} />
        </View>
        <Text style={styles.eyebrow}>EXPERIENCE BOOKED</Text>
        <Text style={styles.title}>You're in</Text>
        <Text style={styles.sub}>
          {exp ? `${exp.title} at ${exp.location}` : 'Your experience is confirmed'} —
          we'll see you there.
        </Text>
      </View>

      <View style={[styles.footer, {paddingBottom: insets.bottom + 12}]}>
        <Pressable
          style={styles.cta}
          onPress={() => navigation.navigate('LoyaltyBookings')}
          accessibilityRole="button">
          <Text style={styles.ctaText}>View in My Bookings</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: loyaltyColors.bgTop},
  body: {flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 8},
  badge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.brand.pistachio,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  eyebrow: {fontFamily: fontFamily.bodyBold, fontSize: 12, letterSpacing: 1.4, color: colors.brand.champagne},
  title: {fontFamily: fontFamily.displayBold, fontSize: 36, color: colors.brand.white, marginTop: 4},
  sub: {fontFamily: fontFamily.bodyRegular, fontSize: 14, lineHeight: 20, color: 'rgba(255,255,255,0.75)', textAlign: 'center', marginTop: 4},
  footer: {paddingHorizontal: 24, paddingTop: 6},
  cta: {height: 54, borderRadius: 999, backgroundColor: colors.brand.champagne, alignItems: 'center', justifyContent: 'center'},
  ctaText: {fontFamily: fontFamily.bodyBold, fontSize: 15, color: colors.brand.navy},
});
