import React from 'react';
import {Pressable, StyleSheet, Text} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {colors, fontFamily} from '../../theme';

/**
 * Selectable event-type card (Figma UA2 6522:27218). White with a champagne
 * hairline by default; pale-blue fill + 2px Um Abdallah-blue border when
 * selected. Blue icon over a bold label.
 */
export function EventTypeCard({
  icon,
  label,
  selected,
  onPress,
}: {
  icon: string;
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{selected}}
      style={({pressed}) => [
        styles.card,
        selected && styles.selected,
        pressed && styles.pressed,
      ]}>
      <Icon name={icon} size={24} color={colors.brand.umabdallah} />
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '31%',
    height: 100,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(235,202,144,0.7)',
    backgroundColor: colors.brand.white,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 8,
  },
  selected: {
    borderWidth: 2,
    borderColor: colors.brand.umabdallah,
    backgroundColor: '#eaeffb',
  },
  pressed: {opacity: 0.85},
  label: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 13,
    color: colors.text.primary,
  },
});
