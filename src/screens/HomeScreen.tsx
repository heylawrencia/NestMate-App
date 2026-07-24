import React, { useCallback } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CompositeScreenProps, useFocusEffect } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import ElevatedCard from '../components/ElevatedCard';
import GradientHeader from '../components/GradientHeader';
import IconCircle from '../components/IconCircle';
import { colors, spacing, typography } from '../theme';
import { MainTabParamList, RootStackParamList } from '../navigation/types';
import { useAsyncData } from '../hooks/useAsyncData';
import { fetchHousingStatus } from '../services/userService';
import { fetchHostels } from '../services/hostelService';
import { fetchMatches, isPaywallError } from '../services/matchService';
import { Match } from '../types/match';
import { useDrawer } from '../context/DrawerContext';
import { useAuth } from '../context/AuthContext';
import { displayNameFor } from '../utils/formatName';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'HomeTab'>,
  NativeStackScreenProps<RootStackParamList>
>;

const MATCH_AVATAR_TONES = [colors.primaryLight, '#E3F5EE', '#FCEEDC'];

function initialsFor(name: string): string {
  return name
    .split(' ')
    .map((part) => part.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function HomeScreen({ navigation }: Props) {
  const { email } = useAuth();
  const firstName = displayNameFor(email ?? '');
  const { data: housingStatus, loading: housingLoading } = useAsyncData(fetchHousingStatus, []);
  const { data: hostels, loading: hostelsLoading } = useAsyncData(() => fetchHostels(), []);
  const {
    data: topMatches,
    loading: matchesLoading,
    rawError: matchesRawError,
    reload: reloadTopMatches,
  } = useAsyncData(() => fetchMatches(3), []);
  const matchesPaywalled = isPaywallError(matchesRawError);
  const { openDrawer } = useDrawer();

  useFocusEffect(
    useCallback(() => {
      reloadTopMatches();
    }, [reloadTopMatches]),
  );

  const minPrice = hostels?.length ? Math.min(...hostels.map((hostel) => hostel.fromPricePerYear)) : null;

  const quickActions = [
    {
      key: 'explore',
      label: 'Explore',
      icon: 'compass-outline' as const,
      color: colors.accent,
      onPress: () => navigation.navigate('Explore'),
    },
    {
      key: 'matches',
      label: 'Matches',
      icon: 'people-outline' as const,
      color: colors.primary,
      onPress: () => navigation.navigate('Matches'),
    },
    {
      key: 'invites',
      label: 'Invites',
      icon: 'ticket-outline' as const,
      color: colors.secondary,
      onPress: () => navigation.navigate('Invites'),
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <GradientHeader style={styles.gradientHeader}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={openDrawer} accessibilityLabel="Open menu" accessibilityRole="button">
              <IconCircle size={40} backgroundColor="rgba(255,255,255,0.2)">
                <Text style={styles.avatarInitial}>{firstName.charAt(0).toUpperCase()}</Text>
              </IconCircle>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate('Notifications')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityLabel="Notifications"
              accessibilityRole="button"
            >
              <Ionicons name="notifications-outline" size={24} color={colors.white} />
            </TouchableOpacity>
          </View>
          <Text style={styles.greeting}>Hello, {firstName} 👋</Text>
          <Text style={styles.subtitle}>Where will you live this year?</Text>
        </GradientHeader>

        <TouchableOpacity
          style={styles.searchCard}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Explore')}
        >
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <Text style={styles.searchPlaceholder}>Search hostels, areas, budget...</Text>
        </TouchableOpacity>

        <View style={styles.content}>
          <View style={styles.quickActionsRow}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.key}
                style={styles.quickActionTile}
                activeOpacity={0.8}
                onPress={action.onPress}
              >
                <Ionicons name={action.icon} size={26} color={action.color} />
                <Text style={styles.quickActionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Top matches for you</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Matches')}>
              <Text style={styles.seeAllLink}>See all</Text>
            </TouchableOpacity>
          </View>

          {matchesLoading ? (
            <ActivityIndicator color={colors.primary} style={styles.sectionLoader} />
          ) : matchesPaywalled ? (
            <ElevatedCard style={styles.noMatchesCard}>
              <Text style={styles.noMatchesText}>
                You&apos;ve used your free matches this month. Upgrade to Premium for unlimited matching.
              </Text>
            </ElevatedCard>
          ) : topMatches && topMatches.length > 0 ? (
            <View style={styles.matchesRow}>
              {topMatches.map((match: Match, index: number) => (
                <TouchableOpacity
                  key={match.userId}
                  style={styles.matchCard}
                  activeOpacity={0.7}
                  onPress={() => navigation.navigate('MatchProfile', { matchId: String(match.userId) })}
                >
                  <IconCircle size={56} backgroundColor={MATCH_AVATAR_TONES[index % MATCH_AVATAR_TONES.length]}>
                    <Text style={styles.matchInitials}>{initialsFor(match.fullName)}</Text>
                  </IconCircle>
                  <Text style={styles.matchName} numberOfLines={1}>
                    {match.fullName.split(' ')[0]} {match.fullName.split(' ')[1]?.charAt(0)}.
                  </Text>
                  <Text
                    style={[
                      styles.matchPercent,
                      { color: match.score >= 85 ? colors.success : colors.accent },
                    ]}
                  >
                    {Math.round(match.score)}% match
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <ElevatedCard style={styles.noMatchesCard}>
              <Text style={styles.noMatchesText}>
                No matches yet — head to Explore and start matching with roommates.
              </Text>
            </ElevatedCard>
          )}

          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Your room</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Explore')}>
              <Text style={styles.seeAllLink}>Browse</Text>
            </TouchableOpacity>
          </View>

          <ElevatedCard style={styles.roomCard}>
            {housingLoading || hostelsLoading ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <TouchableOpacity
                style={styles.roomRow}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('Explore')}
              >
                {housingStatus?.hasRoom ? (
                  <IconCircle size={40} backgroundColor={colors.primaryLight}>
                    <Ionicons name="bed-outline" size={20} color={colors.primary} />
                  </IconCircle>
                ) : (
                  <Text style={styles.roomFlag}>🇬🇭</Text>
                )}
                <View style={styles.roomTextGroup}>
                  {housingStatus?.hasRoom ? (
                    <>
                      <Text style={styles.roomTitle}>Room {housingStatus.roomNumber}</Text>
                      <Text style={styles.roomSubtitle}>{housingStatus.hostelName}</Text>
                    </>
                  ) : (
                    <>
                      <Text style={styles.roomTitle}>No room yet</Text>
                      <Text style={styles.roomSubtitle}>
                        {hostels?.length ?? 0} hostels near KNUST
                        {minPrice ? ` from GH₵${minPrice.toLocaleString()}/yr` : ''}
                      </Text>
                    </>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            )}
          </ElevatedCard>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surfaceTint,
  },
  scrollContent: {
    flexGrow: 1,
  },
  gradientHeader: {
    paddingBottom: spacing.xxl,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  avatarInitial: {
    fontSize: typography.body,
    fontWeight: typography.weightBold,
    color: colors.white,
  },
  greeting: {
    fontSize: typography.h1,
    fontWeight: typography.weightBold,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.body,
    color: 'rgba(255,255,255,0.85)',
  },
  searchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: 14,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginHorizontal: spacing.lg,
    marginTop: -spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  searchPlaceholder: {
    fontSize: typography.body,
    color: colors.textMuted,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  quickActionTile: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primaryLight,
    borderRadius: 16,
    paddingVertical: spacing.md,
  },
  quickActionLabel: {
    fontSize: typography.caption,
    fontWeight: typography.weightMedium,
    color: colors.text,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.body,
    fontWeight: typography.weightBold,
    color: colors.text,
  },
  seeAllLink: {
    fontSize: typography.caption,
    fontWeight: typography.weightMedium,
    color: colors.primary,
  },
  sectionLoader: {
    marginBottom: spacing.xl,
  },
  matchesRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  matchCard: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  matchInitials: {
    fontSize: typography.body,
    fontWeight: typography.weightBold,
    color: colors.primary,
  },
  matchName: {
    fontSize: typography.caption,
    fontWeight: typography.weightBold,
    color: colors.text,
  },
  matchPercent: {
    fontSize: 11,
    fontWeight: typography.weightMedium,
  },
  noMatchesCard: {
    padding: spacing.md,
    marginBottom: spacing.xl,
  },
  noMatchesText: {
    fontSize: typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
  },
  roomCard: {
    padding: spacing.md,
  },
  roomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  roomFlag: {
    fontSize: 28,
    width: 40,
    textAlign: 'center',
  },
  roomTextGroup: {
    flex: 1,
  },
  roomTitle: {
    fontSize: typography.body,
    fontWeight: typography.weightBold,
    color: colors.text,
  },
  roomSubtitle: {
    fontSize: typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
});
