import React, {useEffect, useRef, useState} from 'react';
import {
  Image,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  Easing,
  interpolate,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, {Path} from 'react-native-svg';
import Icon from 'react-native-vector-icons/Ionicons';
import type {Branch} from '../data/reservations';
import {colors, fontFamily} from '../theme';

const AText = Animated.createAnimatedComponent(Text);

const TAB_H = 58;
const FIGMA_W = 342;
const FIGMA_H = 412;
const TOP_RADIUS = 20;
const DUR = 380;
const EASE = Easing.bezier(0.22, 1, 0.36, 1);
const GALLERY_H = 184;
const AUTO_MS = 2800;
const FACT_MS = 2600;
const CLOTH_PATH =
  'M19.002 2H322.999C327.695 2 332.113 3.3092 335.289 5.53027V5.53125C338.458 7.74755 340 10.5714 340 13.2871L339.999 409.967C331.056 409.681 326.347 407.48 321.469 405.205C316.013 402.661 310.362 400.035 299.255 400.035C288.148 400.035 282.494 402.661 277.037 405.205C271.806 407.644 266.771 410 256.509 410C246.247 410 241.212 407.644 235.98 405.205C230.523 402.661 224.868 400.035 213.758 400.035C202.647 400.035 196.994 402.661 191.537 405.205C186.306 407.644 181.271 410 171.006 410C160.741 410 155.707 407.644 150.476 405.205C145.019 402.661 139.365 400.035 128.255 400.035C117.144 400.035 111.491 402.661 106.034 405.205C100.803 407.644 95.7681 410 85.5029 410C75.2381 410 70.2036 407.644 64.9727 405.205C59.516 402.661 53.8623 400.035 42.752 400.035C31.6413 400.035 25.987 402.661 20.5303 405.205C15.6508 407.48 10.9422 409.681 2 409.967L2.00098 13.2871C2.00102 10.5714 3.54286 7.74755 6.71191 5.53125C9.88806 3.31017 14.3055 2 19.002 2Z';
const ROUNDER_CLOTH_PATH =
  'M20 2H320C331.046 2 340 10.954 340 22L339.999 409.967C331.056 409.681 326.347 407.48 321.469 405.205C316.013 402.661 310.362 400.035 299.255 400.035C288.148 400.035 282.494 402.661 277.037 405.205C271.806 407.644 266.771 410 256.509 410C246.247 410 241.212 407.644 235.98 405.205C230.523 402.661 224.868 400.035 213.758 400.035C202.647 400.035 196.994 402.661 191.537 405.205C186.306 407.644 181.271 410 171.006 410C160.741 410 155.707 407.644 150.476 405.205C145.019 402.661 139.365 400.035 128.255 400.035C117.144 400.035 111.491 402.661 106.034 405.205C100.803 407.644 95.7681 410 85.5029 410C75.2381 410 70.2036 407.644 64.9727 405.205C59.516 402.661 53.8623 400.035 42.752 400.035C31.6413 400.035 25.987 402.661 20.5303 405.205C15.6508 407.48 10.9422 409.681 2 409.967L2 22C2 10.954 10.954 2 20 2Z';
function FactTicker({lines, active}: {lines: string[]; active: boolean}) {
  const [i, setI] = useState(0);
  const op = useSharedValue(1);

  useEffect(() => {
    if (!active || lines.length < 2) {
      return;
    }
    const timer = setInterval(() => {
      op.value = withTiming(0, {duration: 200});
      setTimeout(() => {
        setI(prev => (prev + 1) % lines.length);
        op.value = withTiming(1, {duration: 260});
      }, 210);
    }, FACT_MS);
    return () => clearInterval(timer);
  }, [active, lines.length, op]);

  useEffect(() => {
    if (!active) {
      setI(0);
      op.value = 1;
    }
  }, [active, op]);

  const style = useAnimatedStyle(() => ({opacity: op.value}));

  return (
    <View style={styles.factPill}>
      <AText style={[styles.factText, style]} numberOfLines={1}>
        {lines[i]}
      </AText>
    </View>
  );
}

function Gallery({
  photos,
  width,
  active,
}: {
  photos: Branch['photos'];
  width: number;
  active: boolean;
}) {
  const ref = useRef<ScrollView>(null);
  const [index, setIndex] = useState(0);
  const idxRef = useRef(0);

  useEffect(() => {
    if (!active || photos.length < 2) {
      return;
    }
    const timer = setInterval(() => {
      const next = (idxRef.current + 1) % photos.length;
      ref.current?.scrollTo({x: next * width, animated: true});
      idxRef.current = next;
      setIndex(next);
    }, AUTO_MS);
    return () => clearInterval(timer);
  }, [active, photos.length, width]);

  useEffect(() => {
    if (!active) {
      idxRef.current = 0;
      setIndex(0);
      ref.current?.scrollTo({x: 0, animated: false});
    }
  }, [active]);

  const onEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(e.nativeEvent.contentOffset.x / width);
    idxRef.current = next;
    setIndex(next);
  };

  return (
    <View>
      <View style={[styles.gallery, {width}]}>
        <ScrollView
          ref={ref}
          horizontal
          pagingEnabled
          scrollEnabled={active}
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onEnd}>
          {photos.map((p, idx) => (
            <Image
              key={idx}
              source={p}
              style={{width, height: GALLERY_H}}
              resizeMode="cover"
            />
          ))}
        </ScrollView>
      </View>
      <View style={styles.dots}>
        {photos.map((_, idx) => (
          <View key={idx} style={[styles.dot, idx === index && styles.dotActive]} />
        ))}
      </View>
    </View>
  );
}

export function ClothCard({
  branch,
  brandColor,
  width,
  expanded,
  onPress,
}: {
  branch: Branch;
  brandColor: string;
  width: number;
  expanded: boolean;
  onPress: () => void;
}) {
  const p = useSharedValue(expanded ? 1 : 0);
  const expandedH = Math.round((width * FIGMA_H) / FIGMA_W);
  const galleryW = width - 40;

  useEffect(() => {
    p.value = withTiming(expanded ? 1 : 0, {duration: DUR, easing: EASE});
  }, [expanded, p]);

  const contentStyle = useAnimatedStyle(() => ({
    transform: [{translateY: interpolate(p.value, [0, 1], [10, 0])}],
  }));
  const nameStyle = useAnimatedStyle(() => ({
    fontSize: interpolate(p.value, [0, 1], [19, 22]),
  }));

  return (
    <Animated.View
      layout={LinearTransition.duration(DUR).easing(EASE)}
      style={[
        {
          marginTop: expanded ? -10 : 0,
          marginBottom: expanded ? 0 : -2,
        },
      ]}>
      <View>
        <Pressable onPress={onPress} disabled={expanded}>
          <Animated.View
            style={[styles.clip, {width, height: expanded ? expandedH : TAB_H}]}>
            {expanded ? (
              <Svg
                width={width}
                height={expandedH}
                viewBox={`0 0 ${FIGMA_W} ${FIGMA_H}`}
                preserveAspectRatio="none"
                style={styles.clothSvg}
                pointerEvents="none">
                <Path
                  d={ROUNDER_CLOTH_PATH}
                  fill={brandColor}
                  stroke={colors.border.subtle}
                  strokeWidth={4}
                />
              </Svg>
            ) : (
              <View style={[styles.tabBody, {backgroundColor: brandColor}]} />
            )}

            <View style={[styles.header, expanded && styles.headerExpanded]}>
              <AText style={[styles.name, nameStyle]} numberOfLines={1}>
                {branch.name}
              </AText>
              {expanded ? (
                <Animated.View style={[styles.ratingPill, contentStyle]}>
                  <Icon name="star" size={11} color="#f5a623" />
                  <Text style={styles.ratingText}>
                    {branch.rating} {'\u00b7'} {branch.ratingCount}
                  </Text>
                </Animated.View>
              ) : null}
            </View>

            {expanded ? (
              <Animated.View
                style={[styles.content, contentStyle]}
                pointerEvents="box-none">
                <Text style={styles.area}>{branch.area}</Text>

                <View style={styles.tags}>
                  {branch.tags.map(tag => (
                    <View key={tag} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>

                <FactTicker lines={[branch.highlight, ...branch.facts]} active={expanded} />

                <View style={styles.loved}>
                  <Icon name="flame" size={14} color="#ffb238" />
                  <Text style={styles.lovedText}>Most loved: {branch.mostLoved}</Text>
                  <Icon name="chevron-forward" size={12} color={colors.brand.white} />
                </View>

                <Gallery photos={branch.photos} width={galleryW} active={expanded} />
              </Animated.View>
            ) : null}
          </Animated.View>
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  clip: {
    overflow: 'visible',
    borderTopLeftRadius: TOP_RADIUS,
    borderTopRightRadius: TOP_RADIUS,
    borderBottomRightRadius: 0,
    borderBottomLeftRadius: 0,
  },
  clothSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  tabBody: {
    position: 'absolute',
    top: -10,
    right: 0,
    bottom: 0,
    left: 0,
    borderColor: colors.border.subtle,
    borderWidth: 3,
    borderBottomWidth: 0,
    borderTopLeftRadius: TOP_RADIUS,
    borderTopRightRadius: TOP_RADIUS,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  header: {
    position: 'absolute',
    top: 10,
    left: 22,
    right: 18,
    height: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerExpanded: {
    top: 25,
    left: 20,
    right: 20,
  },
  name: {
    fontFamily: fontFamily.displayBold,
    color: colors.brand.white,
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.brand.white,
    borderRadius: 999,
    paddingLeft: 8,
    paddingRight: 10,
    paddingVertical: 4,
  },
  ratingText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 11,
    color: colors.brand.navy,
  },
  content: {
    position: 'absolute',
    top: 70,
    left: 20,
    right: 20,
    gap: 9,
  },
  area: {
    fontFamily: fontFamily.displayItalic,
    fontSize: 12,
    color: colors.brand.white,
  },
  tags: {flexDirection: 'row', gap: 5, paddingTop: 2},
  tag: {
    borderWidth: 1,
    borderColor: colors.brand.white,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tagText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 10,
    color: colors.brand.white,
  },
  factPill: {
    alignSelf: 'stretch',
    backgroundColor: colors.brand.champagne,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  factText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 11,
    color: colors.brand.navy,
  },
  loved: {flexDirection: 'row', alignItems: 'center', gap: 8},
  lovedText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 11,
    color: colors.brand.white,
  },
  gallery: {
    height: GALLERY_H,
    borderRadius: 22,
    overflow: 'hidden',
    marginTop: 4,
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
    alignSelf: 'center',
    marginTop: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.brand.navy,
  },
  dotActive: {width: 18, backgroundColor: colors.brand.navy},
});
