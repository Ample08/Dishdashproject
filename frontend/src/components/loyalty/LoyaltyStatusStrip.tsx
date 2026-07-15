import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, fontFamily } from '../../theme';

/**
 * StatusStrip (Figma 3908) - floating active-booking reminder above the tab bar.
 */
export function LoyaltyStatusStrip({
  title,
  subtitle,
  items,
  onView,
  onClose,
}: {
  title: string;
  subtitle: string;
  items?: { title: string; subtitle: string }[];
  onView?: () => void;
  onClose?: () => void;
}) {
  const slides = items?.length ? items : [{ title, subtitle }];
  const [active, setActive] = useState(0);
  const slide = slides[active] ?? slides[0];
  const anim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (slides.length <= 1) {
      return;
    }

    const timer = setInterval(() => {
      Animated.timing(anim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }).start(() => {
        setActive(index => (index + 1) % slides.length);
        anim.setValue(0);
        Animated.timing(anim, {
          toValue: 1,
          duration: 260,
          useNativeDriver: true,
        }).start();
      });
    }, 2600);

    return () => clearInterval(timer);
  }, [anim, slides.length]);

  const slideStyle = {
    opacity: anim,
    transform: [
      {
        translateX: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [14, 0],
        }),
      },
    ],
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.strip}>
        <View style={styles.left}>
          <View style={styles.iconBg}>
            <Icon name="calendar-outline" size={18} color={colors.brand.navy} />
          </View>

          <Animated.View style={[styles.copy, slideStyle]}>
            <Text style={styles.title} numberOfLines={1}>
              {slide.title}
            </Text>
            <Text style={styles.sub} numberOfLines={1}>
              {slide.subtitle}
            </Text>
          </Animated.View>
        </View>

        <View style={styles.right}>
          <Pressable
            style={styles.viewBtn}
            onPress={onView}
            accessibilityRole="button"
          >
            <Text style={styles.viewText}>View</Text>
            <Icon name="arrow-forward" size={13} color={colors.brand.navy} />
          </Pressable>
          <Pressable
            style={styles.closeBtn}
            onPress={onClose}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Dismiss"
          >
            <Icon name="close" size={18} color="rgba(249,240,234,0.7)" />
          </Pressable>
        </View>
      </View>

      <View style={styles.dots}>
        {slides.map((item, index) => (
          <View
            key={`${item.title}-${index}`}
            style={[styles.dot, index === active && styles.dotActive]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
    backgroundColor: colors.brand.navy,
    paddingLeft: 16,
    paddingRight: 14,
    paddingVertical: 12,
    gap: 8,
  },
  strip: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  left: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.brand.pistachio,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 13,
    lineHeight: 17,
    color: colors.brand.ivory,
  },
  sub: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: 11,
    lineHeight: 15,
    color: 'rgba(249,240,234,0.78)',
    marginTop: 1,
  },
  right: {
    flexShrink: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  viewBtn: {
    minWidth: 70,
    height: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: colors.brand.pistachio,
    borderRadius: 999,
    paddingHorizontal: 13,
  },
  viewText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 12,
    color: colors.brand.navy,
  },
  closeBtn: {
    width: 24,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dots: {
    flexDirection: 'row',
    alignSelf: 'center',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(249,240,234,0.3)',
  },
  dotActive: {
    width: 8,
    backgroundColor: colors.brand.pistachio,
  },
});
