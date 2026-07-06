import React from 'react';
import {Pressable, StyleSheet, Text} from 'react-native';
import {colors} from '../theme';

/**
 * Checkbox (Figma 473:23). 20×20 visible, navy fill + white tick when checked.
 * Wrapped in a 24pt target with hitSlop for accessibility.
 */
type Props = {
  checked: boolean;
  onChange: (next: boolean) => void;
};

export function Checkbox({checked, onChange}: Props) {
  return (
    <Pressable
      onPress={() => onChange(!checked)}
      accessibilityRole="checkbox"
      accessibilityState={{checked}}
      hitSlop={12}
      style={styles.target}>
      <Pressable
        pointerEvents="none"
        style={[styles.box, checked && styles.boxChecked]}>
        {checked ? <Text style={styles.tick}>✓</Text> : null}
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  target: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.border.strong,
    backgroundColor: colors.surface.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxChecked: {
    backgroundColor: colors.brand.navy,
    borderColor: colors.brand.navy,
  },
  tick: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 16,
  },
});
