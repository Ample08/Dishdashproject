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
import { BottomSheet } from '../../components/BottomSheet';
import { AuroraBackground } from '../../components/loyalty/AuroraBackground';
import { CoachMark } from '../../components/loyalty/CoachMark';
import { EarnMarquee } from '../../components/loyalty/EarnMarquee';
import { ExperienceCard } from '../../components/loyalty/ExperienceCard';
import { LoyaltyStatusStrip } from '../../components/loyalty/LoyaltyStatusStrip';
import { ProgressRing } from '../../components/loyalty/ProgressRing';
import { TierPerkPill } from '../../components/loyalty/TierPerkPill';
import { VoucherCard, VoucherRailCard } from '../../components/loyalty/Voucher';
import {
  EXPERIENCES,
  LOYALTY_BOOKINGS,
  REDEEM_STEPS,
  TIERS,
  loyaltyColors,
  type Voucher,
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
  const { points, tier, next, vouchers, coachSeen, dismissCoach } =
    useLoyalty();
  const [stripOpen, setStripOpen] = useState(true);
  const [welcomeVoucher, setWelcomeVoucher] = useState<Voucher | null>(null);

  // Strip only surfaces upcoming bookings (past ones live in My Bookings · Past).
  const upcomingBookings = LOYALTY_BOOKINGS.filter(b => !b.past);

  const subtitle = next
    ? `${(next.min - points).toLocaleString()} pts to ${next.name}`
    : 'Maximum Flavor Unlocked';
  const ringProgress = next ? Math.min(1, points / next.min) : 1;

  const goVoucher = (voucher: Voucher) =>
    voucher.kind === 'celebration'
      ? navigation.navigate('GenerateCelebration')
      : setWelcomeVoucher(voucher);

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
            progress={ringProgress}
            subtitle={subtitle}
          />
        </Pressable>

        <View style={styles.perkWrap}>
          <TierStepper activeKey={tier.key} points={points} />
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
          {vouchers
            .filter(voucher => voucher.status !== 'used')
            .map(voucher => (
              <VoucherRailCard
                key={voucher.id}
                voucher={voucher}
                onPress={() => goVoucher(voucher)}
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
          <Text style={styles.endSub}>Made with ❤️ love by DishDash Group</Text>
        </View>
      </ScrollView>

      {stripOpen && upcomingBookings.length > 0 && (
        <View style={[styles.strip, { bottom: 0 }]}>
          <LoyaltyStatusStrip
            title={upcomingBookings[0].title}
            subtitle={upcomingBookings[0].dateLabel}
            items={upcomingBookings.map(booking => ({
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

      <BottomSheet
        visible={welcomeVoucher !== null}
        onClose={() => setWelcomeVoucher(null)}
        enterDuration={300}
        exitDuration={300}
        sheetStyle={styles.voucherSheet}>
        {welcomeVoucher ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.voucherSheetScroll}>
            <VoucherCard
              voucher={welcomeVoucher}
              initiallyRevealed
              notchColor={loyaltyColors.bgTop}
            />

            <Text style={styles.sheetTitle}>How to Redeem</Text>
            <Text style={styles.sheetSub}>
              Show your code to staff at the restaurant
            </Text>

            <View style={styles.steps}>
              {REDEEM_STEPS.map((s, i) => (
                <View key={i} style={styles.step}>
                  <View style={styles.num}>
                    <Text style={styles.numText}>{i + 1}</Text>
                  </View>
                  <Text style={styles.stepText}>{s}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        ) : null}
      </BottomSheet>
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

function TierStepper({
  activeKey,
  points,
}: {
  activeKey: string;
  points: number;
}) {
  const activeIndex = Math.max(
    0,
    TIERS.findIndex(item => item.key === activeKey),
  );
  const next = TIERS[activeIndex + 1];
  const currentFill = next ? Math.min(1, Math.max(0.08, points / next.min)) : 1;

  return (
    <View style={styles.tierSteps}>
      {TIERS.map((item, index) => (
        <View
          key={item.key}
          style={[
            styles.tierStep,
            { borderColor: item.color },
            index < activeIndex && styles.tierStepActive,
            index < activeIndex && styles.tierStepCompleted,
            index === activeIndex && styles.tierStepCurrent,
          ]}
        >
          {index === activeIndex ? (
            <View
              style={[
                styles.tierStepPartial,
                {
                  backgroundColor: item.color,
                  height: `${currentFill * 100}%`,
                },
              ]}
            />
          ) : null}
          <Text
            style={[
              styles.tierStepText,
              index > activeIndex && styles.tierStepTextFuture,
            ]}>
            {index + 1}
          </Text>
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
    backgroundColor: '#E4B86B',
    borderWidth: 0,
    borderRadius: 0,
    opacity: 1,
    overflow: 'hidden',
  },
  tierStepActive: {
    opacity: 1,
  },
  tierStepCompleted: {
    backgroundColor: '#E4B86B',
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
    zIndex: 2,
  },
  tierStepPartial: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.72,
  },
  tierStepTextFuture: {
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
  voucherSheet: {
    backgroundColor: loyaltyColors.bgTop,
    paddingHorizontal: 24,
    maxHeight: '92%',
  },
  voucherSheetScroll: {
    gap: 16,
    paddingBottom: 10,
  },
  sheetTitle: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 24,
    color: colors.brand.white,
    marginTop: 8,
  },
  sheetSub: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 13,
    color:colors.brand.white,
    marginTop: -8,
  },
  steps: { gap: 16, marginTop: 4 },
  step: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  num: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    backgroundColor: colors.brand.champagne,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 13,
    color: colors.brand.navy,
  },
  stepText: {
    flex: 1,
    fontFamily: fontFamily.bodyRegular,
    fontSize: 14,
    color: colors.brand.white,
  },
});
