import React, {useCallback, useState} from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import {Dirham} from '../../components/Dirham';
import {BRANDS} from '../../data/menu';
import type {RootStackScreenProps} from '../../navigation/types';
import {fetchOrders} from '../../services/orderService';
import {STATUS_META, type ActiveOrder} from '../../state/OrderContext';
import {useAuth} from '../../state/AuthContext';
import {colors, fontFamily, radius} from '../../theme';

/**
 * My Orders — the signed-in user's order history (GET /api/app/orders).
 * Read-only list; the live/active order is tracked separately on Order Status.
 */
export function MyOrdersScreen({navigation}: RootStackScreenProps<'MyOrders'>) {
  const insets = useSafeAreaInsets();
  const {token} = useAuth();
  const [orders, setOrders] = useState<ActiveOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (!token) {
        setOrders([]);
        setLoading(false);
        return;
      }
      let cancelled = false;
      setLoading(true);
      fetchOrders()
        .then(list => {
          if (!cancelled) setOrders(list);
        })
        .catch(() => {})
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
      return () => {
        cancelled = true;
      };
    }, [token]),
  );

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />
      <View style={[styles.topBar, {paddingTop: insets.top + 8}]}>
        <Pressable
          style={styles.iconBtn}
          hitSlop={8}
          accessibilityLabel="Back"
          onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={24} color={colors.text.primary} />
        </Pressable>
        <Text style={styles.topTitle}>My Orders</Text>
        <View style={styles.iconBtn} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.brand.navy} />
        </View>
      ) : orders.length === 0 ? (
        <View style={styles.center}>
          <Icon name="receipt-outline" size={40} color={colors.text.tertiary} />
          <Text style={styles.emptyText}>You haven’t placed any orders yet.</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scroll,
            {paddingBottom: insets.bottom + 24},
          ]}>
          {orders.map(order => (
            <OrderCard key={order.id} order={order} />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

function OrderCard({order}: {order: ActiveOrder}) {
  const brand = BRANDS[order.brand];
  const meta = STATUS_META[order.status];
  return (
    <View style={styles.card}>
      <View style={styles.cardHead}>
        <Text style={styles.brand}>
          {brand?.name ?? order.brand}
          {order.branch ? ` · ${order.branch}` : ''}
        </Text>
        <View style={[styles.statusPill, meta.ready && styles.statusReady]}>
          <Text style={[styles.statusText, meta.ready && styles.statusTextReady]}>
            {meta.chip}
          </Text>
        </View>
      </View>
      <Text style={styles.ref}>#{order.id}</Text>
      <View style={styles.cardFoot}>
        <Text style={styles.items}>{order.itemCount} items</Text>
        <View style={styles.totalRow}>
          <Dirham size={12} color={colors.text.primary} />
          <Text style={styles.total}>{order.total.toFixed(2)}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: colors.brand.ivory},
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  iconBtn: {width: 40, height: 40, alignItems: 'center', justifyContent: 'center'},
  topTitle: {fontFamily: fontFamily.bodyBold, fontSize: 18, color: colors.text.primary},
  center: {flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingBottom: 80},
  emptyText: {fontFamily: fontFamily.bodyMedium, fontSize: 14, color: colors.text.secondary},
  scroll: {paddingHorizontal: 20, paddingTop: 8, gap: 12},
  card: {
    backgroundColor: colors.brand.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 8,
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  brand: {flex: 1, fontFamily: fontFamily.bodyBold, fontSize: 14, color: colors.text.primary},
  statusPill: {
    backgroundColor: colors.surface.input,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusReady: {backgroundColor: colors.brand.pistachio},
  statusText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 9,
    letterSpacing: 0.6,
    color: colors.text.secondary,
  },
  statusTextReady: {color: colors.brand.navy},
  ref: {fontFamily: fontFamily.bodyRegular, fontSize: 12, color: colors.text.secondary},
  cardFoot: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  items: {fontFamily: fontFamily.bodyRegular, fontSize: 13, color: colors.text.secondary},
  totalRow: {flexDirection: 'row', alignItems: 'center', gap: 4},
  total: {fontFamily: fontFamily.bodyBold, fontSize: 15, color: colors.text.primary},
});
