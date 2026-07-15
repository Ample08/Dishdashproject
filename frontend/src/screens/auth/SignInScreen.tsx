import React, {useState} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, {FadeInDown} from 'react-native-reanimated';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import type {RootStackScreenProps} from '../../navigation/types';
import {
  AppleLogo,
  BottomSheet,
  CountryPickerSheet,
  CreamBackground,
  GoogleLogo,
  MascotPanel,
  OrDivider,
  OutlineButton,
  PhoneField,
  PrimaryButton,
  SocialButton,
} from '../../components';
import {DEFAULT_COUNTRY, type Country} from '../../data/countries';
import {useAuth} from '../../state/AuthContext';
import {colors, fontFamily} from '../../theme';

/**
 * Sign In (Figma 597:11)
 * Phone path → OTP (from-sso=false). SSO → Handoff → Phone Verify.
 * Face/Touch ID → toast. T&C → privacy bottom sheet.
 */
type Props = RootStackScreenProps<'SignIn'>;

const T = {
  mascot: 90,
  hero: 160,
  phone: 250,
  actions: 340,
};

function normalizePhone(raw: string) {
  return raw.replace(/\D/g, '');
}

export function SignInScreen({navigation}: Props) {
  const {width, height} = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [country, setCountry] = useState<Country>(DEFAULT_COUNTRY);
  const [countryOpen, setCountryOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const {requestOtp} = useAuth();

  const onChangePhone = (v: string) => {
    setPhone(v);
    if (error) {
      setError(undefined);
    }
  };

  const onSelectCountry = (c: Country) => {
    setCountry(c);
    setCountryOpen(false);
    if (error) {
      setError(undefined);
    }
  };

  const onSendCode = async () => {
    const digits = normalizePhone(phone);
    // UAE numbers are 9 digits after +971; other countries vary, so accept 6–12.
    const valid = country.iso === 'AE' ? digits.length === 9 : digits.length >= 6;
    if (!valid) {
      setError(
        country.iso === 'AE'
          ? 'Enter a valid UAE number (9 digits after +971).'
          : 'Enter a valid phone number.',
      );
      return;
    }
    setError(undefined);
    const fullPhone = `${country.dialCode} ${digits}`;

    // Ask the backend to send the OTP. If it's unreachable we still continue —
    // the OTP screen accepts the mock code (123456) once the API is back.
    setSending(true);
    try {
      await requestOtp(fullPhone);
    } catch {
      // network/offline — proceed anyway
    } finally {
      setSending(false);
    }

    // Phone path → from-sso stays false.
    navigation.navigate('OTP', {
      phone: fullPhone,
      fromSso: false,
    });
  };

  const onBiometric = () => {
    // Error-matrix #12: biometric not enrolled on device.
    Toast.show({
      type: 'info',
      text1: "Face / Touch ID isn't set up on this device.",
      text2: 'Use phone or social instead.',
    });
  };

  return (
     <SafeAreaView style={styles.flex}>
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <CreamBackground width={width} height={height} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={[
            styles.center,
            {
             // minHeight: height,
              paddingTop: insets.top + 18,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          showsVerticalScrollIndicator={false}
          bounces={false}
          overScrollMode="never">
          <Animated.View style={styles.contentMotion}>
            <Animated.View entering={FadeInDown.delay(T.mascot).duration(420)} style={styles.fullCenter}>
              <MascotPanel />
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(T.hero).duration(420)} style={styles.fullCenter}>
              <Text style={styles.hero}>Step inside.</Text>
              <Text style={styles.subtitle}>
                Drop your WhatsApp number we'll text you a quick code.
              </Text>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(T.phone).duration(420)} style={styles.full}>
              <PhoneField
                style={styles.full}
                value={phone}
                onChangeText={onChangePhone}
                dialCode={country.dialCode}
                flag={country.flag}
                onPressPrefix={() => setCountryOpen(true)}
                error={error}
              />
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(T.actions).duration(420)} style={styles.fullCenter}>
              <PrimaryButton label="Send code on WhatsApp" onPress={onSendCode} />

              <OrDivider />

              <SocialButton
                label="Continue with Google"
                icon={<GoogleLogo size={22} />}
                onPress={() => navigation.navigate('Handoff', {provider: 'google'})}
              />
              <SocialButton
                label="Continue with Apple"
                icon={<AppleLogo size={22} />}
                onPress={() => navigation.navigate('Handoff', {provider: 'apple'})}
              />

              <OutlineButton label="Use Face / Touch ID" radius={12} onPress={onBiometric} />

              <TouchableOpacity activeOpacity={0.6} onPress={() => setPrivacyOpen(true)}>
                <Text style={styles.terms}>
                  By continuing you agree to our Terms & Privacy Policy.
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      <BottomSheet visible={countryOpen} onClose={() => setCountryOpen(false)}>
        <CountryPickerSheet
          selectedIso={country.iso}
          onSelect={onSelectCountry}
          onClose={() => setCountryOpen(false)}
        />
      </BottomSheet>

      <BottomSheet visible={privacyOpen} onClose={() => setPrivacyOpen(false)}>
        <Text style={styles.sheetTitle}>Terms & Privacy</Text>
        <Text style={styles.sheetBody}>
          We use your number only to verify your account and send order &
          reservation updates. We never share it with third parties. Standard
          message rates may apply. You can opt out of marketing anytime in
          Settings.
        </Text>
        <PrimaryButton label="Got it" onPress={() => setPrivacyOpen(false)} />
      </BottomSheet>
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: colors.brand.ivory},
  flex: {flex: 1},
  center: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingBottom: 28,
    alignItems: 'center',
    gap: 14,
  },
  full: {width: '100%'},
  contentMotion: {width: '100%', alignItems: 'center', gap: 14},
  fullCenter: {width: '100%', alignItems: 'center', gap: 14},
  hero: {
    width: '100%',
    fontFamily: fontFamily.displayBold,
    fontSize: 36,
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
  terms: {
    width: '100%',
    fontFamily: fontFamily.bodyRegular,
    fontSize: 11,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
  sheetTitle: {
    fontFamily: fontFamily.displayBold,
    fontSize: 22,
    color: colors.text.primary,
    marginBottom: 10,
  },
  sheetBody: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 14,
    lineHeight: 21,
    color: colors.text.secondary,
    marginBottom: 20,
  },
});
