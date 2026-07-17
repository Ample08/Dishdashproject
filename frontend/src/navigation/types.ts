import type {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import type {CompositeScreenProps} from '@react-navigation/native';
import type {NavigatorScreenParams} from '@react-navigation/native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';

import type {BrandKey} from '../data/menu';

export type Provider = 'google' | 'apple';

export type ProfilePrefill = {
  firstName?: string;
  lastName?: string;
  email?: string;
};

export type RootStackParamList = {
  Splash: undefined;
  SignIn: undefined;
  Handoff: {provider: Provider};
  PhoneVerify: {provider?: Provider} | undefined;
  OTP: {phone?: string; fromSso?: boolean; provider?: Provider} | undefined;
  ProfileSetup: {sso?: boolean; prefill?: ProfilePrefill} | undefined;
  Location: undefined;
  Notifications: undefined;
  WelcomeCelebration: undefined;
  WelcomeVoucher: {userName?: string} | undefined;
  MainTabs: NavigatorScreenParams<TabParamList> | undefined;
  BrandPage: {brand: BrandKey};
  Search: {brand: BrandKey};
  DishDetail: {itemId: string};
  Cart: undefined;
  Payment: undefined;
  OrderSuccess: undefined;
  OrderStatus: undefined;

  // Reservation flow (40a → 45) + booking management (46)
  NewReservation: undefined;
  ReservationPlace: undefined;
  WhenTable: undefined;
  ReservationWhen: undefined;
  ConfirmBooking: undefined;
  ReservationSuccess: {bookingId: string};
  BookingDetail: {bookingId: string};

  // Catering inquiry flow (UA1 → UA5)
  CateringHome: undefined;
  CateringStep1: undefined;
  CateringStep2: undefined;
  CateringSuccess: {inquiryId: string};
  MyCateringInquiries: undefined;
  CateringInquiryDetail: {inquiryId: string};

  // Loyalty flow (29 → 39)
  MyVouchers: undefined;
  WelcomeReveal: {voucherId: string};
  GenerateCelebration: undefined;
  CelebrationGenerated: {voucherId: string};
  MembershipTiers: undefined;
  ExperienceHome: undefined;
  ExperienceDetail: {experienceId: string};
  ExperienceBooked: {experienceId: string};
  LoyaltyBookings: undefined;
  LoyaltyBookingDetail: {bookingId: string};
  PointHistory: undefined;
};

export type TabParamList = {
  Home: undefined;
  Orders: undefined;
  Loyalty: undefined;
  Reserve: undefined;
  Profile: undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export type TabScreenProps<T extends keyof TabParamList> = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, T>,
  RootStackScreenProps<keyof RootStackParamList>
>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
