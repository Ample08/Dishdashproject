import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {colors, fontFamily} from '../theme';

/** "or" rule divider (Figma 697:24). */
export function OrDivider({label = 'or'}: {label?: string}) {
  return (
    <View style={styles.row}>
      <View style={styles.line} />
      <Text style={styles.label}>{label}</Text>
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 6,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border.subtle,
  },
  label: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 13,
    color: colors.text.tertiary,
  },
});
