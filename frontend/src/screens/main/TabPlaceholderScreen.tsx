import React from 'react';
import {SafeAreaView, StyleSheet, Text, View} from 'react-native';
import type {TabScreenProps} from '../../navigation/types';
import {colors, fontFamily} from '../../theme';

/**
 * Temporary placeholder for the not-yet-built tabs (Orders / Loyalty /
 * Reserve / Profile). Shows the tab name on the cream brand background.
 */
export function TabPlaceholderScreen({
  route,
}: TabScreenProps<'Orders' | 'Loyalty' | 'Reserve' | 'Profile'>) {
  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.center}>
        <Text style={styles.title}>{route.name}</Text>
        <Text style={styles.subtitle}>Coming soon</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: colors.brand.ivory},
  center: {flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6},
  title: {
    fontFamily: fontFamily.displayBold,
    fontSize: 28,
    color: colors.text.primary,
  },
  subtitle: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 14,
    color: colors.text.secondary,
  },
});
