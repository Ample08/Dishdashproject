import React, {useEffect, useRef, useState} from 'react';
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
import Toast from 'react-native-toast-message';
import type {RootStackScreenProps} from '../../navigation/types';
import {
  BackButton,
  BottomSheet,
  ConfirmDialog,
  CountryPickerSheet,
  CreamBackground,
  PhoneField,
  PrimaryButton,
} from '../../components';
import {DEFAULT_COUNTRY, type Country} from '../../data/countries';
import {classifyError, firstValidationMessage} from '../../services/api';
import {useAuth} from '../../state/AuthContext';
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
  const [sending, setSending] = useState(false);
  const [skipOpen, setSkipOpen] = useState(false);
  const [conflictOpen, setConflictOpen] = useState(false);
  const allowLeave = useRef(false);
  const {requestOtp} = useAuth();

  // Error #14: leaving post-SSO phone verify → confirm the loyalty trade-off
  // before letting the back gesture / hardware back actually pop the screen.
  useEffect(() => {
    const unsub = navigation.addListener('beforeRemove', e => {
      if (allowLeave.current) {
        return;
      }
      e.preventDefault();
      setSkipOpen(true);
    });
    return unsub;
  }, [navigation]);

  const skipPhone = () => {
    allowLeave.current = true;
    setSkipOpen(false);
    // Skip → continue into profile setup without linking a number.
    navigation.reset({
      index: 0,
      routes: [{name: 'ProfileSetup', params: {sso: true}}],
    });
  };

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

  const onSend = async () => {
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

    setSending(true);
    try {
      await requestOtp(fullPhone);
    } catch (e: any) {
      setSending(false);
      const kind = classifyError(e);
      if (kind === 'validation') {
        setError(firstValidationMessage(e) ?? 'Enter a valid phone number.');
        return;
      }
      if (kind === 'conflict') {
        // Error #2: number already tied to another account.
        setConflictOpen(true);
        return;
      }
      Toast.show({
        type: 'info',
        text1: kind === 'offline' ? "You're offline" : "Couldn't send the code",
        text2: 'Check your connection and tap Send again.',
      });
      return;
    }
    setSending(false);

    // Post-SSO path → mark from-sso so OTP routes to Profile Setup (SSO).
    // This is a push (not a pop), so the skip prompt won't fire here.
    navigation.navigate('OTP', {
      phone: fullPhone,
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
              <PrimaryButton
                label="Send code on WhatsApp"
                onPress={onSend}
                loading={sending}
              />

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

      {/* Error #2: number already tied to another account. */}
      <BottomSheet visible={conflictOpen} onClose={() => setConflictOpen(false)}>
        <Text style={styles.sheetTitle}>Number already linked</Text>
        <Text style={styles.sheetBody}>
          This number is already linked to another Flavours account. Use a
          different number, or sign in with that account instead.
        </Text>
        <PrimaryButton
          label="Try another number"
          onPress={() => setConflictOpen(false)}
        />
      </BottomSheet>

      {/* Error #14: confirm skipping phone verification (loyalty won't link). */}
      <ConfirmDialog
        visible={skipOpen}
        title="Skip phone verification?"
        message="Your loyalty points and perks won't link to a number until you verify it. You can add it later in Settings."
        confirmLabel="Skip for now"
        cancelLabel="Keep verifying"
        onConfirm={skipPhone}
        onCancel={() => setSkipOpen(false)}
      />
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
