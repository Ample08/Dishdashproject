import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React from 'react';
import {Image, Pressable, StyleSheet, Text, View} from 'react-native';
import {dashboardImages} from '../assets/dashboardImages';
import type {BrandKey} from '../data/menu';
import type {RootStackParamList} from '../navigation/types';
import {colors, fontFamily} from '../theme';
import {GoldenOrderButton} from './GoldenOrderButton';

/**
 * BrandPicker (Figma 1256:5) — "EXPLORE OUR KITCHENS": Karaz + Jade brand cards
 * with golden "ORDER NOW" CTAs (shine animation), plus the catering card.
 */
function BrandCard({
  bg,
  logo,
  bordered,
  onOrder,
}: {
  bg: string;
  logo: ReturnType<typeof require>;
  bordered?: boolean;
  onOrder: () => void;
}) {
  return (
    <View style={[styles.brandCard, {backgroundColor: bg}, bordered && styles.brandCardBorder]}>
      <View style={styles.logoWrap}>
        <Image source={logo} style={styles.logo} resizeMode="contain" />
      </View>
      <GoldenOrderButton height={32} onPress={onOrder} />
    </View>
  );
}

export function BrandPicker() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const order = (brand: BrandKey) => navigation.navigate('BrandPage', {brand});

  return (
    <View style={styles.wrap}>
      <Text style={styles.eyebrow}>EXPLORE OUR KITCHENS</Text>

      <View style={styles.row}>
        <BrandCard
          bg={colors.brand.karaz}
          logo={dashboardImages.karazLogo}
          bordered
          onOrder={() => order('Karaz')}
        />
        <BrandCard
          bg={colors.brand.jade}
          logo={dashboardImages.jadeLogo}
          onOrder={() => order('Jade')}
        />
      </View>
 <Pressable
            style={styles.catering}
            onPress={() => navigation.navigate('CateringHome')}
            accessibilityRole="button"
            accessibilityLabel="Explore catering by Bait Um Abdallah">
     
        <Image source={dashboardImages.catering} style={styles.cateringImg} resizeMode="cover" />
        <View style={styles.cateringText}>
          <Text style={styles.cateringTitle}>Bait Um Abdallah</Text>
          <Text style={styles.cateringSub}>Hosting 20–500? Heritage catering</Text>
          <Text style={styles.inquire}>Inquire Now ›</Text>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {gap: 12},
  eyebrow: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 11,
    letterSpacing: 0.88,
    color: colors.text.tertiary,
  },
  row: {flexDirection: 'row', gap: 12},
  brandCard: {
    flex: 1,
    height: 119,
    borderRadius: 16,
    padding: 14,
    gap: 12,
    justifyContent: 'space-between',
  },
  brandCardBorder: {
    borderWidth: 1,
    borderColor: 'rgba(212,189,143,0.6)',
  },
  logoWrap: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  logo: {width: '85%', height: 45},
  catering: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(235,201,143,0.16)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(235,201,143,0.55)',
    padding: 14,
  },
  cateringImg: {width: 72, height: 65, borderRadius: 10},
  cateringText: {flex: 1},
  cateringTitle: {
    fontFamily: fontFamily.displayBoldItalic,
    fontSize: 16,
    color: colors.text.primary,
  },
  cateringSub: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 11,
    color: colors.text.secondary,
    marginTop: 2,
  },
  inquire: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 11,
    color: '#2959a8',
    marginTop: 6,
  },
});
