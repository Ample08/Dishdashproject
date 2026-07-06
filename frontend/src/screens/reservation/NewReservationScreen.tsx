import React from 'react';
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import {ReservationHeader} from '../../components/ReservationHeader';
import {StepNav} from '../../components/StepNav';
import {BRANDS, type BrandKey} from '../../data/menu';
import type {RootStackScreenProps} from '../../navigation/types';
import {useReservations} from '../../state/ReservationContext';
import {colors, fontFamily, radius} from '../../theme';

const TAGLINES: Record<BrandKey, string> = {
  Jade: 'Modern Arabic with global soul.',
  Karaz: 'Levantine, the way it has always been.',
};

const BRAND_INFO: Record<BrandKey, {subtitle: string; body: string; hours: string}> = {
  Jade: {
    subtitle: 'Modern Pan-Asian, refined',
    body:
      'Jade weaves Sichuan heat, Tokyo precision, and Hong Kong daring into a single menu. Wok-charred prawns, hand-pulled noodles, sake pairings curated by our head sommelier.',
    hours: 'Open 12 PM - 12 AM · Khalifa City',
  },
  Karaz: {
    subtitle: 'Heritage on a plate',
    body:
      "Karaz brings 50 years of Lebanese family craft to the table. Slow-cooked mansaf, hand-rolled vine leaves, charcoal-grilled lamb over cherry wood. Our chefs trained in Beirut. Our menu reads like our grandmothers' kitchens.",
    hours: 'Open 8 AM - 1 AM · Dubai Mall · Creek · Yas Island',
  },
};

/**
 * 40a · New Reservation (Figma 4101:6) — greeting + "Choose where to dine"
 * brand picker. Selecting a brand stores it on the draft and advances to Place.
 */
export function NewReservationScreen({
  navigation,
}: RootStackScreenProps<'NewReservation'>) {
  const insets = useSafeAreaInsets();
  const {patchDraft} = useReservations();
  const [infoBrand, setInfoBrand] = React.useState<BrandKey | null>(null);

  const choose = (brand: BrandKey) => {
    patchDraft({restaurant: brand});
    navigation.navigate('ReservationPlace');
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />
      <ReservationHeader title="New Reservation" onBack={navigation.goBack} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}>
        <View style={styles.greeting}>
          <Text style={styles.hi}>Hey Layla 👋</Text>
          <Text style={styles.headline}>An evening worth remembering</Text>
          <Text style={styles.sub}>Reserve a table in under a minute</Text>
        </View>

        <View style={styles.picker}>
          <Text style={styles.pickerLabel}>Choose where to dine</Text>
          <BrandCard
            brandKey="Jade"
            onPress={() => choose('Jade')}
            onKnowMore={() => setInfoBrand('Jade')}
          />
          <BrandCard
            brandKey="Karaz"
            onPress={() => choose('Karaz')}
            onKnowMore={() => setInfoBrand('Karaz')}
          />
        </View>
      </ScrollView>

      <View style={[styles.nav, {paddingBottom: insets.bottom + 8}]}>
        <StepNav current="Restaurant" />
      </View>

      <Modal
        visible={infoBrand !== null}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={() => setInfoBrand(null)}>
        <Pressable style={styles.modalScrim} onPress={() => setInfoBrand(null)}>
          <Pressable
            style={[styles.infoSheet, {paddingBottom: insets.bottom + 28}]}
            onPress={() => undefined}>
            <View style={styles.sheetHandle} />
            {infoBrand ? (
              <>
                <Text style={styles.sheetTitle}>{infoBrand}</Text>
                <Text style={styles.sheetSubtitle}>
                  {BRAND_INFO[infoBrand].subtitle}
                </Text>
                <Text style={styles.sheetBody}>{BRAND_INFO[infoBrand].body}</Text>
                <Text style={styles.sheetHours}>{BRAND_INFO[infoBrand].hours}</Text>
              </>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>

    </View>
  );
}

function BrandCard({
  brandKey,
  onPress,
  onKnowMore,
}: {
  brandKey: BrandKey;
  onPress: () => void;
  onKnowMore: () => void;
}) {
  const brand = BRANDS[brandKey];
  return (
    <Pressable
      style={[
        styles.card,
        {backgroundColor: brand.color},
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Reserve at ${brand.name}`}>
      <View style={styles.cardBody}>
        <Image source={brand.logo} style={styles.logo} resizeMode="contain" />
        <View style={styles.cardText}>
          <Text style={styles.tagline}>{TAGLINES[brandKey]}</Text>
          <Text style={styles.knowMore}>Know more ›</Text>
        </View>
      </View>
      <Pressable
        style={styles.knowMoreHitbox}
        onPress={onKnowMore}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={`Know more about ${brand.name}`}
      />
      <View style={styles.chev}>
        <Icon name="chevron-forward" size={18} color={colors.brand.white} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: colors.brand.ivory},
  scroll: {paddingBottom: 24},

  greeting: {paddingHorizontal: 20, paddingTop: 24, gap: 6},
  hi: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 15,
    color: colors.brand.navy,
  },
  headline: {
    fontFamily: fontFamily.displayBold,
    fontSize: 28,
    lineHeight: 38,
    color: colors.brand.navy,
  },
  sub: {
    fontFamily: fontFamily.displayItalic,
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 2,
  },

  nav: {backgroundColor: colors.brand.ivory},

  picker: {paddingHorizontal: 20, paddingTop: 28, gap: 16},
  pickerLabel: {
    fontFamily: fontFamily.displayBold,
    fontSize: 16,
    color: colors.brand.navy,
  },

  card: {
    height: 160,
    borderRadius: radius.card,
    paddingHorizontal: 22,
    paddingVertical: 20,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  cardBody: {gap: 18},
  logo: {width: 100, height: 50, alignSelf: 'flex-start'},
  cardText: {gap: 6},
  tagline: {
    fontFamily: fontFamily.displayBoldItalic,
    fontSize: 14,
    color: colors.brand.white,
  },
  knowMore: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 11,
    color: 'rgba(255,255,255,0.85)',
  },
  knowMoreHitbox: {
    position: 'absolute',
    left: 22,
    bottom: 30,
    width: 92,
    height: 24,
  },
  chev: {
    position: 'absolute',
    right: 18,
    top: '50%',
    marginTop: -14,
    width: 28,
    height: 28,
    borderRadius: 14,
  //  borderWidth: 1.5,
   // borderColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalScrim: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  infoSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 10,
    paddingHorizontal: 24,
    backgroundColor: colors.brand.ivory,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 42,
    height: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(28,35,48,0.18)',
    marginBottom: 28,
  },
  sheetTitle: {
    fontFamily: fontFamily.displayBold,
    fontSize: 34,
    color: colors.brand.navy,
  },
  sheetSubtitle: {
    marginTop: 8,
    fontFamily: fontFamily.displayItalic,
    fontSize: 16,
    color: colors.brand.navy,
  },
  sheetBody: {
    marginTop: 20,
    fontFamily: fontFamily.bodyBold,
    fontSize: 13,
    lineHeight: 21,
    color: colors.text.primary,
  },
  sheetHours: {
    marginTop: 20,
    fontFamily: fontFamily.displayItalic,
    fontSize: 13,
    color: colors.brand.navy,
  },
});
