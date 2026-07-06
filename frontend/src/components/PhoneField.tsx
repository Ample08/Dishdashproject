import React, {useRef, useState} from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {colors, fontFamily} from '../theme';
import {WhatsAppMark} from './icons';

/**
 * Phone Field (Figma 773:23)
 * Country-code prefix + WhatsApp glyph + number input.
 * States: Default (placeholder), Focus (pistachio glow), Filled, Error, Disabled.
 * When `onPressPrefix` is set, the flag + dial-code opens the country picker.
 */
type Props = {
  value: string;
  onChangeText: (v: string) => void;
  dialCode?: string;
  flag?: string;
  placeholder?: string;
  error?: string;
  editable?: boolean;
  onPressPrefix?: () => void;
  style?: StyleProp<ViewStyle>;
};

export function PhoneField({
  value,
  onChangeText,
  dialCode = '+971',
  flag = '🇦🇪',
  placeholder = '50 123 4567',
  error,
  editable = true,
  onPressPrefix,
  style,
}: Props) {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const hasError = !!error;

  return (
    <View style={style}>
      <Pressable
        onPress={() => inputRef.current?.focus()}
        style={[
          styles.field,
          focused && styles.focused,
          hasError && styles.errored,
          !editable && styles.disabled,
        ]}>
        <Pressable
          onPress={onPressPrefix}
          disabled={!editable || !onPressPrefix}
          accessibilityRole="button"
          accessibilityLabel={`Country code ${dialCode}, change country`}
          hitSlop={8}
          style={styles.prefixBtn}>
          <Text style={styles.prefix}>
            {flag} {dialCode}
          </Text>
          {onPressPrefix ? (
            <Icon name="chevron-down" size={14} color={colors.text.secondary} />
          ) : null}
        </Pressable>
        <View style={styles.divider} />
        <WhatsAppMark size={20} />
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          editable={editable}
          placeholder={placeholder}
          placeholderTextColor={colors.text.tertiary}
          keyboardType="numeric"
          textContentType="telephoneNumber"
          maxLength={12}
        />
      </Pressable>
      {hasError ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 18,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.brand.navy,
    backgroundColor: colors.brand.white,
  },
  focused: {
    borderColor: colors.brand.pistachio,
    shadowColor: colors.brand.pistachio,
    shadowOpacity: 0.5,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 0},
    elevation: 4,
  },
  errored: {
    borderColor: colors.status.error,
  },
  disabled: {
    opacity: 0.5,
  },
  prefixBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  prefix: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 16,
    color: colors.brand.navy,
  },
  divider: {
    width: 1,
    height: 22,
    backgroundColor: colors.border.subtle,
  },
  input: {
    flex: 1,
    padding: 0,
    fontFamily: fontFamily.bodyBold,
    fontSize: 16,
    color: colors.brand.navy,
  },
  errorText: {
    marginTop: 8,
    marginLeft: 4,
    fontFamily: fontFamily.bodyRegular,
    fontSize: 12,
    color: colors.status.error,
  },
});
