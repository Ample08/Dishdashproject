import React from 'react';
import {Platform} from 'react-native';
import LottieView from 'lottie-react-native';
import {PERMISSIONS, request} from 'react-native-permissions';
import type {RootStackScreenProps} from '../../navigation/types';
import {PermissionScaffold} from '../../components';
import FastImage from 'react-native-fast-image';

// TODO(asset): swap for the real `location_anim` GIF/Lottie when provided.
const LOCATION_ANIM = require('../../../assets/animations/location_anim_v3.gif');

/** Location permission primer (Figma 702:5). */
type Props = RootStackScreenProps<'Location'>;

export function LocationScreen({navigation}: Props) {
  const next = () => navigation.navigate('Notifications');

  const grant = async () => {
    try {
      await request(
        Platform.OS === 'ios'
          ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
          : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
      );
    } catch {
      // proceed regardless of outcome
    }
    next();
  };

  return (
    <PermissionScaffold
      illustration={
        // <LottieView source={LOCATION_ANIM} autoPlay loop style={styles.anim} />
        <FastImage
          source={LOCATION_ANIM}
          style={styles.anim}
          resizeMode={FastImage.resizeMode.contain}
        />
      }
      topOffset={88}
      title="Quick favour, my friend?"
      subtitle="I know — another permission. Promise this one's just so we can send the right flavour your way, nothing more then:"
      benefits={['Faster delivery', 'Nearest dine-in', 'Emirate-only perks']}
      primaryLabel="Sure, find me"
      onPrimary={grant}
      onSkip={next}
    />
  );
}

const styles = {
  anim: {width: 280, height: 200},
};
