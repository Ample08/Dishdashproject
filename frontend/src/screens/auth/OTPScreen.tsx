import React, {useEffect, useRef, useState} from 'react';
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
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import type {RootStackScreenProps} from '../../navigation/types';
import {
  BackButton,
  CreamBackground,
  OTPInput,
  PrimaryButton,
} from '../../components';
import {colors, fontFamily} from '../../theme';

/**
 * OTP Verification (Figma 597:46)
 * Six-digit code entry with resend countdown. Body @ top 130, px 28, gap 22.
 */
const CODE_LENGTH = 6;
const RESEND_SECONDS = 45;

type Props = RootStackScreenProps<'OTP'>;

function fmt(total: number) {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function OTPScreen({navigation, route}: Props) {
  const {width, height} = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const phone = route.params?.phone ?? '+971 50 XXX XXXX';
  const fromSso = route.params?.fromSso ?? false;

  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const [helper, setHelper] = useState<string | undefined>();
  const [seconds, setSeconds] = useState(RESEND_SECONDS);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timer.current = setInterval(() => {
      setSeconds(prev => {
        if (prev <= 1) {
          if (timer.current) {
            clearInterval(timer.current);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timer.current) {
        clearInterval(timer.current);
      }
    };
  }, []);

  const onChange = (v: string) => {
    setCode(v);
    if (error) {
      setError(false);
      setHelper(undefined);
    }
  };

  const verify = (value: string) => {
    if (value.length !== CODE_LENGTH) {
      setError(true);
      setHelper('Enter all 6 digits of the code.');
      return;
    }
    // TODO: POST /auth/otp/verify — on mismatch: setError(true) +
    // setHelper("That didn't match. N tries left.") (error-matrix #5/#6).
    // Conditional routing on the SSO flag (Figma var auth/from-sso).
    navigation.reset({
      index: 0,
      routes: [{name: 'ProfileSetup', params: {sso: fromSso}}],
    });
  };

  const resend = () => {
    if (seconds > 0) {
      return;
    }
    setCode('');
    setError(false);
    setSeconds(RESEND_SECONDS);
    if (timer.current) {
      clearInterval(timer.current);
    }
    timer.current = setInterval(() => {
      setSeconds(prev => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    // TODO: POST /auth/otp/request again.
  };

  return (
     <SafeAreaView style={styles.flex}>
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <CreamBackground width={width} height={height} />
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
             //s minHeight: height - insets.top - 58,
              //paddingTop: Math.max(44, Math.min(88, height * 0.09)),
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
              <Text style={styles.title}>Six digits, then we're in.</Text>
              <Text style={styles.subtitle}>
                Sent to {phone}. It usually arrives in seconds.
              </Text>
            </View>

            <View style={styles.full}>
              <OTPInput
                value={code}
                onChangeText={onChange}
                error={error}
                onFilled={verify}
              />
            </View>

            {helper ? <Text style={styles.errorHelper}>{helper}</Text> : null}

            <View style={styles.actions}>
              <TouchableOpacity
                activeOpacity={seconds > 0 ? 1 : 0.6}
                onPress={resend}
                disabled={seconds > 0}>
                <Text style={styles.resend}>
                  {seconds > 0 ? `No code yet?  Resend in ${fmt(seconds)}` : 'Resend code'}
                </Text>
              </TouchableOpacity>

              <PrimaryButton label="Let me in" onPress={() => verify(code)} />

              <Text style={styles.footnote}>
                Same code works for sign-up and sign-in.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.brand.ivory,
  },
  flex: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 10,
    zIndex: 2,
  },
  scroll: {
    flexGrow: 1,
  },
  body: {
    paddingHorizontal: 28,
    gap: 22,
  },
  full: {width: '100%'},
  actions: {width: '100%', gap: 22},
  hero: {
    width: '100%',
    gap: 8,
  },
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
  errorHelper: {
    width: '100%',
    marginTop: -8,
    fontFamily: fontFamily.bodyRegular,
    fontSize: 13,
    color: colors.status.error,
    textAlign: 'center',
  },
  resend: {
    width: '100%',
    fontFamily: fontFamily.bodyRegular,
    fontSize: 13,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  footnote: {
    width: '100%',
    fontFamily: fontFamily.bodyRegular,
    fontSize: 11,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
});
