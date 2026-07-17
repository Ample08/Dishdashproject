import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {DashboardTabBar} from '../components/DashboardTabBar';
import {HomeDashboardScreen} from '../screens/main/HomeDashboardScreen';
import {OrdersHomeScreen} from '../screens/main/OrdersHomeScreen';
import {ReservationsHomeScreen} from '../screens/reservation/ReservationsHomeScreen';
import {LoyaltyHomeScreen} from '../screens/loyalty/LoyaltyHomeScreen';
import {ProfileHomeScreen} from '../screens/main/ProfileHomeScreen';
import type {TabParamList} from './types';

const Tab = createBottomTabNavigator<TabParamList>();

/** Main 5-tab shell (Figma TabBar 2034:202). */
export function TabNavigator() {
  return (
    <Tab.Navigator
      tabBar={props => <DashboardTabBar {...props} />}
      screenOptions={{headerShown: false}}>
      <Tab.Screen name="Home" component={HomeDashboardScreen} />
      <Tab.Screen name="Orders" component={OrdersHomeScreen} />
      <Tab.Screen name="Loyalty" component={LoyaltyHomeScreen} />
      <Tab.Screen name="Reserve" component={ReservationsHomeScreen} />
      <Tab.Screen name="Profile" component={ProfileHomeScreen} />
    </Tab.Navigator>
  );
}
