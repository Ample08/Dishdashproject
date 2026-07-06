import React from 'react';
import {Image, Pressable, StyleSheet, Text, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {dashboardImages} from '../assets/dashboardImages';
import {colors, fontFamily} from '../theme';

type Branch = {
  brand: 'Karaz' | 'Jade';
  name: string;
  address: string;
};

const KARAZ_BRANCHES: Branch[] = [
  {
    brand: 'Karaz',
    name: 'Dubai Mall',
    address:
      'The Waterfall, Lower Ground Level, Unit LG-117, Dubai Mall, Downtown Dubai · 1.2 km',
  },
  {
    brand: 'Karaz',
    name: 'Dubai Creek',
    address: 'Al Kheeran First, Dubai Creek Harbour, Dubai · 8.4 km',
  },
  {
    brand: 'Karaz',
    name: 'Abu Dhabi',
    address:
      'The Fountains, Ground Level, Grand Prix Parking, Yas Mall, Yas Island, Abu Dhabi · 128 km',
  },
];

const JADE_BRANCHES: Branch[] = [
  {
    brand: 'Jade',
    name: 'Khalifa City',
    address: '380 Al Mireef St, Khalifa City, SE45, Abu Dhabi · 128 km',
  },
];

export function BranchPickerSheet({
  selected,
  onSelect,
  onClose,
}: {
  selected: string;
  onSelect: (branch: string) => void;
  onClose: () => void;
}) {
  return (
    <View>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>Select location</Text>
          <Text style={styles.subtitle}>Pick a restaurant and branch</Text>
        </View>
        <Pressable style={styles.close} onPress={onClose} accessibilityLabel="Close">
          <Icon name="close" size={16} color={colors.text.secondary} />
        </Pressable>
      </View>

      <Pressable style={styles.locateBtn} accessibilityRole="button">
        <Text style={styles.locateText}>Use my current location</Text>
      </Pressable>

      <View style={styles.detected}>
        <View style={styles.detectedDot} />
        <Text style={styles.detectedText}>Detected: Al Nahda St, Dubai</Text>
      </View>

      <BranchGroup
        title="KARAZ BRANCHES"
        branches={KARAZ_BRANCHES}
        selected={selected}
        onSelect={onSelect}
      />
      <BranchGroup
        title="JADE BRANCHES"
        branches={JADE_BRANCHES}
        selected={selected}
        onSelect={onSelect}
      />
    </View>
  );
}

function BranchGroup({
  title,
  branches,
  selected,
  onSelect,
}: {
  title: string;
  branches: Branch[];
  selected: string;
  onSelect: (branch: string) => void;
}) {
  return (
    <View style={styles.group}>
      <Text style={styles.sectionLabel}>{title}</Text>
      {branches.map(b => {
        const isSelected = b.name === selected;
        const logo =
          b.brand === 'Karaz' ? dashboardImages.karazLogo : dashboardImages.jadeLogo;

        return (
          <Pressable
            key={`${b.brand}-${b.name}`}
            style={styles.row}
            onPress={() => onSelect(b.name)}
            accessibilityRole="button">
            <View style={[styles.monogram, b.brand === 'Jade' && styles.jadeMonogram]}>
              <Image source={logo} style={styles.monogramLogo} resizeMode="contain" />
            </View>
            <View style={styles.rowText}>
              <Text style={styles.rowName}>{b.name}</Text>
              <Text style={styles.rowAddress}>{b.address}</Text>
            </View>
            {isSelected ? (
              <View style={styles.check}>
                <Icon name="checkmark" size={15} color={colors.brand.navy} />
              </View>
            ) : (
              <Icon name="chevron-forward" size={18} color={colors.text.tertiary} />
            )}
          </Pressable>
        );
      })}
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
    fontFamily: fontFamily.displayBold,
    fontSize: 22,
    color: colors.text.primary,
  },
  subtitle: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 12,
    color: colors.text.secondary,
  },
  close: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface.input,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  locateBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brand.pistachio,
    borderRadius: 12,
    paddingVertical: 12,
  },
  locateText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 13,
    color: colors.brand.navy,
  },
  detected: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 14,
  },
  detectedDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.text.secondary,
  },
  detectedText: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 11,
    color: colors.text.secondary,
  },
  group: {paddingBottom: 10},
  sectionLabel: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 11,
    letterSpacing: 1.54,
    color: colors.text.tertiary,
    paddingBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e8dbc9',
  },
  monogram: {
    width: 40,
    height: 40,
    borderRadius: 4,
    backgroundColor: colors.brand.karaz,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  jadeMonogram: {
    backgroundColor: colors.brand.navy,
  },
  monogramLogo: {width: 30, height: 30},
  rowText: {flex: 1, gap: 2},
  rowName: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 14,
    color: colors.text.primary,
  },
  rowAddress: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 11,
    lineHeight: 14,
    color: colors.text.secondary,
  },
  check: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.brand.pistachio,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
