import React from 'react';
import {StyleSheet, View} from 'react-native';
import {colors} from '../theme';
import {Mascot} from './Mascot';

/**
 * Pistachio brand badge with the mascot centered (Figma 697:7).
 * 120px circle, soft drop shadow.
 */
export function MascotPanel() {
  return (
    <View style={styles.panel}>
      <Mascot width={66.512} color={colors.brand.navy} />
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.brand.pistachio,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: {width: 0, height: 6},
    elevation: 3,
  },
});
