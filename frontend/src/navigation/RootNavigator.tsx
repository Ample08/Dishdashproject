import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {SplashScreen} from '../screens/auth/SplashScreen';
import {SignInScreen} from '../screens/auth/SignInScreen';
import {HandoffScreen} from '../screens/auth/HandoffScreen';
import {PhoneVerifyScreen} from '../screens/auth/PhoneVerifyScreen';
import {OTPScreen} from '../screens/auth/OTPScreen';
import {ProfileSetupScreen} from '../screens/auth/ProfileSetupScreen';
import {LocationScreen} from '../screens/auth/LocationScreen';
import {NotificationsScreen} from '../screens/auth/NotificationsScreen';
import {WelcomeCelebrationScreen} from '../screens/auth/WelcomeCelebrationScreen';
import {WelcomeVouchersScreen} from '../screens/auth/WelcomeVouchersScreen';
import {TabNavigator} from './TabNavigator';
import {BrandPageScreen} from '../screens/main/BrandPageScreen';
import {SearchScreen} from '../screens/main/SearchScreen';
import {DishDetailScreen} from '../screens/main/DishDetailScreen';
import {CartScreen} from '../screens/main/CartScreen';
import {PaymentScreen} from '../screens/main/PaymentScreen';
import {OrderSuccessScreen} from '../screens/main/OrderSuccessScreen';
import {OrderStatusScreen} from '../screens/main/OrderStatusScreen';
import {MyOrdersScreen} from '../screens/main/MyOrdersScreen';
import {NewReservationScreen} from '../screens/reservation/NewReservationScreen';
import {PlaceScreen} from '../screens/reservation/PlaceScreen';
import {WhenTableScreen} from '../screens/reservation/WhenTableScreen';
import {WhenScreen} from '../screens/reservation/WhenScreen';
import {ConfirmBookingScreen} from '../screens/reservation/ConfirmBookingScreen';
import {ReservationSuccessScreen} from '../screens/reservation/ReservationSuccessScreen';
import {BookingDetailScreen} from '../screens/reservation/BookingDetailScreen';
import {CateringHomeScreen} from '../screens/catering/CateringHomeScreen';
import {CateringInquiryStep1Screen} from '../screens/catering/CateringInquiryStep1Screen';
import {CateringInquiryStep2Screen} from '../screens/catering/CateringInquiryStep2Screen';
import {CateringSuccessScreen} from '../screens/catering/CateringSuccessScreen';
import {MyCateringInquiriesScreen} from '../screens/catering/MyCateringInquiriesScreen';
import {CateringInquiryDetailScreen} from '../screens/catering/CateringInquiryDetailScreen';
import {MyVouchersScreen} from '../screens/loyalty/MyVouchersScreen';
import {WelcomeRevealScreen} from '../screens/loyalty/WelcomeRevealScreen';
import {GenerateCelebrationScreen} from '../screens/loyalty/GenerateCelebrationScreen';
import {CelebrationGeneratedScreen} from '../screens/loyalty/CelebrationGeneratedScreen';
import {MembershipTiersScreen} from '../screens/loyalty/MembershipTiersScreen';
import {ExperienceHomeScreen} from '../screens/loyalty/ExperienceHomeScreen';
import {ExperienceDetailScreen} from '../screens/loyalty/ExperienceDetailScreen';
import {ExperienceBookedScreen} from '../screens/loyalty/ExperienceBookedScreen';
import {LoyaltyBookingsScreen} from '../screens/loyalty/LoyaltyBookingsScreen';
import {LoyaltyBookingDetailScreen} from '../screens/loyalty/LoyaltyBookingDetailScreen';
import {PointHistoryScreen} from '../screens/loyalty/PointHistoryScreen';
import type {RootStackParamList} from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Auth flow (matches the Figma prototype order):
 * Splash → Sign In → (phone | SSO→Handoff→Phone Verify) → OTP
 *        → Profile Setup [SSO] → Location → Notifications → Welcome → Home
 */
export function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{headerShown: false}}>
      <Stack.Screen name="Splash" component={SplashScreen} options={{animation: 'fade'}} />
      <Stack.Screen name="SignIn" component={SignInScreen} options={{animation: 'fade'}} />
      <Stack.Screen name="Handoff" component={HandoffScreen} options={{animation: 'fade'}} />
      <Stack.Screen
        name="PhoneVerify"
        component={PhoneVerifyScreen}
        options={{animation: 'fade', animationDuration: 300}}
      />
      <Stack.Screen
        name="OTP"
        component={OTPScreen}
        options={{animation: 'slide_from_right', animationDuration: 300}}
      />
      <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
      <Stack.Screen name="Location" component={LocationScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen
        name="WelcomeCelebration"
        component={WelcomeCelebrationScreen}
        options={{animation: 'fade'}}
      />
      <Stack.Screen
        name="WelcomeVoucher"
        component={WelcomeVouchersScreen}
        options={{animation: 'fade'}}
      />
      <Stack.Screen
        name="MainTabs"
        component={TabNavigator}
        options={{animation: 'fade', animationDuration: 400}}
      />

      {/* Order flow (pushed over the tabs) */}
      <Stack.Screen name="BrandPage" component={BrandPageScreen} />
      <Stack.Screen
        name="Search"
        component={SearchScreen}
        options={{animation: 'fade'}}
      />
      <Stack.Screen name="DishDetail" component={DishDetailScreen} />
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="Payment" component={PaymentScreen} />
      <Stack.Screen
        name="OrderSuccess"
        component={OrderSuccessScreen}
        options={{animation: 'fade', gestureEnabled: false}}
      />
      <Stack.Screen name="OrderStatus" component={OrderStatusScreen} />
      <Stack.Screen name="MyOrders" component={MyOrdersScreen} />

      {/* Reservation flow (pushed over the tabs) */}
      <Stack.Screen name="NewReservation" component={NewReservationScreen} />
      <Stack.Screen
        name="ReservationPlace"
        component={PlaceScreen}
        options={{animation: 'slide_from_right', animationDuration: 300}}
      />
      <Stack.Screen name="WhenTable" component={WhenTableScreen} />
      <Stack.Screen name="ReservationWhen" component={WhenScreen} />
      <Stack.Screen name="ConfirmBooking" component={ConfirmBookingScreen} />
      <Stack.Screen
        name="ReservationSuccess"
        component={ReservationSuccessScreen}
        options={{animation: 'fade', gestureEnabled: false}}
      />
      <Stack.Screen name="BookingDetail" component={BookingDetailScreen} />

      {/* Catering inquiry flow (pushed over the tabs) */}
      <Stack.Screen name="CateringHome" component={CateringHomeScreen} />
      <Stack.Screen name="CateringStep1" component={CateringInquiryStep1Screen} />
      <Stack.Screen name="CateringStep2" component={CateringInquiryStep2Screen} />
      <Stack.Screen
        name="CateringSuccess"
        component={CateringSuccessScreen}
        options={{animation: 'fade', gestureEnabled: false}}
      />
      <Stack.Screen
        name="MyCateringInquiries"
        component={MyCateringInquiriesScreen}
      />
      <Stack.Screen
        name="CateringInquiryDetail"
        component={CateringInquiryDetailScreen}
      />

      {/* Loyalty flow (pushed over the tabs) */}
      <Stack.Screen name="MyVouchers" component={MyVouchersScreen} />
      <Stack.Screen
        name="WelcomeReveal"
        component={WelcomeRevealScreen}
        options={{presentation: 'modal'}}
      />
      <Stack.Screen name="GenerateCelebration" component={GenerateCelebrationScreen} />
      <Stack.Screen
        name="CelebrationGenerated"
        component={CelebrationGeneratedScreen}
        options={{animation: 'fade', gestureEnabled: false}}
      />
      <Stack.Screen name="MembershipTiers" component={MembershipTiersScreen} />
      <Stack.Screen name="ExperienceHome" component={ExperienceHomeScreen} />
      <Stack.Screen name="ExperienceDetail" component={ExperienceDetailScreen} />
      <Stack.Screen
        name="ExperienceBooked"
        component={ExperienceBookedScreen}
        options={{animation: 'fade', gestureEnabled: false}}
      />
      <Stack.Screen name="LoyaltyBookings" component={LoyaltyBookingsScreen} />
      <Stack.Screen
        name="LoyaltyBookingDetail"
        component={LoyaltyBookingDetailScreen}
      />
      <Stack.Screen name="PointHistory" component={PointHistoryScreen} />
    </Stack.Navigator>
  );
}
