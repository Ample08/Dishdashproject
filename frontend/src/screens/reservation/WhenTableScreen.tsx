import React, {useState} from 'react';
import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import MCIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import {PrimaryButton} from '../../components/PrimaryButton';
import {ReservationHeader} from '../../components/ReservationHeader';
import {StepNav} from '../../components/StepNav';
import {TableViz} from '../../components/TableViz';
import {
  MAX_GUESTS,
  MIN_GUESTS,
  type SeatingArea,
  type ShishaPref,
} from '../../data/reservations';
import type {RootStackScreenProps} from '../../navigation/types';
import {useReservations} from '../../state/ReservationContext';
import {colors, fontFamily, radius} from '../../theme';

type IconSet = 'ion' | 'mci';
type Option<T> = {
  value: T;
  label: string;
  set: IconSet;
  icon: string;
  badge?: string;
};

/**
 * 42 · When & Table (Figma 4229:6) — seating + shisha selectors and the
 * animated guest/table picker.
 */
export function WhenTableScreen({
  navigation,
}: RootStackScreenProps<'WhenTable'>) {
  const insets = useSafeAreaInsets();
  const {draft, patchDraft} = useReservations();

  const [seating, setSeating] = useState<SeatingArea>(draft.seating);
  const [shisha, setShisha] = useState<ShishaPref>(draft.shisha);
  const [guests, setGuests] = useState(draft.guests);

  // Functional clamp so rapid +/- taps never drop or double-count.
  const changeGuests = (delta: number) =>
    setGuests(g => Math.min(MAX_GUESTS, Math.max(MIN_GUESTS, g + delta)));

  const seatingOpts: Option<SeatingArea>[] = [
    {value: 'indoor', label: 'Indoor', set: 'ion', icon: 'home-outline'},
    {
      value: 'terrace',
      label: 'Terrace',
      set: 'ion',
      icon: 'sunny-outline',
      badge: '+ Burj view',
    },
  ];
  const shishaOpts: Option<ShishaPref>[] = [
    {value: 'shisha', label: 'Shisha lounge', set: 'mci', icon: 'smoking'},
    {value: 'non', label: 'Non-Shisha Lounge', set: 'ion', icon: 'leaf-outline'},
  ];

  const onContinue = () => {
    patchDraft({seating, shisha, guests});
    navigation.navigate('ReservationWhen');
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />
      <ReservationHeader title="New Reservation" onBack={navigation.goBack} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}>
        <Text style={styles.h1}>Where would you like to sit?</Text>

        <Text style={styles.section}>SEATING AREA</Text>
        <View style={styles.pair}>
          {seatingOpts.map(o => (
            <SelectCard
              key={o.value}
              option={o}
              selected={seating === o.value}
              onPress={() => setSeating(o.value)}
            />
          ))}
        </View>

        <Text style={[styles.section, {marginTop: 22}]}>SHISHA PREFERENCE</Text>
        <View style={styles.pair}>
          {shishaOpts.map(o => (
            <SelectCard
              key={o.value}
              option={o}
              selected={shisha === o.value}
              onPress={() => setShisha(o.value)}
            />
          ))}
        </View>

        <Text style={styles.h2}>How many guests?</Text>
        <TableViz count={guests} onChange={changeGuests} />
      </ScrollView>

      <View style={[styles.footer, {paddingBottom: insets.bottom + 8}]}>
        <View style={styles.ctaWrap}>
          <PrimaryButton
            label="Continue To Timing"
            onPress={onContinue}
            style={styles.cta}
          />
        </View>
        <StepNav current="Table" />
      </View>
    </View>
  );
}

function SelectCard<T>({
  option,
  selected,
  onPress,
}: {
  option: Option<T>;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.card, selected && styles.cardSelected]}
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{selected}}>
      {option.badge && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{option.badge}</Text>
        </View>
      )}
      {option.set === 'ion' ? (
        <Icon name={option.icon} size={20} color={selected ? colors.brand.champagne : colors.brand.navy} />
      ) : (
        <MCIcon name={option.icon} size={20} color={selected ? colors.brand.champagne : colors.brand.navy} />
      )}
      <Text style={[styles.cardLabel, selected && {color: colors.brand.champagne}]} numberOfLines={1}>
        {option.label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: colors.brand.ivory},
  scroll: {paddingHorizontal: 20, paddingTop: 18, paddingBottom: 28},
  h1: {
    fontFamily: fontFamily.displayBold,
    fontSize: 20,
    color: colors.brand.navy,
    marginBottom: 18,
  },
  section: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 11,
    letterSpacing: 0.8,
    color: '#000000',
    marginBottom: 10,
  },
  pair: {flexDirection: 'row', gap: 14},
  card: {
    flex: 1,
    height: 75,
    borderRadius: radius.card,
    backgroundColor: colors.brand.white,
    borderWidth: 1.2,
    borderColor: colors.brand.navy,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    overflow: 'hidden',
  },
  cardSelected: {
    color: colors.brand.champagne,
    backgroundColor: colors.brand.navy,
  },
  cardLabel: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 14,
    color: colors.brand.navy,
    zIndex: 2,
  },
  badge: {
    position: 'absolute',
    top: 8,
    left: 8,
    zIndex: 2,
    backgroundColor: colors.brand.champagne,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 9,
    color: colors.brand.navy,
  },

  h2: {
    fontFamily: fontFamily.displayBold,
    fontSize: 15,
    color: colors.brand.navy,
    marginTop: 26,
    marginBottom: 10,
  },

  footer: {backgroundColor: colors.brand.ivory, paddingTop: 6},
  ctaWrap: {paddingHorizontal: 30, marginBottom: 4},
  cta: {height: 54},
});
