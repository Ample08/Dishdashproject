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
import {SafeAreaView} from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import type {RootStackScreenProps} from '../../navigation/types';
import {
  BackButton,
  BottomSheet,
  CreamBackground,
  OTPInput,
  PrimaryButton,
} from '../../components';
import {classifyError} from '../../services/api';
import {isProfileComplete} from '../../services/authService';
import {useAuth} from '../../state/AuthContext';
import {colors, fontFamily} from '../../theme';
import Animated, {Easing, FadeInRight} from 'react-native-reanimated';

/**
 * OTP Verification (Figma 597:46) + Error Handling matrix (Figma 6522:20892)
 * Six-digit entry with resend countdown, wrong-attempt lockout, code expiry,
 * and network/server-aware recovery. Body @ top 130, px 28, gap 22.
 */
const CODE_LENGTH = 6;
const RESEND_SECONDS = 45; // resend cooldown
const EXPIRY_SECONDS = 300; // code valid for 5 minutes
const MAX_ATTEMPTS = 3; // wrong tries before a temporary lock
const LOCK_SECONDS = 60; // lock duration after too many wrong tries

type Props = RootStackScreenProps<'OTP'>;

function fmt(total: number) {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function OTPScreen({navigation, route}: Props) {
  const {width, height} = useWindowDimensions();
  const phone = route.params?.phone ?? '+971 50 XXX XXXX';
  const fromSso = route.params?.fromSso ?? false;

  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const [helper, setHelper] = useState<string | undefined>();
  const [resendIn, setResendIn] = useState(RESEND_SECONDS);
  const [expiryIn, setExpiryIn] = useState(EXPIRY_SECONDS);
  const [expired, setExpired] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [lockIn, setLockIn] = useState(0); // >0 → temporarily locked
  const [verifying, setVerifying] = useState(false);
  const [conflictOpen, setConflictOpen] = useState(false);
  const wasLocked = useRef(false);
  const {verifyOtp, requestOtp, profileSkipped} = useAuth();

  const locked = lockIn > 0;

  // Single 1s ticker drives every countdown (resend cooldown, code expiry, lock).
  useEffect(() => {
    const t = setInterval(() => {
      setResendIn(s => (s > 0 ? s - 1 : 0));
      setLockIn(s => (s > 0 ? s - 1 : 0));
      setExpiryIn(s => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  // Error #7: code expired (5 min idle) → clear cells, warn, force a resend.
  useEffect(() => {
    if (expiryIn === 0 && !expired) {
      setExpired(true);
      setCode('');
      setError(false);
      setHelper(undefined);
      Toast.show({
        type: 'info',
        text1: 'Code expired',
        text2: 'Tap resend to get a fresh code.',
      });
    }
  }, [expiryIn, expired]);

  // Error #6: lock lifted after the cooldown → let the user try again.
  useEffect(() => {
    if (lockIn === 0 && wasLocked.current) {
      wasLocked.current = false;
      setAttempts(0);
      setError(false);
      setHelper('You can try again now.');
    }
  }, [lockIn]);

  const onChange = (v: string) => {
    if (locked || expired) {
      return;
    }
    setCode(v);
    if (error) {
      setError(false);
      setHelper(undefined);
    }
  };

  const verify = async (value: string) => {
    if (locked || expired || verifying) {
      return;
    }
    if (value.length !== CODE_LENGTH) {
      setError(true);
      setHelper('Enter all 6 digits of the code.');
      return;
    }

    setVerifying(true);
    try {
      const {isNewUser, user} = await verifyOtp(phone, value);

      // New users, SSO sign-ups, and anyone whose registration is incomplete
      // (missing name / email / date of birth) go to Profile Setup; fully
      // registered returning users jump straight into the app. Returning users
      // who already chose "Skip for now" aren't forced back through it — the
      // order / booking / loyalty gates pick them up instead.
      const needsProfile = !isProfileComplete(user) && !profileSkipped;
      if (isNewUser || fromSso || needsProfile) {
        navigation.reset({
          index: 0,
          routes: [{name: 'ProfileSetup', params: {sso: fromSso}}],
        });
      } else {
        navigation.reset({index: 0, routes: [{name: 'MainTabs'}]});
      }
    } catch (e: any) {
      const kind = classifyError(e);
      if (kind === 'conflict') {
        // Error #2: phone already linked to another account.
        setConflictOpen(true);
      } else if (kind === 'offline') {
        // Error #3: no connection.
        setError(true);
        setHelper("You're offline. Check your connection and try again.");
      } else if (kind === 'auth') {
        // Error #4/#6: wrong code — count the attempt, lock after MAX_ATTEMPTS.
        const next = attempts + 1;
        setAttempts(next);
        setError(true);
        setCode('');
        if (next >= MAX_ATTEMPTS) {
          wasLocked.current = true;
          setLockIn(LOCK_SECONDS);
          setHelper(undefined);
        } else {
          const left = MAX_ATTEMPTS - next;
          setHelper(`That didn't match. ${left} ${left === 1 ? 'try' : 'tries'} left.`);
        }
      } else {
        // Error #5: server fault / timeout.
        setError(true);
        setHelper("Couldn't verify right now. Tap to retry.");
      }
    } finally {
      setVerifying(false);
    }
  };

  const resend = async () => {
    // Error #8: resend disabled while cooling down or locked.
    if (resendIn > 0 || locked) {
      return;
    }
    setCode('');
    setError(false);
    setHelper(undefined);
    setResendIn(RESEND_SECONDS);
    setExpiryIn(EXPIRY_SECONDS);
    setExpired(false);
    setAttempts(0);
    try {
      await requestOtp(phone);
    } catch (e: any) {
      const offline = classifyError(e) === 'offline';
      Toast.show({
        type: 'info',
        text1: offline ? "You're offline" : "Couldn't send the code",
        text2: 'Tap resend to try again.',
      });
    }
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
          <Animated.View
            entering={FadeInRight.duration(300).easing(Easing.out(Easing.cubic))}
            style={styles.body}>
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

            {locked ? (
              <Text style={styles.errorHelper}>
                {`Too many attempts. Try again in ${fmt(lockIn)}.`}
              </Text>
            ) : helper ? (
              <Text style={styles.errorHelper}>{helper}</Text>
            ) : null}

            <View style={styles.actions}>
              <TouchableOpacity
                activeOpacity={resendIn > 0 || locked ? 1 : 0.6}
                onPress={resend}
                disabled={resendIn > 0 || locked}>
                <Text style={styles.resend}>
                  {locked
                    ? `Locked · retry in ${fmt(lockIn)}`
                    : resendIn > 0
                    ? `No code yet?  Resend in ${fmt(resendIn)}`
                    : 'Resend code'}
                </Text>
              </TouchableOpacity>

              <PrimaryButton
                label="Let me in"
                onPress={() => verify(code)}
                loading={verifying}
                disabled={locked || expired}
              />

              <Text style={styles.footnote}>
                Same code works for sign-up and sign-in.
              </Text>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Error #2: this phone is already tied to another account. */}
      <BottomSheet visible={conflictOpen} onClose={() => setConflictOpen(false)}>
        <Text style={styles.sheetTitle}>Number already linked</Text>
        <Text style={styles.sheetBody}>
          This number is already linked to another Flavours account. Sign in
          there, or go back and use a different number.
        </Text>
        <PrimaryButton
          label="Use a different number"
          onPress={() => {
            setConflictOpen(false);
            navigation.goBack();
          }}
        />
      </BottomSheet>
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
