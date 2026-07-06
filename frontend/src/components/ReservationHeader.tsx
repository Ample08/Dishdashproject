import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import {colors, fontFamily} from '../theme';

/**
 * Shared app bar for the reservation flow (Figma Header 4494:x):
 * back chevron + centered title over a hairline divider.
 */
export function ReservationHeader({
  title,
  onBack,
}: {
  title: string;
  onBack: () => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.root, {paddingTop: insets.top}]}>
      <View style={styles.bar}>
        <Pressable
          style={styles.back}
          onPress={onBack}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Go back">
          <Icon name="chevron-back" size={24} color={colors.brand.navy} />
        </Pressable>
        <Text style={styles.title}>{title}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.brand.ivory,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(28,35,48,0.08)',
  },
  bar: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  back: {
    position: 'absolute',
    left: 16,
    height: 56,
    justifyContent: 'center',
  },
  title: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 16,
    color: colors.brand.navy,
  },
});
