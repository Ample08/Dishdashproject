import React, {useCallback, useEffect, useRef} from 'react';
import {StyleSheet, View} from 'react-native';
import LottieView from 'lottie-react-native';
import type {RootStackScreenProps} from '../../navigation/types';
import {colors} from '../../theme';

/**
 * Welcome — Part 1: celebration animation only.
 * Plays the vector welcome-voucher Lottie (~3.3s), then hands off to the
 * settled WelcomeVoucher screen (with a safety fallback).
 */
const CELEBRATION_ANIM = require('../../../assets/animations/welcome-voucher-clean.json');

// Safety fallback in case onAnimationFinish doesn't fire (anim is ~3.3s).
const FALLBACK_MS = 4800;

type Props = RootStackScreenProps<'WelcomeCelebration'>;

export function WelcomeCelebrationScreen({navigation}: Props) {
  const advanced = useRef(false);

  const goNext = useCallback(() => {
    if (advanced.current) {
      return;
    }
    advanced.current = true;
    navigation.replace('WelcomeVoucher');
  }, [navigation]);

  useEffect(() => {
    const timer = setTimeout(goNext, FALLBACK_MS);
    return () => clearTimeout(timer);
  }, [goNext]);

  return (
    <View style={styles.root}>
      <LottieView
        source={CELEBRATION_ANIM}
        autoPlay
        loop={false}
        resizeMode="cover"
        onAnimationFinish={goNext}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: colors.brand.ivory},
});
