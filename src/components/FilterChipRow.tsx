/**
 * FilterChipRow — Horizontally scrolling chips for active filters (Spec §7.3)
 *
 * Each chip is individually clearable, rendered in colors.primaryLight when set.
 */

import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, radius, space, type } from '../theme';
import { HostelSearchFilters } from '../types/hostel';

interface FilterChip {
  key: string;
  label: string;
  onClear: () => void;
}

interface FilterChipRowProps {
  filters: HostelSearchFilters;
  onUpdateFilters: (newFilters: HostelSearchFilters) => void;
}

export default function FilterChipRow({ filters, onUpdateFilters }: FilterChipRowProps) {
  const chips: FilterChip[] = [];

  // Area chips
  if (filters.areas && filters.areas.length > 0) {
    filters.areas.forEach((area) => {
      chips.push({
        key: `area-${area}`,
        label: `Area: ${area}`,
        onClear: () => {
          const nextAreas = filters.areas?.filter((a) => a !== area);
          onUpdateFilters({ ...filters, areas: nextAreas && nextAreas.length > 0 ? nextAreas : undefined });
        },
      });
    });
  }

  // Price range chip
  if (filters.minPrice != null || filters.maxPrice != null) {
    const minStr = filters.minPrice ? `GH₵${filters.minPrice.toLocaleString()}` : 'GH₵1,000';
    const maxStr = filters.maxPrice ? `GH₵${filters.maxPrice.toLocaleString()}` : 'GH₵15,000+';
    chips.push({
      key: 'price-range',
      label: `Price: ${minStr} - ${maxStr}`,
      onClear: () => onUpdateFilters({ ...filters, minPrice: undefined, maxPrice: undefined }),
    });
  }

  // Capacity chips
  if (filters.capacities && filters.capacities.length > 0) {
    chips.push({
      key: 'capacity',
      label: `Room: ${filters.capacities.join(', ')} in a room`,
      onClear: () => onUpdateFilters({ ...filters, capacities: undefined }),
    });
  }

  // Kind chip
  if (filters.kind && filters.kind !== 'ANY') {
    chips.push({
      key: 'kind',
      label: `Kind: ${filters.kind === 'HOSTEL' ? 'Hostel' : 'Apartment'}`,
      onClear: () => onUpdateFilters({ ...filters, kind: undefined }),
    });
  }

  // Availability chip
  if (filters.availableOnly) {
    chips.push({
      key: 'available',
      label: 'Free beds only',
      onClear: () => onUpdateFilters({ ...filters, availableOnly: undefined }),
    });
  }

  // Sort chip
  if (filters.sort && filters.sort !== 'RECOMMENDED') {
    const sortLabels: Record<string, string> = {
      PRICE_ASC: 'Price ↑',
      PRICE_DESC: 'Price ↓',
      RATING_DESC: 'Rating ↓',
      AVAILABILITY_DESC: 'Availability ↓',
    };
    chips.push({
      key: 'sort',
      label: `Sort: ${sortLabels[filters.sort] ?? filters.sort}`,
      onClear: () => onUpdateFilters({ ...filters, sort: undefined }),
    });
  }

  if (chips.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {chips.map((chip) => (
          <TouchableOpacity key={chip.key} style={styles.chip} onPress={chip.onClear} activeOpacity={0.8}>
            <Text style={styles.chipText}>{chip.label}</Text>
            <Ionicons name="close-circle" size={16} color={colors.primary} style={styles.closeIcon} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: space.xs,
  },
  scrollContent: {
    paddingHorizontal: space.lg,
    gap: space.xs,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
    borderWidth: 1,
    paddingHorizontal: space.sm + 2,
    paddingVertical: space.xs,
    borderRadius: radius.pill,
  },
  chipText: {
    fontFamily: type.caption.fontFamily,
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  closeIcon: {
    marginLeft: 4,
  },
});
