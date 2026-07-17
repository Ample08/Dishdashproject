import React, {useState} from 'react';
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
  const {draft, patchDraft, createInquiry, resetDraft} = useCatering();
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    location?: string;
    name?: string;
    email?: string;
    phone?: string;
    requirements?: string;
  }>({});

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const MIN_MSG = 50;
  const MAX_MSG = 1000;

  const clearErr = (k: keyof typeof errors) => {
    if (errors[k]) setErrors(e => ({...e, [k]: undefined}));
  };

  // Catering contact validation (SRS · 8.1).
  const onSubmit = async () => {
    if (submitting) {
      return;
    }
    const req = draft.requirements.trim();
    const next: typeof errors = {};
    if (!draft.location.trim()) {
      next.location = 'Event location is required.';
    }
    if (draft.name.trim().length < 2) {
      next.name = 'Enter your full name (at least 2 characters).';
    }
    if (!draft.email.trim()) {
      next.email = 'Email is required.';
    } else if (!EMAIL_RE.test(draft.email.trim())) {
      next.email = 'Enter a valid email address.';
    }
    if (!draft.phone.trim()) {
      next.phone = 'Phone is required.';
    }
    if (req.length < MIN_MSG) {
      next.requirements = `Add at least ${MIN_MSG} characters (${req.length}/${MIN_MSG}).`;
    } else if (req.length > MAX_MSG) {
      next.requirements = `Keep it under ${MAX_MSG} characters.`;
    }
    setErrors(next);
    if (Object.keys(next).length > 0) {
      return;
    }
    setSubmitting(true);
    try {
      const inquiry = await createInquiry();
      resetDraft();
      // Replace the form stack so back from Success goes to the inquiries list
      // (and then Home), never back into the half-filled form.
      navigation.reset({
        index: 2,
        routes: [
          {name: 'MainTabs'},
          {name: 'MyCateringInquiries'},
          {name: 'CateringSuccess', params: {inquiryId: inquiry.id}},
        ],
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.root}>
      <StepHeader step={2} total={2} onBack={() => navigation.goBack()} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          contentContainerStyle={styles.scroll}>
          <Text style={styles.kicker}>DETAILS</Text>
          <Text style={styles.heading}>What you'd like included</Text>

          <View style={styles.fields}>
            <TextField
              label="Event Location *"
              value={draft.location}
              onChangeText={v => {
                patchDraft({location: v});
                clearErr('location');
              }}
              placeholder="Location/Venue"
              error={errors.location}
            />

            <View style={styles.areaWrap}>
              <View style={styles.areaLabelRow}>
                <Text style={styles.areaLabel}>Special Requirements *</Text>
                <Text style={styles.counter}>
                  {draft.requirements.trim().length}/{MAX_MSG}
                </Text>
              </View>
              <TextInput
                style={[styles.textArea, !!errors.requirements && styles.textAreaError]}
                value={draft.requirements}
                onChangeText={v => {
                  patchDraft({requirements: v});
                  clearErr('requirements');
                }}
                placeholder="Tell us about your event — dietary needs, theme, menu, equipment, vibe… (min 50 characters)"
                placeholderTextColor={colors.text.tertiary}
                multiline
                textAlignVertical="top"
                maxLength={MAX_MSG}
              />
              {errors.requirements ? (
                <Text style={styles.fieldError}>{errors.requirements}</Text>
              ) : null}
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
              onChangeText={v => {
                patchDraft({name: v});
                clearErr('name');
              }}
              placeholder="Layla Ahmed"
              autoCapitalize="words"
              error={errors.name}
            />
            <TextField
              label="Email *"
              value={draft.email}
              onChangeText={v => {
                patchDraft({email: v});
                clearErr('email');
              }}
              placeholder="layla.ahmad@gmail.com"
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
            />

            <View style={styles.phoneWrap}>
              <Text style={styles.areaLabel}>Phone (WhatsApp preferred) *</Text>
              <PhoneField
                value={draft.phone}
                onChangeText={v => {
                  patchDraft({phone: v});
                  clearErr('phone');
                }}
                error={errors.phone}
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

        <View style={[styles.ctaBar, {paddingBottom: insets.bottom + 12}]}>
          <CateringButton
            label="Submit Inquiry"
            onPress={onSubmit}
            loading={submitting}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: colors.brand.ivory},
  flex: {flex: 1},
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 40,
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
  areaLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  areaLabel: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 13,
    color: colors.text.secondary,
  },
  counter: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 11,
    color: colors.text.tertiary,
  },
  fieldError: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 11,
    color: colors.status.error,
  },
  textAreaError: {
    borderColor: colors.status.error,
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
