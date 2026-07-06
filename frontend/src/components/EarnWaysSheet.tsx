import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {colors, fontFamily} from '../theme';

/**
 * Earn Ways Sheet · Hi-Fi (Figma 2597:3270) — "Ways to earn points": three
 * champagne quest cards, each with an icon, copy, and a secondary CTA.
 * Rendered as BottomSheet children (grabber/padding come from BottomSheet).
 */
type Quest = {icon: string; title: string; sub: string; cta: string; action?: 'findBranch'};

const QUESTS: Quest[] = [
  {
    icon: 'restaurant-outline',
    title: 'Dine in at any branch',
    sub: '5 AED spent = 1 pt',
    cta: 'Find branch',
    action: 'findBranch',
  },
  {
    icon: 'bag-handle-outline',
    title: 'Order food earn pts',
    sub: '5 AED spent on the app = 1 pt',
    cta: 'Browse menu',
  },
  {
    icon: 'people-outline',
    title: 'Refer a friend',
    sub: 'Both earn 100 pts when they dine',
    cta: 'Invite',
  },
];

export function EarnWaysSheet({
  onClose,
  onFindBranch,
}: {
  onClose: () => void;
  onFindBranch?: () => void;
}) {
  return (
    <View>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>Ways to earn points</Text>
          <Text style={styles.subtitle}>Earn points to climb tiers and unlock more.</Text>
        </View>
        <Pressable style={styles.close} onPress={onClose} accessibilityLabel="Close">
          <Icon name="close" size={16} color={colors.text.secondary} />
        </Pressable>
      </View>

      <View style={styles.list}>
        {QUESTS.map(q => (
          <View key={q.title} style={styles.card}>
            <View style={styles.iconCircle}>
              <Icon name={q.icon} size={20} color={colors.brand.navy} />
            </View>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>{q.title}</Text>
              <Text style={styles.cardSub}>{q.sub}</Text>
            </View>
            <Pressable
              style={styles.cta}
              onPress={q.action === 'findBranch' ? onFindBranch : onClose}
              accessibilityRole="button">
              <Text style={styles.ctaText}>{q.cta}</Text>
            </Pressable>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingBottom: 16,
  },
  headerText: {flex: 1, gap: 4},
  title: {
    fontFamily: fontFamily.displayBlack,
    fontSize: 23,
    color: colors.brand.navy,
  },
  subtitle: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 13,
    color: 'rgba(28,36,48,0.6)',
  },
  close: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f5f5f7',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  list: {gap: 10},
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.brand.champagne,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    borderRadius: 14,
    paddingLeft: 14,
    paddingRight: 12,
    paddingVertical: 14,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.brand.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: {flex: 1, gap: 2},
  cardTitle: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 13,
    color: colors.brand.navy,
  },
  cardSub: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 12,
    color: 'rgba(28,36,48,0.65)',
  },
  cta: {
    backgroundColor: colors.brand.white,
    borderWidth: 1.5,
    borderColor: colors.brand.navy,
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  ctaText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 13,
    color: colors.brand.navy,
  },
});
