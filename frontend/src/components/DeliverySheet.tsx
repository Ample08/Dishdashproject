import React from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import {colors, fontFamily} from '../theme';

/**
 * 22 · Delivery Partners (Figma 6522:21646) — "Prefer delivery?" full-screen
 * modal shown when the Delivery toggle is tapped on the Brand Page. Ivory
 * background, close button top-right, and the partner list on white cards.
 */
type Partner = {name: string; bg: string; fg: string};

const PARTNERS: Partner[] = [
  {name: 'talabat', bg: '#ff5a00', fg: '#ffffff'},
  {name: 'Careem', bg: '#1d8e3f', fg: '#ffffff'},
  {name: 'noon', bg: '#feee00', fg: '#1c2330'},
  {name: 'Deliveroo', bg: '#00ccbc', fg: '#ffffff'},
  {name: 'keeta', bg: '#fbd000', fg: '#1c2330'},
];

export function DeliverySheet({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      statusBarTranslucent
      onRequestClose={onClose}>
      <View style={[styles.root, {paddingTop: insets.top}]}>
        <StatusBar barStyle="dark-content" />

        <View style={styles.topBar}>
          <Pressable style={styles.close} onPress={onClose} accessibilityLabel="Close">
            <Icon name="close" size={20} color={colors.brand.ivory} />
          </Pressable>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.content,
            {paddingBottom: insets.bottom + 24},
          ]}>
          <Text style={styles.eyebrow}>DELIVERY</Text>
          <Text style={styles.title}>Prefer delivery?</Text>
          <Text style={styles.subtitle}>
            Karaz menu lives on our delivery partners. Pick one to order food
            straight to your doorstep.
          </Text>

          <Text style={styles.sectionLabel}>OUR PARTNERS</Text>

          <View style={styles.list}>
            {PARTNERS.map(p => (
              <View key={p.name} style={styles.row}>
                <View style={[styles.logo, {backgroundColor: p.bg}]}>
                  <Text style={[styles.logoText, {color: p.fg}]} numberOfLines={1}>
                    {p.name}
                  </Text>
                </View>
                <Text style={styles.partnerName}>
                  {p.name.charAt(0).toUpperCase() + p.name.slice(1)}
                </Text>
                <Pressable
                  style={styles.orderBtn}
                  onPress={onClose}
                  accessibilityRole="button">
                  <Text style={styles.orderText}>Order now</Text>
                </Pressable>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.brand.ivory,
  },
  topBar: {
    height: 48,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  close: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.brand.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  eyebrow: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 11,
    letterSpacing: 1.4,
    color: colors.brand.teal,
  },
  title: {
    fontFamily: fontFamily.displayBlack,
    fontSize: 30,
    color: colors.text.primary,
    marginTop: 10,
  },
  subtitle: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.text.secondary,
    marginTop: 8,
  },
  sectionLabel: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 11,
    letterSpacing: 1.4,
    color: colors.text.tertiary,
    marginTop: 24,
    marginBottom: 12,
  },
  list: {gap: 12},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.brand.white,
    borderRadius: 14,
    padding: 12,
    shadowColor: 'rgba(13,33,43,1)',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 2},
    elevation: 1,
  },
  logo: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  logoText: {
    fontFamily: fontFamily.bodyBlack,
    fontSize: 12,
  },
  partnerName: {
    flex: 1,
    fontFamily: fontFamily.bodyBold,
    fontSize: 15,
    color: colors.text.primary,
  },
  orderBtn: {
    borderWidth: 1.5,
    borderColor: colors.brand.navy,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  orderText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 13,
    color: colors.brand.navy,
  },
});
