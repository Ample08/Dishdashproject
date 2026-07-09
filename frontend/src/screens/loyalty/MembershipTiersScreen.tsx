import React from 'react';
import {ScrollView, StatusBar, StyleSheet, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import {LoyaltyHeader} from '../../components/loyalty/LoyaltyHeader';
import {MEMBERSHIP_TIERS, loyaltyColors} from '../../data/loyalty';
import type {RootStackScreenProps} from '../../navigation/types';
import {colors, fontFamily} from '../../theme';

/**
 * 33 · Membership Tiers (Figma 3514:6) — tier ladder with the current tier
 * highlighted. Copy/values shown verbatim from the design.
 */
export function MembershipTiersScreen({
  navigation,
}: RootStackScreenProps<'MembershipTiers'>) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      {/* <AuroraBackground /> */}
      <LoyaltyHeader title="Membership Tiers" onBack={navigation.goBack} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, {paddingBottom: insets.bottom + 24}]}>
        <Text style={styles.eyebrow}>YOUR TIER</Text>
        <Text style={styles.title}>You're a Feast member</Text>
        <Text style={styles.sub}>250 more pts to unlock Gourmet perks.</Text>

        <View style={styles.cards}>
          {MEMBERSHIP_TIERS.map(t => {
            const current = t.state === 'current';
            const locked = t.state === 'locked';
            return (
              <View
                key={t.name}
                style={[styles.card, current && styles.cardCurrent]}>
                <View style={styles.cardHead}>
                  <View style={styles.nameRow}>
                    <View style={[styles.dot, {backgroundColor: t.dot}]} />
                    <View>
                      <Text style={styles.tierName}>
                        {t.name}
                        {t.state !== 'locked' ? ` · ${t.perk}` : ''}
                      </Text>
                      <Text style={styles.reach}>{t.reach}</Text>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.statusChip,
                      current && styles.chipCurrent,
                      !current && styles.chipWhite,
                    ]}>
                    <Text
                      style={[
                        styles.statusText,
                        current && styles.statusTextCurrent,
                        !current && styles.statusTextOnWhite,
                      ]}>
                      {t.state.toUpperCase()}
                    </Text>
                  </View>
                </View>

                {t.state !== 'unlocked' && (
                  <>
                    <Text style={styles.bigPerk}>{t.perk}</Text>
                    <Text style={styles.perkSub}>{t.perkSub}</Text>
                    {locked && t.more ? (
                      <Text style={styles.more}>{t.more}</Text>
                    ) : null}
                  </>
                )}
              </View>
            );
          })}
        </View>

        <View style={styles.note}>
          <Icon name="alert-circle-outline" size={20} color={'#EBCA90'} style={styles.noteIcon} />
          <View style={styles.noteText}>
            <Text style={styles.noteTitle}>Points reset annually</Text>
            <Text style={styles.noteBody}>
              Your balance resets on your sign-up anniversary. Keep earning to
              maintain your tier.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: loyaltyColors.bgall},
  scroll: {paddingHorizontal: 20, paddingTop: 18},
  eyebrow: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 11,
    letterSpacing: 1.4,
    color: colors.brand.champagne,
  },
  title: {fontFamily: fontFamily.displayBold, fontSize: 26, color: colors.brand.white, marginTop: 6},
  sub: {fontFamily: fontFamily.bodyRegular, fontSize: 13, color: colors.brand.white, marginTop: 4},

  cards: {gap: 14, marginTop: 22},
  card: {
    borderRadius: 18,
    borderWidth: 1.2,
    borderColor: colors.brand.white,   
    padding: 18,
  },
  cardCurrent: {borderColor: '#EBC98F',},
  cardHead: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  nameRow: {flexDirection: 'row', alignItems: 'center', gap: 10},
  dot: {width: 10, height: 10, borderRadius: 5, bottom: 5},
  tierName: {fontFamily: fontFamily.bodyBold, fontSize: 16, color: colors.brand.white},
  reach: {fontFamily: fontFamily.bodyRegular, fontSize: 12, color: colors.brand.white, marginTop: 1},
  statusChip: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  chipCurrent: {backgroundColor: colors.brand.champagne, borderColor: colors.brand.champagne},
  chipLocked: {borderColor: 'rgba(255,255,255,0.25)'},
  chipWhite: {backgroundColor: colors.brand.white, borderColor: colors.brand.white},
  statusText: {fontFamily: fontFamily.bodyBold, fontSize: 9, letterSpacing: 0.5, color: colors.brand.white},
  statusTextCurrent: {color: colors.brand.navy},
  statusTextOnWhite: {color: colors.brand.navy},
  bigPerk: {fontFamily: fontFamily.bodyBold, fontSize: 34, color: colors.brand.white, marginTop: 16},
  perkSub: {fontFamily: fontFamily.bodyRegular, fontSize: 12, color: colors.brand.white, marginTop: 4},
  more: {fontFamily: fontFamily.bodyMedium, fontSize: 12, color: colors.brand.white, marginTop: 12},

  note: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: colors.brand.white,
    borderRadius: 16,
    padding: 14,alignItems: 'center',
    marginTop: 20,
  },
  noteText: {flex: 1},
  noteIcon: {bottom: 10},
  noteTitle: {fontFamily: fontFamily.bodyBold, fontSize: 13, color: colors.brand.navy},
  noteBody: {fontFamily: fontFamily.bodyRegular, fontSize: 12, lineHeight: 17, color: colors.text.onButton, marginTop: 2},
});
