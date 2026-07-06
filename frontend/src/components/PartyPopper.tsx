import React, { useLayoutEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';

const POPPER_COLORS = ['#9ed387', '#bc1e3c', '#ffefcb', '#1b4a55', '#e26949'];

type PopperPiece = {
  color: string;
  width: number;
  height: number;
  radius: number;
  originX: number;
  originY: number;
  burstX: number;
  burstY: number;
  settleX: number;
  settleY: number;
  rotate: number;
};

export function PartyPopper() {
  const { width, height } = useWindowDimensions();
  const progress = useRef(new Animated.Value(0.03)).current;

  const pieces = useMemo<PopperPiece[]>(() => {
    const rand = (index: number, seed: number) => {
      const x = Math.sin((index + 1) * seed) * 10000;
      return x - Math.floor(x);
    };

    return Array.from({ length: 76 }, (_, i) => {
      const originX = width / 2 + (rand(i, 8.4) - 0.5) * width * 0.08;
      const originY = rand(i, 5.82) * height * 0.035;
      const targetX = rand(i, 12.99) * width;
      const targetY = rand(i, 4.74) * height * 0.82;
      const size = 4 + rand(i, 7.13) * 12;
      const strip = rand(i, 9.21) > 0.46;

      return {
        color: POPPER_COLORS[i % POPPER_COLORS.length],
        width: strip ? 4 + rand(i, 2.7) * 5 : size,
        height: strip ? 12 + rand(i, 3.3) * 18 : size,
        radius: rand(i, 5.6) > 0.5 ? 2 : 1,
        originX,
        originY,
        burstX: originX + (targetX - originX) * 0.54,
        burstY: Math.max(12, targetY * 0.18),
        settleX: targetX,
        settleY: targetY + 40 + rand(i, 6.61) * 120,
        rotate: (rand(i, 11.9) > 0.5 ? 1 : -1) * (240 + rand(i, 10.2) * 620),
      };
    });
  }, [height, width]);

  useLayoutEffect(() => {
    progress.setValue(0.03);
    Animated.timing(progress, {
      toValue: 1,
      duration: 850,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
      isInteraction: false,
    }).start();
  }, [progress]);

  return (
    <View pointerEvents="none" style={styles.layer}>
      {pieces.map((piece, index) => (
        <PopperPieceView key={index} piece={piece} progress={progress} />
      ))}
    </View>
  );
}

function PopperPieceView({
  piece,
  progress,
}: {
  piece: PopperPiece;
  progress: Animated.Value;
}) {
  const translateX = progress.interpolate({
    inputRange: [0, 0.32, 1],
    outputRange: [piece.originX, piece.burstX, piece.settleX],
  });
  const translateY = progress.interpolate({
    inputRange: [0, 0.32, 1],
    outputRange: [piece.originY, piece.burstY, piece.settleY],
  });
  const opacity = progress.interpolate({
    inputRange: [0, 0.04, 0.76, 1],
    outputRange: [0, 1, 1, 0],
  });
  const scale = progress.interpolate({
    inputRange: [0, 0.12, 1],
    outputRange: [0.2, 1, 0.85],
  });
  const rotate = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', `${piece.rotate}deg`],
  });

  return (
    <Animated.View
      style={[
        styles.piece,
        {
          width: piece.width,
          height: piece.height,
          borderRadius: piece.radius,
          backgroundColor: piece.color,
          opacity,
          transform: [{ translateX }, { translateY }, { rotate }, { scale }],
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  layer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 50,
    elevation: 50,
  },
  piece: {
    position: 'absolute',
  },
});
