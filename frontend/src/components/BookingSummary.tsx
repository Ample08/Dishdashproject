import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {BRANDS, type BrandKey} from '../data/menu';
import {colors, fontFamily} from '../theme';

/** Brand-coloured card header with restaurant + branch and a location pin. */
export function BrandHeader({
  restaurant,
  branchName,
  oneLine,
  radiusTop = 19,
}: {
  restaurant: BrandKey;
  branchName: string;
  oneLine?: boolean;
  radiusTop?: number;
}) {
  const brand = BRANDS[restaurant];
  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor: brand.color,
          borderTopLeftRadius: radiusTop,
          borderTopRightRadius: radiusTop,
        },
      ]}>
      {oneLine ? (
        <Text style={styles.headerOneLine}>
          {brand.name} · {branchName}
        </Text>
      ) : (
        <View style={styles.headerCol}>
          <Text style={styles.brandLabel}>{restaurant.toUpperCase()}</Text>
          <Text style={styles.branchName}>{branchName}</Text>
        </View>
      )}
      <Icon name="location-outline" size={16} color={colors.brand.champagne} />
    </View>
  );
}

/** A labelled detail row. `align="split"` puts the value on the right. */
export function InfoRow({
  icon,
  label,
  value,
  align = 'stack',
  last,
}: {
  icon?: string;
  label: string;
  value: string;
  align?: 'stack' | 'split';
  last?: boolean;
}) {
  if (align === 'split') {
    return (
      <View style={[styles.split, !last && styles.rowBorder]}>
        <Text style={styles.splitLabel}>{label}</Text>
        <Text style={styles.splitValue}>{value}</Text>
      </View>
    );
  }
  return (
    <View style={[styles.stack, !last && styles.rowBorder]}>
      {icon && (
        <Icon name={icon} size={18} color={colors.text.secondary} style={styles.rowIcon} />
      )}
      <View style={styles.stackText}>
        <Text style={styles.stackLabel}>{label}</Text>
        <Text style={styles.stackValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  headerCol: {gap: 1},
  brandLabel: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 10,
    letterSpacing: 0.8,
    color: 'rgba(255,239,203,0.85)',
  },
  branchName: {
    fontFamily: fontFamily.displayBold,
    fontSize: 18,
    color: colors.brand.champagne,
  },
  headerOneLine: {
    fontFamily: fontFamily.displayBold,
    fontSize: 18,
    color: colors.brand.champagne,
  },

  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.brand.navy,
  },
  stack: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  rowIcon: {width: 22, textAlign: 'center'},
  stackText: {flex: 1, gap: 2},
  stackLabel: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 10,
    letterSpacing: 0.6,
    color: colors.text.secondary,
  },
  stackValue: {
    fontFamily: fontFamily.bodySemibold,
    fontSize: 15,
    color: colors.brand.navy,
  },

  split: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  splitLabel: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 11,
    letterSpacing: 0.4,
    color: colors.text.secondary,
  },
  splitValue: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 14,
    color: colors.brand.navy,
  },
});
