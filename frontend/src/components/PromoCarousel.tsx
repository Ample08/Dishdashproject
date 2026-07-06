import React, {useState} from 'react';
import {
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import {dashboardImages} from '../assets/dashboardImages';
import {colors, fontFamily} from '../theme';
import {GradientFill} from './GradientFill';

/**
 * "Made for you, habibi" auto-carousel (Figma 1354:255) — three distinct promo
 * card types from the prototype: Editorial (Chef's pick), Image Hero (Mansaf),
 * and Statement (loyalty / teal). Swipe paging with dots.
 */
function Chip({label, dark}: {label: string; dark?: boolean}) {
  return (
    <View style={[styles.chip, dark && styles.chipDark]}>
      <Text style={styles.chipText}>{label}</Text>
    </View>
  );
}

function EditorialCard({width}: {width: number}) {
  return (
    <View style={[styles.card, {width}]}>
      <GradientFill
        colors={['#fff0c9', '#fff7f2']}
        start={{x: 0, y: 1}}
        end={{x: 1, y: 0}}
      />
      <View style={styles.editorialBorder} />
      <View style={styles.editorialText}>
        <View style={styles.eyebrowRow}>
          <View style={styles.eyebrowDot} />
          <Text style={styles.eyebrowDark}>CHEF'S PICK · TODAY</Text>
        </View>
        <Text style={styles.titleDark}>Cardamom lamb</Text>
        <Text style={styles.subDark}>12 plates left tonight.</Text>
        <Chip label="Reserve →" />
      </View>
      <View style={styles.editorialImageWrap}>
        <Image source={dashboardImages.banner} style={styles.fill} resizeMode="cover" />
      </View>
    </View>
  );
}

function ImageHeroCard({width}: {width: number}) {
  return (
    <View style={[styles.card, {width}]}>
      <GradientFill colors={['#734d33', '#33211a']} start={{x: 0, y: 0}} end={{x: 1, y: 1}} />
      <Image source={dashboardImages.promoHero} style={styles.heroImg} resizeMode="cover" />
      <View style={styles.heroScrim}>
        <GradientFill
          colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0.7)']}
          start={{x: 0, y: 0}}
          end={{x: 0, y: 1}}
          locations={[0, 0.5, 1]}
        />
      </View>
      <View style={styles.limited}>
        <Text style={styles.limitedText}>LIMITED</Text>
      </View>
      <View style={styles.heroContent}>
        <Text style={styles.eyebrowGold}>TONIGHT · KARAZ</Text>
        <Text style={styles.titleLight}>Mansaf, family-style</Text>
        <Chip label="Book A Table →" />
      </View>
    </View>
  );
}

function StatementCard({width}: {width: number}) {
  return (
    <View style={[styles.card, styles.statement, {width}]}>
      <Text style={styles.eyebrowPistachio}>YOUR JOURNEY · LOYALTY</Text>
      <Text style={styles.statementTitle}>3 orders to Savor</Text>
      <Text style={styles.subLight}>Unlock 5% off, forever.</Text>
      <Chip label="View Tier →" />
    </View>
  );
}

const CARDS = [EditorialCard, ImageHeroCard, StatementCard];

export function PromoCarousel() {
  const {width} = useWindowDimensions();
  const cardW = width - 80; // body padding 24 + peek of next card
  const [index, setIndex] = useState(0);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIndex(Math.round(e.nativeEvent.contentOffset.x / (cardW + 12)));
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.heading}>Made for you, habibi</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={cardW + 12}
        decelerationRate="fast"
        onScroll={onScroll}
        scrollEventThrottle={16}>
        {CARDS.map((Card, i) => (
          <View
            key={i}
            // eslint-disable-next-line react-native/no-inline-styles
            style={{marginRight: i < CARDS.length - 1 ? 12 : 0}}>
            <Card width={cardW} />
          </View>
        ))}
      </ScrollView>

      <View style={styles.dots}>
        {CARDS.map((_, i) => (
          <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {gap: 12},
  heading: {
    fontFamily: fontFamily.displayBold,
    fontSize: 20,
    color: colors.text.primary,
  },
  fill: {position: 'absolute', top: 0, left: 0, right: 0, bottom: 0},
  card: {
    height: 156,
    borderRadius: 18,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  // shared chip
  chip: {
    alignSelf: 'flex-start',
    backgroundColor: colors.brand.white,
    borderWidth: 1,
    borderColor: colors.brand.champagne,
    borderRadius: 99,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginTop: 2,
  },
  chipDark: {},
  chipText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 11,
    letterSpacing: 0.66,
    color: colors.brand.navy,
  },
  // editorial
  editorialBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 1,
    borderColor: colors.brand.champagne,
    borderRadius: 18,
  },
  editorialText: {
    flex: 1,
    justifyContent: 'center',
    gap: 8,
    paddingLeft: 18,
    paddingRight: 12,
    paddingVertical: 18,
  },
  eyebrowRow: {flexDirection: 'row', alignItems: 'center', gap: 6},
  eyebrowDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.brand.teal,
  },
  eyebrowDark: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 9,
    letterSpacing: 1.08,
    color: colors.text.secondary,
  },
  titleDark: {
    fontFamily: fontFamily.displayBold,
    fontSize: 17,
    color: colors.text.primary,
  },
  subDark: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 11,
    color: colors.text.secondary,
  },
  editorialImageWrap: {
    width: 130,
    height: 156,
    borderTopLeftRadius: 90,
    borderBottomLeftRadius: 90,
    overflow: 'hidden',
  },
  // image hero
  heroImg: {position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.85},
  heroScrim: {position: 'absolute', top: 0, left: 0, right: 0, bottom: 0},
  limited: {
    position: 'absolute',
    top: 14,
    right: 14,
    backgroundColor: colors.status.error,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 99,
  },
  limitedText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 9,
    letterSpacing: 1.08,
    color: '#ffffff',
  },
  heroContent: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 14,
    gap: 6,
  },
  eyebrowGold: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 9,
    letterSpacing: 1.08,
    color: '#e5c78c',
  },
  titleLight: {
    fontFamily: fontFamily.displayBold,
    fontSize: 18,
    color: '#ffffff',
  },
  // statement
  statement: {
    backgroundColor: colors.brand.teal,
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 8,
    padding: 22,
  },
  eyebrowPistachio: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 9,
    letterSpacing: 1.26,
    color: colors.brand.pistachio,
  },
  statementTitle: {
    fontFamily: fontFamily.displayBold,
    fontSize: 22,
    color: '#fff7eb',
  },
  subLight: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 12,
    color: 'rgba(255,247,235,0.75)',
  },
  dots: {flexDirection: 'row', justifyContent: 'center', gap: 6},
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E3CFBF' ,
  },
  dotActive: {
    width: 18,
    backgroundColor:'#E26949',
  },
});
