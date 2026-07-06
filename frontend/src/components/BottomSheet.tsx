import React, {useEffect, useState} from 'react';
import {
  Keyboard,
  Modal,
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {colors, radius} from '../theme';

/**
 * Bottom Sheet (Figma dev-note: slide from bottom ~250ms ease-out + backdrop
 * fade 200ms; drag-to-dismiss). Variants composed by passing children.
 */
const TRAVEL = 700;

type Props = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  avoidKeyboard?: boolean;
  sheetStyle?: StyleProp<ViewStyle>;
};

export function BottomSheet({
  visible,
  onClose,
  children,
  avoidKeyboard = false,
  sheetStyle: sheetStyleOverride,
}: Props) {
  const [mounted, setMounted] = useState(visible);
  const progress = useSharedValue(0);
  const drag = useSharedValue(0);
  const keyboardLift = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      drag.value = 0;
      progress.value = withTiming(1, {duration: 250});
    } else {
      progress.value = withTiming(0, {duration: 200}, finished => {
        if (finished) {
          runOnJS(setMounted)(false);
        }
      });
    }
  }, [visible, progress, drag]);

  useEffect(() => {
    if (!avoidKeyboard) {
      keyboardLift.value = 0;
      return;
    }

    const showSub = Keyboard.addListener('keyboardDidShow', e => {
      keyboardLift.value = withTiming(e.endCoordinates.height, {duration: 180});
    });
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      keyboardLift.value = withTiming(0, {duration: 180});
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [avoidKeyboard, keyboardLift]);

  const pan = Gesture.Pan()
    .onUpdate(e => {
      drag.value = Math.max(0, e.translationY);
    })
    .onEnd(e => {
      if (e.translationY > 120 || e.velocityY > 800) {
        runOnJS(onClose)();
      } else {
        drag.value = withTiming(0, {duration: 150});
      }
    });

  const backdropStyle = useAnimatedStyle(() => ({opacity: progress.value}));
  const sheetStyle = useAnimatedStyle(() => ({
    transform: [
      {translateY: (1 - progress.value) * TRAVEL + drag.value - keyboardLift.value},
    ],
  }));

  if (!mounted) {
    return null;
  }

  return (
    <Modal
      transparent
      visible={mounted}
      statusBarTranslucent
      onRequestClose={onClose}
      animationType="none">
      <View style={styles.fill}>
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        <GestureDetector gesture={pan}>
          <Animated.View style={[styles.sheet, sheetStyleOverride, sheetStyle]}>
            <View style={styles.grabber} />
            {children}
          </Animated.View>
        </GestureDetector>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(28,35,48,0.45)',
  },
  sheet: {
    backgroundColor: colors.brand.white,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 34,
  },
  grabber: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border.default,
    marginBottom: 16,
  },
});
