import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {BRANDS} from '../data/menu';
import type {Booking} from '../data/reservations';
import {colors, fontFamily, radius} from '../theme';

/**
 * BookingCard (Figma 4574:103) — one reservation in the Reserve-tab list.
 * Header tone, status pill and primary action all key off booking.status.
 * Two states are drawn in Figma (red=completed, champagne=awaiting); the
 * confirmed/cancelled tones extend the same system.
 */
type StatusStyle = {
  headerBg: string;
  headerLabel: string;
  headerName: string;
  pillBg: string;
  pillDot: string;
  pillText: string;
  label: string;
  action: string;
};

function statusStyle(b: Booking): StatusStyle {
  const brand = BRANDS[b.restaurant].color;
  switch (b.status) {
    case 'awaiting':
      return {
        headerBg: colors.brand.champagne,
        headerLabel: 'rgba(28,35,48,0.55)',
        headerName: colors.brand.navy,
        pillBg: colors.brand.champagne,
        pillDot: colors.status.error,
        pillText: colors.brand.navy,
        label: 'AWAITING CONFIRMATION',
        action: 'View',
      };
    case 'confirmed':
      return {
        headerBg: brand,
        headerLabel: 'rgba(255,239,203,0.85)',
        headerName: colors.brand.champagne,
        pillBg: colors.brand.pistachio,
        pillDot: colors.brand.navy,
        pillText: colors.brand.navy,
        label: 'CONFIRMED',
        action: 'View',
      };
    case 'cancelled':
      return {
        headerBg: '#e7e3df',
        headerLabel: 'rgba(28,35,48,0.45)',
        headerName: 'rgba(28,35,48,0.55)',
        pillBg: '#ededed',
        pillDot: colors.text.tertiary,
        pillText: colors.text.secondary,
        label: 'CANCELLED',
        action: 'Rebook',
      };
    case 'completed':
    default:
      return {
        headerBg: brand,
        headerLabel: 'rgba(255,239,203,0.85)',
        headerName: colors.brand.champagne,
        pillBg: colors.brand.pistachio,
        pillDot: colors.brand.navy,
        pillText: colors.brand.navy,
        label: 'COMPLETED · RATE YOUR VISIT',
        action: 'Rate',
      };
  }
}

export function BookingCard({
  booking,
  onPress,
}: {
  booking: Booking;
  onPress?: () => void;
}) {
  const s = statusStyle(booking);
  return (
    <Pressable
      style={({pressed}) => [styles.card, pressed && styles.pressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${booking.restaurant} ${booking.branchName} reservation, ${s.label}`}>
      {/* Brand stripe */}
      <View style={[styles.header, {backgroundColor: s.headerBg}]}>
        <View style={styles.headerText}>
          <Text style={[styles.brandLabel, {color: s.headerLabel}]}>
            {booking.restaurant.toUpperCase()}
          </Text>
          <Text style={[styles.branchName, {color: s.headerName}]}>
            {booking.branchName}
          </Text>
        </View>
        <Icon name="location-outline" size={16} color={s.headerName} />
      </View>

      {/* Status pill */}
      <View style={styles.statusRow}>
        <View style={[styles.statusPill, {backgroundColor: s.pillBg}]}>
          <View style={[styles.dot, {backgroundColor: s.pillDot}]} />
          <Text style={[styles.statusText, {color: s.pillText}]}>{s.label}</Text>
        </View>
      </View>

      {/* Date · Time · Guests */}
      <View style={styles.body}>
        <View style={styles.metaRow}>
          <Meta label="DATE" value={booking.dateLabel} />
          <View style={styles.divider} />
          <Meta label="TIME" value={booking.timeLabel} />
          <View style={styles.divider} />
          <Meta label="GUESTS" value={String(booking.guests)} />
        </View>

        <View style={styles.footer}>
          <View style={styles.idCol}>
            <Text style={styles.idLabel}>BOOKING ID</Text>
            <Text style={styles.idValue}>#{booking.id}</Text>
          </View>
          <View style={styles.actionPill}>
            <Text style={styles.actionText}>{s.action}</Text>
            <Icon name="chevron-forward" size={12} color={colors.brand.navy} />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

function Meta({label, value}: {label: string; value: string}) {
  return (
    <View style={styles.metaCol}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
  );
}

const HAIRLINE = 'rgba(28,35,48,0.14)';

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.brand.white,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: 'rgba(28,36,48,1)',
    shadowOpacity: 0.1,
    shadowRadius: 24,
    shadowOffset: {width: 0, height: 10},
    elevation: 4,
  },
  pressed: {opacity: 0.95},

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  headerText: {flex: 1, gap: 1},
  brandLabel: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 10,
    letterSpacing: 0.8,
  },
  branchName: {
    fontFamily: fontFamily.displayBold,
    fontSize: 16,
  },

  statusRow: {paddingHorizontal: 18, paddingTop: 12},
  statusPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingLeft: 8,
    paddingRight: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  dot: {width: 6, height: 6, borderRadius: 3},
  statusText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 9,
    letterSpacing: 0.54,
  },

  body: {paddingHorizontal: 18, paddingTop: 14, paddingBottom: 16, gap: 14},
  metaRow: {flexDirection: 'row', alignItems: 'center', gap: 16},
  metaCol: {gap: 2},
  metaLabel: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 10,
    letterSpacing: 0.6,
    color: colors.brand.navy,
  },
  metaValue: {
    fontFamily: fontFamily.displayBold,
    fontSize: 18,
    color: colors.brand.navy,
  },
  divider: {width: 1, height: 32, backgroundColor: HAIRLINE},

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: HAIRLINE,
  },
  idCol: {flex: 1, gap: 1},
  idLabel: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 9,
    letterSpacing: 0.54,
    color: colors.brand.navy,
  },
  idValue: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 12,
    color: colors.brand.navy,
  },
  actionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.brand.pistachio,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  actionText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 11,
    color: colors.brand.navy,
  },
});
