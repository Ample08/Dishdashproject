import React, { useCallback, useState } from 'react';
import { Pressable, StatusBar, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { PartyPopper } from '../../components/PartyPopper';
import { CateringButton } from '../../components/catering/CateringButton';
import { useCatering } from '../../state/CateringContext';
import type { RootStackScreenProps } from '../../navigation/types';
import { colors, fontFamily } from '../../theme';

/**
 * UA4 · Inquiry Submitted. Confetti burst + a spring-popped check badge,
 * the "Inquiry sent!" headline, the inquiry ref pill, and the two actions.
 * Recreates the Figma "Enter → Settled" entrance animation in Reanimated.
 */
export function CateringSuccessScreen({
  navigation,
  route,
}: RootStackScreenProps<'CateringSuccess'>) {
  const insets = useSafeAreaInsets();
  const { getInquiry } = useCatering();
  const inquiry = getInquiry(route.params.inquiryId);
  const [showPopper, setShowPopper] = useState(true);

  const badge = useSharedValue(0);

  useFocusEffect(
    useCallback(() => {
      badge.value = 0;
      badge.value = withSpring(1, { damping: 9, stiffness: 140, mass: 0.7 });
      setShowPopper(true);

      const timer = setTimeout(() => {
        setShowPopper(false);
      }, 1000);

      return () => clearTimeout(timer);
    }, [badge]),
  );

  const badgeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: badge.value }],
    opacity: badge.value,
  }));

  return (
    <View style={styles.root}>
      <StatusBar
        barStyle="dark-content"
        translucent
        backgroundColor="transparent"
      />
      {showPopper ? <PartyPopper /> : null}

      <View
        style={[
          styles.center,
          { paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}
      >
        <Animated.View style={[styles.badge, badgeStyle]}>
          <FontAwesome6 name="check" size={52} color={colors.brand.white} />
        </Animated.View>

        <View style={styles.stack}>
          <Text style={styles.title}>Inquiry sent!</Text>
          <Text style={styles.subtitle}>
            We'll get back to you within 24 hours via email or WhatsApp.
          </Text>

          <View style={styles.refPill}>
            <Text style={styles.refLabel}>Inquiry Ref</Text>
            <Text style={styles.refValue}>{inquiry?.id ?? '#CRV-1042'}</Text>
          </View>
        </View>
      </View>

      <View style={[styles.actions, { paddingBottom: insets.bottom + 16 }]}>
        <CateringButton
          label="Back to Home"
          onPress={() =>
            navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] })
          }
        />
        <Pressable
          style={styles.ghost}
          onPress={() => navigation.replace('MyCateringInquiries')}
          accessibilityRole="button"
        >
          <Text style={styles.ghostText}>View My Inquiries</Text>
          <Icon
            name="arrow-forward"
            size={16}
            color={colors.brand.umabdallah}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.brand.ivory },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 18,
  },
  badge: {
    width: 116,
    height: 116,
    borderRadius: 58,
    backgroundColor: colors.brand.umabdallah,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(41,89,168,1)',
    shadowOpacity: 0.4,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  stack: { alignItems: 'center', gap: 18 },
  title: {
    fontFamily: fontFamily.displayBold,
    fontSize: 32,
    color: colors.text.primary,
  },
  subtitle: {
    fontFamily: fontFamily.displayItalic,
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 304,
    color: 'rgba(28,35,48,0.65)',
    textAlign: 'center',
  },
  refPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
    paddingHorizontal: 14,
    height: 37,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.brand.umabdallah,
    backgroundColor: colors.brand.white,
  },
  refLabel: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 10,
    letterSpacing: 1.2,
    color: colors.brand.umabdallah,
  },
  refValue: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 13,
    color: colors.text.primary,
  },
  actions: {
    paddingHorizontal: 32,
    gap: 10,
    alignItems: 'center',
  },
  ghost: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
  },
  ghostText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 14,
    color: colors.brand.umabdallah,
  },
});
