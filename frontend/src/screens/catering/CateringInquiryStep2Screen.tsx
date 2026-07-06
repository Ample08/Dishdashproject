import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import {TextField} from '../../components/TextField';
import {PhoneField} from '../../components/PhoneField';
import {CateringButton} from '../../components/catering/CateringButton';
import {StepHeader} from '../../components/catering/StepHeader';
import {useCatering} from '../../state/CateringContext';
import type {RootStackScreenProps} from '../../navigation/types';
import {colors, fontFamily} from '../../theme';

/**
 * UA3 · Catering Inquiry — Step 2/2 ("What you'd like included").
 * Location + special requirements, then contact info (name / email / phone).
 * Submitting commits the inquiry and routes to the success screen.
 */
export function CateringInquiryStep2Screen({
  navigation,
}: RootStackScreenProps<'CateringStep2'>) {
  const insets = useSafeAreaInsets();
  const {draft, patchDraft, createInquiry} = useCatering();

  const onSubmit = () => {
    const inquiry = createInquiry();
    navigation.navigate('CateringSuccess', {inquiryId: inquiry.id});
  };

  return (
    <View style={styles.root}>
      <StepHeader step={2} total={2} onBack={() => navigation.goBack()} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scroll}>
          <Text style={styles.kicker}>DETAILS</Text>
          <Text style={styles.heading}>What you'd like included</Text>

          <View style={styles.fields}>
            <TextField
              label="Event Location *"
              value={draft.location}
              onChangeText={v => patchDraft({location: v})}
              placeholder="Location/Venue"
            />

            <View style={styles.areaWrap}>
              <Text style={styles.areaLabel}>Special Requirements</Text>
              <TextInput
                style={styles.textArea}
                value={draft.requirements}
                onChangeText={v => patchDraft({requirements: v})}
                placeholder="Dietary needs, theme, equipment, vibe…"
                placeholderTextColor={colors.text.tertiary}
                multiline
                textAlignVertical="top"
              />
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.contactKicker}>YOUR CONTACT INFO</Text>
          <Text style={styles.contactSub}>
            We'll only use this to reach out about your inquiry.
          </Text>

          <View style={styles.fields}>
            <TextField
              label="Full Name *"
              value={draft.name}
              onChangeText={v => patchDraft({name: v})}
              placeholder="Layla Ahmed"
              autoCapitalize="words"
            />
            <TextField
              label="Email *"
              value={draft.email}
              onChangeText={v => patchDraft({email: v})}
              placeholder="layla.ahmad@gmail.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <View style={styles.phoneWrap}>
              <Text style={styles.areaLabel}>Phone (WhatsApp preferred) *</Text>
              <PhoneField
                value={draft.phone}
                onChangeText={v => patchDraft({phone: v})}
              />
              <View style={styles.whatsappNote}>
                <Icon name="ellipse" size={8} color={colors.status.success} />
                <Text style={styles.whatsappText}>
                  We respond fastest on WhatsApp
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={[styles.ctaBar, {paddingBottom: insets.bottom + 12}]}>
        <CateringButton
          label="Submit Inquiry"
          onPress={onSubmit}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: colors.brand.ivory},
  flex: {flex: 1},
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 24,
  },
  kicker: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 11,
    letterSpacing: 1.32,
    color: colors.brand.umabdallah,
  },
  heading: {
    fontFamily: fontFamily.displayBold,
    fontSize: 26,
    lineHeight: 32,
    color: colors.text.primary,
    marginTop: 4,
  },
  fields: {
    marginTop: 22,
    gap: 18,
  },
  areaWrap: {gap: 6},
  areaLabel: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 13,
    color: colors.text.secondary,
  },
  textArea: {
    minHeight: 88,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border.subtle,
    backgroundColor: colors.brand.white,
    fontFamily: fontFamily.bodyRegular,
    fontSize: 15,
    color: colors.text.primary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.subtle,
    marginTop: 26,
  },
  contactKicker: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 11,
    letterSpacing: 1.32,
    color: colors.brand.umabdallah,
    marginTop: 22,
  },
  contactSub: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 12,
    color: 'rgba(28,35,48,0.55)',
    marginTop: 4,
  },
  phoneWrap: {gap: 8},
  whatsappNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(38,201,76,0.14)',
  },
  whatsappText: {
    fontFamily: fontFamily.bodySemibold,
    fontSize: 11,
    color: 'rgba(28,35,48,0.85)',
  },
  ctaBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: colors.brand.ivory,
    borderTopWidth: 1,
    borderTopColor: 'rgba(28,35,48,0.06)',
  },
});
