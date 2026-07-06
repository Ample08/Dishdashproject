import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {colors, fontFamily} from '../../theme';
import type {CateringInquiry} from '../../data/catering';
import {StatusBadge} from './StatusBadge';

/**
 * Inquiry card on My Inquiries (Figma UA5 6522:27438): ref + status badge,
 * event title, date · location meta, and a status footer line — a muted clock
 * for awaiting, a blue envelope for a received response.
 */
export function InquiryCard({inquiry}: {inquiry: CateringInquiry}) {
  const awaiting = inquiry.status === 'awaiting';
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <Text style={styles.ref}>{inquiry.id}</Text>
        <StatusBadge status={inquiry.status} />
      </View>

      <Text style={styles.title}>{inquiry.title}</Text>
      <Text style={styles.meta}>
        {inquiry.dateLabel} · {inquiry.location}
      </Text>

      <View style={styles.noteRow}>
        <Icon
          name={awaiting ? 'time-outline' : 'mail-outline'}
          size={15}
          color={awaiting ? 'rgba(28,35,48,0.55)' : colors.brand.umabdallah}
        />
        <Text style={[styles.note, !awaiting && styles.noteReceived]}>
          {awaiting
            ? "We'll reach out within 24 hours."
            : 'Response received — check your email or WhatsApp.'}
        </Text>
      </View>
    </View>
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
