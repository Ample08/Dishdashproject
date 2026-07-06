import React, {useMemo, useState} from 'react';
import {
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ClothCard} from '../../components/ClothCard';
import {PrimaryButton} from '../../components/PrimaryButton';
import {ReservationHeader} from '../../components/ReservationHeader';
import {StepNav} from '../../components/StepNav';
import {BRANDS} from '../../data/menu';
import {BRANCHES, branchByKey, type BranchKey} from '../../data/reservations';
import type {RootStackScreenProps} from '../../navigation/types';
import {useReservations} from '../../state/ReservationContext';
import {colors, fontFamily} from '../../theme';

const CARD_W = Dimensions.get('window').width - 42;

/**
 * 41 · Place (Figma 4134:6) — "Choose your location" cloth-card accordion.
 * The selected branch expands to the bottom; the others stack above as tabs.
 * Tapping a tab re-selects (smart-animate equivalent via ClothCard).
 */
export function PlaceScreen({navigation}: RootStackScreenProps<'ReservationPlace'>) {
  const insets = useSafeAreaInsets();
  const {draft, patchDraft} = useReservations();
  const brandColor = BRANDS[draft.restaurant ?? 'Karaz'].color;

  const [selected, setSelected] = useState<BranchKey>(
    draft.branch ?? 'dubai-mall',
  );

  // Tabs (non-selected, in canonical order) first, expanded card last.
  const ordered = useMemo(
    () => [...BRANCHES.filter(b => b.key !== selected), branchByKey(selected)],
    [selected],
  );

  const onContinue = () => {
    patchDraft({branch: selected});
    navigation.navigate('WhenTable');
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />
      <ReservationHeader title="New Reservation" onBack={navigation.goBack} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}>
        <Text style={styles.label}>Choose your location</Text>
        <View style={styles.stack}>
          {ordered.map(branch => (
            <ClothCard
              key={branch.key}
              branch={branch}
              brandColor={brandColor}
              width={CARD_W}
              expanded={branch.key === selected}
              onPress={() => setSelected(branch.key)}
            />
          ))}
        </View>
      </ScrollView>

      <View style={[styles.footer, {paddingBottom: insets.bottom + 8}]}>
        <View style={styles.ctaWrap}>
          <PrimaryButton
            label={`Continue at ${branchByKey(selected).name}`}
            onPress={onContinue}
            style={styles.cta}
          />
        </View>
        <StepNav current="Place" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: colors.brand.ivory},
  scroll: {paddingHorizontal: 21, paddingTop: 14, paddingBottom: 24},
  label: {
    fontFamily: fontFamily.displayBold,
    fontSize: 18,
    color: colors.brand.navy,
    marginBottom: 14,
  },
  stack: {gap: 0},

  footer: {backgroundColor: colors.brand.ivory, paddingTop: 6},
  ctaWrap: {paddingHorizontal: 30, marginBottom: 4},
  cta: {height: 54},
});
