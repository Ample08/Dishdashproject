import React, {useState} from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type KeyboardTypeOptions,
} from 'react-native';
import {colors, fontFamily} from '../theme';

/**
 * Labelled text field (Figma 847:118 etc.).
 * Label (Lato Bold 12) + white box (1.5px subtle border, radius 12) with
 * optional trailing node + helper line. Pistachio border on focus.
 */
type Props = {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  helper?: string;
  trailing?: React.ReactNode;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  editable?: boolean;
  onPress?: () => void;
};

export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  helper,
  trailing,
  keyboardType,
  autoCapitalize = 'sentences',
  editable = true,
  onPress,
}: Props) {
  const [focused, setFocused] = useState(false);

  const field = (
    <View style={[styles.field, focused && styles.focused]}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        placeholderTextColor={colors.text.tertiary}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        editable={editable && !onPress}
        pointerEvents={onPress ? 'none' : 'auto'}
      />
      {trailing}
    </View>
  );

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      {onPress ? (
        <Pressable onPress={onPress}>{field}</Pressable>
      ) : (
        field
      )}
      {helper ? <Text style={styles.helper}>{helper}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    gap: 6,
  },
  label: {
    width: '100%',
    fontFamily: fontFamily.bodyBold,
    fontSize: 12,
    color: colors.text.primary,
  },
  field: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border.subtle,
    backgroundColor: colors.brand.white,
  },
  focused: {
    borderColor: colors.brand.pistachio,
  },
  input: {
    flex: 1,
    padding: 0,
    fontFamily: fontFamily.bodyRegular,
    fontSize: 15,
    color: colors.text.primary,
  },
  helper: {
    width: '100%',
    fontFamily: fontFamily.bodyRegular,
    fontSize: 11,
    color: colors.text.tertiary,
  },
});
