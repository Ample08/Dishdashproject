import React from 'react';
import {ScrollView, StatusBar, StyleSheet, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {AuroraBackground} from '../../components/loyalty/AuroraBackground';
import {ExperienceCard} from '../../components/loyalty/ExperienceCard';
import {LoyaltyHeader} from '../../components/loyalty/LoyaltyHeader';
import {EXPERIENCES, loyaltyColors} from '../../data/loyalty';
import type {RootStackScreenProps} from '../../navigation/types';
import {fontFamily} from '../../theme';

/** 34 · Experience Home (Figma 3528:6) — the full experiences catalogue. */
export function ExperienceHomeScreen({
  navigation,
}: RootStackScreenProps<'ExperienceHome'>) {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <AuroraBackground />
      <LoyaltyHeader title="Experiences" onBack={navigation.goBack} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, {paddingBottom: insets.bottom + 24}]}>
        <Text style={styles.lead}>Redeem points for unforgettable tables.</Text>
        {EXPERIENCES.map(e => (
          <ExperienceCard
            key={e.id}
            experience={e}
            onPress={() =>
              navigation.navigate('ExperienceDetail', {experienceId: e.id})
            }
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: loyaltyColors.bgBottom},
  scroll: {paddingHorizontal: 20, paddingTop: 18, gap: 16},
  lead: {fontFamily: fontFamily.bodyRegular, fontSize: 13, color: 'rgba(255,255,255,0.7)'},
});
