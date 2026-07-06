import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MCIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import {colors, fontFamily} from '../theme';

/**
 * StepNav (Figma 4483:106) — the 4-step reservation progress rail.
 * Steps up to and including `current` show a filled pistachio circle; later
 * steps show a navy outline. Connector lines before the current step are
 * pistachio, the rest are faint.
 */
export type ReserveStep = 'Restaurant' | 'Place' | 'Table' | 'When';

const STEPS: {key: ReserveStep; label: string; set: 'ion' | 'mci'; icon: string}[] =
  [
    {key: 'Restaurant', label: 'Restaurant', set: 'ion', icon: 'restaurant'},
    {key: 'Place', label: 'Place', set: 'ion', icon: 'location-outline'},
    {key: 'Table', label: 'Table', set: 'mci', icon: 'rhombus-outline'},
    {key: 'When', label: 'When', set: 'ion', icon: 'time-outline'},
  ];

export function StepNav({current}: {current: ReserveStep}) {
  const currentIdx = STEPS.findIndex(s => s.key === current);

  return (
    <View style={styles.root}>
      {STEPS.map((step, i) => {
        const done = i <= currentIdx;
        return (
          <React.Fragment key={step.key}>
            <View style={styles.step}>
              <View style={[styles.circle, done ? styles.circleDone : styles.circleIdle]}>
                {step.set === 'ion' ? (
                  <Icon name={step.icon} size={18}  color={done ? colors.brand.navy : '#73737A'} />
                ) : (
                  <MCIcon name={step.icon} size={18} color={done ? colors.brand.navy : '#73737A'} />
                )}
              </View>
              <Text style={styles.label} numberOfLines={1}>
                {step.label}
              </Text>
            </View>
            {i < STEPS.length - 1 && (
              <View
                style={[
                  styles.line,
                  i < currentIdx ? styles.lineDone : styles.lineIdle,
                ]}
              />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: 12,
    paddingHorizontal: 22,
  },
  step: {width: 52, alignItems: 'center', gap: 6},
  circle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleDone: {backgroundColor: colors.brand.pistachio},
  circleIdle: {
    borderWidth: 1.5,
    borderColor: colors.brand.navy,
  },
  label: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 10,
    color: colors.brand.navy,
  },
  line: {
    flex: 1,
    height: 3,
    borderRadius: 1.5,
    marginTop: 16.5,
    marginHorizontal: 2,
  },
  lineDone: {backgroundColor: colors.brand.pistachio},
  lineIdle: {backgroundColor: 'rgba(28,35,48,0.1)'},
});
