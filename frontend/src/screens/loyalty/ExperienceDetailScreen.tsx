import React, {useState} from 'react';
import {
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
import {EXPERIENCES, loyaltyColors} from '../../data/loyalty';
import type {RootStackScreenProps} from '../../navigation/types';
import {useLoyalty} from '../../state/LoyaltyContext';
import {colors, fontFamily} from '../../theme';

const DATES = ['Sat 6 Jun', 'Sun 7 Jun', 'Sat 13 Jun', 'Sun 20 Jun'];
const TIMES = ['12:30 PM', '1:00 PM', '7:00 PM', '7:30 PM', '8:00 PM'];

/**
 * 35 · Experience Detail (Figma 3547:6) — hero image + points cost, date/time
 * pickers and "Book with X pts".
 */
export function ExperienceDetailScreen({
  navigation,
  route,
}: RootStackScreenProps<'ExperienceDetail'>) {
  const insets = useSafeAreaInsets();
  const {bookExperience} = useLoyalty();
  const exp = EXPERIENCES.find(e => e.id === route.params.experienceId);
  const [date, setDate] = useState(0);
  const [time, setTime] = useState(2);

  if (!exp) {
    return <View style={styles.root} />;
  }

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
            <Text style={styles.brand}>{exp.brand}</Text>
            <Icon name="location-outline" size={13} color="rgba(255,255,255,0.7)" />
            <Text style={styles.location}>{exp.location.split('·')[1]?.trim()}</Text>
          </View>

          <View style={styles.ptsRow}>
            <View style={styles.coin}>
              <Icon name="star" size={13} color={colors.brand.navy} />
            </View>
            <Text style={styles.pts}>{exp.pts} pts</Text>
            <Text style={styles.value}>{exp.value}</Text>
          </View>

          <Text style={styles.desc}>{exp.desc}</Text>

          <View style={styles.tags}>
            {exp.tags.map(t => (
              <View key={t} style={styles.tag}>
                <Text style={styles.tagText}>{t}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.pick}>Pick a date</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            {DATES.map((d, i) => {
              const on = i === date;
              const [wd, ...rest] = d.split(' ');
              return (
                <Pressable key={d} style={[styles.dateChip, on && styles.chipOn]} onPress={() => setDate(i)}>
                  <Text style={[styles.dateWd, on && styles.onNavy]}>{wd}</Text>
                  <Text style={[styles.dateNum, on && styles.onNavy]}>{rest.join(' ')}</Text>
                </Pressable>
              );
            })}
            <View style={[styles.dateChip, styles.otherChip]}>
              <Icon name="calendar-outline" size={16} color={colors.brand.white} />
              <Text style={styles.other}>Other</Text>
            </View>
          </ScrollView>

          <Text style={styles.pick}>Pick a time</Text>
          <View style={styles.timeRow}>
            {TIMES.map((t, i) => {
              const on = i === time;
              return (
                <Pressable key={t} style={[styles.timeChip, on && styles.chipOn]} onPress={() => setTime(i)}>
                  <Text style={[styles.timeText, on && styles.onNavy]}>{t}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, {paddingBottom: insets.bottom + 12}]}>
        <Pressable
          style={styles.cta}
          onPress={() => {
            bookExperience(exp.id);
            navigation.replace('ExperienceBooked', {experienceId: exp.id});
          }}
          accessibilityRole="button">
          <Text style={styles.ctaText}>Book with {exp.pts} pts</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: loyaltyColors.bgTop},
  hero: {height: 300},
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
    marginTop: -28,
    backgroundColor: loyaltyColors.bgTop,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 26,
  },
  title: {fontFamily: fontFamily.displayBold, fontSize: 28, color: colors.brand.white},
  locationRow: {flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10},
  brand: {fontFamily: fontFamily.displayItalic, fontSize: 16, color: colors.brand.white},
  location: {fontFamily: fontFamily.bodyMedium, fontSize: 12, color: 'rgba(255,255,255,0.7)'},
  ptsRow: {flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 14},
  coin: {width: 26, height: 26, borderRadius: 13, backgroundColor: '#f0b429', alignItems: 'center', justifyContent: 'center'},
  pts: {fontFamily: fontFamily.bodyBlack, fontSize: 20, color: colors.brand.white},
  value: {fontFamily: fontFamily.bodyMedium, fontSize: 13, color: 'rgba(255,255,255,0.7)'},
  desc: {fontFamily: fontFamily.bodyRegular, fontSize: 14, lineHeight: 20, color: 'rgba(255,255,255,0.85)', marginTop: 14},
  tags: {flexDirection: 'row', gap: 8, marginTop: 14},
  tag: {borderRadius: 999, backgroundColor: loyaltyColors.surfaceTeal, paddingHorizontal: 12, paddingVertical: 6},
  tagText: {fontFamily: fontFamily.bodyBold, fontSize: 11, color: colors.brand.white},

  pick: {fontFamily: fontFamily.bodyBold, fontSize: 14, color: colors.brand.white, marginTop: 22, marginBottom: 12},
  chipRow: {gap: 10, paddingRight: 24},
  dateChip: {
    width: 64,
    height: 64,
    borderRadius: 14,
    backgroundColor: loyaltyColors.surfaceTeal,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  otherChip: {gap: 4},
  chipOn: {backgroundColor: colors.brand.champagne},
  dateWd: {fontFamily: fontFamily.bodyMedium, fontSize: 11, color: 'rgba(255,255,255,0.7)'},
  dateNum: {fontFamily: fontFamily.bodyBold, fontSize: 14, color: colors.brand.white},
  onNavy: {color: colors.brand.navy},
  other: {fontFamily: fontFamily.bodyBold, fontSize: 11, color: colors.brand.white},
  timeRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 10},
  timeChip: {
    paddingHorizontal: 16,
    height: 42,
    borderRadius: 12,
    backgroundColor: loyaltyColors.surfaceTeal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeText: {fontFamily: fontFamily.bodyBold, fontSize: 14, color: colors.brand.white},

  footer: {position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 24, paddingTop: 10, backgroundColor: loyaltyColors.bgTop},
  cta: {height: 54, borderRadius: 999, backgroundColor: colors.brand.pistachio, alignItems: 'center', justifyContent: 'center'},
  ctaText: {fontFamily: fontFamily.bodyBold, fontSize: 15, color: colors.brand.navy},
});
