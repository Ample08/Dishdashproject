import React, {useCallback, useEffect, useRef} from 'react';
import {StatusBar, StyleSheet, View} from 'react-native';
import LottieView from 'lottie-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {RootStackScreenProps} from '../../navigation/types';
import {isProfileComplete} from '../../services/authService';
import {colors} from '../../theme';

/**
 * Splash (Figma 586:9)
 * Dev-note: "Lottie wordmark stroke→fill, 3.5s. ON_MEDIA_END → DISSOLVE 400ms
 * → Sign In". Renders the vector Lottie wordmark on the teal brand background
 * and hands off when the animation finishes (with a safety fallback).
 */
const SPLASH_BG = colors.brand.tealDeep;
// Same keys AuthContext persists the session under.
const TOKEN_KEY = '@dishdash/token';
const USER_KEY = '@dishdash/user';
const SPLASH_ANIM = require('../../../assets/animations/flavours_splash_fillafter.json');

// Safety fallback in case onAnimationFinish doesn't fire (anim is ~3.5s).
const FALLBACK_MS = 5000;

type Props = RootStackScreenProps<'Splash'>;

export function SplashScreen({navigation}: Props) {
  const advanced = useRef(false);

  const goNext = useCallback(async () => {
    if (advanced.current) {
      return;
    }
    advanced.current = true;

    // Route based on the saved session: no token → Sign In; token but the
    // registration was never finished → Profile Setup; otherwise → Home.
    let target: 'SignIn' | 'MainTabs' | 'ProfileSetup' = 'SignIn';
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      if (token) {
        const raw = await AsyncStorage.getItem(USER_KEY);
        const user = raw ? JSON.parse(raw) : null;
        target = isProfileComplete(user) ? 'MainTabs' : 'ProfileSetup';
      }
    } catch {
      target = 'SignIn';
    }
    navigation.reset({index: 0, routes: [{name: target}]});
  }, [navigation]);

  useEffect(() => {
    const timer = setTimeout(goNext, FALLBACK_MS);
    return () => clearTimeout(timer);
  }, [goNext]);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={SPLASH_BG} translucent />
      <LottieView
        source={SPLASH_ANIM}
        autoPlay
        loop={false}
        resizeMode="cover"
        onAnimationFinish={goNext}
        style={styles.anim}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: SPLASH_BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  anim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});
