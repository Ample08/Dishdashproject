import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import {ProgressBar} from '../ProgressBar';
import {colors, fontFamily} from '../../theme';

/**
 * Header for the catering inquiry steps (UA2 / UA3): back chevron + "Get a
 * Quote" title, a "STEP n/total" marker, and the thin progress bar underneath.
 */
export function StepHeader({
  step,
  total,
  onBack,
}: {
  step: number;
  total: number;
  onBack: () => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.root, {paddingTop: insets.top + 6}]}>
      <View style={styles.bar}>
        <Pressable
          onPress={onBack}
          hitSlop={12}
          style={styles.back}
          accessibilityRole="button"
          accessibilityLabel="Go back">
          <Icon name="arrow-back" size={22} color={colors.brand.navy} />
        </Pressable>
        <Text style={styles.title}>Get a Quote</Text>
        <Text style={styles.step}>
          STEP {step}/{total}
        </Text>
      </View>
      <ProgressBar
        progress={step / total}
        color={colors.brand.umabdallah}
        trackColor="rgba(28,35,48,0.06)"
        style={styles.progress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.brand.ivory,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    paddingHorizontal: 20,
    gap: 14,
  },
  back: {justifyContent: 'center'},
  title: {
    flex: 1,
    fontFamily: fontFamily.displayBold,
    fontSize: 18,
    color: colors.brand.navy,
  },
  step: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 11,
    letterSpacing: 1.1,
    color: colors.brand.umabdallah,
  },
  progress: {
    marginTop: 4,
  },
});
