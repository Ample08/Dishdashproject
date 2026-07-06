import React from 'react';
import {requestNotifications} from 'react-native-permissions';
import FastImage from 'react-native-fast-image';
import type {RootStackScreenProps} from '../../navigation/types';
import {PermissionScaffold} from '../../components';

const NOTIF_GIF = require('../../../assets/animations/notif_anim_v3.gif');

/** Notifications permission primer (Figma 702:32). */
type Props = RootStackScreenProps<'Notifications'>;

export function NotificationsScreen({navigation}: Props) {
  // After permissions → Welcome celebration GIF → settled voucher.
  const next = () => navigation.reset({index: 0, routes: [{name: 'WelcomeCelebration'}]});

  const grant = async () => {
    try {
      await requestNotifications(['alert', 'sound', 'badge']);
    } catch {
      // proceed regardless of outcome
    }
    next();
  };

  return (
    <PermissionScaffold
      illustration={
        <FastImage
          source={NOTIF_GIF}
          style={styles.anim}
          resizeMode={FastImage.resizeMode.contain}
        />
      }
      topOffset={83}
      title="Mind if I ping you?"
      subtitle="Most apps overdo this — I won't. Only the buzz you'll actually want."
      benefits={['Order updates', 'Table-ready alerts', 'Reward drops']}
      primaryLabel="Sure, ping me"
      onPrimary={grant}
      onSkip={next}
    />
  );
}

const styles = {
  anim: {width: 292, height: 292},
};
