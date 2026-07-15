import React, {useState} from 'react';
import {Image, Linking, Pressable, StyleSheet, Text, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {dashboardImages} from '../../assets/dashboardImages';
import type {BrandKey} from '../../data/menu';
import {colors, fontFamily} from '../../theme';

/**
 * BookingReviewOverlay (Figma 6522:24678) — dark review prompt shown inside a
 * BottomSheet from the completed Booking Detail. Brand mark + branch chip,
 * a 5-star rating, then "Leave a Google review" / "Maybe later".
 */
export function BookingReviewSheet({
  brand,
  location,
  onClose,
}: {
  brand: BrandKey;
  location: string;
  onClose: () => void;
}) {
  const [rating, setRating] = useState(0);
  const logo = brand === 'Jade' ? dashboardImages.jadeLogo : dashboardImages.karazLogo;

  const leaveReview = () => {
    Linking.openURL('https://www.google.com/search?q=leave+a+review').catch(
      () => {},
    );
    onClose();
  };

  return (
    <View style={styles.card}>
      <Pressable
        style={styles.close}
        onPress={onClose}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Close">
        <Icon name="close" size={16} color={colors.brand.ivory} />
      </Pressable>

      <Image source={logo} style={styles.logo} resizeMode="contain" />

      <View style={styles.chip}>
        <Icon name="location-outline" size={12} color={colors.brand.ivory} />
        <Text style={styles.chipText}>{location.toUpperCase()}</Text>
      </View>

      <Text style={styles.title}>How was your meal?</Text>
      <Text style={styles.sub}>
        Help others discover us — leave a quick review on Google.
      </Text>

      <View style={styles.stars}>
        {[0, 1, 2, 3, 4].map(i => (
          <Pressable
            key={i}
            onPress={() => setRating(i + 1)}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel={`Rate ${i + 1} star${i ? 's' : ''}`}>
            <Icon
              name={i < rating ? 'star' : 'star-outline'}
              size={28}
              color={i < rating ? '#f0b429' : colors.brand.ivory}
            />
          </Pressable>
        ))}
      </View>

      <Pressable
        style={({pressed}) => [styles.primary, pressed && styles.pressed]}
        onPress={leaveReview}
        accessibilityRole="button">
        <Text style={styles.primaryText}>Leave a Google review</Text>
      </Pressable>

      <Pressable onPress={onClose} hitSlop={8} accessibilityRole="button">
        <Text style={styles.ghost}>Maybe later</Text>
      </Pressable>
    </View>
  );
}

const IVORY = colors.brand.ivory;

const styles = StyleSheet.create({
  card: {alignItems: 'center', gap: 16, paddingTop: 4, paddingBottom: 4},
  close: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#45555a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {width: 110, height: 55, marginTop: 8},
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#dbdbe0',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  chipText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 11,
    letterSpacing: 1,
    color: IVORY,
  },
  title: {
    fontFamily: fontFamily.displayBlack,
    fontSize: 22,
    lineHeight: 28,
    color: IVORY,
    textAlign: 'center',
  },
  sub: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(249,240,234,0.65)',
    textAlign: 'center',
  },
  stars: {flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4},
  primary: {
    width: '100%',
    height: 45,
    borderRadius: 999,
    backgroundColor: colors.brand.pistachio,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6b4d1a',
    shadowOpacity: 0.22,
    shadowRadius: 7,
    shadowOffset: {width: 0, height: 6},
    elevation: 4,
  },
  primaryText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 14,
    color: colors.brand.navy,
  },
  ghost: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: 13,
    color: 'rgba(249,240,234,0.55)',
    paddingTop: 2,
  },
  pressed: {opacity: 0.85},
});
