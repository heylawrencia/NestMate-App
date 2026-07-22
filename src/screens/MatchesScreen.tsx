import React, { useCallback } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { CompositeScreenProps, useFocusEffect } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import AsyncBoundary from '../components/AsyncBoundary';
import Badge from '../components/Badge';
import ElevatedCard from '../components/ElevatedCard';
import EmptyState from '../components/EmptyState';
import GradientHeader from '../components/GradientHeader';
import HeaderIconRow from '../components/HeaderIconRow';
import IconCircle from '../components/IconCircle';
import { colors, spacing, typography } from '../theme';
import { MainTabParamList, RootStackParamList } from '../navigation/types';
import { useAsyncData } from '../hooks/useAsyncData';
import { fetchAllMatches } from '../services/roommateService';
import { RoommateGroupMember } from '../types/roommate';
import { useDrawer } from '../context/DrawerContext';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Matches'>,
  NativeStackScreenProps<RootStackParamList>
>;

export default function MatchesScreen({ navigation }: Props) {
  const { openDrawer } = useDrawer();
  const { data: matches, loading, error, reload } = useAsyncData(fetchAllMatches, []);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  function renderMatch(member: RoommateGroupMember, index: number, all: RoommateGroupMember[]) {
    return (
      <TouchableOpacity
        key={member.id}
        style={[styles.matchRow, index < all.length - 1 && styles.matchRowDivider]}
        activeOpacity={0.7}
        onPress={() => navigation.navigate('MatchProfile', { matchId: member.id })}
      >
        <IconCircle size={48} backgroundColor={colors.primaryLight}>
          <Text style={styles.matchInitial}>{member.name.charAt(0).toUpperCase()}</Text>
        </IconCircle>
        <Text style={styles.matchName}>{member.name}</Text>
        <Badge label={`${member.matchPercent}% match`} tone="success" />
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <GradientHeader>
        <HeaderIconRow
          onMenuPress={openDrawer}
          onNotificationsPress={() => navigation.navigate('Notifications')}
        />
        <Text style={styles.header}>Matches</Text>
      </GradientHeader>

      <AsyncBoundary loading={loading} error={error} onRetry={reload}>
        {matches && matches.length > 0 ? (
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <ElevatedCard style={styles.listCard}>{matches.map(renderMatch)}</ElevatedCard>
          </ScrollView>
        ) : (
          <EmptyState
            icon="heart-outline"
            title="No matches yet"
            description="Explore rooms and we'll surface roommates who fit your vibe."
          />
        )}
      </AsyncBoundary>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surfaceTint,
  },
  header: {
    fontSize: typography.h1,
    fontWeight: typography.weightBold,
    color: colors.white,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  listCard: {
    padding: spacing.sm,
  },
  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  matchRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  matchInitial: {
    fontSize: typography.body,
    fontWeight: typography.weightBold,
    color: colors.primary,
  },
  matchName: {
    flex: 1,
    fontSize: typography.body,
    fontWeight: typography.weightBold,
    color: colors.text,
  },
});
