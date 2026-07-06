import React, {useEffect, useRef, useState} from 'react';
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
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {Confetti} from '../../components/Confetti';
import {Shimmer} from '../../components/Shimmer';
import {Dirham} from '../../components/Dirham';
import {useCart} from '../../state/CartContext';
import type {RootStackScreenProps} from '../../navigation/types';
import {colors, fontFamily, radius} from '../../theme';
import { Coin } from '../../components';

/**
 * 26 · Order Success / Enter (Figma 2087:2484)
 * Confetti burst over a centred success stack: pistachio check, Playfair
 * celebration headline, pickup/ready info card, primary + ghost CTAs and a
 * points-earned strip. The live cart summary (item count + subtotal) is
 * captured on first render, then the cart is cleared once so the receipt
 * persists.
 */
export function OrderSuccessScreen({
  navigation,
}: RootStackScreenProps<'OrderSuccess'>) {
  const insets = useSafeAreaInsets();
  const {count, subtotal, clear} = useCart();

  // Snapshot the cart at first render so the summary survives clear().
  const [summary] = useState(() => ({count, subtotal}));

  // Empty the cart exactly once after the snapshot is taken.
  const clearedRef = useRef(false);
  useEffect(() => {
    if (clearedRef.current) {
      return;
    }
    clearedRef.current = true;
    clear();
  }, [clear]);
const confettiY = useRef(new Animated.Value(-220)).current;
const confettiOpacity = useRef(new Animated.Value(1)).current;
const [showConfetti, setShowConfetti] = useState(true);

useEffect(() => {
  Animated.sequence([
Animated.parallel([
  Animated.timing(confettiY, {
    toValue: 720,
    duration: 2600,
    easing: Easing.out(Easing.quad),
    useNativeDriver: true,
  }),
  Animated.timing(confettiOpacity, {
    toValue: 0.35,
    duration: 2600,
    easing: Easing.out(Easing.quad),
    useNativeDriver: true,
  }),
])
      
  ]).start(() => {
    setShowConfetti(false);
  });
}, [confettiY, confettiOpacity]);
  const itemLabel = `${summary.count} ${summary.count === 1 ? 'item' : 'items'}`;

  return (
    <View style={styles.root}>
      <StatusBar
        barStyle="dark-content"
        translucent
        backgroundColor="transparent"
      />


      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          {paddingTop: insets.top + 24, paddingBottom: insets.bottom + 32},
        ]}>
        <View style={styles.stack}>
          {/* Success check */}
          <View style={styles.check}>
            <FontAwesome name="check" size={48} color={colors.text.onButton} />
          </View>

          {/* Headline */}
          <Text style={styles.title}>
            Layla, your craving {'\n'} is in good hands.
          </Text>

          <Text style={styles.subtitle}>
            Karaz kitchen is on it, we'll notify the moment your meal is ready to
            grab.
          </Text>

          {/* Info / receipt card */}
          <View style={styles.card}>
            <View style={styles.cardRow}>
              <View style={styles.cardIcon}>
                <Icon
                  name="location-outline"
                  size={20}
                  color={colors.brand.pistachio}
                />
              </View>
              <View style={styles.cardText}>
                <Text style={styles.cardLabel}>PICKUP LOCATION</Text>
                <Text style={styles.cardValue}>Karaz · Dubai Mall</Text>
                <Text style={styles.cardSub}>Ground Floor · The Avenue</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.cardRow}>
              <View style={styles.cardIcon}>
                <Icon name="time-outline" size={20} color={colors.brand.pistachio} />
              </View>
              <View style={styles.cardText}>
                <Text style={styles.cardLabel}>IT WILL BE READY IN</Text>
                <Text style={styles.cardValue}>15 - 20 min</Text>
                <Text style={styles.cardSub}>Order #CRV-00123</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.cardRow}>
              <View style={styles.cardIcon}>
                <Icon
                  name="receipt-outline"
                  size={20}
                  color={colors.brand.pistachio}
                />
              </View>
              <View style={styles.cardText}>
                <Text style={styles.cardLabel}>ORDER TOTAL</Text>
                <Text style={styles.cardValue}>{itemLabel}</Text>
                <Text style={styles.cardSub}>Paid · ready to grab</Text>
              </View>
              <View style={styles.cardAmount}>
                <Dirham size={15} color={colors.text.primary} />
                <Text style={styles.cardAmountText}>
                  {summary.subtotal.toFixed(2)}
                </Text>
              </View>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <Pressable
              style={styles.primaryBtn}
              accessibilityRole="button"
              onPress={() => navigation.navigate('OrderStatus')}>
              <Text style={styles.primaryBtnText}>Track my order</Text>
              <Shimmer />
            </Pressable>

            <Pressable
              style={styles.ghostBtn}
              accessibilityRole="button"
              onPress={() => navigation.navigate('MainTabs')}>
              <Text style={styles.ghostBtnText}>Back to home</Text>
            </Pressable>
          </View>

          {/* Points earned strip */}
          <View style={styles.pointsStrip}>
           <Coin size={16}  />
            <Text style={styles.pointsText}>
              <Text style={styles.pointsBold}>+12 pts queued</Text>
              <Text> · credits on pickup</Text>
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Confetti falls in front of the content — one-shot on appear (Figma 6522:22021) */}
      {showConfetti ? (
  <Animated.View
    pointerEvents="none"
    style={[
      styles.confettiLayer,
      {
        opacity: confettiOpacity,
        transform: [{translateY: confettiY}],
      },
    ]}>
    <Confetti count={60} />
  </Animated.View>
) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: colors.brand.ivory},
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  stack: {
    alignItems: 'center',
    gap: 14,
  },
  check: {
    width: 96,
    height: 96,
    borderRadius: radius.pill,
    backgroundColor: colors.brand.pistachio,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6b4d1a',
    shadowOpacity: 0.22,
    shadowRadius: 24,
    shadowOffset: {width: 0, height: 8},
    elevation: 6,
  },
  title: {
    fontFamily: fontFamily.displayBoldItalic,
    fontSize: 32,
   // lineHeight: 42,
    color: colors.text.primary,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 14,
    lineHeight: 21,
    color: colors.text.secondary,
    textAlign: 'center',
    alignSelf: 'stretch',
  },
  confettiLayer: {
    width: '100%',
    height: '100%',  
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 99,
},
  card: {
    alignSelf: 'stretch',
    backgroundColor: colors.brand.white,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    shadowColor: '#000000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 2},
    elevation: 1,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  cardIcon: {
    width: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: {flex: 1, gap: 2},
  cardLabel: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 10,
    letterSpacing: 0.8,
    color: colors.text.tertiary,
  },
  cardValue: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 14,
    color: colors.text.primary,
  },
  cardSub: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 12,
    color: colors.text.secondary,
  },
  cardAmount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  cardAmountText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 16,
    color: colors.text.primary,
  },
  divider: {
    height: 1,
    marginHorizontal: 20,
    backgroundColor: colors.border.subtle,
  },
  actions: {
    alignSelf: 'stretch',
    gap: 10,
    marginTop: 4,
  },
  primaryBtn: {
    height: 45,
    borderRadius: radius.pill,
    overflow: 'hidden',
    backgroundColor: colors.brand.pistachio,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    shadowColor: '#6b4d1a',
    shadowOpacity: 0.22,
    shadowRadius: 7,
    shadowOffset: {width: 0, height: 6},
    elevation: 4,
  },
  primaryBtnText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 14,
    color: colors.text.onButton,
  },
  ghostBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  ghostBtnText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 14,
    color: colors.text.secondary,
  },
  pointsStrip: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 36,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(237,199,128,0.22)',
  },
  pointsText: {
    flex: 1,
    fontFamily: fontFamily.bodyRegular,
    fontSize: 13,
    color: colors.brand.navy,
  },
  pointsBold: {
    fontFamily: fontFamily.bodyBold,
  },
});
