import React, {useEffect, useRef, useState} from 'react';
import {Pressable, StyleSheet, Text, TextInput, View} from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import {colors, fontFamily} from '../theme';

/**
 * OTP Input (Figma 679:88)
 * Six equal cells. Active cell: 2px pistachio border + green glow + blinking
 * caret. Filled: 1px pistachio. Empty: 1px subtle. Error: red border + shake.
 * A single hidden TextInput captures entry (supports SMS autofill + paste).
 */
type Props = {
  value: string;
  onChangeText: (v: string) => void;
  cellCount?: number;
  error?: boolean;
  autoFocus?: boolean;
  onFilled?: (code: string) => void;
};

export function OTPInput({
  value,
  onChangeText,
  cellCount = 6,
  error = false,
  autoFocus = true,
  onFilled,
}: Props) {
  const inputRef = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);

  const shake = useSharedValue(0);
  const caret = useSharedValue(0);

  // Shake on error.
  useEffect(() => {
    if (error) {
      shake.value = withSequence(
        withTiming(-8, {duration: 50}),
        withTiming(8, {duration: 50}),
        withTiming(-6, {duration: 50}),
        withTiming(6, {duration: 50}),
        withTiming(0, {duration: 50}),
      );
    }
  }, [error, shake]);

  // Blinking caret while focused.
  useEffect(() => {
    if (focused) {
      caret.value = withRepeat(
        withSequence(
          withTiming(1, {duration: 1}),
          withTiming(1, {duration: 500}),
          withTiming(0, {duration: 500}),
        ),
        -1,
      );
    } else {
      cancelAnimation(caret);
      caret.value = 0;
    }
    return () => cancelAnimation(caret);
  }, [focused, caret]);

  const handleChange = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, cellCount);
    onChangeText(digits);
    if (digits.length === cellCount) {
      onFilled?.(digits);
    }
  };

  const rowStyle = useAnimatedStyle(() => ({
    transform: [{translateX: shake.value}],
  }));
  const caretStyle = useAnimatedStyle(() => ({opacity: caret.value}));

  return (
    <Pressable style={styles.wrap} onPress={() => inputRef.current?.focus()}>
      <Animated.View style={[styles.row, rowStyle]}>
        {Array.from({length: cellCount}).map((_, i) => {
          const char = value[i];
          const isFilled = i < value.length;
          const isActive = focused && i === value.length && value.length < cellCount;
          return (
            <View
              key={i}
              style={[
                styles.cell,
                isFilled && styles.cellFilled,
                isActive && styles.cellActive,
                error && styles.cellError,
              ]}>
              <View style={styles.cellContent}>
                {char ? (
                  <Text style={styles.digit}>{char}</Text>
                ) : isActive ? (
                  <Animated.View style={[styles.caret, caretStyle]} />
                ) : null}
              </View>
            </View>
          );
        })}
      </Animated.View>

      <TextInput
        ref={inputRef}
        style={styles.hiddenInput}
        value={value}
        onChangeText={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
        maxLength={cellCount}
        autoFocus={autoFocus}
        caretHidden
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
  },
  row: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    overflow: 'visible',
  },
  cell: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 12,
    borderWidth: 0.7,
    borderColor: colors.border.subtle,
    backgroundColor: colors.surface.elevated,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  // Fixed-height content box so empty cells match filled-cell height.
  cellContent: {
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellFilled: {
    borderWidth: 1,
     height: 62, 
    borderColor: colors.brand.pistachio,
  },
  cellActive: {
  borderWidth: 2,
   borderColor: '#9ED487',
  backgroundColor: colors.surface.elevated,
  shadowColor: '#79d352',
  shadowOpacity: 1.3,
  shadowRadius: 18,
  shadowOffset: {width: 0, height: 0},
  elevation: 16,

  },
  cellError: {
    borderColor: colors.status.error,
  },
  digit: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 24,
    color: colors.text.primary,
  },
  caret: {
    width: 2,
    height: 24,
    backgroundColor: colors.brand.pistachio,
  },
  hiddenInput: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0,
  },
});
