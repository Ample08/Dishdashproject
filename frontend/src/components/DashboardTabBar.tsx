import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Ion from 'react-native-vector-icons/Ionicons';
import MCI from 'react-native-vector-icons/MaterialCommunityIcons';
import type {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import {colors, fontFamily} from '../theme';

/**
 * Bottom Tab Bar (Figma 2034:202) — 5 tabs, white bar with a top hairline.
 * Active tab: navy icon/label + pistachio underline. Inactive: grey.
 * Icons match the Figma set: Loyalty = award ribbon, Reserve = sofa.
 */
type IconDef = {set: 'ion' | 'mci'; on: string; off: string};

const ICONS: Record<string, IconDef> = {
  Home: {set: 'ion', on: 'home', off: 'home-outline'},
  Orders: {set: 'ion', on: 'receipt', off: 'receipt-outline'},
  Loyalty: {set: 'ion', on: 'ribbon', off: 'ribbon-outline'},
  Reserve: {set: 'mci', on: 'sofa', off: 'sofa-outline'},
  Profile: {set: 'ion', on: 'person', off: 'person-outline'},
};

export function DashboardTabBar({state, descriptors, navigation}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, {paddingBottom: Math.max(insets.bottom, 10)}]}>
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const {options} = descriptors[route.key];
        const label = (options.tabBarLabel ?? options.title ?? route.name) as string;
        const icon = ICONS[route.name] ?? {set: 'ion', on: 'ellipse', off: 'ellipse-outline'};
        const IconCmp = icon.set === 'mci' ? MCI : Ion;
        const color = focused ? colors.text.primary : colors.text.tertiary;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            accessibilityRole="button"
            accessibilityState={{selected: focused}}
            style={styles.tab}>
            <IconCmp name={focused ? icon.on : icon.off} size={23} color={color} />
            <Text
              style={[
                styles.label,
                {color, fontFamily: focused ? fontFamily.bodyBold : fontFamily.bodyRegular},
              ]}>
              {label}
            </Text>
            <View style={focused ? styles.underline : styles.underlineHidden} />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.brand.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border.default,
    paddingTop: 10,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  label: {
    fontSize: 11,
  },
  underline: {
    width: 22,
    height: 2.5,
    borderRadius: 2,
    backgroundColor: colors.brand.pistachio,
  },
  underlineHidden: {
    height: 2.5,
  },
});
