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
  BackButton,
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

const formatDob = (d: Date) => {
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd} / ${mm} / ${d.getFullYear()}`;
};

export function ProfileSetupScreen({ navigation, route }: Props) {
  const { width, height } = useWindowDimensions();
  const sso = route.params?.sso ?? false;
  const prefill = route.params?.prefill;

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
  const scrollRef = useRef<ScrollView>(null);
  const referralInputRef = useRef<TextInput>(null);

  // After profile → permission primers. (TODO: POST /auth/profile.)
  const finish = () =>
    navigation.reset({ index: 0, routes: [{ name: 'Location' }] });

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
                  <Text style={styles.avatarGlyph}>👤</Text>
                )}
              </View>
              <View style={styles.editBadge}>
                <Text style={styles.editGlyph}>✎</Text>
              </View>
            </Pressable>
          </View>

          <TextField
            label="First name"
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Enter first name"
            autoCapitalize="words"
          />
          <TextField
            label="Last name"
            value={lastName}
            onChangeText={setLastName}
            placeholder="Enter last name"
            autoCapitalize="words"
          />
          <TextField
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="name@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {/* <TextField
            label="Date of birth"
            value={dob ? formatDob(dob) : ''}
            onChangeText={() => {}}
            onPress={() => setCalendarOpen(true)}
            placeholder="DD / MM / YYYY"
            helper="Required · we send a treat on your birthday 🎂"
            trailing={<Text style={styles.cake}>🎂</Text>}
          /> */}
          <Pressable onPress={() => setCalendarOpen(true)}>
            <View pointerEvents="none">
              <TextField
                label="Date of birth"
                value={dob ? formatDob(dob) : ''}
                onChangeText={() => {}}
                placeholder="DD / MM / YYYY"
                helper="Required · we send a treat on your birthday 🎂"
                trailing={<Text style={styles.cake}>🎂</Text>}
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

          <PrimaryButton label="Continue" onPress={finish} />

          <Pressable style={styles.skip} onPress={finish}>
            <Text style={styles.skipText}>Skip for now</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>

      <CalendarSheet
        visible={calendarOpen}
        initial={dob ?? DOB_DEFAULT}
        maxDate={TODAY}
        confirmLabel="Set date of birth"
        onClose={() => setCalendarOpen(false)}
        onSelect={setDob}
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
