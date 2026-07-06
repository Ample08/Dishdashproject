import React, {useEffect, useState} from 'react';
import {ActivityIndicator, Platform, Pressable, StyleSheet, Text, View} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LottieView from 'lottie-react-native';
import {check, PERMISSIONS, request, RESULTS} from 'react-native-permissions';
import Toast from 'react-native-toast-message';
import {fontSize, spacing} from '../utils/responsive';
import {env} from '../config/env';

const STORAGE_KEY = '@flavours/onboarding_seen';

export function ProfileScreen() {
  const [loading, setLoading] = useState(true);
  const [onboardingSeen, setOnboardingSeen] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then(value => setOnboardingSeen(value === 'true'))
      .finally(() => setLoading(false));
  }, []);

  const handlePermissionCheck = async () => {
    const permission =
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.CAMERA
        : PERMISSIONS.ANDROID.CAMERA;

    const status = await check(permission);

    if (status === RESULTS.GRANTED) {
      Toast.show({type: 'success', text1: 'Camera permission already granted'});
      return;
    }

    const result = await request(permission);
    Toast.show({
      type: result === RESULTS.GRANTED ? 'success' : 'info',
      text1:
        result === RESULTS.GRANTED
          ? 'Camera permission granted'
          : 'Camera permission denied',
    });
  };

  const markOnboardingSeen = async () => {
    await AsyncStorage.setItem(STORAGE_KEY, 'true');
    setOnboardingSeen(true);
    Toast.show({type: 'success', text1: 'Saved with AsyncStorage'});
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#E85D04" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LottieView
        autoPlay
        loop
        style={styles.lottie}
        source={require('../../assets/animations/loading.json')}
      />
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.subtitle}>Environment: {env.appEnv}</Text>
      <Text style={styles.subtitle}>
        Onboarding seen: {onboardingSeen ? 'Yes' : 'No'}
      </Text>
      <Pressable style={styles.button} onPress={markOnboardingSeen}>
        <Text style={styles.buttonText}>Save onboarding flag</Text>
      </Pressable>
      <Pressable style={styles.secondaryButton} onPress={handlePermissionCheck}>
        <Text style={styles.secondaryButtonText}>Request camera permission</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.sm,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lottie: {
    width: 120,
    height: 120,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: '#111827',
  },
  subtitle: {
    fontSize: fontSize.md,
    color: '#4B5563',
  },
  button: {
    marginTop: spacing.md,
    backgroundColor: '#E85D04',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: spacing.sm,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  secondaryButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  secondaryButtonText: {
    color: '#E85D04',
    fontSize: fontSize.md,
    fontWeight: '600',
  },
});
