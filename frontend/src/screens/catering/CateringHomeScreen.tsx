import React from 'react';
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
import {Shimmer} from '../../components/Shimmer';
import {FeatureRow} from '../../components/catering/FeatureRow';
import {HeroVideo} from '../../components/catering/HeroVideo';
import {
  CATERING_FEATURES,
  CATERING_REVIEW,
  CATERING_REVIEWS,
} from '../../data/catering';
import type {RootStackScreenProps} from '../../navigation/types';
import {colors, fontFamily} from '../../theme';

const HERO_HEIGHT = 300;
const BLUE = colors.brand.umabdallah;

function Stars({size = 13}: {size?: number}) {
  return (
    <View style={styles.stars}>
      {Array.from({length: 5}).map((_, i) => (
        <Icon key={i} name="star" size={size} color={BLUE} />
      ))}
    </View>
  );
}

/**
 * UA1 · Catering Home (Bait Um Abdallah) — Figma 6522:27094.
 * Looping hero reel, a cream panel with brand identity + Back / My Inquiries
 * pills, three feature rows, a reviews block (aggregate + testimonials) and the
 * pinned "Get a Catering Inquiry" CTA. Accent colour is Um Abdallah blue.
 */
export function CateringHomeScreen({
  navigation,
}: RootStackScreenProps<'CateringHome'>) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: insets.bottom + 110}}>
        {/* Hero video */}
        <HeroVideo height={HERO_HEIGHT} />

        {/* Cream panel overlapping the hero */}
        <View style={styles.panel}>
          {/* Back / My Inquiries */}
          <View style={styles.iconRow}>
            <Pressable
              style={styles.pill}
              onPress={() => navigation.goBack()}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Go back">
              <Icon name="chevron-back" size={16} color={colors.brand.navy} />
              <Text style={styles.pillText}>Back</Text>
            </Pressable>

            <Pressable
              style={styles.pill}
              onPress={() => navigation.navigate('MyCateringInquiries')}
              hitSlop={8}
              accessibilityRole="button">
              <Icon name="reader-outline" size={16} color={BLUE} />
              <Text style={[styles.pillText, {color: BLUE}]}>My Inquiries</Text>
            </Pressable>
          </View>

          {/* Brand identity */}
          <Text style={styles.brand}>Bait Um Abdallah</Text>
          <Text style={styles.service}>Catering Service</Text>
          <Text style={styles.tagline}>
            Let Bait Um Abdallah bring the warmth of authentic Arabic hospitality
            to your next gathering from intimate dinners to grand celebrations.
          </Text>

          {/* Features */}
          <View style={styles.features}>
            {CATERING_FEATURES.map(f => (
              <FeatureRow key={f.title} icon={f.icon} title={f.title} sub={f.sub} />
            ))}
          </View>

          <View style={styles.divider} />

          {/* Reviews */}
          <Text style={styles.kicker}>{CATERING_REVIEW.kicker}</Text>
          <Text style={styles.reviewsTitle}>{CATERING_REVIEW.headline}</Text>
          <Text style={styles.reviewsSub}>{CATERING_REVIEW.sub}</Text>

          {/* Aggregate rating */}
          <View style={styles.aggregate}>
            <View style={styles.aggregateTop}>
              <Text style={styles.aggregateScore}>{CATERING_REVIEW.rating}</Text>
              <View style={styles.aggregateStack}>
                <Stars size={14} />
                <Text style={styles.aggregateCount}>
                  {CATERING_REVIEW.ratingCount}
                </Text>
              </View>
            </View>
            <Pressable style={styles.seeAllRow} hitSlop={6} accessibilityRole="button">
              <Text style={styles.seeAll}>{CATERING_REVIEW.seeAll}</Text>
              <Icon name="arrow-forward" size={14} color={BLUE} />
            </Pressable>
          </View>

          {/* Review cards */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.reviewCards}>
            {CATERING_REVIEWS.map(r => (
              <View key={r.name} style={styles.reviewCard}>
                <View style={styles.reviewTop}>
                  <Stars size={13} />
                  <Text style={styles.reviewDate}>{r.date}</Text>
                </View>
                <Text style={styles.reviewQuote}>{r.quote}</Text>
                <View style={styles.reviewAuthor}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{r.initials}</Text>
                  </View>
                  <View style={styles.nameStack}>
                    <Text style={styles.reviewName}>{r.name}</Text>
                    <Text style={styles.reviewEvent}>{r.event}</Text>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      {/* Pinned CTA */}
      <View style={[styles.ctaBar, {paddingBottom: insets.bottom + 12}]}>
        <Pressable
          style={({pressed}) => [styles.cta, pressed && styles.ctaPressed]}
          onPress={() => navigation.navigate('CateringStep1')}
          accessibilityRole="button">
          <Text style={styles.ctaText}>Get a Catering Inquiry</Text>
          <Shimmer />
        </Pressable>
      </View>
    </View>
  );
}

const MUTED = 'rgba(28,35,48,0.55)';

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: colors.brand.ivory},

  panel: {
    marginTop: -24,
    backgroundColor: colors.brand.ivory,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingLeft: 12,
    paddingRight: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.brand.white,
    borderWidth: 1,
    borderColor: 'rgba(28,35,48,0.1)',
  },
  pillText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 12,
    color: colors.brand.navy,
  },

  brand: {
    fontFamily: fontFamily.displayBold,
    fontSize: 40,
    lineHeight: 48,
    color: colors.text.primary,
  },
  service: {
    fontFamily: fontFamily.displayBold,
    fontSize: 20,
    color: BLUE,
    marginTop: 2,
  },
  tagline: {
    fontFamily: fontFamily.bodyRegular,
    fontStyle: 'italic',
    fontSize: 13,
    lineHeight: 19,
    color: 'rgba(28,36,48,0.65)',
    marginTop: 8,
  },

  features: {marginTop: 12},

  divider: {
    height: 1,
    backgroundColor: 'rgba(28,35,48,0.1)',
    marginVertical: 16,
  },

  kicker: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 11,
    letterSpacing: 1.54,
    color: BLUE,
  },
  reviewsTitle: {
    fontFamily: fontFamily.displayBold,
    fontSize: 24,
    lineHeight: 30,
    color: colors.text.primary,
    marginTop: 6,
  },
  reviewsSub: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 13,
    color: 'rgba(28,36,48,0.65)',
    marginTop: 6,
  },

  aggregate: {
    marginTop: 12,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 14,
    gap: 8,
    backgroundColor: colors.brand.white,
    borderWidth: 1,
    borderColor: 'rgba(28,35,48,0.06)',
  },
  aggregateTop: {flexDirection: 'row', alignItems: 'center', gap: 12},
  aggregateScore: {
    fontFamily: fontFamily.displayBold,
    fontSize: 28,
    color: colors.text.primary,
  },
  aggregateStack: {flex: 1, gap: 2},
  aggregateCount: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: 12,
    color: 'rgba(28,35,48,0.6)',
  },
  seeAllRow: {flexDirection: 'row', alignItems: 'center', gap: 6},
  seeAll: {fontFamily: fontFamily.bodyBold, fontSize: 13, color: BLUE},

  stars: {flexDirection: 'row', alignItems: 'center', gap: 3},

  reviewCards: {gap: 8, paddingTop: 12, paddingRight: 20},
  reviewCard: {
    width: 300,
    backgroundColor: colors.brand.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(28,35,48,0.08)',
    padding: 18,
    gap: 12,
  },
  reviewTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reviewDate: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: 11,
    color: 'rgba(28,35,48,0.5)',
  },
  reviewQuote: {
    fontFamily: fontFamily.displayItalic,
    fontSize: 14,
    lineHeight: 22,
    color: 'rgba(28,35,48,0.85)',
  },
  reviewAuthor: {flexDirection: 'row', alignItems: 'center', gap: 10},
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: BLUE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 13,
    color: colors.text.inverse,
  },
  nameStack: {flex: 1, gap: 2},
  reviewName: {
    fontFamily: fontFamily.bodySemibold,
    fontSize: 13,
    color: colors.text.primary,
  },
  reviewEvent: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 12,
    color: MUTED,
  },

  ctaBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: colors.brand.ivory,
    borderTopWidth: 1,
    borderTopColor: 'rgba(28,35,48,0.06)',
  },
  cta: {
    height: 45,
    borderRadius: 999,
    overflow: 'hidden',
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
    zIndex: 2,
    fontFamily: fontFamily.bodyBold,
    fontSize: 16,
    color: colors.brand.navy,
  },
});
