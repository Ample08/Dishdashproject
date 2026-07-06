import React, {useCallback, useRef, useState} from 'react';
import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useFocusEffect} from '@react-navigation/native';
import Animated, {FadeIn, FadeInDown} from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {RootStackScreenProps} from '../../navigation/types';
import {AtmosphereLayer, CreamBackground, WelcomeVoucherCard} from '../../components';
import {colors, fontFamily} from '../../theme';

/**
 * Welcome Voucher (Figma WV11 → WV15) — choreographed entrance.
 * Reached after the celebration screen. Each element fades + rises in sequence
 * over the cream background: greeting → subtitle → voucher card → CTA, with the
 * atmosphere washing in behind. Cinematic pacing (~2.8s total).
 *
 * We use Reanimated's declarative `entering` layout animations (triggered on the
 * Fabric mount commit) rather than manually driving shared values in useEffect —
 * the manual timeline froze mid-flight when it started during the screen's
 * navigation `fade` transition. Layout animations are managed natively and play
 * reliably alongside the transition.
 */
const ONBOARDING_KEY = '@flavours/onboarding_complete';
const CARD_REVEAL_DELAY_MS = 4000;

// Entrance timeline (ms from mount) — cinematic pacing, mirrors the 5 keyframes.
const T = {
  atmosphere: 650,
  greeting: 900,
  secondary: 1320,
  card: 1760,
  cta: 2550,
};

type Props = RootStackScreenProps<'WelcomeVoucher'>;

export function WelcomeVouchersScreen({navigation, route}: Props) {
  const {width, height} = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const userName = route.params?.userName ?? 'Layla';
  const [voucherKey, setVoucherKey] = useState(0);
  const finishedRef = useRef(false);

  const finish = useCallback(async () => {
    if (finishedRef.current) {
      return;
    }
    finishedRef.current = true;
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    } catch {
      // non-fatal
    }
    navigation.replace('MainTabs');
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      finishedRef.current = false;
      setVoucherKey(key => key + 1);
    }, []),
  );

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <CreamBackground width={width} height={height} cx={width} rx={width} ry={height} />

      {/* subtle atmosphere — behind everything */}
      <Animated.View
        entering={FadeIn.delay(T.atmosphere).duration(650)}
        style={StyleSheet.absoluteFill}
        pointerEvents="none">
        <AtmosphereLayer />
      </Animated.View>

      <ScrollView
        style={StyleSheet.absoluteFill}
        contentContainerStyle={[
          styles.scrollContent,
          {minHeight: height + insets.bottom, paddingTop: Math.max(insets.top + 64, 82)},
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
        overScrollMode="never">
        <View style={styles.greeting} pointerEvents="none">
          <Animated.Text
            entering={FadeInDown.delay(T.greeting).duration(420)}
            style={styles.greetingPrimary}>
            Welcome, {userName}.
          </Animated.Text>
          <Animated.Text
            entering={FadeInDown.delay(T.secondary).duration(380)}
            style={styles.greetingSecondary}>
            Here's a little something.
          </Animated.Text>
        </View>

        <Animated.View
          entering={FadeInDown.delay(T.card).duration(450)}
          style={styles.cardWrap}>
          <WelcomeVoucherCard
            key={voucherKey}
            amount="10%"
            code="FLVR5253"
            autoRevealDelayMs={CARD_REVEAL_DELAY_MS}
          />
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(T.cta).duration(360)}
          style={[styles.ctaWrap, {paddingBottom: insets.bottom + 24}]}>
          <Pressable
            onPress={finish}
            accessibilityRole="button"
            hitSlop={{top: 14, bottom: 14, left: 14, right: 14}}
            style={styles.cta}>
            <Text style={styles.ctaText}>I'll dine in later</Text>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: colors.brand.ivory},
  scrollContent: {
    paddingHorizontal: 28,
    paddingBottom: 28,
    alignItems: 'center',
  },
  greeting: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 28,
  },
  greetingPrimary: {
    fontFamily: fontFamily.displayBold,
    fontSize: 28,
    color: colors.brand.navy,
    textAlign: 'center',
  },
  greetingSecondary: {
    marginTop: 13,
    fontFamily: fontFamily.displayItalic,
    fontSize: 14,
    color: 'rgba(28,35,48,0.6)',
    textAlign: 'center',
  },
  cardWrap: {
    width: '100%',
    paddingVertical:10,
    alignItems: 'center',
  },
  ctaWrap: {
    width: '100%',
    alignItems: 'center',
    marginTop: 80,
  },
  cta: {
    width: '100%',
    maxWidth: 334,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.brand.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 16,
    color: colors.brand.navy,
  },
});
