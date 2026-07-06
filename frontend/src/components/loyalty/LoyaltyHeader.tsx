import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import {colors, fontFamily} from '../../theme';

/** Transparent dark-theme app bar for loyalty sub-screens (over the aurora). */
export function LoyaltyHeader({
  title,
  onBack,
  caps,
}: {
  title: string;
  onBack: () => void;
  caps?: boolean;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{paddingTop: insets.top}}>
      <View style={styles.bar}>
        <Pressable
          style={styles.back}
          onPress={onBack}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Go back">
          <Icon name="chevron-back" size={24} color={colors.brand.white} />
        </Pressable>
        <Text style={[styles.title, caps && styles.caps]}>{title}</Text>
      </View>
      <View style={styles.divider} />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {height: 56, alignItems: 'center', justifyContent: 'center'},
  back: {position: 'absolute', left: 16, height: 56, justifyContent: 'center'},
  title: {fontFamily: fontFamily.bodyBold, fontSize: 16, color: colors.brand.white},
  caps: {letterSpacing: 1.5},
  divider: {height: 1, backgroundColor: 'rgba(255,255,255,0.1)'},
});
