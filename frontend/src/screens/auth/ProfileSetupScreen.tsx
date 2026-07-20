import React, { useRef, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import type { RootStackScreenProps } from '../../navigation/types';
import {
  CalendarSheet,
  Checkbox,
  CreamBackground,
  ImagePickerSheet,
  PrimaryButton,
  ProgressBar,
  TextField,
} from '../../components';
import { colors, fontFamily } from '../../theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../state/AuthContext';
import {apiErrorMessage, firstValidationMessage} from '../../services/api';
/**
 * Profile Setup (Figma 847:92)
 * Fixed header (back + progress) over a scrolling form: avatar, name/email/DOB,
 * marketing opt-in, expandable referral, Continue / Skip.
 */
type Props = RootStackScreenProps<'ProfileSetup'>;

const PROGRESS = 220 / 334; // exact fill ratio from the design

const TODAY = new Date();
// Default the DOB calendar to a sensible adult birth year rather than today.
const DOB_DEFAULT = new Date(TODAY.getFullYear() - 25, 0, 1);
// Registration rules (Module 1 Â· 4.1): 13+ years old, 100-year lower bound.
const MIN_AGE = 13;
const MAX_DOB = new Date(TODAY.getFullYear() - MIN_AGE, TODAY.getMonth(), TODAY.getDate());
const MIN_DOB = new Date(TODAY.getFullYear() - 100, 0, 1);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Whole years between a birth date and today. */
function ageOf(d: Date): number {
  let age = TODAY.getFullYear() - d.getFullYear();
  const m = TODAY.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && TODAY.getDate() < d.getDate())) {
    age -= 1;
  }
  return age;
}

const formatDob = (d: Date) => {
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd} / ${mm} / ${d.getFullYear()}`;
};

/** Backend `dob` wants an ISO date string (YYYY-MM-DD). */
const toIsoDate = (d: Date) => {
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
};

export function ProfileSetupScreen({ navigation, route }: Props) {
  const { width, height } = useWindowDimensions();
  const sso = route.params?.sso ?? false;
  const prefill = route.params?.prefill;
  // Reached from an order / booking / loyalty gate rather than onboarding.
  const gated = route.params?.gated ?? false;

  // SSO path arrives with name/email already known from the provider.
  const [firstName, setFirstName] = useState(
    prefill?.firstName ?? (sso ? 'Layla' : ''),
  );
  const [lastName, setLastName] = useState(
    prefill?.lastName ?? (sso ? 'Hassan' : ''),
  );
  const [email, setEmail] = useState(
    prefill?.email ?? (sso ? 'layla.hassan@gmail.com' : ''),
  );
  const [dob, setDob] = useState<Date | null>(null);
  const [optIn, setOptIn] = useState(false);
  const [referralOpen, setReferralOpen] = useState(false);
  const [referral, setReferral] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [photoOpen, setPhotoOpen] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    dob?: string;
    api?: string;
  }>({});
  const [submitting, setSubmitting] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const referralInputRef = useRef<TextInput>(null);
  const { updateProfile, markProfileSkipped } = useAuth();

  // Registration validation (Module 1 Â· 4.1): full name 2â€“50 chars, valid
  // email, and a date of birth that makes the user at least 13.
  const validate = (): boolean => {
    const fullName = `${firstName} ${lastName}`.trim();
    const next: {name?: string; email?: string; dob?: string; api?: string} = {};
    if (fullName.length < 2) {
      next.name = 'Enter your full name (at least 2 characters).';
    } else if (fullName.length > 50) {
      next.name = 'Name must be 50 characters or less.';
    }
    if (!email.trim()) {
      next.email = 'Email is required.';
    } else if (!EMAIL_RE.test(email.trim())) {
      next.email = 'Enter a valid email address.';
    }
    if (!dob) {
      next.dob = 'Date of birth is required.';
    } else if (ageOf(dob) < MIN_AGE) {
      next.dob = `You must be at least ${MIN_AGE} years old.`;
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  // Save the profile, then continue only after the API accepts it.
  const finish = async () => {
    if (submitting) {
      return;
    }
    if (!validate()) {
      scrollRef.current?.scrollTo({y: 0, animated: true});
      return;
    }
    const fullName = `${firstName} ${lastName}`.trim();
    // Send both the display `name` (used by the Home greeting) and the
    // structured fields the backend stores (first/last/dob/opt-in/referral).
    const patch: Parameters<typeof updateProfile>[0] = {
      marketing_opt_in: optIn,
    };
    if (fullName) patch.name = fullName;
    if (firstName.trim()) patch.first_name = firstName.trim();
    if (lastName.trim()) patch.last_name = lastName.trim();
    if (email.trim()) patch.email = email.trim();
    if (dob) patch.dob = toIsoDate(dob);
    if (referral.trim()) patch.referral_code = referral.trim();

    setSubmitting(true);
    setErrors({});
    console.log('[Registration] profile update payload:', patch);
    try {
      const updated = await updateProfile(patch);
      console.log('[Registration] profile update success:', updated);
      if (gated) {
        // Came from a gate — drop them back where they were so they can
        // retry the order / booking / redemption straight away.
        navigation.goBack();
      } else {
        navigation.reset({ index: 0, routes: [{ name: 'Location' }] });
      }
    } catch (error) {
      console.log('[Registration] profile update failed:', error);
      const message =
        firstValidationMessage(error) ??
        apiErrorMessage(error, 'Could not update your profile. Please try again.');
      setErrors(e => ({...e, api: message}));
      Toast.show({
        type: 'error',
        text1: 'Profile update failed',
        text2: message,
      });
      scrollRef.current?.scrollTo({y: 0, animated: true});
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * "Skip for now" — deliberately does NOT validate or save anything. It just
   * remembers the skip (so Splash / OTP stop forcing this screen again) and
   * moves on. Ordering, booking and loyalty stay gated until the profile is
   * completed, and send the user back here at that point.
   */
  const skipForNow = async () => {
    if (submitting) {
      return;
    }
    setErrors({});
    await markProfileSkipped();
    if (gated) {
      navigation.goBack();
    } else {
      navigation.reset({ index: 0, routes: [{ name: 'Location' }] });
    }
  };

  const applyReferral = () => {
    Toast.show({
      type: 'referralError',
      text1: "That code didn't work. Try another.",
      position: 'bottom',
      visibilityTime: 3000,
      bottomOffset: 92,
      props: {
        onRetry: () => {
          Toast.hide();
          setReferralOpen(true);
          setTimeout(() => referralInputRef.current?.focus(), 80);
        },
      },
    });
  };

  return (
    <SafeAreaView style={styles.flex} >
    <View style={styles.root}>
      <StatusBar
        barStyle="dark-content"
        translucent
        backgroundColor="transparent"
      />
      <CreamBackground
        width={width}
        height={height}
        cx={width}
        rx={width}
        ry={height}
      />

      <View style={styles.header}>
        <View style={styles.progressWrap}>
          <ProgressBar progress={PROGRESS} />
          <Text style={styles.progressLabel}>Almost there</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.hero}>
            <Text style={styles.title}>Set up your profile.</Text>
            <Text style={styles.subtitle}>
              {sso
                ? "We grabbed these from your account — tweak anything that's off."
                : 'Tell us a bit about yourself so we can personalise your visits.'}
            </Text>
            {errors.api ? (
              <View style={styles.apiError}>
                <Icon name="alert-circle-outline" size={16} color={colors.status.error} />
                <Text style={styles.apiErrorText}>{errors.api}</Text>
              </View>
            ) : null}
          </View>

          {/* Avatar */}
          <View style={styles.avatarWrap}>
            <Pressable
              style={styles.avatarFrame}
              onPress={() => setPhotoOpen(true)}
              accessibilityRole="button"
              accessibilityLabel="Edit photo"
            >
              <View style={styles.avatarCircle}>
                {avatarUri ? (
                  <Image
                    source={{ uri: avatarUri }}
                    style={styles.avatarImage}
                  />
                ) : (
                  <Text style={styles.avatarGlyph}>{'\u{1F464}'}</Text>
                )}
              </View>
              <View style={styles.editBadge}>
                <Text style={styles.editGlyph}>{'\u270E'}</Text>
              </View>
            </Pressable>
          </View>

          <TextField
            label="First name"
            value={firstName}
            onChangeText={v => {
              setFirstName(v);
              if (errors.name || errors.api) setErrors(e => ({...e, name: undefined, api: undefined}));
            }}
            placeholder="Enter first name"
            autoCapitalize="words"
            error={errors.name}
          />
          <TextField
            label="Last name"
            value={lastName}
            onChangeText={v => {
              setLastName(v);
              if (errors.name || errors.api) setErrors(e => ({...e, name: undefined, api: undefined}));
            }}
            placeholder="Enter last name"
            autoCapitalize="words"
          />
          <TextField
            label="Email"
            value={email}
            onChangeText={v => {
              setEmail(v);
              if (errors.email || errors.api) setErrors(e => ({...e, email: undefined, api: undefined}));
            }}
            placeholder="name@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
          />
          {/* <TextField
            label="Date of birth"
            value={dob ? formatDob(dob) : ''}
            onChangeText={() => {}}
            onPress={() => setCalendarOpen(true)}
            placeholder="DD / MM / YYYY"
            helper={`Required · we send a treat on your birthday ${'\u{1F382}'}`}
            trailing={<Text style={styles.cake}>{'\u{1F382}'}</Text>}
          /> */}
          <Pressable onPress={() => setCalendarOpen(true)}>
            <View pointerEvents="none">
              <TextField
                label="Date of birth"
                value={dob ? formatDob(dob) : ''}
                onChangeText={() => {}}
                placeholder="DD / MM / YYYY"
                helper={`Required · we send a treat on your birthday ${'\u{1F382}'}`}
                error={errors.dob}
                trailing={<Text style={styles.cake}>{'\u{1F382}'}</Text>}
              />
            </View>
          </Pressable>
          {/* Marketing opt-in */}
          <View style={styles.optIn}>
            <Checkbox checked={optIn} onChange={setOptIn} />
            <View style={styles.optInLabels}>
              <Text style={styles.optInTitle}>Send me good stuff</Text>
              <Text style={styles.optInSub}>
                Offers, points & reservation updates. Opt out anytime.
              </Text>
            </View>
          </View>

          {/* Referral */}
          <View style={styles.referral}>
            <Pressable
              style={styles.referralHeader}
              onPress={() => {
                setReferralOpen(o => !o);
                setTimeout(
                  () => scrollRef.current?.scrollToEnd({ animated: true }),
                  150,
                );
              }}
            >
              <Text style={styles.referralTitle}>Have a referral code?</Text>
              <Text style={styles.referralPlus}>
                {referralOpen ? '×' : '+'}
              </Text>
            </Pressable>
            {referralOpen ? (
              <View style={styles.referralExpanded}>
                <View style={styles.referralRow}>
                  <TextInput
                    ref={referralInputRef}
                    style={styles.referralInput}
                    value={referral}
                    onChangeText={setReferral}
                    onFocus={() =>
                      setTimeout(
                        () =>
                          scrollRef.current?.scrollToEnd({ animated: true }),
                        150,
                      )
                    }
                    placeholder="Enter code"
                    placeholderTextColor={colors.text.tertiary}
                    autoCapitalize="characters"
                  />
                  <Pressable style={styles.applyBtn} onPress={applyReferral}>
                    <Text style={styles.applyText}>Apply</Text>
                  </Pressable>
                </View>
                <Text style={styles.referralHelp}>
                  Got a friend's code? Drop it in. Both of you score perks.
                </Text>
              </View>
            ) : null}
          </View>

          <PrimaryButton label="Continue" onPress={finish} loading={submitting} disabled={submitting} />

          <Pressable style={styles.skip} onPress={skipForNow} disabled={submitting}>
            <Text style={styles.skipText}>Skip for now</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>

      <CalendarSheet
        visible={calendarOpen}
        initial={dob ?? DOB_DEFAULT}
        minDate={MIN_DOB}
        maxDate={MAX_DOB}
        pickerStyle="yearMonth"
        title="Your date of birth"
        confirmLabel="Set date of birth"
        onClose={() => setCalendarOpen(false)}
        onSelect={d => {
          setDob(d);
          if (errors.dob || errors.api) setErrors(e => ({...e, dob: undefined, api: undefined}));
        }}
      />

      <ImagePickerSheet
        visible={photoOpen}
        onClose={() => setPhotoOpen(false)}
        onPicked={asset => asset.uri && setAvatarUri(asset.uri)}
      />
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.brand.ivory },
  flex: { flex: 1 },
  header: {
    paddingTop: 12,
    paddingHorizontal: 28,
  },
  progressWrap: {
    marginTop: 16,
    gap: 8,
  },
  progressLabel: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 12,
    color: colors.text.tertiary,
  },
  content: {
    paddingTop: 16,
    paddingHorizontal: 28,
    paddingBottom: 40,
    gap: 16,
  },
  hero: {
    width: '100%',
    gap: 6,
  },
  title: {
    width: '100%',
    fontFamily: fontFamily.displayBold,
    fontSize: 28,
    color: colors.text.primary,
  },
  subtitle: {
    width: '100%',
    fontFamily: fontFamily.bodyRegular,
    fontSize: 13,
    color: colors.text.secondary,
  },
  apiError: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(190,45,45,0.22)',
    backgroundColor: 'rgba(190,45,45,0.08)',
  },
  apiErrorText: {
    flex: 1,
    fontFamily: fontFamily.bodyMedium,
    fontSize: 12,
    color: colors.status.error,
  },
  avatarWrap: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 4,
    paddingBottom: 8,
  },
  avatarFrame: {
    width: 96,
    height: 96,
  },
  avatarCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.brand.champagne,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  avatarGlyph: {
    fontSize: 40,
    opacity: 0.4,
  },
  editBadge: {
    position: 'absolute',
    left: 66,
    top: 66,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.brand.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editGlyph: {
    color: '#ffffff',
    fontSize: 14,
  },
  cake: {
    fontSize: 18,
  },
  optIn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    backgroundColor: colors.brand.white,
  },
  optInLabels: {
    flex: 1,
    gap: 2,
  },
  optInTitle: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 13,
    color: colors.text.primary,
  },
  optInSub: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 11,
    color: colors.text.secondary,
  },
  referral: {
    width: '100%',
    gap: 10,
  },
  referralHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  referralTitle: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 12,
    color: colors.text.primary,
  },
  referralPlus: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 16,
    color: colors.text.primary,
  },
  referralExpanded: {
    width: '100%',
    gap: 8,
  },
  referralRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  referralInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border.subtle,
    backgroundColor: colors.brand.white,
    fontFamily: fontFamily.bodyRegular,
    fontSize: 15,
    color: colors.text.primary,
  },
  applyBtn: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.brand.navy,
  },
  applyText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 14,
    color: colors.text.inverse,
  },
  referralHelp: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 11,
    color: colors.text.tertiary,
  },
  skip: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 8,
  },
  skipText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 13,
    color: colors.text.tertiary,
  },
});
