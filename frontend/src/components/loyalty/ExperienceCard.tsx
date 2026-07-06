import React from 'react';
import {Image, Pressable, StyleSheet, Text, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import type {Experience} from '../../data/loyalty';
import {colors, fontFamily} from '../../theme';

/**
 * ExperienceCard (Figma CardExperience 3074) — a loyalty experience with
 * points cost. Eligible → "Indulge"; locked → "Explore" + points needed.
 */
export function ExperienceCard({
  experience,
  onPress,
}: {
  experience: Experience;
  onPress?: () => void;
}) {
  const e = experience;
  return (
    <Pressable
      style={[styles.card, !e.eligible && styles.cardLocked]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${e.title} experience`}>
      <View style={styles.imageWrap}>
        <Image source={e.photo} style={styles.image} resizeMode="cover" />
        <View style={styles.brandBadge}>
          <Text style={styles.brandText}>{e.brand.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>
            {e.title}
          </Text>
          {!e.eligible && (
            <View style={styles.lockChip}>
              <Icon name="lock-closed" size={8} color={colors.brand.champagne} />
              <Text style={styles.lockText}>LOCKED</Text>
            </View>
          )}
        </View>

        <View style={styles.locationRow}>
          <Icon name="location-outline" size={11} color={colors.brand.navy} />
          <Text style={styles.location}>{e.location}</Text>
        </View>

        <Text style={styles.desc} numberOfLines={2}>
          {e.desc}
        </Text>

        <View style={styles.footer}>
          <View>
            <View style={styles.ptsRow}>
              <View style={styles.coin}>
                <Icon name="star" size={11} color={colors.brand.navy} />
              </View>
              <Text style={styles.pts}>{e.pts} pts</Text>
            </View>
            {!e.eligible && e.needMore ? (
              <Text style={styles.needMore}>Need {e.needMore} more pts</Text>
            ) : null}
          </View>
          <View style={[styles.cta, e.eligible ? styles.ctaFilled : styles.ctaOutline]}>
            <Text style={styles.ctaText}>
              {e.eligible ? 'Indulge  →' : 'Explore  →'}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    height: 130,
    borderRadius: 18,
    backgroundColor: colors.brand.white,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 18,
    shadowOffset: {width: 0, height: 8},
    elevation: 5,
  },
  cardLocked: {backgroundColor: 'rgba(255,255,255,0.92)'},
  imageWrap: {width: 130, height: 130},
  image: {width: '100%', height: '100%'},
  brandBadge: {
    position: 'absolute',
    left: 10,
    top: 10,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  brandText: {
    fontFamily: fontFamily.bodyBlack,
    fontSize: 8,
    letterSpacing: 0.96,
    color: colors.brand.navy,
  },
  content: {flex: 1, paddingHorizontal: 14, paddingVertical: 12},
  titleRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  title: {flex: 1, fontFamily: fontFamily.bodyBold, fontSize: 14, color: colors.brand.navy},
  lockChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.brand.navy,
    borderRadius: 999,
    paddingLeft: 7,
    paddingRight: 8,
    paddingVertical: 3,
  },
  lockText: {fontFamily: fontFamily.bodyBold, fontSize: 9, letterSpacing: 0.54, color: colors.brand.champagne},
  locationRow: {flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4},
  location: {fontFamily: fontFamily.bodyBold, fontSize: 10, letterSpacing: 0.4, color: colors.brand.navy},
  desc: {fontFamily: fontFamily.bodyRegular, fontSize: 11, color: 'rgba(28,35,48,0.6)', marginTop: 4},
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 'auto',
  },
  ptsRow: {flexDirection: 'row', alignItems: 'center', gap: 5},
  coin: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#f0b429',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pts: {fontFamily: fontFamily.bodyBlack, fontSize: 15, letterSpacing: -0.15, color: colors.brand.navy},
  needMore: {fontFamily: fontFamily.bodyBold, fontSize: 10, color: colors.brand.navy, marginTop: 1},
  cta: {borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8},
  ctaFilled: {backgroundColor: colors.brand.pistachio},
  ctaOutline: {borderWidth: 1, borderColor: colors.brand.navy},
  ctaText: {fontFamily: fontFamily.bodyBold, fontSize: 12, color: colors.brand.navy},
});
