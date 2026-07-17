import React, {useCallback} from 'react';
import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import {StatusBadge} from '../../components/catering/StatusBadge';
import {INQUIRY_STATUS_META} from '../../data/catering';
import type {RootStackScreenProps} from '../../navigation/types';
import {useCatering} from '../../state/CateringContext';
import {colors, fontFamily} from '../../theme';

/**
 * Catering inquiry detail — full record for one inquiry, pulled fresh from the
 * backend (GET /catering/inquiries/{ref}) with its live workflow status.
 */
export function CateringInquiryDetailScreen({
  navigation,
  route,
}: RootStackScreenProps<'CateringInquiryDetail'>) {
  const insets = useSafeAreaInsets();
  const {getInquiry, inquiries, refreshInquiry} = useCatering();
  const id = route.params.inquiryId;
  const inquiry = getInquiry(id) ?? inquiries.find(i => i.id === id);

  // Pull the authoritative record (and latest status) when opened.
  useFocusEffect(
    useCallback(() => {
      refreshInquiry(id);
    }, [id, refreshInquiry]),
  );

  const meta = inquiry
    ? INQUIRY_STATUS_META[inquiry.status] ?? INQUIRY_STATUS_META.awaiting
    : null;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      <View style={[styles.header, {paddingTop: insets.top + 6}]}>
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={12}
          style={styles.back}
          accessibilityRole="button"
          accessibilityLabel="Go back">
          <Icon name="arrow-back" size={22} color={colors.brand.navy} />
        </Pressable>
        <Text style={styles.headerTitle}>Inquiry Details</Text>
      </View>

      {!inquiry || !meta ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>This inquiry could not be found.</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scroll, {paddingBottom: insets.bottom + 28}]}>
          <View style={styles.topRow}>
            <Text style={styles.ref}>{inquiry.id}</Text>
            <StatusBadge status={inquiry.status} />
          </View>

          <Text style={styles.title}>{inquiry.title}</Text>

          {/* Status note banner */}
          <View style={[styles.statusNote, {backgroundColor: meta.tint}]}>
            <Icon name={meta.icon} size={18} color={meta.dot} />
            <Text style={styles.statusNoteText}>{meta.note}</Text>
          </View>

          {/* Event details */}
          <Text style={styles.section}>EVENT DETAILS</Text>
          <View style={styles.card}>
            <Row icon="pricetag-outline" label="Event type" value={inquiry.eventType} />
            <Row icon="people-outline" label="Guests" value={`${inquiry.guests}`} />
            <Row icon="calendar-outline" label="Date" value={inquiry.dateLabel} />
            <Row icon="location-outline" label="Location" value={inquiry.location} />
            {inquiry.budget ? (
              <Row icon="cash-outline" label="Budget" value={inquiry.budget} />
            ) : null}
            <Row
              icon="document-text-outline"
              label="Requirements"
              value={inquiry.requirements || '—'}
              last
            />
          </View>

          {/* Contact */}
          <Text style={styles.section}>YOUR CONTACT</Text>
          <View style={styles.card}>
            <Row icon="person-outline" label="Name" value={inquiry.name} />
            <Row icon="mail-outline" label="Email" value={inquiry.email} />
            <Row icon="call-outline" label="Phone" value={inquiry.phone} last />
          </View>

          <View style={styles.supportRow}>
            <Text style={styles.supportText}>Need to change something?</Text>
            <Pressable accessibilityRole="button" hitSlop={6}>
              <Text style={styles.supportLink}>Contact Support →</Text>
            </Pressable>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

function Row({
  icon,
  label,
  value,
  last,
}: {
  icon: string;
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View style={[styles.row, last && styles.rowLast]}>
      <Icon name={icon} size={18} color={colors.text.secondary} style={styles.rowIcon} />
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: colors.brand.ivory},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  back: {justifyContent: 'center'},
  headerTitle: {
    fontFamily: fontFamily.displayBold,
    fontSize: 22,
    color: colors.brand.navy,
  },
  empty: {flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24},
  emptyText: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 14,
    color: colors.text.secondary,
  },
  scroll: {paddingHorizontal: 20, paddingTop: 12},
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ref: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 12,
    letterSpacing: 0.88,
    color: 'rgba(28,35,48,0.55)',
  },
  title: {
    fontFamily: fontFamily.displayBold,
    fontSize: 24,
    color: colors.text.primary,
    marginTop: 10,
  },
  statusNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 12,
    marginTop: 16,
  },
  statusNoteText: {
    flex: 1,
    fontFamily: fontFamily.bodySemibold,
    fontSize: 13,
    color: colors.text.primary,
  },
  section: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 11,
    letterSpacing: 1.32,
    color: colors.brand.umabdallah,
    marginTop: 24,
    marginBottom: 10,
  },
  card: {
    backgroundColor: colors.brand.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(28,35,48,0.06)',
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  rowLast: {borderBottomWidth: 0},
  rowIcon: {marginRight: 12},
  rowLabel: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 14,
    color: colors.text.secondary,
    flex: 1,
  },
  rowValue: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 14,
    color: colors.text.primary,
    maxWidth: '58%',
    textAlign: 'right',
  },
  supportRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
    marginTop: 24,
  },
  supportText: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 13,
    color: colors.text.secondary,
  },
  supportLink: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 13,
    color: colors.brand.umabdallah,
  },
});
