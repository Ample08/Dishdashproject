import React from 'react';
import {StyleSheet, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {colors} from '../theme';

/**
 * Coin — the gold star token used across rewards surfaces (home HeroRewardsCard,
 * brand-page earn chip). Gold disc with a navy star; scales via `size`.
 */
export function Coin({size = 24}: {size?: number}) {
  return (
    <View style={[styles.coin, {width: size, height: size, borderRadius: size / 2}]}>
      <Icon name="star" size={size * 0.5} color={colors.brand.navy} />
    </View>
  );
}

const styles = StyleSheet.create({
  coin: {
    backgroundColor: '#f0b429',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
