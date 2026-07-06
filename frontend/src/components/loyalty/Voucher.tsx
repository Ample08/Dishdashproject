import React, {useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import type {Voucher} from '../../data/loyalty';
import {colors, fontFamily} from '../../theme';

/** Voucher surface colours by kind. */
function tones(kind: Voucher['kind']) {
  return kind === 'welcome'
    ? {bg: '#a7d293', inset: '#2f5d52'}
    : {bg: '#e9cd86', inset: '#2f5048'};
}

const STATUS_LABEL: Record<Voucher['status'], string> = {
  pending: 'PENDING',
  available: 'AVAILABLE',
  claimed: 'CLAIMED',
  used: 'USED',
};

/* ----------------------------- Rail card (home) ---------------------------- */

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
      <Text style={styles.railAction}>{voucher.action}  →</Text>

      <View style={[styles.notch, {left: -8, backgroundColor: notchColor}]} />
      <View style={[styles.notch, {right: -8, backgroundColor: notchColor}]} />
    </Pressable>
  );
}

/* --------------------------- Full card (reveal) ---------------------------- */

export function VoucherCard({
  voucher,
  notchColor = '#163a40',
  initiallyRevealed = false,
  width,
  onRedeem,
}: {
  voucher: Voucher;
  notchColor?: string;
  initiallyRevealed?: boolean;
  width?: number;
  onRedeem?: () => void;
}) {
  const t = tones(voucher.kind);
  const [revealed, setRevealed] = useState(initiallyRevealed);
  const claimed = voucher.status === 'claimed' || voucher.status === 'used';
  const used = voucher.status === 'used';

  return (
    <View style={[styles.full, {backgroundColor: t.bg}, width ? {width} : null]}>
      {/* Top */}
      <View style={styles.fullTop}>
        <View style={styles.fullLabelRow}>
          <Icon name="ticket-outline" size={16} color={colors.brand.navy} />
          <Text style={styles.fullLabel}>{voucher.label}</Text>
        </View>
        <View style={styles.fullDiscount}>
          <Text style={styles.fullPct}>{voucher.discount}</Text>
          <Text style={styles.fullScope}>OFF · {voucher.scope}</Text>
        </View>
        {claimed && (
          <View style={styles.stamp}>
            <Text style={styles.stampText}>CLAIMED</Text>
          </View>
        )}
      </View>

      {/* Perforation */}
      <View style={styles.perf}>
        <View style={[styles.perfNotch, {left: -10, backgroundColor: notchColor}]} />
        <View style={styles.dashRow}>
          {Array.from({length: 22}).map((_, i) => (
            <View key={i} style={styles.dash} />
          ))}
        </View>
        <View style={[styles.perfNotch, {right: -10, backgroundColor: notchColor}]} />
      </View>

      {/* Bottom — tap to reveal */}
      <Pressable
        style={styles.fullBottom}
        onPress={() => setRevealed(r => !r)}
        accessibilityRole="button"
        accessibilityLabel={revealed ? 'Hide code' : 'Reveal code'}>
        <View style={[styles.codeBox, {backgroundColor: t.inset}]}>
          <Text style={styles.codeLabel}>YOUR CODE</Text>
          <Text style={styles.code}>
            {revealed ? voucher.code : '• • • • • • • •'}
          </Text>
        </View>
        {voucher.guests ? (
          <View style={styles.guests}>
            <Icon name="people-outline" size={13} color={colors.brand.navy} />
            <Text style={styles.guestsText}>{voucher.guests} guests</Text>
          </View>
        ) : null}
        <Text style={styles.toggle}>{revealed ? 'HIDE CODE' : 'TAP TO REVEAL'}</Text>
      </Pressable>

      {onRedeem && !used ? (
        <View style={styles.redeemWrap}>
          <Pressable
            style={styles.redeemBtn}
            onPress={onRedeem}
            accessibilityRole="button"
            accessibilityLabel="Redeem voucher">
            <Icon name="ticket-outline" size={15} color={colors.brand.white} />
            <Text style={styles.redeemBtnText}>Redeem now</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  /* rail */
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
  railAction: {fontFamily: fontFamily.bodyBold, fontSize: 12, color: colors.brand.navy, marginTop: 6},
  notch: {
    position: 'absolute',
    top: 116 / 2 - 8,
    width: 16,
    height: 16,
    borderRadius: 8,
  },

  /* full */
  full: {borderRadius: 20, overflow: 'hidden'},
  fullTop: {paddingHorizontal: 22, paddingTop: 20, paddingBottom: 24, alignItems: 'center'},
  fullLabelRow: {flexDirection: 'row', alignItems: 'center', gap: 6},
  fullLabel: {fontFamily: fontFamily.bodyBold, fontSize: 12, letterSpacing: 1, color: colors.brand.navy},
  fullDiscount: {alignItems: 'center', marginTop: 24},
  fullPct: {fontFamily: fontFamily.displayBold, fontSize: 52, color: colors.brand.navy},
  fullScope: {fontFamily: fontFamily.bodyBold, fontSize: 11, letterSpacing: 1, color: colors.brand.navy, marginTop: 2},
  stamp: {
    position: 'absolute',
    top: 70,
    alignSelf: 'center',
    borderWidth: 2,
    borderColor: '#c0392b',
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 4,
    transform: [{rotate: '-12deg'}],
    opacity: 0.85,
  },
  stampText: {fontFamily: fontFamily.bodyBlack, fontSize: 22, letterSpacing: 2, color: '#c0392b'},

  perf: {height: 20, justifyContent: 'center'},
  perfNotch: {position: 'absolute', top: 0, width: 20, height: 20, borderRadius: 10},
  dashRow: {flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 18},
  dash: {width: 6, height: 1.5, borderRadius: 1, backgroundColor: 'rgba(28,35,48,0.3)'},

  fullBottom: {paddingHorizontal: 22, paddingTop: 8, paddingBottom: 22, alignItems: 'center', gap: 8},
  codeBox: {width: '100%', borderRadius: 12, paddingVertical: 14, alignItems: 'center', gap: 4},
  codeLabel: {fontFamily: fontFamily.bodyBold, fontSize: 10, letterSpacing: 1.2, color: 'rgba(255,255,255,0.7)'},
  code: {fontFamily: fontFamily.bodyBold, fontSize: 20, letterSpacing: 3, color: colors.brand.white},
  guests: {flexDirection: 'row', alignItems: 'center', gap: 5},
  guestsText: {fontFamily: fontFamily.bodyMedium, fontSize: 12, color: colors.brand.navy},
  toggle: {fontFamily: fontFamily.bodyBold, fontSize: 11, letterSpacing: 1, color: 'rgba(28,35,48,0.55)'},
  redeemWrap: {paddingHorizontal: 22, paddingBottom: 20, marginTop: -6},
  redeemBtn: {
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
