import React, {useRef, useState} from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import Svg, {Circle, Defs, RadialGradient, Stop} from 'react-native-svg';
import {BottomSheet} from '../../components';
import {BrandPicker} from '../../components/BrandPicker';
import {EarnWaysSheet} from '../../components/EarnWaysSheet';
import {HeroRewardsCard} from '../../components/HeroRewardsCard';
import {PromoCarousel} from '../../components/PromoCarousel';
import {StatusStrip} from '../../components/StatusStrip';
import {TonightsPicks} from '../../components/TonightsPicks';
import type {TabScreenProps} from '../../navigation/types';
import {dashboardImages} from '../../assets/dashboardImages';
import {colors, fontFamily} from '../../theme';

/**
 * 12 · Home — Dashboard (Figma 1072:673)
 * Teal header + rewards + brand picker + promo carousel + Tonight's Picks +
 * end-of-feed, with a pinned full-width Status Strip and the location sheet.
 * Top notch handled via safe-area insets (teal band bleeds under the bar).
 */
const TEAL = colors.brand.teal;

/**
 * Soft radial highlight that gives the flat teal band its depth (Figma
 * 1189:19 / 1189:20 — two glow ellipses bleeding off the top corners).
 */
function Glow({
  id,
  size,
  color,
  opacity,
  style,
}: {
  id: string;
  size: number;
  color: string;
  opacity: number;
  style: object;
}) {
  return (
    <Svg width={size} height={size} pointerEvents="none" style={[styles.glow, style]}>
      <Defs>
        <RadialGradient id={id} cx="50%" cy="50%" r="50%">
          {/* solid core then a soft edge — approximates Figma's 18% fill + 60 blur */}
          <Stop offset="0" stopColor={color} stopOpacity={opacity} />
          <Stop offset="0.55" stopColor={color} stopOpacity={opacity} />
          <Stop offset="1" stopColor={color} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Circle cx={size / 2} cy={size / 2} r={size / 2} fill={`url(#${id})`} />
    </Svg>
  );
}

type Sheet = null | 'location' | 'earn';
type LocationBranch = {
  brand: 'Karaz' | 'Jade';
  name: string;
  address: string;
};

const HOME_KARAZ_BRANCHES: LocationBranch[] = [
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

const HOME_JADE_BRANCHES: LocationBranch[] = [
  {
    brand: 'Jade',
    name: 'Khalifa City',
    address: '380 Al Mireef St, Khalifa City, SE45, Abu Dhabi · 128 km',
  },
];

function HomeLocationSheet({
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
      <View style={styles.locationSheetHeader}>
        <View style={styles.locationSheetHeaderText}>
          <Text style={styles.locationSheetTitle}>Select location</Text>
          <Text style={styles.locationSheetSub}>Pick a restaurant and branch</Text>
        </View>
        <Pressable
          style={styles.locationSheetClose}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close">
          <Icon name="close" size={16} color={colors.text.secondary} />
        </Pressable>
      </View>

      <Pressable style={styles.locationSheetCurrent} accessibilityRole="button">
        <Text style={styles.locationSheetCurrentText}>Use my current location</Text>
      </Pressable>

      <View style={styles.locationSheetDetected}>
        <View style={styles.locationSheetDot} />
        <Text style={styles.locationSheetDetectedText}>Detected: Al Nahda St, Dubai</Text>
      </View>

      <HomeLocationGroup
        title="KARAZ BRANCHES"
        branches={HOME_KARAZ_BRANCHES}
        selected={selected}
        onSelect={onSelect}
      />
      <HomeLocationGroup
        title="JADE BRANCHES"
        branches={HOME_JADE_BRANCHES}
        selected={selected}
        onSelect={onSelect}
      />
    </View>
  );
}

function HomeLocationGroup({
  title,
  branches,
  selected,
  onSelect,
}: {
  title: string;
  branches: LocationBranch[];
  selected: string;
  onSelect: (branch: string) => void;
}) {
  return (
    <View style={styles.locationSheetGroup}>
      <Text style={styles.locationSheetSection}>{title}</Text>
      {branches.map(branch => {
        const selectedBranch = branch.name === selected;
        const logo =
          branch.brand === 'Karaz'
            ? dashboardImages.karazLogo
            : dashboardImages.jadeLogo;

        return (
          <Pressable
            key={`${branch.brand}-${branch.name}`}
            style={styles.locationSheetRow}
            onPress={() => onSelect(branch.name)}
            accessibilityRole="button">
            <View
              style={[
                styles.locationSheetLogo,
                branch.brand === 'Jade' && styles.locationSheetLogoJade,
              ]}>
              <Image source={logo} style={styles.locationSheetLogoImage} resizeMode="contain" />
            </View>
            <View style={styles.locationSheetRowText}>
              <Text style={styles.locationSheetRowName}>{branch.name}</Text>
              <Text style={styles.locationSheetRowAddress}>{branch.address}</Text>
            </View>
            {selectedBranch ? (
              <View style={styles.locationSheetCheck}>
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

export function HomeDashboardScreen({navigation}: TabScreenProps<'Home'>) {
  const insets = useSafeAreaInsets();
  const [sheet, setSheet] = useState<Sheet>(null);
  const [branch, setBranch] = useState('Dubai Mall');

  // Keep showing the sheet that was actually opened while it animates out —
  // otherwise the content swaps to the other sheet during the close.
  const lastSheet = useRef<Exclude<Sheet, null>>('location');
  if (sheet) {
    lastSheet.current = sheet;
  }
  const sheetContent = sheet ?? lastSheet.current;

  return (
    
    <View style={styles.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, {paddingBottom: insets.bottom + 110}]}>
        {/* Teal top band */}
        <View style={[styles.topBand, {paddingTop: insets.top + 14}]}>
          <Glow id="glowR" size={300} color="#9ED487" opacity={0.18} style={styles.glowRight} />
          <Glow id="glowL" size={260} color="#9ED487" opacity={0.18} style={styles.glowLeft} />

          <View style={styles.headerRow}>
            <View style={styles.greetingCol}>
              <Text style={styles.greetingHi}>Good evening,</Text>
              <View style={styles.nameRow}>
                <Text style={styles.name}>Layla</Text>
                <Text style={styles.moon}> 🌙</Text>
              </View>
              <View style={styles.memberRow}>
                <Icon name="person" size={13} color={colors.brand.pistachio} />
                <Text style={styles.memberText}>TASTE · SINCE MAY 2026</Text>
              </View>
            </View>

            <Pressable style={styles.bell} accessibilityLabel="Notifications">
              <Icon name="notifications-outline" size={22} color={colors.brand.ivory} />
              <View style={styles.bellBadge}>
                <Text style={styles.bellBadgeText}>3</Text>
              </View>
            </Pressable>
          </View>

          <Pressable
            style={styles.location}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Tap to switch restaurant or branch"
            onPressIn={() => setSheet('location')}
            onPress={() => setSheet('location')}>
            <View style={styles.locationIcon}>
              <Icon name="restaurant-outline" size={20} color={colors.brand.ivory} />
            </View>
            <View style={styles.locationText}>
              <Text style={styles.locationTitle}>Karaz · {branch}</Text>
              <Text style={styles.locationSub}>Tap to switch restaurant or branch</Text>
            </View>
          </Pressable>
        </View>

        {/* Body */}
        <View style={styles.body}>
          <View style={styles.heroWrap}>
            <HeroRewardsCard
              onEarnPress={() => setSheet('earn')}
              onBenefitsPress={() => navigation.navigate('Loyalty')}
            />
          </View>
          <BrandPicker />
          <PromoCarousel />

          <TonightsPicks
            branch={branch}
            onSwitchBranch={() => setSheet('location')}
          />

          {/* End of feed */}
          <View style={styles.endFeed}>
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.endWord}>flavours</Text>
              <View style={styles.dividerLine} />
            </View>
            <Text style={styles.endTitle}>That's a wrap, habibi</Text>
            <Text style={styles.endSub}>
              You've seen our full table. Catch you at the next craving.
            </Text>
            <Pressable style={styles.endPill} accessibilityRole="button">
              <Text style={styles.endPillText}>Reserve a table ›</Text>
            </Pressable>
            <Text style={styles.endFooter}>Flavours by DishDash</Text>
          </View>
        </View>
      </ScrollView>

      {/* Pinned full-width status strip above the tab bar */}
      <View style={[styles.stripWrap]} pointerEvents="box-none">
        <StatusStrip />
      </View>

      {/* Earn-ways + branch-picker sheets (Figma 2597:3270 / 1781:5) */}
      <BottomSheet visible={sheet !== null} onClose={() => setSheet(null)}>
        {sheetContent === 'earn' ? (
          <EarnWaysSheet
            onClose={() => setSheet(null)}
            onFindBranch={() => setSheet('location')}
          />
        ) : (
          <HomeLocationSheet
            selected={branch}
            onSelect={b => {
              setBranch(b);
              setSheet(null);
            }}
            onClose={() => setSheet(null)}
          />
        )}
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: colors.brand.ivory},
  scroll: {},
  topBand: {
    backgroundColor: TEAL,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingHorizontal: 24,
    paddingBottom: 100,
    gap: 14,
    overflow: 'hidden',
  },
  glow: {position: 'absolute'},
  glowRight: {top: -120, right: -70},
  glowLeft: {top: -110, left: -90},
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greetingCol: {flex: 1},
  greetingHi: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 13,
    color: colors.brand.ivory,
  },
  nameRow: {flexDirection: 'row', alignItems: 'center', marginTop: 2},
  name: {
    fontFamily: fontFamily.displayBoldItalic,
    fontSize: 28,
    color: colors.brand.ivory,
  },
  moon: {fontSize: 22},
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  memberText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 10,
    letterSpacing: 1,
    color: colors.brand.ivory,
  },
  bell: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: colors.status.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellBadgeText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 10,
    color: '#ffffff',
  },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  locationIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.brand.pistachio,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationText: {flex: 1},
  locationTitle: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 15,
    color: colors.brand.ivory,
  },
  locationSub: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 11,
    letterSpacing: 0.4,
    color: colors.brand.pistachio,
    marginTop: 2,
  },
  body: {
    paddingHorizontal: 24,
    paddingTop: 0,
    gap: 24,
  },
  heroWrap: {
    marginTop: -80,
  },
  catering: {
    height: 168,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: colors.brand.navy,
    justifyContent: 'flex-end',
  },
  cateringPressed: {opacity: 0.9},
  cateringImg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  cateringScrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(28,35,48,0.42)',
  },
  cateringText: {padding: 18, gap: 3},
  cateringKicker: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 10,
    letterSpacing: 1,
    color: colors.brand.pistachio,
  },
  cateringTitle: {
    fontFamily: fontFamily.displayBold,
    fontSize: 24,
    color: colors.brand.ivory,
  },
  cateringSub: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 13,
    color: colors.brand.ivory,
  },
  cateringCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.brand.pistachio,
  },
  cateringCtaText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 13,
    color: colors.brand.navy,
  },
  endFeed: {alignItems: 'center', gap: 12, paddingTop: 0, paddingBottom: 0},
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    alignSelf: 'stretch',
  },
  dividerLine: {flex: 1, height: 1, backgroundColor: colors.border.strong},
  endWord: {
    fontFamily: fontFamily.displayBoldItalic,
    fontSize: 16,
    color: colors.text.primary,
  },
  endTitle: {
    fontFamily: fontFamily.displayBoldItalic,
    fontSize: 22,
    color: colors.text.primary,
  },
  endSub: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 12,
    color: colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  endPill: {
    backgroundColor: colors.brand.white,
    borderWidth: 1,
    borderColor: colors.brand.champagne,
    borderRadius: 99,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  endPillText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 12,
    letterSpacing: 0.72,
    color: colors.text.primary,
  },
  endFooter: {
    fontFamily: fontFamily.displayItalic,
    fontSize: 11,
    color: colors.text.tertiary,
  },
  stripWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  locationSheetHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingBottom: 16,
  },
  locationSheetHeaderText: {flex: 1, gap: 4},
  locationSheetTitle: {
    fontFamily: fontFamily.displayBold,
    fontSize: 22,
    color: colors.text.primary,
  },
  locationSheetSub: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 12,
    color: colors.text.secondary,
  },
  locationSheetClose: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface.input,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  locationSheetCurrent: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brand.pistachio,
    borderRadius: 12,
    paddingVertical: 12,
  },
  locationSheetCurrentText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 13,
    color: colors.brand.navy,
  },
  locationSheetDetected: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 14,
  },
  locationSheetDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.text.secondary,
  },
  locationSheetDetectedText: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 11,
    color: colors.text.secondary,
  },
  locationSheetGroup: {paddingBottom: 10},
  locationSheetSection: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 11,
    letterSpacing: 1.54,
    color: colors.text.tertiary,
    paddingBottom: 8,
  },
  locationSheetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e8dbc9',
  },
  locationSheetLogo: {
    width: 40,
    height: 40,
    borderRadius: 4,
    backgroundColor: colors.brand.karaz,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  locationSheetLogoJade: {
    backgroundColor: colors.brand.navy,
  },
  locationSheetLogoImage: {width: 30, height: 30},
  locationSheetRowText: {flex: 1, gap: 2},
  locationSheetRowName: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 14,
    color: colors.text.primary,
  },
  locationSheetRowAddress: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 11,
    lineHeight: 14,
    color: colors.text.secondary,
  },
  locationSheetCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.brand.pistachio,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
