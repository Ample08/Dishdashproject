import React, {useCallback, useMemo, useState} from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useFocusEffect} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import Toast from 'react-native-toast-message';
import Svg, {Circle, Defs, RadialGradient, Stop} from 'react-native-svg';
import {
  CalendarSheet,
  ImagePickerSheet,
  PrimaryButton,
  TextField,
} from '../../components';
import type {TabScreenProps} from '../../navigation/types';
import {useAuth} from '../../state/AuthContext';
import {useLoyalty} from '../../state/LoyaltyContext';
import {colors, fontFamily} from '../../theme';

/**
 * Profile (tab 5) â€” the signed-in user's account, backed by /api/app/profile.
 * View mode shows live details fetched via GET; Edit mode saves changes via PUT.
 */
const TEAL = colors.brand.teal;
const PROFILE_PHOTO_KEY = '@dishdash/profile-photo-uri';

/** Parse the backend `dob` ("YYYY-MM-DD" or ISO) into a Date, or null. */
function parseDob(dob?: string | null): Date | null {
  if (!dob) {
    return null;
  }
  const d = new Date(dob.length <= 10 ? `${dob}T00:00:00` : dob);
  return isNaN(d.getTime()) ? null : d;
}

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];
const prettyDob = (d: Date) =>
  `${String(d.getDate()).padStart(2, '0')} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
const toIsoDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`;

function Glow() {
  return (
    <Svg width={280} height={280} pointerEvents="none" style={styles.glow}>
      <Defs>
        <RadialGradient id="pglow" cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor="#9ED487" stopOpacity={0.16} />
          <Stop offset="0.55" stopColor="#9ED487" stopOpacity={0.16} />
          <Stop offset="1" stopColor="#9ED487" stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Circle cx={140} cy={140} r={140} fill="url(#pglow)" />
    </Svg>
  );
}

export function ProfileHomeScreen({navigation}: TabScreenProps<'Profile'>) {
  const insets = useSafeAreaInsets();
  const {user, refreshProfile, updateProfile, signOut} = useAuth();
  const {points, tier} = useLoyalty();

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState<Date | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [photoOpen, setPhotoOpen] = useState(false);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  // Pull the latest profile whenever the tab is shown (GET /api/app/profile).
  useFocusEffect(
    useCallback(() => {
      refreshProfile();
      AsyncStorage.getItem(PROFILE_PHOTO_KEY)
        .then(setAvatarUri)
        .catch(() => {});
    }, [refreshProfile]),
  );

  const displayName = useMemo(() => {
    const full = [user?.first_name, user?.last_name].filter(Boolean).join(' ').trim();
    return full || user?.name?.trim() || 'Guest';
  }, [user]);
  const initial = displayName.charAt(0).toUpperCase();

  const beginEdit = () => {
    setFirstName(user?.first_name ?? '');
    setLastName(user?.last_name ?? '');
    setEmail(user?.email ?? '');
    setDob(parseDob(user?.dob));
    setEditing(true);
  };

  const save = async () => {
    if (saving) {
      return;
    }
    setSaving(true);
    const fullName = `${firstName} ${lastName}`.trim();
    const patch: Parameters<typeof updateProfile>[0] = {};
    if (fullName) patch.name = fullName;
    if (firstName.trim()) patch.first_name = firstName.trim();
    if (lastName.trim()) patch.last_name = lastName.trim();
    if (email.trim()) patch.email = email.trim();
    if (dob) patch.dob = toIsoDate(dob);
    try {
      await updateProfile(patch);
      setEditing(false);
      Toast.show({type: 'success', text1: 'Profile updated'});
    } catch {
      Toast.show({
        type: 'info',
        text1: "Couldn't save your profile",
        text2: 'Check your connection and try again.',
      });
    } finally {
      setSaving(false);
    }
  };

  const doSignOut = async () => {
    await signOut();
    navigation.getParent()?.reset({index: 0, routes: [{name: 'SignIn'}]});
  };

  const updatePhoto = async (uri: string) => {
    setAvatarUri(uri);
    await AsyncStorage.setItem(PROFILE_PHOTO_KEY, uri);
    Toast.show({type: 'success', text1: 'Profile picture updated'});
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: insets.bottom + 120}}>
        {/* Teal header with avatar + tier */}
        <View style={[styles.header, {paddingTop: insets.top + 18}]}>
          <Glow />
          <Pressable
            style={styles.avatar}
            onPress={() => setPhotoOpen(true)}
            accessibilityRole="button"
            accessibilityLabel="Update profile picture">
            {avatarUri ? (
              <Image source={{uri: avatarUri}} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>{initial}</Text>
            )}
            <View style={styles.avatarEdit}>
              <Icon name="camera" size={15} color={colors.brand.navy} />
            </View>
          </Pressable>
          <Text style={styles.name}>{displayName}</Text>
          <View style={styles.tierRow}>
            <Icon name="ribbon" size={13} color={colors.brand.pistachio} />
            <Text style={styles.tierText}>{tier.name.toUpperCase()} MEMBER</Text>
          </View>
          <View style={styles.pointsPill}>
            <Icon name="star" size={13} color={colors.brand.navy} />
            <Text style={styles.pointsText}>{points.toLocaleString()} points</Text>
          </View>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.body}>
            <View style={styles.cardHead}>
              <Text style={styles.cardTitle}>Account details</Text>
              {!editing ? (
                <Pressable
                  style={styles.editBtn}
                  onPress={beginEdit}
                  accessibilityRole="button">
                  <Icon name="create-outline" size={15} color={colors.brand.navy} />
                  <Text style={styles.editText}>Edit</Text>
                </Pressable>
              ) : null}
            </View>

            {!editing ? (
              <View style={styles.card}>
                <Row icon="call-outline" label="Phone" value={user?.phone ?? 'â€”'} />
                <Row icon="mail-outline" label="Email" value={user?.email || 'Not added'} />
                <Row
                  icon="calendar-outline"
                  label="Date of birth"
                  value={user?.dob ? prettyDob(parseDob(user.dob) as Date) : 'Not added'}
                />
                <Row
                  icon="gift-outline"
                  label="Referral code"
                  value={user?.referral_code ?? '—'}
                  last
                />
              </View>
            ) : (
              <View style={styles.editCard}>
                <TextField
                  label="First name"
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="First name"
                  autoCapitalize="words"
                />
                <TextField
                  label="Last name"
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="Last name"
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
                <Pressable onPress={() => setCalendarOpen(true)}>
                  <View pointerEvents="none">
                    <TextField
                      label="Date of birth"
                      value={dob ? prettyDob(dob) : ''}
                      onChangeText={() => {}}
                      placeholder="Select your birthday"
                      trailing={
                        <Icon name="calendar-outline" size={18} color={colors.text.tertiary} />
                      }
                    />
                  </View>
                </Pressable>

                <PrimaryButton label="Update Profile" onPress={save} loading={saving} />
                <Pressable
                  style={styles.cancel}
                  onPress={() => setEditing(false)}
                  disabled={saving}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </Pressable>
              </View>
            )}

            {!editing ? (
              <Pressable
                style={styles.signOut}
                onPress={doSignOut}
                accessibilityRole="button">
                <Icon name="log-out-outline" size={18} color={colors.status.error} />
                <Text style={styles.signOutText}>Sign out</Text>
              </Pressable>
            ) : null}
          </View>
        </KeyboardAvoidingView>
      </ScrollView>

      <CalendarSheet
        visible={calendarOpen}
        initial={dob ?? new Date(new Date().getFullYear() - 25, 0, 1)}
        minDate={new Date(new Date().getFullYear() - 100, 0, 1)}
        maxDate={new Date(new Date().getFullYear() - 13, new Date().getMonth(), new Date().getDate())}
        pickerStyle="yearMonth"
        title="Your date of birth"
        confirmLabel="Set date of birth"
        onClose={() => setCalendarOpen(false)}
        onSelect={setDob}
      />
      <ImagePickerSheet
        visible={photoOpen}
        onClose={() => setPhotoOpen(false)}
        onPicked={asset => {
          if (asset.uri) {
            updatePhoto(asset.uri);
          }
        }}
      />
    </View>
  );
}

function Row({
  icon,
  label,
  value,
  last,
}: {
  icon: string;
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View style={[styles.row, last && styles.rowLast]}>
      <Icon name={icon} size={18} color={colors.text.secondary} style={styles.rowIcon} />
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: colors.brand.ivory},
  header: {
    backgroundColor: TEAL,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingHorizontal: 24,
    paddingBottom: 26,
    alignItems: 'center',
    overflow: 'hidden',
  },
  glow: {position: 'absolute', top: -80, alignSelf: 'center'},
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.brand.pistachio,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  avatarText: {
    fontFamily: fontFamily.displayBold,
    fontSize: 36,
    color: colors.brand.navy,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 42,
  },
  avatarEdit: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.brand.pistachio,
    borderWidth: 2,
    borderColor: TEAL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontFamily: fontFamily.displayBold,
    fontSize: 24,
    color: colors.brand.ivory,
    marginTop: 12,
  },
  tierRow: {flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6},
  tierText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 10.5,
    letterSpacing: 1,
    color: colors.brand.pistachio,
  },
  pointsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: colors.brand.pistachio,
  },
  pointsText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 12.5,
    color: colors.brand.navy,
  },
  body: {paddingHorizontal: 20, paddingTop: 20},
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardTitle: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 13,
    letterSpacing: 0.4,
    color: colors.text.secondary,
    textTransform: 'uppercase',
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.brand.white,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  editText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 12.5,
    color: colors.brand.navy,
  },
  card: {
    backgroundColor: colors.brand.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  rowLast: {borderBottomWidth: 0},
  rowIcon: {marginRight: 12},
  rowLabel: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 14,
    color: colors.text.secondary,
    flex: 1,
  },
  rowValue: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 14,
    color: colors.text.primary,
    maxWidth: '55%',
    textAlign: 'right',
  },
  editCard: {gap: 16},
  optIn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    backgroundColor: colors.brand.white,
  },
  optInLabels: {flex: 1, gap: 2},
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
  cancel: {alignItems: 'center', paddingVertical: 6},
  cancelText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 13,
    color: colors.text.tertiary,
  },
  signOut: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 22,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    backgroundColor: colors.brand.white,
  },
  signOutText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 14,
    color: colors.status.error,
  },
});
