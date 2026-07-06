import React, {useState} from 'react';
import {Image, StyleSheet, View, type StyleProp, type ViewStyle} from 'react-native';
import {dashboardImages} from '../../assets/dashboardImages';
import {heroVideoSource} from './heroVideoSource';

/**
 * Looping, muted hero reel for the Catering Home header (UA1 VideoPlaceholder).
 *
 * The `react-native-video` module is required lazily — only when a video source
 * is configured (see heroVideoSource.ts). Until then, or if the video errors,
 * the catering poster image is shown, so this screen has no dependency on the
 * native video module before you add the mp4 and rebuild. A soft dark scrim
 * sits on top so the white header controls stay legible.
 */
export function HeroVideo({
  height,
  children,
  style,
}: {
  height: number;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const [failed, setFailed] = useState(false);
  const showVideo = heroVideoSource != null && !failed;

  // Only touch react-native-video when a source is actually configured.
  const Video = showVideo
    ? (require('react-native-video').default as React.ComponentType<any>)
    : null;

  return (
    <View style={[styles.wrap, {height}, style]}>
      {Video ? (
        <Video
          source={heroVideoSource as any}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
          repeat
          muted
          paused={false}
          playInBackground={false}
          poster={Image.resolveAssetSource(dashboardImages.catering).uri}
          posterResizeMode="cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <Image
          source={dashboardImages.catering}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
      )}
      <View style={styles.scrim} pointerEvents="none" />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  scrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
});
