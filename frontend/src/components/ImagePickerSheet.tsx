import React from 'react';
import {Platform, Pressable, StyleSheet, Text, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  check,
  PERMISSIONS,
  request,
  RESULTS,
  type Permission,
} from 'react-native-permissions';
import {
  launchCamera,
  launchImageLibrary,
  type Asset,
  type CameraOptions,
  type ImageLibraryOptions,
} from 'react-native-image-picker';
import Toast from 'react-native-toast-message';
import {BottomSheet} from './BottomSheet';
import {colors, fontFamily} from '../theme';

/**
 * Sheet · Image source picker — lets the user choose between the Camera and the
 * photo Gallery to set a picture (e.g. the profile avatar). Handles the camera
 * runtime permission; the library uses the system photo picker.
 */
const MEDIA: ImageLibraryOptions & CameraOptions = {
  mediaType: 'photo',
  quality: 0.8,
  includeBase64: false,
  selectionLimit: 1,
};

async function ensureCameraPermission(): Promise<boolean> {
  const permission: Permission =
    Platform.OS === 'ios'
      ? PERMISSIONS.IOS.CAMERA
      : PERMISSIONS.ANDROID.CAMERA;

  const status = await check(permission);
  if (status === RESULTS.GRANTED || status === RESULTS.LIMITED) {
    return true;
  }
  const result = await request(permission);
  return result === RESULTS.GRANTED || result === RESULTS.LIMITED;
}

export function ImagePickerSheet({
  visible,
  onClose,
  onPicked,
}: {
  visible: boolean;
  onClose: () => void;
  onPicked: (asset: Asset) => void;
}) {
  const handleResult = (asset?: Asset) => {
    if (asset?.uri) {
      onPicked(asset);
    }
  };

  const fromCamera = async () => {
    onClose();
    const granted = await ensureCameraPermission();
    if (!granted) {
      Toast.show({
        type: 'info',
        text1: 'Camera permission needed',
        text2: 'Enable camera access in Settings to take a photo.',
      });
      return;
    }
    const res = await launchCamera(MEDIA);
    if (res.didCancel) {
      return;
    }
    if (res.errorCode) {
      Toast.show({type: 'error', text1: res.errorMessage ?? 'Could not open camera'});
      return;
    }
    handleResult(res.assets?.[0]);
  };

  const fromGallery = async () => {
    onClose();
    const res = await launchImageLibrary(MEDIA);
    if (res.didCancel) {
      return;
    }
    if (res.errorCode) {
      Toast.show({type: 'error', text1: res.errorMessage ?? 'Could not open gallery'});
      return;
    }
    handleResult(res.assets?.[0]);
  };

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <Text style={styles.title}>Update photo</Text>
      <Text style={styles.subtitle}>Choose where to get your picture from.</Text>

      <Pressable style={styles.option} onPress={fromCamera} accessibilityRole="button">
        <View style={styles.iconWrap}>
          <Icon name="camera-outline" size={22} color={colors.brand.navy} />
        </View>
        <View style={styles.optionLabels}>
          <Text style={styles.optionTitle}>Take a photo</Text>
          <Text style={styles.optionSub}>Use your camera</Text>
        </View>
        <Icon name="chevron-forward" size={20} color={colors.text.tertiary} />
      </Pressable>

      <Pressable style={styles.option} onPress={fromGallery} accessibilityRole="button">
        <View style={styles.iconWrap}>
          <Icon name="images-outline" size={22} color={colors.brand.navy} />
        </View>
        <View style={styles.optionLabels}>
          <Text style={styles.optionTitle}>Choose from gallery</Text>
          <Text style={styles.optionSub}>Pick an existing picture</Text>
        </View>
        <Icon name="chevron-forward" size={20} color={colors.text.tertiary} />
      </Pressable>

      <Pressable style={styles.cancel} onPress={onClose} accessibilityRole="button">
        <Text style={styles.cancelText}>Cancel</Text>
      </Pressable>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: fontFamily.displayBold,
    fontSize: 20,
    color: colors.text.primary,
  },
  subtitle: {
    marginTop: 4,
    marginBottom: 16,
    fontFamily: fontFamily.bodyRegular,
    fontSize: 13,
    color: colors.text.secondary,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    backgroundColor: colors.brand.white,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brand.champagne,
  },
  optionLabels: {
    flex: 1,
    gap: 2,
  },
  optionTitle: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 15,
    color: colors.text.primary,
  },
  optionSub: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 12,
    color: colors.text.secondary,
  },
  cancel: {
    marginTop: 4,
    height: 50,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 14,
    color: colors.text.tertiary,
  },
});
