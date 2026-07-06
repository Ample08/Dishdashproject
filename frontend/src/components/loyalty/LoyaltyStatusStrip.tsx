import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Svg, {
  Defs,
  Ellipse,
  LinearGradient,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';
import { loyaltyColors } from '../../data/loyalty';
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
      <StripAurora />
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

function StripAurora() {
  const drift = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(drift, {
          toValue: 1,
          duration: 3600,
          useNativeDriver: true,
        }),
        Animated.timing(drift, {
          toValue: 0,
          duration: 3600,
          useNativeDriver: true,
        }),
      ]),
    );

    loop.start();
    return () => loop.stop();
  }, [drift]);

  const glowStyle = {
    transform: [
      {
        translateX: drift.interpolate({
          inputRange: [0, 1],
          outputRange: [-22, 22],
        }),
      },
    ],
    opacity: drift.interpolate({
      inputRange: [0, 1],
      outputRange: [0.72, 1],
    }),
  };

  return (
    <View style={styles.aurora} pointerEvents="none">
      <Svg width="100%" height="100%" preserveAspectRatio="none">
        <Defs>
          <LinearGradient id="stripBase" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={loyaltyColors.bgTop} />
            <Stop offset="1" stopColor={colors.brand.navy} />
          </LinearGradient>
          <RadialGradient id="stripMint" cx="0.5" cy="0.5" r="0.5">
            <Stop
              offset="0"
              stopColor={loyaltyColors.auroraMint}
              stopOpacity="0.72"
            />
            <Stop
              offset="1"
              stopColor={loyaltyColors.auroraMint}
              stopOpacity="0"
            />
          </RadialGradient>
          <RadialGradient id="stripGold" cx="0.5" cy="0.5" r="0.5">
            <Stop
              offset="0"
              stopColor={loyaltyColors.auroraGold}
              stopOpacity="0.62"
            />
            <Stop
              offset="1"
              stopColor={loyaltyColors.auroraGold}
              stopOpacity="0"
            />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#stripBase)" />
      </Svg>
      <Animated.View style={[styles.glow, glowStyle]}>
        <Svg width="100%" height="100%" preserveAspectRatio="none">
          <Ellipse cx="28%" cy="8%" rx="190" ry="74" fill="url(#stripMint)" />
          <Ellipse cx="78%" cy="28%" rx="142" ry="70" fill="url(#stripGold)" />
        </Svg>
      </Animated.View>
      <View style={styles.scrim} />
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
  aurora: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  glow: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  scrim: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(6,20,22,0.32)',
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
