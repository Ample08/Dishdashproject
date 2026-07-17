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
import {CateringButton} from '../../components/catering/CateringButton';
import {InquiryCard} from '../../components/catering/InquiryCard';
import {useCatering} from '../../state/CateringContext';
import type {RootStackScreenProps} from '../../navigation/types';
import {colors, fontFamily} from '../../theme';

/**
 * UA5 · My Catering Inquiries. Scrollable list of inquiry cards with a count
 * header, a support prompt, and a "Back to Home" action pinned at the bottom.
 */
export function MyCateringInquiriesScreen({
  navigation,
}: RootStackScreenProps<'MyCateringInquiries'>) {
  const insets = useSafeAreaInsets();
  const {inquiries, loaded, refreshInquiries} = useCatering();

  // Pull the latest inquiries from the backend each time the screen is shown.
  useFocusEffect(
    useCallback(() => {
      refreshInquiries();
    }, [refreshInquiries]),
  );

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      {/* Header */}
      <View style={[styles.header, {paddingTop: insets.top + 6}]}>
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={12}
          style={styles.back}
          accessibilityRole="button"
          accessibilityLabel="Go back">
          <Icon name="arrow-back" size={22} color={colors.brand.navy} />
        </Pressable>
        <Text style={styles.title}>My Inquiries</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}>
        {inquiries.length === 0 ? (
          <View style={styles.empty}>
            <Icon
              name="document-text-outline"
              size={44}
              color={colors.text.tertiary}
            />
            <Text style={styles.emptyTitle}>
              {loaded ? 'No inquiries yet' : 'Loading your inquiries…'}
            </Text>
            {loaded ? (
              <Text style={styles.emptySub}>
                When you submit a catering inquiry, it'll show up here so you can
                track its status.
              </Text>
            ) : null}
          </View>
        ) : (
          <>
            <Text style={styles.count}>
              {inquiries.length} {inquiries.length === 1 ? 'INQUIRY' : 'INQUIRIES'}
            </Text>

            <View style={styles.list}>
              {inquiries.map(inq => (
                <InquiryCard
                  key={inq.id}
                  inquiry={inq}
                  onPress={() =>
                    navigation.navigate('CateringInquiryDetail', {
                      inquiryId: inq.id,
                    })
                  }
                />
              ))}
            </View>

            <View style={styles.supportRow}>
              <Text style={styles.supportText}>Need help with an inquiry?</Text>
              <Pressable accessibilityRole="button" hitSlop={6}>
                <Text style={styles.supportLink}>Contact Support →</Text>
              </Pressable>
            </View>
          </>
        )}
      </ScrollView>

      <View style={[styles.ctaBar, {paddingBottom: insets.bottom + 12}]}>
        <CateringButton
          label="Back to Home"
          onPress={() =>
            navigation.reset({index: 0, routes: [{name: 'MainTabs'}]})
          }
        />
      </View>
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
  title: {
    fontFamily: fontFamily.displayBold,
    fontSize: 22,
    color: colors.brand.navy,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
  },
  count: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 11,
    letterSpacing: 1.32,
    color: colors.brand.umabdallah,
    marginBottom: 14,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 90,
    paddingHorizontal: 24,
    gap: 12,
  },
  emptyTitle: {
    fontFamily: fontFamily.displayBold,
    fontSize: 20,
    color: colors.text.primary,
  },
  emptySub: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  list: {gap: 14},
  supportRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
    marginTop: 22,
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
  ctaBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: colors.brand.ivory,
    borderTopWidth: 1,
    borderTopColor: 'rgba(28,35,48,0.06)',
  },
});
