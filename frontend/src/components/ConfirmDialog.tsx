import React from 'react';
import {Modal, Pressable, StyleSheet, Text, View} from 'react-native';
import {colors, fontFamily} from '../theme';

/**
 * ConfirmDialog (Figma 6522 · Confirmation / Clear Cart dialogs) — centered
 * overlay card with an italic title, a body line, and a Cancel + destructive
 * action pair. Reused for "Remove this item?" and "Clear your cart?".
 */
const DANGER_RED = '#e0342d';

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}: {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} />
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.row}>
            <Pressable
              style={[styles.btn, styles.cancel]}
              onPress={onCancel}
              accessibilityRole="button">
              <Text style={styles.cancelText}>{cancelLabel}</Text>
            </Pressable>
            <Pressable
              style={[styles.btn, styles.confirm]}
              onPress={onConfirm}
              accessibilityRole="button">
              <Text style={styles.confirmText}>{confirmLabel}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    backgroundColor: 'rgba(28,35,48,0.45)',
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: colors.brand.white,
    borderRadius: 20,
    padding: 24,
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 24,
    shadowOffset: {width: 0, height: 10},
    elevation: 12,
  },
  title: {
    fontFamily: fontFamily.displayBoldItalic,
    fontSize: 22,
    color: colors.text.primary,
  },
  message: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.text.secondary,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  btn: {
    flex: 1,
    height: 48,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancel: {
    backgroundColor: colors.brand.white,
    borderWidth: 1.5,
    borderColor: colors.border.subtle,
  },
  cancelText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 15,
    color: colors.text.primary,
  },
  confirm: {
    backgroundColor: DANGER_RED,
  },
  confirmText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 15,
    color: colors.brand.white,
  },
});
