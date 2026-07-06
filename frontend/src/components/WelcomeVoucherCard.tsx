import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import Animated, {
  Easing,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {SvgXml} from 'react-native-svg';
import {BG_NOTCHED, PATTERN_DOTS} from '../assets/illustrations';
import {colors, fontFamily} from '../theme';
import {GradientFill} from './GradientFill';
import {Mascot} from './Mascot';

/**
 * Card · Welcome Voucher (Figma 893:325)
 * ---------------------------------------------------------------------------
 * Ticket-notched green card. Smart-Animate flip between Front (offer +
 * "TAP TO REVEAL") and Back (the unlocked code). Measurements taken verbatim
 * from Dev Mode. The notched gradient background + green glow shadow + dot
 * pattern are the exact Figma SVG exports rendered via SvgXml.
 */

const CARD_W = 320;
const CARD_H = 360;
// BgNotched export is 376×416 with the shadow bleeding out by these insets.
const BG_INSET_X = 28; // -8.75% of 320
const BG_INSET_TOP = 12; // -3.33% of 360
const BG_W = 376;
const BG_H = 416;

const TEAL_GRADIENT = ['#2e6b78', '#143d47'];
const PERF_COUNT = 29;

type Props = {
  amount?: string;
  code?: string; // bound to API user.welcomeVoucher.code in production
  onReveal?: () => void;
  autoRevealDelayMs?: number;
};

function CardChrome() {
  // Shared offer chrome present on both faces (bg, dots, mascot, header).
  return (
    <>
      <View style={styles.bgNotched} pointerEvents="none">
        <SvgXml xml={BG_NOTCHED} width={BG_W} height={BG_H} />
      </View>
      <View style={styles.patternDots} pointerEvents="none">
        <SvgXml xml={PATTERN_DOTS} width={CARD_W} height={CARD_H} />
      </View>
      <View style={styles.mascot} pointerEvents="none">
        <Mascot width={22} />
      </View>
      <Text style={styles.welcomeOffer}>WELCOME OFFER</Text>
    </>
  );
}

function Perforation() {
  return (
    <View style={styles.perforation} pointerEvents="none">
      {Array.from({length: PERF_COUNT}).map((_, i) => (
        <View key={i} style={styles.perfDash} />
      ))}
    </View>
  );
}

export function WelcomeVoucherCard({
  amount = '10%',
  code = 'FLVR5253',
  onReveal,
  autoRevealDelayMs = 2000,
}: Props) {
  const flip = useSharedValue(0);
  const revealedRef = useRef(false);
  const [revealed, setRevealedState] = useState(false);

  const setRevealed = useCallback((next: boolean) => {
    if (revealedRef.current === next) {
      return;
    }
    revealedRef.current = next;
    setRevealedState(next);
    flip.value = withTiming(next ? 1 : 0, {
      duration: 520,
      easing: Easing.inOut(Easing.cubic),
    });
    if (next) {
      onReveal?.();
    }
  }, [flip, onReveal]);

  const reveal = useCallback(() => {
    setRevealed(true);
  }, [setRevealed]);

  // Auto-reveal the code after the parent screen has had time to stage in.
  useEffect(() => {
    if (autoRevealDelayMs < 0) {
      return undefined;
    }
    const timer = setTimeout(() => {
      setRevealed(true);
    }, autoRevealDelayMs);
    return () => clearTimeout(timer);
  }, [autoRevealDelayMs, setRevealed]);

  const backStyle = {};

  return (
    <Pressable
      onPress={reveal}
      onPressIn={reveal}
      accessibilityRole="button"
      accessibilityLabel="Welcome voucher, tap to reveal code"
      hitSlop={{top: 14, bottom: 14, left: 14, right: 14}}
      style={styles.card}>
      {/* FRONT — offer */}
      <Animated.View style={[styles.face, styles.faceTop]}>
        <CardChrome />
        <View style={styles.amountRow} pointerEvents="none">
          <Text style={styles.amount}>{amount}</Text>
        </View>
        <Text style={styles.offLabel}>OFF · DINE-IN ONLY</Text>
          <Perforation />
          <View style={styles.revealBtn} pointerEvents="none">
            <GradientFill colors={TEAL_GRADIENT} />
            {!revealed ? (
              <Text style={styles.revealBtnText}>TAP TO REVEAL</Text>
            ) : (
              <View style={styles.inlineCode}>
                <Text style={styles.yourCode}>YOUR CODE</Text>
                <Text style={styles.codeValue}>{code}</Text>
              </View>
            )}
          </View>
          <Text style={styles.firstDineIn}>FIRST DINE-IN</Text>
      </Animated.View>

      {/* BACK — revealed code */}
      {false ? (
      <Animated.View style={[styles.face, styles.faceTop, backStyle]}>
        <CardChrome />
        <View style={styles.amountRow} pointerEvents="none">
          <Text style={styles.amount}>{amount}</Text>
        </View>
        <Text style={styles.offLabel}>OFF · DINE-IN ONLY</Text>
        <Perforation />
        <View style={styles.revealPanel} pointerEvents="none">
          <GradientFill colors={TEAL_GRADIENT} /> 
          <View style={styles.codeCol}>
            <Text style={styles.yourCode}>YOUR CODE</Text>
            <Text style={styles.codeValue}>{code}</Text>
          </View>
        </View>
      </Animated.View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_W,
    height: CARD_H,
  },
  face: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: CARD_W,
    height: CARD_H,
    backfaceVisibility: 'hidden',
  },
  faceTop: {
    zIndex: 2,
    elevation: 2,
  },
  bgNotched: {
    position: 'absolute',
    left: -BG_INSET_X,
    top: -BG_INSET_TOP,
    width: BG_W,
    height: BG_H,
  },
  patternDots: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: CARD_W,
    height: CARD_H,
  },
  mascot: {
    position: 'absolute',
    left: 85,
    top: 32,
  },
  welcomeOffer: {
    position: 'absolute',
    left: 115,
    top: 39.9,
    fontFamily: fontFamily.bodyBlack,
    fontSize: 12,
    letterSpacing: 1.44,
    color: colors.brand.navy,
  },
  amountRow: {
    position: 'absolute',
    left: 0,
    top: 116,
    width: CARD_W,
    alignItems: 'center',
  },
  amount: {
    fontFamily: fontFamily.displayBold,
    fontSize: 64,
    letterSpacing: -2,
    color: colors.brand.navy,
  },
  offLabel: {
    position: 'absolute',
    top: 195,
    width: CARD_W,
    textAlign: 'center',
    fontFamily: fontFamily.bodyBold,
    fontSize: 9,
    letterSpacing: 2,
    color: 'rgba(28,35,48,0.7)',
  },
  perforation: {
    position: 'absolute',
    left: 14,
    top: 239,
    width: 292,
    height: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  perfDash: {
    width: 5,
    height: 2,
    backgroundColor: colors.brand.navy,
    opacity: 0.28,
  },
  revealBtn: {
    position: 'absolute',
    top: 278,
    alignSelf: 'center',
    width: 232,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(28,35,48,0.22)',
    overflow: 'hidden',
    shadowColor: 'rgba(130,188,105,1)',
    shadowOpacity: 0.55,
    shadowRadius: 9,
    shadowOffset: {width: 0, height: 6},
    elevation: 6,
  },
  revealBtnText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 13,
    letterSpacing: 2.4,
    color: '#faf0e8',
  },
  inlineCode: {
    alignItems: 'center',
    gap: 2,
  },
  firstDineIn: {
    position: 'absolute',
    top: 336,
    width: CARD_W,
    textAlign: 'center',
    fontFamily: fontFamily.bodyBold,
    fontSize: 10,
    letterSpacing: 2,
    color: 'rgba(28,35,48,0.45)',
  },
  revealPanel: {
    position: 'absolute',
    top: 250,
    left: 20,
    width: 280,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: 'rgba(130,188,105,1)',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 8},
    elevation: 6,
  },
  qrBox: {
    padding: 5,
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  codeCol: {
    alignItems: 'center',
    gap: 4,
  },
  yourCode: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 10,
    letterSpacing: 2,
    color: colors.text.inverse,
  },
  codeValue: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 18,
    letterSpacing: 4,
    color: '#ffffff',
  },
});
