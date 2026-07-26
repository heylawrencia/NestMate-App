import React, { useCallback } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
import { fetchMatches, isPaywallError } from '../services/matchService';
import { Match } from '../types/match';
import { useDrawer } from '../context/DrawerContext';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Matches'>,
  NativeStackScreenProps<RootStackParamList>
>;

export default function MatchesScreen({ navigation }: Props) {
  const { openDrawer } = useDrawer();
  const { data: matches, loading, error, rawError, reload } = useAsyncData(() => fetchMatches(), []);
  const paywalled = isPaywallError(rawError);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  function renderMatch(match: Match, index: number, all: Match[]) {
    return (
      <TouchableOpacity
        key={match.userId}
        style={[styles.matchRow, index < all.length - 1 && styles.matchRowDivider]}
        activeOpacity={0.7}
        onPress={() => navigation.navigate('MatchProfile', { matchId: String(match.userId) })}
      >
        <IconCircle size={48} backgroundColor={colors.primaryLight}>
          <Text style={styles.matchInitial}>{match.fullName.charAt(0).toUpperCase()}</Text>
        </IconCircle>
        <Text style={styles.matchName}>{match.fullName}</Text>
        <Badge label={`${Math.round(match.score)}% match`} tone="success" />
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
      <GradientHeader>
        <HeaderIconRow
          onMenuPress={openDrawer}
          onNotificationsPress={() => navigation.navigate('Notifications')}
        />
        <Text style={styles.header}>Matches</Text>
      </GradientHeader>

      <AsyncBoundary loading={loading} error={paywalled ? null : error} onRetry={reload}>
        {paywalled ? (
          <EmptyState
            icon="lock-closed-outline"
            title="You've used your 5 free days this month"
            description="Free accounts get 5 days of match-checking a month - upgrade to Premium to check matches every day."
            actionLabel="Upgrade to Premium"
            onAction={() => navigation.navigate('UpgradePremium')}
          />
        ) : matches && matches.length > 0 ? (
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <ElevatedCard style={styles.listCard}>{matches.map(renderMatch)}</ElevatedCard>
          </ScrollView>
        ) : (
          <EmptyState
            icon="heart-outline"
            title="No compatible roommates found yet"
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
