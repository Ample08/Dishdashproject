import React from 'react';
import {ScrollView, StatusBar, StyleSheet, Text, useWindowDimensions, View} from 'react-native';
import Animated, {FadeInDown} from 'react-native-reanimated';
import {colors, fontFamily} from '../theme';
import {CreamBackground} from './CreamBackground';
import {PrimaryButton} from './PrimaryButton';

/**
 * Shared scaffold for the permission primer screens (Figma 702:5 / 702:32).
 * Cream bg · centered illustration (Lottie or GIF) · Playfair title · subtitle
 * · bullet benefits · pistachio primary · "Maybe later" · settings footnote.
 */
type Props = {
  illustration: React.ReactNode;
  title: string;
  subtitle: string;
  benefits: string[];
  primaryLabel: string;
  onPrimary: () => void;
  onSkip: () => void;
  topOffset?: number;
};

export function PermissionScaffold({
  illustration,
  title,
  subtitle,
  benefits,
  primaryLabel,
  onPrimary,
  onSkip,
  topOffset = 88,
}: Props) {
  const {width, height} = useWindowDimensions();

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <CreamBackground width={width} height={height} />

      <ScrollView
        contentContainerStyle={[styles.center, {paddingTop: topOffset}]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.spacer8} />

        {/* <Animated.View entering={FadeInDown.delay(80).duration(440)}> */}
          {illustration}
        {/* </Animated.View> */}

        <Animated.Text
          style={styles.title}
          entering={FadeInDown.delay(200).duration(420)}>
          {title}
        </Animated.Text>
        <Animated.Text
          style={styles.subtitle}
          entering={FadeInDown.delay(270).duration(420)}>
          {subtitle}
        </Animated.Text>

        <View style={styles.benefits}>
          {benefits.map((label, i) => (
            <Animated.View
              key={label}
              style={styles.benefitRow}
              entering={FadeInDown.delay(350 + i * 80).duration(400)}>
              <View style={styles.dot} />
              <Text style={styles.benefitLabel}>{label}</Text>
            </Animated.View>
          ))}
        </View>

        <View style={styles.spacer8} />

        <Animated.View
          style={styles.actionsBlock}
          entering={FadeInDown.delay(350 + benefits.length * 80 + 60).duration(420)}>
          <PrimaryButton label={primaryLabel} onPress={onPrimary} />

          <Text style={styles.maybeLater} onPress={onSkip}>
            Maybe later
          </Text>
          <Text style={styles.settings}>
            You can change this anytime in Settings.
          </Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.brand.ivory,
  },
  center: {
    paddingHorizontal: 32,
    paddingBottom: 40,
    alignItems: 'center',
    gap: 16,
  },
  spacer8: {
    height: 8,
  },
  title: {
    width: '100%',
    fontFamily: fontFamily.displayBold,
    fontSize: 32,
    lineHeight: 35,
    color: colors.text.primary,
    textAlign: 'center',
  },
  subtitle: {
    width: '100%',
    fontFamily: fontFamily.bodyRegular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  actionsBlock: {
    width: '100%',
    alignItems: 'center',
    gap: 16,
  },
  benefits: {
    width: '100%',
    gap: 12,
    paddingVertical: 16,
  },
  benefitRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.brand.pistachio,
  },
  benefitLabel: {
    flex: 1,
    fontFamily: fontFamily.bodyRegular,
    fontSize: 14,
    color: colors.text.primary,
  },
  maybeLater: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  settings: {
    width: '100%',
    fontFamily: fontFamily.bodyRegular,
    fontSize: 11,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
});