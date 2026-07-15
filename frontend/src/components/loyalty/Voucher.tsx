import React, {useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import Animated, {FadeIn, FadeOut} from 'react-native-reanimated';
import Svg, {Defs, LinearGradient, Rect, Stop} from 'react-native-svg';
import Icon from 'react-native-vector-icons/Ionicons';
import type {Voucher} from '../../data/loyalty';
import {colors, fontFamily} from '../../theme';

function tones(kind: Voucher['kind']) {
  return kind === 'welcome'
    ? {bg: '#a7d293', inset: '#2f5d52', gradient: false}
    : {bg: '#e9cd86', inset: '#1B4A55', gradient: true};
}

const STATUS_LABEL: Record<Voucher['status'], string> = {
  pending: 'PENDING',
  available: 'AVAILABLE',
  claimed: 'CLAIMED',
  used: 'USED',
};

const CARD_H = 344;
const CARD_REVEALED_H = 390;

export function VoucherRailCard({
  voucher,
  width = 169,
  notchColor = '#0d2226',
  onPress,
}: {
  voucher: Voucher;
  width?: number;
  notchColor?: string;
  onPress?: () => void;
}) {
  const t = tones(voucher.kind);
  return (
    <Pressable
      style={[styles.rail, {width, backgroundColor: t.bg}]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${voucher.title} voucher`}>
      <View style={styles.railHead}>
        <Text style={styles.railTitle}>{voucher.title}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{STATUS_LABEL[voucher.status]}</Text>
        </View>
      </View>
      <View style={styles.railDiscount}>
        <Text style={styles.railPct}>{voucher.discount}</Text>
        <Text style={styles.railOff}>OFF</Text>
      </View>
      <Text style={styles.railSub}>{voucher.sub}</Text>
      <View style={styles.railActionRow}>
        <Text style={styles.railAction}>{voucher.action}</Text>
        <Icon
          name="arrow-forward"
          size={12}
          color={colors.brand.navy}
          style={styles.railArrow}
        />
      </View>

      <View style={[styles.notch, styles.notchLeft, {backgroundColor: notchColor}]} />
      <View style={[styles.notch, styles.notchRight, {backgroundColor: notchColor}]} />
    </Pressable>
  );
}

export function VoucherCard({
  voucher,
  notchColor = '#163a40',
  initiallyRevealed = false,
  hideClaimStamp = false,
  allowClaimedToggle = false,
  width,
  onRedeem,
}: {
  voucher: Voucher;
  notchColor?: string;
  initiallyRevealed?: boolean;
  hideClaimStamp?: boolean;
  allowClaimedToggle?: boolean;
  width?: number;
  onRedeem?: () => void;
}) {
  const t = tones(voucher.kind);
  const claimed = voucher.status === 'claimed' || voucher.status === 'used';
  const used = voucher.status === 'used';
  const locked = claimed && !allowClaimedToggle;
  const [revealed, setRevealed] = useState(initiallyRevealed || claimed);
  const showCode = revealed || locked;

  return (
    <View style={[styles.wrap, width ? {width} : null, used && styles.dimmed]}>
      <View style={[styles.card, {height: showCode ? CARD_REVEALED_H : CARD_H}]}>
        <View style={[styles.face, {backgroundColor: t.bg}]}>
          {t.gradient ? <VoucherGradient /> : null}
          <View style={[styles.fullTop, showCode && styles.revealedTop]}>
            <View style={styles.fullLabelRow}>
              <Icon name="ticket-outline" size={16} color={colors.brand.navy} />
              <Text style={styles.fullLabel}>{voucher.label}</Text>
            </View>
            <View style={styles.fullDiscount}>
              <Text style={styles.fullPct}>{voucher.discount}</Text>
              <Text style={styles.fullScope}>OFF · {voucher.scope}</Text>
            </View>
          </View>

          {claimed && !hideClaimStamp ? (
            <View style={[styles.stamp, used && styles.usedStamp]} pointerEvents="none">
              <Text style={styles.stampText}>CLAIMED</Text>
            </View>
          ) : null}

          <View style={styles.perf}>
            <View
              style={[
                styles.perfNotch,
                styles.perfNotchLeft,
                {backgroundColor: notchColor},
              ]}
            />
            <View style={styles.dashRow}>
              {Array.from({length: 22}).map((_, i) => (
                <View key={i} style={styles.dash} />
              ))}
            </View>
            <View
              style={[
                styles.perfNotch,
                styles.perfNotchRight,
                {backgroundColor: notchColor},
              ]}
            />
          </View>

          {showCode ? (
            <Animated.View
              key="code"
              entering={FadeIn.duration(400)}
              exiting={FadeOut.duration(250)}
              style={styles.revealedBottom}>
              <Pressable
                disabled={locked}
                onPress={() => setRevealed(false)}
                accessibilityRole="button"
                accessibilityLabel="Hide code"
                style={styles.codePress}>
                <View style={[styles.codeChip, {backgroundColor: t.inset}]}>
                  <Text style={styles.codeLabel}>YOUR CODE</Text>
                  <Text style={styles.code}>{voucher.code}</Text>
                </View>
                {voucher.guests ? (
                  <View style={styles.guests}>
                    <Icon name="people-outline" size={12} color={colors.brand.navy} />
                    <Text style={styles.guestsText}>{voucher.guests} guests</Text>
                  </View>
                ) : null}
                <Text style={styles.hideCode}>HIDE CODE</Text>
              </Pressable>
            </Animated.View>
          ) : (
            <Pressable
              style={styles.faceBottom}
              onPress={() => setRevealed(true)}
              accessibilityRole="button"
              accessibilityLabel="Reveal code">
              <View style={[styles.revealPill, {backgroundColor: t.inset}]}>
                <Text style={styles.revealPillText}>TAP TO REVEAL</Text>
              </View>
              <Text style={styles.noExpiry}>NO EXPIRY</Text>
            </Pressable>
          )}
        </View>
      </View>

      {onRedeem && !used ? (
        <Pressable
          style={styles.redeemBtn}
          onPress={onRedeem}
          accessibilityRole="button"
          accessibilityLabel="Redeem voucher">
          <Icon name="ticket-outline" size={15} color={colors.brand.white} />
          <Text style={styles.redeemBtnText}>Redeem now</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function VoucherGradient() {
  return (
    <View style={styles.gradientFill} pointerEvents="none">
      <Svg width="100%" height="100%" preserveAspectRatio="none">
        <Defs>
          <LinearGradient id="voucherChampagne" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#F7DBA6" />
            <Stop offset="0.5" stopColor="#EBCA90" />
            <Stop offset="1" stopColor="#D1A86B" />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#voucherChampagne)" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  rail: {
    height: 116,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    overflow: 'hidden',
  },
  railHead: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  railTitle: {fontFamily: fontFamily.bodySemibold, fontSize: 11, color: colors.brand.navy},
  badge: {backgroundColor: colors.brand.white, borderRadius: 999, paddingHorizontal: 5, paddingVertical: 2},
  badgeText: {fontFamily: fontFamily.bodyBlack, fontSize: 7, letterSpacing: 0.7, color: colors.brand.navy},
  railDiscount: {flexDirection: 'row', alignItems: 'flex-end', gap: 4, marginTop: 2},
  railPct: {fontFamily: fontFamily.bodyBlack, fontSize: 26, letterSpacing: -0.5, color: colors.brand.navy},
  railOff: {fontFamily: fontFamily.bodyBlack, fontSize: 12, color: colors.brand.navy, marginBottom: 4},
  railSub: {fontFamily: fontFamily.bodyRegular, fontSize: 10, color: colors.brand.navy, marginTop: 6},
  railActionRow: {flexDirection: 'row', alignItems: 'center', marginTop: 6},
  railAction: {fontFamily: fontFamily.bodyBold, fontSize: 12, color: colors.brand.navy},
  railArrow: {marginLeft: 4},
  notch: {
    position: 'absolute',
    top: 116 / 2 - 8,
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  notchLeft: {left: -8},
  notchRight: {right: -8},

  wrap: {},
  dimmed: {opacity: 0.55},
  card: {position: 'relative', width: '100%'},
  face: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  gradientFill: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  fullTop: {
    height: 200,
    paddingHorizontal: 22,
    paddingTop: 26,
    alignItems: 'center',
  },
  revealedTop: {
    height: 200,
  },
  fullLabelRow: {flexDirection: 'row', alignItems: 'center', gap: 6},
  fullLabel: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 12,
    letterSpacing: 1.6,
    color: colors.brand.navy,
  },
  fullDiscount: {alignItems: 'center', marginTop: 62},
  fullPct: {fontFamily: fontFamily.displayBold, fontSize: 56, lineHeight: 60, color: colors.brand.navy},
  fullScope: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 10,
    letterSpacing: 1,
    color: colors.brand.navy,
   
  },
  perf: {
    width: '100%',
    height: 20,
    justifyContent: 'center',
  },
  perfNotch: {
    position: 'absolute',
    top: -1,
    width: 22,
    height: 22,
    borderRadius: 11,
    zIndex: 2,
  },
  perfNotchLeft: {left: -11},
  perfNotchRight: {right: -11},
  dashRow: {flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 18},
  dash: {width: 6, height: 1.5, borderRadius: 1, backgroundColor: 'rgba(28,35,48,0.3)'},
  faceBottom: {flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 22},
  revealPill: {
    paddingHorizontal: 22,
    paddingVertical: 13,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  revealPillText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 13,
    letterSpacing: 2.4,
    color: colors.brand.ivory,
  },
  noExpiry: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 10,
    letterSpacing: 2,
    color: 'rgba(28,35,48,0.55)',
  },
  revealedBottom: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 15,
    paddingHorizontal: 18,
  },
  codePress: {
    width: '100%',
    alignItems: 'center',
  },
  codeChip: {
    width: '100%',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    gap: 7,
  },
  codeLabel: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 10,
    letterSpacing: 1.2,
    color: 'rgba(255,255,255,0.7)',
  },
  code: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 18,
    letterSpacing: 4,
    color: colors.brand.white,
  },
  guests: {flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 10},
  guestsText: {fontFamily: fontFamily.bodyMedium, fontSize: 12, color: colors.brand.navy},
  hideCode: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 10,
    letterSpacing: 2,
    color: 'rgba(28,35,48,0.72)',
    marginTop: 16,
  },
  stamp: {
    position: 'absolute',
    top: 139,
    alignSelf: 'center',
    borderWidth: 2,
    borderColor: '#c0392b',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
    transform: [{rotate: '-12deg'}],
    opacity: 0.9,
    zIndex: 5,
  },
  usedStamp: {top: 139},
  stampText: {fontFamily: fontFamily.bodyBlack, fontSize: 22, letterSpacing: 2, color: '#c0392b'},
  redeemBtn: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 46,
    borderRadius: 999,
    backgroundColor: colors.brand.navy,
  },
  redeemBtnText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 14,
    color: colors.brand.white,
  },
});
