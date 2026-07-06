import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { AuroraBackground } from '../../components/loyalty/AuroraBackground';
import { CoachMark } from '../../components/loyalty/CoachMark';
import { EarnMarquee } from '../../components/loyalty/EarnMarquee';
import { ExperienceCard } from '../../components/loyalty/ExperienceCard';
import { LoyaltyStatusStrip } from '../../components/loyalty/LoyaltyStatusStrip';
import { ProgressRing } from '../../components/loyalty/ProgressRing';
import { TierPerkPill } from '../../components/loyalty/TierPerkPill';
import { VoucherRailCard } from '../../components/loyalty/Voucher';
import {
  EXPERIENCES,
  LOYALTY_BOOKINGS,
  TIERS,
  loyaltyColors,
} from '../../data/loyalty';
import type { TabScreenProps } from '../../navigation/types';
import { useLoyalty } from '../../state/LoyaltyContext';
import { colors, fontFamily } from '../../theme';

/**
 * 29 Loyalty Home - aurora dark surface with tier progress, vouchers,
 * experiences and a floating active-booking strip.
 */
export function LoyaltyHomeScreen({ navigation }: TabScreenProps<'Loyalty'>) {
  const insets = useSafeAreaInsets();
  const { points, tier, next, progress, vouchers, coachSeen, dismissCoach } =
    useLoyalty();
  const [stripOpen, setStripOpen] = useState(true);

  const subtitle = next
    ? `${(next.min - points).toLocaleString()} pts to ${next.name}`
    : 'Maximum Flavor Unlocked';

  const goVoucher = (id: string, kind: string) =>
    kind === 'celebration'
      ? navigation.navigate('GenerateCelebration')
      : navigation.navigate('WelcomeReveal', { voucherId: id });

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <AuroraBackground />

      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Text style={styles.brand}>Loyalty</Text>
        <View style={styles.chips}>
          <HeaderChip
            icon="time-outline"
            label="History"
            onPress={() => navigation.navigate('PointHistory')}
          />
          <HeaderChip
            icon="calendar-outline"
            label="Bookings"
            onPress={() => navigation.navigate('LoyaltyBookings')}
          />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + 180 },
        ]}
      >
        <EarnMarquee />

        <Pressable
          style={styles.ringWrap}
          onPress={() => navigation.navigate('MembershipTiers')}
          accessibilityRole="button"
          accessibilityLabel="View membership tiers"
        >
          <ProgressRing
            points={points}
            tier={tier}
            progress={progress}
            subtitle={subtitle}
          />
        </Pressable>

        <View style={styles.perkWrap}>
          <TierStepper activeKey={tier.key} />
          <TierPerkPill
            label={`${tier.perk ?? '5% OFF'} every dine-in - auto-applied`}
          />
        </View>

        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Your Vouchers</Text>
          <Pressable onPress={() => navigation.navigate('MyVouchers')}>
            <Text style={styles.seeAll}>See All Vouchers</Text>
          </Pressable>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.voucherRail}
        >
          {vouchers.map(voucher => (
            <VoucherRailCard
              key={voucher.id}
              voucher={voucher}
              onPress={() => goVoucher(voucher.id, voucher.kind)}
            />
          ))}
        </ScrollView>

        <View style={[styles.sectionHead, { marginTop: 24 }]}>
          <Text style={styles.sectionTitle}>Experiences</Text>
          <Pressable onPress={() => navigation.navigate('ExperienceHome')}>
            <Text style={styles.seeAll}>See All &gt;</Text>
          </Pressable>
        </View>
        <View style={styles.experiences}>
          {EXPERIENCES.map(experience => (
            <ExperienceCard
              key={experience.id}
              experience={experience}
              onPress={() =>
                navigation.navigate('ExperienceDetail', {
                  experienceId: experience.id,
                })
              }
            />
          ))}
        </View>

        <View style={styles.end}>
          <View style={styles.endRow}>
            <View style={styles.endLine} />
            <Text style={styles.endMark}>flavours</Text>
            <View style={styles.endLine} />
          </View>
          <Text style={styles.endTitle}>You've reached the end</Text>
          <Text style={styles.endSub}>Made with love by DishDash Group</Text>
        </View>
      </ScrollView>

      {stripOpen && (
        <View style={[styles.strip, { bottom: 0 }]}>
          <LoyaltyStatusStrip
            title={LOYALTY_BOOKINGS[0].title}
            subtitle={LOYALTY_BOOKINGS[0].dateLabel}
            items={LOYALTY_BOOKINGS.map(booking => ({
              title: booking.title,
              subtitle: booking.dateLabel,
            }))}
            onView={() => navigation.navigate('LoyaltyBookings')}
            onClose={() => setStripOpen(false)}
          />
        </View>
      )}

      {!coachSeen && (
        <CoachMark
          tierName={tier.name}
          perk={tier.perk ?? '5% OFF'}
          onDismiss={dismissCoach}
        />
      )}
    </View>
  );
}

function HeaderChip({
  icon,
  label,
  onPress,
}: {
  icon: string;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.chip} onPress={onPress} accessibilityRole="button">
      <Icon name={icon} size={12} color={colors.brand.white} />
      <Text style={styles.chipText}>{label}</Text>
    </Pressable>
  );
}

function TierStepper({ activeKey }: { activeKey: string }) {
  const activeIndex = Math.max(
    0,
    TIERS.findIndex(item => item.key === activeKey),
  );

  return (
    <View style={styles.tierSteps}>
      {TIERS.map((item, index) => (
        <View
          key={item.key}
          style={[
            styles.tierStep,
            index <= activeIndex && styles.tierStepActive,
            index === activeIndex && styles.tierStepCurrent,
          ]}
        >
          <Text style={styles.tierStepText}>{index + 1}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: loyaltyColors.bgBottom },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  brand: {
    fontFamily: fontFamily.displayBlack,
    fontSize: 28,
    color: colors.brand.white,
  },
  chips: { flexDirection: 'row', gap: 6 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: loyaltyColors.chipBg,
    borderWidth: 1,
    borderColor: loyaltyColors.chipBorder,
    borderRadius: 999,
    paddingLeft: 10,
    paddingRight: 12,
    paddingVertical: 6,
  },
  chipText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 11,
    color: colors.brand.white,
  },
  scroll: { alignItems: 'center', gap: 8 },
  ringWrap: { marginTop: 4 },
  perkWrap: { marginTop: 22, marginBottom: 8, alignItems: 'center', gap: 10 },
  tierSteps: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  tierStep: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e5b870',
    borderRadius: 1,
    opacity: 0.9,
  },
  tierStepActive: {
    backgroundColor: '#f1c36f',
    opacity: 1,
  },
  tierStepCurrent: {
    shadowColor: '#000000',
    shadowOpacity: 0.22,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  tierStepText: {
    fontFamily: fontFamily.bodyBlack,
    fontSize: 14,
    color: colors.brand.navy,
  },
  sectionHead: {
    width: 358,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 17,
    color: colors.brand.white,
  },
  seeAll: {
    fontFamily: fontFamily.bodySemibold,
    fontSize: 12,
    color: colors.brand.champagne,
  },
  voucherRail: { gap: 12, paddingHorizontal: 16 },
  experiences: { width: 358, gap: 16, marginTop: 16 },
  end: {
    alignItems: 'center',
    gap: 12,
    paddingTop: 32,
    paddingHorizontal: 24,
    width: '100%',
  },
  endRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
  },
  endLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.4)' },
  endMark: {
    fontFamily: fontFamily.displayBoldItalic,
    fontSize: 16,
    color: colors.brand.champagne,
  },
  endTitle: {
    fontFamily: fontFamily.displayBoldItalic,
    fontSize: 22,
    color: colors.brand.white,
  },
  endSub: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 12,
    color: colors.brand.white,
  },
  strip: { position: 'absolute', left: 0, right: 0 },
});
