import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import {LoyaltyHeader} from '../../components/loyalty/LoyaltyHeader';
import {POINT_HISTORY, loyaltyColors} from '../../data/loyalty';
import type {RootStackScreenProps} from '../../navigation/types';
import {useLoyalty} from '../../state/LoyaltyContext';
import {colors, fontFamily} from '../../theme';

type Filter = 'All' | 'Earned' | 'Spent';

function FlippingCoin() {
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(1600),
        Animated.timing(spin, {
          toValue: 1,
          duration: 1300,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(spin, {toValue: 0, duration: 0, useNativeDriver: true}),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [spin]);

  const rotateX = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={[styles.coinFlip, {transform: [{perspective: 600}, {rotateX}]}]}>
      <View style={styles.coin}>
        <Icon name="star" size={16} color={colors.brand.navy} />
      </View>
    </Animated.View>
  );
}

/** 39 · Point History (Figma 3950:6) — balance + filterable transaction list. */
export function PointHistoryScreen({
  navigation,
}: RootStackScreenProps<'PointHistory'>) {
  const insets = useSafeAreaInsets();
  const {points} = useLoyalty();
  const [filter, setFilter] = useState<Filter>('All');

  const rows = useMemo(
    () =>
      POINT_HISTORY.filter(p =>
        filter === 'Earned' ? p.delta > 0 : filter === 'Spent' ? p.delta < 0 : true,
      ),
    [filter],
  );

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
     
      <LoyaltyHeader title="Point History" onBack={navigation.goBack} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, {paddingBottom: insets.bottom + 24}]}>
        {/* Balance */}
        <View style={styles.balance}>
          <Text style={styles.balLabel}>CURRENT BALANCE</Text>
          <View style={styles.balRow}>
            <FlippingCoin />
            <Text style={styles.balValue}>{points.toLocaleString()}</Text>
            <Text style={styles.balUnit}>pts</Text>
          </View>
          <View style={styles.resetRow}>
            <Icon name="alert-circle-outline" size={13} color="rgba(255,255,255,0.6)" />
            <Text style={styles.reset}>Resets in 47 days · 21 Jul 2026</Text>
          </View>
        </View>

        {/* Filters */}
        <View style={styles.filters}>
          {(['All', 'Earned', 'Spent'] as Filter[]).map(f => (
            <Pressable
              key={f}
              style={[styles.filter, filter === f ? styles.filterOn : styles.filterIdle]}
              onPress={() => setFilter(f)}>
              <Text style={[styles.filterText, filter === f && styles.filterTextOn]}>
                {f}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Transactions */}
        <View style={styles.list}>
          {rows.map(p => (
            <View key={p.id} style={styles.row}>
              <View
                style={[
                  styles.rowIcon,
                  p.delta > 0 ? styles.iconEarnedBg : styles.iconSpentBg,
                ]}>
                <Icon
                  name={p.icon}
                  size={18}
                  color={p.delta > 0 ? colors.brand.pistachio : colors.brand.champagne}
                />
              </View>
              <View style={styles.rowText}>
                <Text style={styles.rowTitle}>{p.title}</Text>
                <Text style={styles.rowSub}>{p.sub}</Text>
              </View>
              <Text style={[styles.delta, p.delta > 0 ? styles.earned : styles.spent]}>
                {p.delta > 0 ? `+${p.delta}` : p.delta}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: loyaltyColors.bgall},
  scroll: {paddingHorizontal: 20, paddingTop: 16},

  balance: {
    borderRadius: 18,
    borderWidth: 1,
   borderColor: loyaltyColors.chipBorder, backgroundColor: loyaltyColors.chipBg,
    padding: 18,
  },
  balLabel: {fontFamily: fontFamily.bodyBold, fontSize: 11, letterSpacing: 0.8, color: 'rgba(255,255,255,0.6)'},
  balRow: {flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8},
  coin: {width: 32, height: 32, borderRadius: 16, backgroundColor: '#f0b429', alignItems: 'center', justifyContent: 'center'},
  coinFlip: {width: 32, height: 32, alignItems: 'center', justifyContent: 'center'},
  balValue: {fontFamily: fontFamily.bodyBlack, fontSize: 32, color: colors.brand.champagne},
  balUnit: {fontFamily: fontFamily.bodyMedium, fontSize: 14, color: 'rgba(255,255,255,0.7)'},
  resetRow: {flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10},
  reset: {fontFamily: fontFamily.bodyMedium, fontSize: 12, color: 'rgba(255,255,255,0.6)'},

  filters: {flexDirection: 'row', gap: 10, marginTop: 20},
  filter: {borderRadius: 999, paddingHorizontal: 18, paddingVertical: 8},
  filterOn: {backgroundColor: colors.brand.champagne},
  filterIdle: {borderWidth: 1, borderColor: loyaltyColors.chipBorder, backgroundColor: loyaltyColors.chipBg},
  filterText: {fontFamily: fontFamily.bodyBold, fontSize: 13, color: colors.brand.white},
  filterTextOn: {color: colors.brand.navy},

  list: {marginTop: 16},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEarnedBg: {backgroundColor: 'rgba(158,211,135,0.18)'}, // pistachio tint (Figma)
  iconSpentBg: {backgroundColor: 'rgba(255,239,203,0.18)'}, // champagne tint (Figma)
  rowText: {flex: 1},
  rowTitle: {fontFamily: fontFamily.bodyBold, fontSize: 14, color: colors.brand.white},
  rowSub: {fontFamily: fontFamily.bodyRegular, fontSize: 12, color: colors.brand.white, marginTop: 2},
  delta: {fontFamily: fontFamily.bodyBold, fontSize: 15},
  earned: {color: colors.brand.pistachio},
  spent: {color: colors.brand.champagne},
});
