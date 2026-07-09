import React, {useState} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import type {RootStackScreenProps} from '../../navigation/types';
import {
  BackButton,
  BottomSheet,
  CountryPickerSheet,
  CreamBackground,
  PhoneField,
  PrimaryButton,
} from '../../components';
import {DEFAULT_COUNTRY, type Country} from '../../data/countries';
import {colors, fontFamily} from '../../theme';

/**
 * Phone Verify (Figma 756:5)
 * Post-SSO WhatsApp number entry. Continue sets the SSO flag and goes to OTP.
 * Body @ top 130, px 28, gap 22.
 */
type Props = RootStackScreenProps<'PhoneVerify'>;

function normalizePhone(raw: string) {
  return raw.replace(/\D/g, '');
}

export function PhoneVerifyScreen({navigation, route}: Props) {
  const {width, height} = useWindowDimensions();
  const provider = route.params?.provider;
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [country, setCountry] = useState<Country>(DEFAULT_COUNTRY);
  const [countryOpen, setCountryOpen] = useState(false);

  const onChange = (v: string) => {
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

  const onSend = () => {
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
    // Post-SSO path → mark from-sso so OTP routes to Profile Setup (SSO).
    navigation.navigate('OTP', {
      phone: `${country.dialCode} ${digits}`,
      fromSso: true,
      provider,
    });
  };

  return (
    <SafeAreaView style={styles.flex}>
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <CreamBackground width={width} height={height} cx={width} rx={width} ry={height} />
      <View style={[styles.header, {paddingTop: 10 }]}>
        <BackButton onPress={() => navigation.goBack()} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            {
              // minHeight: height - insets.top - 58,
              // paddingTop: Math.max(44, Math.min(88, height * 0.09)),
              // paddingBottom: insets.bottom + 28,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          showsVerticalScrollIndicator={false}
          bounces={false}
          overScrollMode="never">
          <View style={styles.body}>
            <View style={styles.hero}>
              <Text style={styles.title}>One last thing.</Text>
              <Text style={styles.subtitle}>
                Drop your WhatsApp number we'll text you a quick code.
              </Text>
            </View>

            <View style={styles.full}>
              <PhoneField
                style={styles.full}
                value={phone}
                onChangeText={onChange}
                dialCode={country.dialCode}
                flag={country.flag}
                onPressPrefix={() => setCountryOpen(true)}
                error={error}
              />
            </View>

            <View style={styles.actions}>
              <PrimaryButton label="Send code on WhatsApp" onPress={onSend} />

              <Text style={styles.footnote}>
                We'll send a 6-digit code to confirm. SMS rates may apply.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <BottomSheet visible={countryOpen} onClose={() => setCountryOpen(false)}>
        <CountryPickerSheet
          selectedIso={country.iso}
          onSelect={onSelectCountry}
          onClose={() => setCountryOpen(false)}
        />
      </BottomSheet>
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: colors.brand.ivory},
  flex: {flex: 1},
  header: {
    paddingHorizontal: 24,
    paddingBottom: 10,
    zIndex: 2,
  },
  scroll: {
    flexGrow: 1,
  },
  body: {paddingHorizontal: 28, gap: 22},
  full: {width: '100%'},
  actions: {width: '100%', gap: 22},
  hero: {width: '100%', gap: 8},
  title: {
    width: '100%',
    fontFamily: fontFamily.displayBold,
    fontSize: 32,
    color: colors.text.primary,
  },
  subtitle: {
    width: '100%',
    fontFamily: fontFamily.bodyRegular,
    fontSize: 14,
    color: colors.text.secondary,
  },
  footnote: {
    width: '100%',
    fontFamily: fontFamily.bodyRegular,
    fontSize: 11,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
});
