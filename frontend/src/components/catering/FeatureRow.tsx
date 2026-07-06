import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {colors, fontFamily} from '../../theme';

/**
 * Feature row on the Catering Home landing (UA1): a 32px Um Abdallah-blue icon
 * + bold title over a muted subtitle. (Figma "Feature · …" 6522:27124.)
 */
export function FeatureRow({
  icon,
  title,
  sub,
}: {
  icon: string;
  title: string;
  sub: string;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.iconWrap}>
        <Icon name={icon} size={24} color={colors.brand.umabdallah} />
      </View>
      <View style={styles.text}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.sub}>{sub}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 8,
  },
  iconWrap: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {flex: 1, gap: 6},
  title: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 14,
    color: colors.text.primary,
  },
  sub: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 12,
    color: 'rgba(28,35,48,0.55)',
  },
});
