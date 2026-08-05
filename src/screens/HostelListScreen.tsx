/**
 * HostelListScreen — Hostel discovery list screen (Spec §7.1)
 *
 * Search field in header, filter button with active-count badge, FilterChipRow beneath,
 * HostelCard list, Skeleton loading, and EmptyState with [Clear filters].
 * Filter state persists across tab switches within a session.
 */

import React, { useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import AppTextInput from '../components/AppTextInput';
import AsyncBoundary from '../components/AsyncBoundary';
import EmptyState from '../components/EmptyState';
import FilterChipRow from '../components/FilterChipRow';
import FilterSheet from '../components/FilterSheet';
import HostelCard from '../components/HostelCard';
import Skeleton from '../components/Skeleton';
import { useAsyncData } from '../hooks/useAsyncData';
import { HostelsStackParamList, RootStackParamList } from '../navigation/types';
import { fetchHostels } from '../services/hostelService';
import { colors, radius, space, type } from '../theme';
import { Hostel, HostelSearchFilters } from '../types/hostel';

type Props = CompositeScreenProps<
  NativeStackScreenProps<HostelsStackParamList, 'HostelList'>,
  NativeStackScreenProps<RootStackParamList>
>;

// Session-level filter state persistence across tab switches
let sessionFilterState: HostelSearchFilters = {};

export default function HostelListScreen({ navigation }: Props) {
  const [filters, setFilters] = useState<HostelSearchFilters>(sessionFilterState);
  const [filterSheetVisible, setFilterSheetVisible] = useState(false);

  const updateFilters = (newFilters: HostelSearchFilters) => {
    sessionFilterState = newFilters;
    setFilters(newFilters);
  };

  const {
    data: hostels,
    loading,
    error,
    reload,
  } = useAsyncData(() => fetchHostels(filters), [filters]);

  // Calculate active filter count
  let activeFilterCount = 0;
  if (filters.areas && filters.areas.length > 0) activeFilterCount += filters.areas.length;
  if (filters.minPrice != null || filters.maxPrice != null) activeFilterCount += 1;
  if (filters.capacities && filters.capacities.length > 0) activeFilterCount += 1;
  if (filters.kind && filters.kind !== 'ANY') activeFilterCount += 1;
  if (filters.availableOnly) activeFilterCount += 1;
  if (filters.sort && filters.sort !== 'RECOMMENDED') activeFilterCount += 1;

  const handleClearFilters = () => {
    updateFilters({});
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Header Search & Filter Bar */}
      <View style={styles.headerBar}>
        <View style={styles.searchInputWrapper}>
          <AppTextInput
            label=""
            value={filters.query ?? ''}
            onChangeText={(val) => updateFilters({ ...filters, query: val ? val : undefined })}
            placeholder="Search hostels, areas, budget..."
          />
        </View>

        <TouchableOpacity
          style={styles.filterIconButton}
          onPress={() => setFilterSheetVisible(true)}
          accessibilityLabel="Filter options"
          accessibilityRole="button"
        >
          <Ionicons name="options-outline" size={22} color={colors.ink} />
          {activeFilterCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Active Filter Chips */}
      <FilterChipRow filters={filters} onUpdateFilters={updateFilters} />

      {/* Hostel List */}
      <View style={styles.container}>
        <AsyncBoundary loading={loading} error={error} onRetry={reload}>
          {loading ? (
            <View style={styles.skeletonContainer}>
              <Skeleton variant="card" height={200} style={styles.skeletonCard} />
              <Skeleton variant="card" height={200} style={styles.skeletonCard} />
              <Skeleton variant="card" height={200} style={styles.skeletonCard} />
            </View>
          ) : hostels && hostels.length > 0 ? (
            <FlatList
              data={hostels}
              keyExtractor={(item) => String(item.id)}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }: { item: Hostel }) => (
                <HostelCard
                  name={item.name}
                  area={item.location}
                  minPrice={item.fromPricePerYear}
                  photoUrl={item.imageUrl}
                  bedsAvailable={item.bedsAvailable}
                  rating={item.rating}
                  onPress={() => navigation.navigate('HostelDetail', { hostelId: item.id })}
                />
              )}
            />
          ) : (
            <EmptyState
              icon="search-outline"
              title="No hostels found"
              description="Try adjusting your filters or search query to see more results."
              actionLabel="Clear all filters"
              onAction={handleClearFilters}
            />
          )}
        </AsyncBoundary>
      </View>

      {/* Filter Bottom Sheet */}
      <FilterSheet
        visible={filterSheetVisible}
        onClose={() => setFilterSheetVisible(false)}
        filters={filters}
        onApplyFilters={updateFilters}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: space.lg,
    paddingTop: space.sm,
    paddingBottom: space.xs,
    gap: space.md,
  },
  searchInputWrapper: {
    flex: 1,
  },
  filterIconButton: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  filterBadgeText: {
    fontFamily: type.micro.fontFamily,
    fontSize: 10,
    color: colors.white,
    fontWeight: '700',
  },
  container: {
    flex: 1,
  },
  skeletonContainer: {
    padding: space.lg,
    gap: space.md,
  },
  skeletonCard: {
    marginBottom: space.sm,
  },
  listContent: {
    padding: space.lg,
  },
});
