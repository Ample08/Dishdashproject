import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {colors, fontFamily} from '../../theme';
import {INQUIRY_STATUS_META, type CateringInquiry} from '../../data/catering';
import {StatusBadge} from './StatusBadge';

/**
 * Inquiry card on My Inquiries (Figma UA5 6522:27438): ref + status badge,
 * event title, date · location meta, and a status-driven footer line. Tapping
 * it opens the inquiry detail.
 */
export function InquiryCard({
  inquiry,
  onPress,
}: {
  inquiry: CateringInquiry;
  onPress?: () => void;
}) {
  const meta = INQUIRY_STATUS_META[inquiry.status] ?? INQUIRY_STATUS_META.awaiting;
  return (
    <Pressable
      style={styles.card}
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}>
      <View style={styles.topRow}>
        <Text style={styles.ref}>{inquiry.id}</Text>
        <StatusBadge status={inquiry.status} />
      </View>

      <Text style={styles.title}>{inquiry.title}</Text>
      <Text style={styles.meta}>
        {inquiry.dateLabel} · {inquiry.location}
      </Text>

      <View style={styles.noteRow}>
        <Icon name={meta.icon} size={15} color={meta.dot} />
        <Text style={styles.note}>{meta.note}</Text>
        {onPress ? (
          <Icon name="chevron-forward" size={16} color={colors.text.tertiary} />
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.brand.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(28,35,48,0.06)',
    padding: 16,
    gap: 10,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ref: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 11,
    letterSpacing: 0.88,
    color: 'rgba(28,35,48,0.55)',
  },
  title: {
    fontFamily: fontFamily.displayBold,
    fontSize: 16,
    color: colors.text.primary,
  },
  meta: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: 13,
    color: 'rgba(28,35,48,0.55)',
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 2,
  },
  note: {
    flex: 1,
    fontFamily: fontFamily.bodyMedium,
    fontSize: 12,
    color: 'rgba(28,35,48,0.6)',
  },
  noteReceived: {
    fontFamily: fontFamily.bodySemibold,
    color: 'rgba(28,35,48,0.9)',
  },
});
