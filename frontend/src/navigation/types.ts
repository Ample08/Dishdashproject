import type {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import type {CompositeScreenProps} from '@react-navigation/native';
import type {NavigatorScreenParams} from '@react-navigation/native';
import type {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';

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
  /**
   * `gated` marks an entry from an order / booking / loyalty gate rather than
   * from onboarding — on save the user returns to whatever they were doing
   * instead of being pushed through the Location / Notifications flow.
   */
  ProfileSetup:
    | {sso?: boolean; prefill?: ProfilePrefill; gated?: boolean}
    | undefined;
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
  MyOrders: undefined;

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

/** For `useNavigation()` outside a screen component (e.g. shared hooks). */
export type RootStackNavigationProp =
  NativeStackNavigationProp<RootStackParamList>;

export type TabScreenProps<T extends keyof TabParamList> = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, T>,
  RootStackScreenProps<keyof RootStackParamList>
>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
