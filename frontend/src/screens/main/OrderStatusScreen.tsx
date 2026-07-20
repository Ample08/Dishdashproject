import React, {useState} from 'react';
import {
  Pressable,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import Toast from 'react-native-toast-message';
import {Dirham} from '../../components/Dirham';
import {BRANDS} from '../../data/menu';
import type {RootStackScreenProps} from '../../navigation/types';
import {ORDER_STAGES, STATUS_META, useOrders, type OrderStatus} from '../../state/OrderContext';
import {colors, fontFamily, radius} from '../../theme';
import { Coin } from '../../components';

/**
 * 27 · Order Status (Figma 2149:2542). Status-aware: the navy hero, the chip,
 * and the timeline all reflect the live order status (placed → preparing →
 * ready → picked up). Auto-advances via OrderContext.
 */
const TIMELINE: {key: OrderStatus; title: string; sub: string}[] = [
  {key: 'placed', title: 'Order placed', sub: '9:41 AM'},
  {key: 'preparing', title: 'Preparing your order', sub: 'in progress'},
  {key: 'ready', title: 'Ready for pickup', sub: '~9:53 AM'},
  {key: 'pickedup', title: 'Picked up', sub: 'completed'},
];

export function OrderStatusScreen({navigation}: RootStackScreenProps<'OrderStatus'>) {
  const insets = useSafeAreaInsets();
  const {active} = useOrders();
  const [summaryOpen, setSummaryOpen] = useState(false);

  // No live order → real empty state (no fake summary/total/ref).
  if (!active) {
    return (
      <View style={styles.root}>
        <StatusBar barStyle="dark-content" />
        <View style={[styles.topBar, {paddingTop: insets.top + 8}]}>
          <Pressable
            style={styles.iconBtn}
            hitSlop={8}
            accessibilityLabel="Back"
            onPress={() => navigation.navigate('MainTabs')}>
            <Icon name="chevron-back" size={24} color={colors.text.primary} />
          </Pressable>
          <Text style={styles.topTitle}>Order</Text>
          <View style={styles.iconBtn} />
        </View>
        <View style={styles.emptyWrap}>
          <Icon name="receipt-outline" size={40} color={colors.text.tertiary} />
          <Text style={styles.emptyText}>No active order right now.</Text>
        </View>
      </View>
    );
  }

  const status: OrderStatus = active.status;
  const meta = STATUS_META[status];
  const cur = ORDER_STAGES.indexOf(status);
  const brand = BRANDS[active.brand];
  const total = active.total;
  const items = active.items;
  const itemCount = active.itemCount;
  const orderId = active.id;
  const pointsEarned = Math.max(0, Math.floor(total / 5));

  const handleDownloadInvoice = async () => {
    const lines = items
      .map(it => `  ${it.qty}× ${it.name}${' '.repeat(Math.max(1, 28 - it.name.length))}AED ${it.price}`)
      .join('\n');
    const invoice =
      `FLAVOURS BY DISH DASH\n` +
      `Tax Invoice\n` +
      `--------------------------------\n` +
      `Order #${orderId}\n` +
      `${brand.name} · ${brand.branch}\n\n` +
      `${lines}\n` +
      `--------------------------------\n` +
      `Total (incl. VAT)         AED ${total.toFixed(2)}\n\n` +
      `Thank you for your order!`;
    try {
      await Share.share({message: invoice, title: `Invoice ${orderId}`});
    } catch {
      Toast.show({type: 'error', text1: 'Could not open invoice'});
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />

      {/* Top bar */}
      <View style={[styles.topBar, {paddingTop: insets.top + 8}]}>
        <Pressable
          style={styles.iconBtn}
          hitSlop={8}
          accessibilityLabel="Back"
          onPress={() => navigation.navigate('MainTabs')}>
          <Icon name="chevron-back" size={24} color={colors.text.primary} />
        </Pressable>
        <Text style={styles.topTitle}>Order #{orderId}</Text>
        <Pressable style={styles.helpBtn} hitSlop={8}>
          <Text style={styles.helpText}>Help</Text>
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, {paddingBottom: insets.bottom + 100}]}>
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroChip}>
            <View style={styles.heroDot} />
            <Text style={styles.heroChipText}>{meta.chip}</Text>
          </View>
          <View style={styles.heroBody}>
            <View style={styles.heroTextCol}>
              <Text style={styles.heroTitle}>{meta.heroTitle}</Text>
              <Text style={styles.heroSub}>{meta.heroSub}</Text>
            </View>
            <Icon name="restaurant-outline" size={44} color={colors.brand.pistachio} />
          </View>
        </View>

        {/* Points strip */}
        <View style={styles.points}>
        <Coin size={16}  />
          <Text style={styles.pointsText}>
            <Text style={styles.pointsBold}>+{pointsEarned} pts</Text> queued · credits on pickup
          </Text>
        </View>

        {/* Timeline */}
        <View style={styles.card}>
          {TIMELINE.map((step, i) => {
            const done = i < cur;
            const activeStep = i === cur;
            const last = i === TIMELINE.length - 1;
            return (
              <View key={step.key} style={styles.stepRow}>
                <View style={styles.stepLeft}>
                  <View
                    style={[
                      styles.node,
                      done && styles.nodeDone,
                      activeStep && styles.nodeActive,
                    ]}>
                    {done ? (
                      <Icon name="checkmark" size={13} color={colors.brand.white} />
                    ) : activeStep ? (
                      <View style={styles.nodeActiveDot} />
                    ) : null}
                  </View>
                  {!last ? (
                    <View style={[styles.connector, done && styles.connectorDone]} />
                  ) : null}
                </View>
                <View style={styles.stepText}>
                  <Text
                    style={[
                      styles.stepTitle,
                      !done && !activeStep && styles.stepTitleMuted,
                    ]}>
                    {step.title}
                  </Text>
                  <Text style={styles.stepSub}>{step.sub}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Pickup card */}
        <View style={styles.rowCard}>
          <View style={styles.rowIcon}>
            <Icon name="location-outline" size={18} color={colors.brand.navy} />
          </View>
          <View style={styles.rowText}>
            <Text style={styles.rowEyebrow}>PICKUP AT</Text>
            <Text style={styles.rowTitle}>
              {brand.name} · {brand.branch}
            </Text>
            <Text style={styles.rowSub}>{brand.address}</Text>
          </View>
          <Pressable style={styles.rowAction} hitSlop={6}>
            <Text style={styles.rowActionText}>Directions</Text>
            <Icon name="arrow-forward" size={14} color={colors.brand.navy} />
          </Pressable>
        </View>

        {/* Invite card */}
        <View style={styles.rowCard}>
          <View style={styles.rowIcon}>
            <Icon name="people" size={18} color={colors.brand.navy} />
          </View>
          <View style={styles.rowText}>
            <Text style={styles.rowTitle}>Invite a friend, both earn points</Text>
            <Text style={styles.rowSub}>When they place their first order</Text>
          </View>
          <Pressable style={styles.inviteBtn} hitSlop={6}>
            <Text style={styles.inviteText}>Invite</Text>
          </Pressable>
        </View>

        {/* Order summary (expandable) */}
        <View style={styles.summary}>
          <Pressable
            style={styles.summaryHeader}
            onPress={() => setSummaryOpen(o => !o)}
            accessibilityRole="button">
            <View>
              <Text style={styles.rowEyebrow}>ORDER SUMMARY</Text>
              <Text style={styles.summaryItems}>{itemCount} items</Text>
            </View>
            <View style={styles.summaryRight}>
              <Dirham size={14} color={colors.text.primary} />
              <Text style={styles.summaryTotal}>{total.toFixed(2)}</Text>
              <Icon
                name={summaryOpen ? 'chevron-up' : 'chevron-down'}
                size={16}
                color={colors.text.tertiary}
              />
            </View>
          </Pressable>

          {summaryOpen ? (
            <View style={styles.summaryItemsList}>
              {items.map((it, i) => (
                <View key={`${it.name}-${i}`} style={styles.summaryItemRow}>
                  <View style={styles.summaryItemLeft}>
                    <Text style={styles.summaryQty}>{it.qty}×</Text>
                    <Text style={styles.summaryItemName}>{it.name}</Text>
                  </View>
                  <View style={styles.summaryPriceRow}>
                    <Dirham size={12} color={colors.text.primary} />
                    <Text style={styles.summaryItemPrice}>{it.price}</Text>
                  </View>
                </View>
              ))}
            </View>
          ) : null}

          {/* Divider + Download invoice — always visible (Figma SummaryCard) */}
          <View style={styles.summaryDivider} />
          <Pressable
            style={styles.invoiceRow}
            accessibilityRole="button"
            onPress={handleDownloadInvoice}>
            <Icon name="download-outline" size={18} color={colors.text.primary} />
            <Text style={styles.invoiceText}>Download invoice</Text>
            <Icon name="arrow-forward" size={16} color={colors.text.tertiary} />
          </Pressable>
        </View>
      </ScrollView>

      {/* Done */}
      {/* <View style={[styles.doneBar, {paddingBottom: insets.bottom + 12}]}>
        <Pressable style={styles.doneBtn} onPress={() => navigation.navigate('MainTabs')}>
          <Text style={styles.doneText}>Done</Text>
        </Pressable>
      </View> */}
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
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTitle: {fontFamily: fontFamily.bodyBold, fontSize: 18, color: colors.text.primary},
  emptyWrap: {flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingBottom: 80},
  emptyText: {fontFamily: fontFamily.bodyMedium, fontSize: 14, color: colors.text.secondary},
  helpBtn: {
    backgroundColor: colors.brand.white,
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  helpText: {fontFamily: fontFamily.bodyBold, fontSize: 13, color: colors.text.primary},

  scroll: {paddingHorizontal: 20, paddingTop: 8, gap: 12},

  hero: {
    backgroundColor: colors.brand.navy,
    borderRadius: 20,
    padding: 20,
    gap: 16,
  },
  heroChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  heroDot: {width: 7, height: 7, borderRadius: 3.5, backgroundColor: colors.brand.pistachio},
  heroChipText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 11,
    letterSpacing: 0.8,
    color: colors.brand.pistachio,
  },
  heroBody: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12},
  heroTextCol: {flex: 1, gap: 6},
  heroTitle: {
    fontFamily: fontFamily.displayBold,
    fontSize: 30,
    lineHeight: 34,
    color: colors.brand.white,
  },
  heroSub: {fontFamily: fontFamily.bodyRegular, fontSize: 13, color: 'rgba(249,240,234,0.7)'},

  points: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 40,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(237,199,128,0.3)',
  },
  pointsText: {fontFamily: fontFamily.bodyRegular, fontSize: 13, color: colors.brand.navy},
  pointsBold: {fontFamily: fontFamily.bodyBold},

  card: {
    backgroundColor: colors.brand.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  stepRow: {flexDirection: 'row', gap: 14},
  stepLeft: {alignItems: 'center', width: 24},
  node: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeDone: {backgroundColor: colors.brand.pistachio, borderColor: colors.brand.pistachio},
  nodeActive: {borderColor: colors.brand.pistachio},
  nodeActiveDot: {width: 10, height: 10, borderRadius: 5, backgroundColor: colors.brand.pistachio},
  connector: {
    width: 2,
    flex: 1,
    minHeight: 22,
    backgroundColor: colors.border.default,
    marginVertical: 2,
  },
  connectorDone: {backgroundColor: colors.brand.pistachio},
  stepText: {flex: 1, paddingBottom: 18, gap: 2},
  stepTitle: {fontFamily: fontFamily.bodyBold, fontSize: 14, color: colors.text.primary},
  stepTitleMuted: {color: colors.text.tertiary},
  stepSub: {fontFamily: fontFamily.bodyRegular, fontSize: 12, color: colors.text.secondary},

  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.brand.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.brand.pistachio,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {flex: 1, gap: 2},
  rowEyebrow: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 10,
    letterSpacing: 0.8,
    color: colors.text.tertiary,
  },
  rowTitle: {fontFamily: fontFamily.bodyBold, fontSize: 14, color: colors.text.primary},
  rowSub: {fontFamily: fontFamily.bodyRegular, fontSize: 11, color: colors.text.secondary},
  rowAction: {flexDirection: 'row', alignItems: 'center', gap: 4},
  rowActionText: {fontFamily: fontFamily.bodyBold, fontSize: 13, color: colors.brand.navy},
  inviteBtn: {
    borderWidth: 1.5,
    borderColor: colors.brand.navy,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  inviteText: {fontFamily: fontFamily.bodyBold, fontSize: 13, color: colors.brand.navy},

  summary: {
    backgroundColor: colors.brand.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryItems: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 15,
    color: colors.text.primary,
    marginTop: 2,
  },
  summaryRight: {flexDirection: 'row', alignItems: 'center', gap: 6},
  summaryTotal: {fontFamily: fontFamily.bodyBold, fontSize: 16, color: colors.text.primary},
  summaryItemsList: {paddingTop: 12},
  summaryDivider: {
    height: 1,
    backgroundColor: colors.border.subtle,
    marginVertical: 12,
  },
  summaryItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  summaryItemLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  summaryQty: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 13,
    color: colors.text.tertiary,
  },
  summaryItemName: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 14,
    color: colors.text.primary,
  },
  summaryPriceRow: {flexDirection: 'row', alignItems: 'center', gap: 4},
  summaryItemPrice: {fontFamily: fontFamily.bodyBold, fontSize: 14, color: colors.text.primary},
  invoiceRow: {flexDirection: 'row', alignItems: 'center', gap: 10},
  invoiceText: {
    flex: 1,
    fontFamily: fontFamily.bodyBold,
    fontSize: 14,
    color: colors.text.primary,
  },

  doneBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.brand.white,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  doneBtn: {
    height: 54,
    borderRadius: radius.pill,
    backgroundColor: colors.brand.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneText: {fontFamily: fontFamily.bodyBold, fontSize: 16, color: colors.brand.ivory},
});
