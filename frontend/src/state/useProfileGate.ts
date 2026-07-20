import {useCallback} from 'react';
import {useNavigation} from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import type {RootStackNavigationProp} from '../navigation/types';
import {useAuth} from './AuthContext';

/**
 * Guests may browse freely, but anything that commits — placing an order,
 * confirming a table, spending or claiming loyalty points — needs a finished
 * profile (name + email + date of birth).
 *
 * `requireProfile(action)` runs `action` when the profile is complete, and
 * otherwise nudges the user to Profile Setup. Saving there sends them straight
 * back to the screen they were on, so they can retry immediately.
 *
 * Usage:
 *   const requireProfile = useProfileGate();
 *   const onPay = () => requireProfile(() => { ...place the order... });
 */
export function useProfileGate() {
  const {profileComplete} = useAuth();
  const navigation = useNavigation<RootStackNavigationProp>();

  return useCallback(
    (action: () => void, message = 'Add your details to continue.') => {
      if (profileComplete) {
        action();
        return;
      }
      Toast.show({
        type: 'info',
        text1: 'Just one step first',
        text2: message,
      });
      navigation.navigate('ProfileSetup', {gated: true});
    },
    [profileComplete, navigation],
  );
}
