import React, {useMemo, useState} from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {COUNTRIES, SUGGESTED_COUNTRIES, type Country} from '../data/countries';
import {colors, fontFamily} from '../theme';

/**
 * Select country · Overlay Target (Figma 6522:27090).
 * Search + suggested codes above the full list; the active country carries a
 * green dot. Rendered as BottomSheet children.
 */
type Row = Country | {kind: 'label'; text: string};

function isLabel(row: Row): row is {kind: 'label'; text: string} {
  return 'kind' in row;
}

export function CountryPickerSheet({
  selectedIso,
  onSelect,
  onClose,
}: {
  selectedIso: string;
  onSelect: (country: Country) => void;
  onClose: () => void;
}) {
  const {height} = useWindowDimensions();
  const [query, setQuery] = useState('');

  const rows = useMemo<Row[]>(() => {
    const q = query.trim().toLowerCase();
    if (q) {
      const digits = q.replace(/[^0-9]/g, '');
      return COUNTRIES.filter(
        c =>
          c.name.toLowerCase().includes(q) ||
          (digits.length > 0 && c.dialCode.replace('+', '').includes(digits)),
      );
    }
    const rest = COUNTRIES.filter(c => !c.suggested);
    return [
      ...SUGGESTED_COUNTRIES,
      {kind: 'label', text: 'ALL COUNTRIES'},
      ...rest,
    ];
  }, [query]);

  const renderItem = ({item}: {item: Row}) => {
    if (isLabel(item)) {
      return (
        <View style={styles.sectionLabelWrap}>
          <Text style={styles.sectionLabel}>{item.text}</Text>
        </View>
      );
    }
    const isSelected = item.iso === selectedIso;
    return (
      <Pressable
        style={styles.row}
        onPress={() => onSelect(item)}
        accessibilityRole="button"
        accessibilityLabel={`${item.name} ${item.dialCode}`}>
        <Text style={styles.flag}>{item.flag}</Text>
        <Text style={styles.name} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.dial}>{item.dialCode}</Text>
        {isSelected ? <View style={styles.selectedDot} /> : null}
      </Pressable>
    );
  };

  return (
    <View>
      <View style={styles.header}>
        <Text style={styles.title}>Select country</Text>
        <Pressable style={styles.close} onPress={onClose} accessibilityLabel="Close">
          <Icon name="close" size={16} color={colors.text.secondary} />
        </Pressable>
      </View>

      <View style={styles.search}>
        <Icon name="search" size={16} color={colors.text.tertiary} />
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder="Search country or code"
          placeholderTextColor={colors.text.tertiary}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
        />
      </View>

      <FlatList
        data={rows}
        keyExtractor={(item, i) => (isLabel(item) ? `label-${i}` : item.iso)}
        renderItem={renderItem}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        style={{maxHeight: height * 0.5}}
        ListEmptyComponent={
          <Text style={styles.empty}>No countries match "{query.trim()}".</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
  },
  title: {
    fontFamily: fontFamily.displayBold,
    fontSize: 22,
    color: colors.text.primary,
  },
  close: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface.input,
    alignItems: 'center',
    justifyContent: 'center',
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surface.input,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    padding: 0,
    fontFamily: fontFamily.bodyRegular,
    fontSize: 14,
    color: colors.text.primary,
  },
  sectionLabelWrap: {
    paddingTop: 14,
    paddingBottom: 6,
  },
  sectionLabel: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 11,
    letterSpacing: 1.54,
    color: colors.text.tertiary,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  flag: {
    fontSize: 22,
  },
  name: {
    flex: 1,
    fontFamily: fontFamily.bodyRegular,
    fontSize: 15,
    color: colors.text.primary,
  },
  dial: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 15,
    color: colors.text.secondary,
  },
  selectedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.status.success,
  },
  empty: {
    paddingVertical: 24,
    textAlign: 'center',
    fontFamily: fontFamily.bodyRegular,
    fontSize: 13,
    color: colors.text.tertiary,
  },
});
