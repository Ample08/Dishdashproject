import React from 'react';
import {Pressable, StatusBar, StyleSheet, Text, useColorScheme, View} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {NavigationContainer} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import Toast, {type ToastConfig} from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/Ionicons';
import {RootNavigator} from './src/navigation/RootNavigator';
import {AuthProvider} from './src/state/AuthContext';
import {CartProvider} from './src/state/CartContext';
import {OrderProvider} from './src/state/OrderContext';
import {ReservationProvider} from './src/state/ReservationContext';
import {LoyaltyProvider} from './src/state/LoyaltyContext';
import {CateringProvider} from './src/state/CateringContext';
import {colors, fontFamily} from './src/theme';

const toastConfig: ToastConfig = {
  referralError: ({text1, props}) => (
    <View style={styles.referralToast}>
      <View style={styles.toastIcon}>
        <Icon name="alert-outline" size={13} color={colors.status.error} />
      </View>
      <Text style={styles.toastText}>{text1}</Text>
      <Pressable hitSlop={8} onPress={props?.onRetry}>
        <Text style={styles.toastRetry}>Retry</Text>
      </Pressable>
    </View>
  ),
};

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <NavigationContainer>
          <StatusBar
            barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          />
          <AuthProvider>
            <CartProvider>
              <OrderProvider>
                <ReservationProvider>
                  <LoyaltyProvider>
                    <CateringProvider>
                      <RootNavigator />
                    </CateringProvider>
                  </LoyaltyProvider>
                </ReservationProvider>
              </OrderProvider>
            </CartProvider>
          </AuthProvider>
          <Toast config={toastConfig} />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  referralToast: {
    width: '88%',
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingLeft: 12,
    paddingRight: 14,
    borderRadius: 12,
    backgroundColor: colors.brand.navy,
    shadowColor: '#000000',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 4},
    elevation: 6,
  },
  toastIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.4,
    borderColor: colors.status.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toastText: {
    flex: 1,
    fontFamily: fontFamily.bodyRegular,
    fontSize: 12,
    color: colors.text.inverse,
  },
  toastRetry: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 12,
    color: colors.text.inverse,
  },
});

export default App;
