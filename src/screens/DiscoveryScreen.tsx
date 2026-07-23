import React, { useMemo, useState } from 'react';
import { FlatList, Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import AsyncBoundary from '../components/AsyncBoundary';
import Badge from '../components/Badge';
import ElevatedCard from '../components/ElevatedCard';
import EmptyState from '../components/EmptyState';
import GradientHeader from '../components/GradientHeader';
import HeaderIconRow from '../components/HeaderIconRow';
import SearchInput from '../components/SearchInput';
import SegmentedControl from '../components/SegmentedControl';
import SelectableCard from '../components/SelectableCard';
import { colors, spacing, typography } from '../theme';
import { ExploreStackParamList, RootStackParamList } from '../navigation/types';
import { useAsyncData } from '../hooks/useAsyncData';
import { fetchHostels } from '../services/hostelService';
import { Hostel, HostelCategory } from '../types/hostel';
import { useDrawer } from '../context/DrawerContext';

type Props = CompositeScreenProps<
  NativeStackScreenProps<ExploreStackParamList, 'ExploreList'>,
  NativeStackScreenProps<RootStackParamList>
>;

const CATEGORIES: readonly HostelCategory[] = ['Hostels', 'Apartments'];
const LOW_AVAILABILITY_THRESHOLD = 3;

export default function DiscoveryScreen({ navigation }: Props) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<HostelCategory>('Hostels');
  const { openDrawer } = useDrawer();

  const { data: hostels, loading, error, reload } = useAsyncData(
    () => fetchHostels({ category, query }),
    [category, query],
  );

  const listHeader = useMemo(
    () => (
      <View style={styles.tabsWrapper}>
        <SegmentedControl options={CATEGORIES} value={category} onChange={setCategory} />
      </View>
    ),
    [category],
  );

  function renderHostelCard({ item }: { item: Hostel }) {
    const isLowAvailability = item.bedsAvailable <= LOW_AVAILABILITY_THRESHOLD;

    return (
      <SelectableCard
        style={styles.card}
        onPress={() => navigation.navigate('HostelDetail', { hostelId: item.id })}
      >
        <View style={styles.cardImagePlaceholder}>
          {item.imageUrl ? (
            <Image source={{ uri: item.imageUrl }} style={styles.cardImage} resizeMode="cover" />
          ) : (
            <Ionicons name="business-outline" size={32} color={colors.textMuted} />
          )}
        </View>
        <View style={styles.cardBody}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Badge label={`${item.bedsAvailable} beds`} tone={isLowAvailability ? 'warning' : 'success'} />
          </View>
          <Text style={styles.cardSubtitle}>
            {item.location}, from GH₵{item.fromPricePerYear.toLocaleString()}/yr
          </Text>
        </View>
      </SelectableCard>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
      <GradientHeader style={styles.gradientHeader}>
        <HeaderIconRow
          onMenuPress={openDrawer}
          onNotificationsPress={() => navigation.navigate('Notifications')}
        />
        <Text style={styles.header}>Explore</Text>
      </GradientHeader>

      <ElevatedCard style={styles.searchCard}>
        <SearchInput value={query} onChangeText={setQuery} placeholder="Search hostels, apartments..." />
      </ElevatedCard>

      <AsyncBoundary loading={loading} error={error} onRetry={reload}>
        <FlatList
          data={hostels ?? []}
          keyExtractor={(item) => item.id}
          renderItem={renderHostelCard}
          ListHeaderComponent={listHeader}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <EmptyState
              icon="search-outline"
              title={`No ${category.toLowerCase()} found`}
              description="Try a different search term or category."
            />
          }
        />
      </AsyncBoundary>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surfaceTint,
  },
  gradientHeader: {
    paddingBottom: spacing.xxl,
  },
  header: {
    fontSize: typography.h1,
    fontWeight: typography.weightBold,
    color: colors.white,
  },
  searchCard: {
    marginHorizontal: spacing.lg,
    marginTop: -spacing.xl,
    padding: spacing.sm,
  },
  tabsWrapper: {
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  listContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  card: {
    marginBottom: spacing.md,
  },
  cardImagePlaceholder: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 16,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardBody: {
    gap: spacing.xs,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: typography.body,
    fontWeight: typography.weightBold,
    color: colors.text,
  },
  cardSubtitle: {
    fontSize: typography.caption,
    color: colors.textMuted,
  },
});
