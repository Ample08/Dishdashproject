import React, {useEffect, useRef} from 'react';
import {
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import type {RootStackScreenProps} from '../../navigation/types';
import {
  AppleLogo,
  CreamBackground,
  GoogleLogo,
  MascotLoader,
} from '../../components';
import {colors, fontFamily} from '../../theme';

/**
 * Google / Apple Handoff (Figma 784:71 / 784:95)
 * Loader while the SSO provider redirects. Dev-note: mascot_loader_v2 Lottie.
 * Auto-advances to Phone Verify (post-SSO we still collect the WhatsApp number).
 */
const REDIRECT_MS = 2400;

type Props = RootStackScreenProps<'Handoff'>;

export function HandoffScreen({navigation, route}: Props) {
  const {width, height} = useWindowDimensions();
  const provider = route.params?.provider ?? 'google';
  const isGoogle = provider === 'google';
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    timer.current = setTimeout(() => {
      navigation.replace('PhoneVerify', {provider});
    }, REDIRECT_MS);
    return () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    };
  }, [navigation, provider]);

  const cancel = () => {
    if (timer.current) {
      clearTimeout(timer.current);
    }
    navigation.goBack();
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <CreamBackground width={width} height={height} cx={width} rx={width} ry={height} />

      <View style={styles.center}>
        <MascotLoader size={142} />

        <View style={styles.logoCard}>
          {isGoogle ? <GoogleLogo size={44} /> : <AppleLogo size={44} />}
        </View>

        <Text style={styles.title}>
          Continuing with {isGoogle ? 'Google' : 'Apple'}…
        </Text>
        <Text style={styles.subtitle}>
          You'll be redirected. This usually takes a few seconds.
        </Text>

        <Pressable onPress={cancel} accessibilityRole="button">
          <Text style={styles.cancel}>Cancel</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: colors.brand.ivory},
  center: {
    position: 'absolute',
    top: 300,
    left: 0,
    width: '100%',
    alignItems: 'center',
    gap: 18,
    paddingHorizontal: 28,
  },
  logoCard: {
    width: 80,
    height: 80,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.brand.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: {width: 0, height: 6},
    elevation: 3,
  },
  title: {
    width: '100%',
    fontFamily: fontFamily.displayBold,
    fontSize: 26,
    color: colors.text.primary,
    textAlign: 'center',
  },
  subtitle: {
    width: '100%',
    fontFamily: fontFamily.bodyRegular,
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  cancel: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 13,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
});
