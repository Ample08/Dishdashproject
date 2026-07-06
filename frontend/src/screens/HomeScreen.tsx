import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import FastImage from 'react-native-fast-image';
import Svg, {Circle} from 'react-native-svg';
import {fontSize, hp, spacing, wp} from '../utils/responsive';

export function HomeScreen() {
  return (
    <View style={styles.container}>
      <Svg height={wp(20)} width={wp(20)} viewBox="0 0 100 100">
        <Circle cx="50" cy="50" r="40" fill="#E85D04" />
      </Svg>
      <Text style={styles.title}>Flavours</Text>
      <Text style={styles.subtitle}>Navigation, icons, SVG, and FastImage are ready.</Text>
      <FastImage
        style={styles.image}
        source={{
          uri: 'https://picsum.photos/seed/flavours/400/240',
          priority: FastImage.priority.normal,
        }}
        resizeMode={FastImage.resizeMode.cover}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: fontSize.md,
    color: '#4B5563',
    textAlign: 'center',
  },
  image: {
    width: wp(80),
    height: hp(20),
    borderRadius: spacing.sm,
    marginTop: spacing.md,
  },
});
