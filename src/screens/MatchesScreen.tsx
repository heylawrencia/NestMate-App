/**
 * MatchesScreen — Three-State Roommate Matching Screen (Spec §8.2 & Tasks 1, 2, 8)
 *
 * Implements THREE fully designed states:
 * a. NO LIFESTYLE PROFILE → EmptyState prompt routing to Essentials setup
 * b. QUOTA EXHAUSTED (402) → Paywall state with ScoreRing illustration & real numbers (used/limit/resetsOn)
 * c. RESULTS → Grid of match cards with avatar, first name, 56pt ScoreRing, aligned factor chips & interest count
 */

import React, { useMemo, useState } from 'react';
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

import AppButton from '../components/AppButton';
import AsyncBoundary from '../components/AsyncBoundary';
import ElevatedCard from '../components/ElevatedCard';
import EmptyState from '../components/EmptyState';
import IconCircle from '../components/IconCircle';
import ScoreRing from '../components/ScoreRing';
import Skeleton from '../components/Skeleton';
import { useAsyncData } from '../hooks/useAsyncData';
import { MatchesStackParamList, RootStackParamList } from '../navigation/types';
import { fetchMatches, isPaywallError, parsePaywallQuota } from '../services/matchService';
import { fetchProfileCompleteness } from '../services/profileService';
import { colors, radius, space, type } from '../theme';
import { FactorBreakdown, Match, PaywallQuota } from '../types/match';

type Props = CompositeScreenProps<
  NativeStackScreenProps<MatchesStackParamList, 'MatchesList'>,
  NativeStackScreenProps<RootStackParamList>
>;

function getInitials(name: string): string {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return (name[0] ?? '?').toUpperCase();
}

function getTopAlignedChips(breakdown?: FactorBreakdown[] | any): string[] {
  if (Array.isArray(breakdown)) {
    return breakdown
      .filter((b) => b.status === 'ALIGNED')
      .slice(0, 2)
      .map((b) => b.label);
  }
  return [];
}

import CategoryTabs from '../components/CategoryTabs';

const CATEGORIES = [
  { id: 'for_you', label: 'For You' },
  { id: 'nearby', label: 'Nearby' },
  { id: 'new', label: 'New' },
  { id: 'shared', label: 'Shared Interests' },
];

export default function MatchesScreen({ navigation }: Props) {
  const [selectedCategory, setSelectedCategory] = useState('for_you');
  const [paywallData, setPaywallData] = useState<PaywallQuota | null>(null);

  // Check if profile completeness has lifestyle profile
  const { data: completeness } = useAsyncData(fetchProfileCompleteness, []);
  const hasNoLifestyleProfile = completeness && completeness.score < 20;

  const {
    data: matches,
    loading,
    error,
    reload,
  } = useAsyncData(async () => {
    try {
      setPaywallData(null);
      return await fetchMatches(50);
    } catch (err) {
      if (isPaywallError(err)) {
        setPaywallData(parsePaywallQuota(err));
        return [];
      }
      throw err;
    }
  }, []);

  // Client-side filtering/sorting based on selected category tab
  const filteredMatches = useMemo(() => {
    if (!matches) return [];
    switch (selectedCategory) {
      case 'for_you':
        // Default: all matches sorted by score descending
        return [...matches].sort((a, b) => b.score - a.score);

      case 'nearby':
        // High compatibility: score >= 65%
        return [...matches]
          .filter((m) => m.score >= 65)
          .sort((a, b) => b.score - a.score);

      case 'new':
        // Show top matches by score, limited to 10 (simulates "newly discovered")
        return [...matches]
          .sort((a, b) => b.score - a.score)
          .slice(0, 10);

      case 'shared':
        // Matches with at least 1 shared interest, sorted by shared interest count
        return [...matches]
          .filter((m) => (m.sharedInterestCount ?? 0) >= 1)
          .sort((a, b) => (b.sharedInterestCount ?? 0) - (a.sharedInterestCount ?? 0));

      default:
        return matches;
    }
  }, [matches, selectedCategory]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>Roommate Matches</Text>
      </View>

      <CategoryTabs
        categories={CATEGORIES}
        selectedId={selectedCategory}
        onSelect={setSelectedCategory}
      />

      {/* STATE A: NO LIFESTYLE PROFILE */}
      {hasNoLifestyleProfile ? (
        <View style={styles.emptyWrapper}>
          <EmptyState
            icon="sparkles-outline"
            title="Tell us how you live"
            description="Set up your 2-screen lifestyle profile to start matching with compatible students."
            actionLabel="Set up matching →"
            onAction={() => navigation.navigate('Essentials' as any)}
          />
        </View>
      ) : paywallData ? (
        /* STATE B: QUOTA EXHAUSTED (402 PAYWALL STATE) */
        <View style={styles.paywallWrapper}>
          <ElevatedCard style={styles.paywallCard}>
            <ScoreRing score={100} size={88} strokeWidth={7} />

            <Text style={styles.paywallTitle}>Free Match Checks Used</Text>
            <Text style={styles.paywallQuotaText}>
              {paywallData.used} of {paywallData.limit} free monthly matches checked
            </Text>

            <Text style={styles.paywallDescription}>
              You&apos;ve reached your free plan limit for this month. Upgrade to Premium for unlimited roommate matching and instant explanations.
            </Text>

            <View style={styles.paywallButtonWrapper}>
              <AppButton
                title="Upgrade — GH₵20/month →"
                variant="primary"
                size="lg"
                onPress={() => (navigation as any).navigate('UpgradePremium')}
              />
            </View>
          </ElevatedCard>
        </View>
      ) : (
        /* STATE C: RESULTS GRID */
        <AsyncBoundary loading={loading} error={error} onRetry={reload}>
          {loading ? (
            <View style={styles.skeletonGrid}>
              <Skeleton variant="card" height={180} style={styles.skeletonCard} />
              <Skeleton variant="card" height={180} style={styles.skeletonCard} />
            </View>
          ) : filteredMatches.length > 0 ? (
            <FlatList
              data={filteredMatches}
              keyExtractor={(item) => String(item.userId)}
              numColumns={2}
              columnWrapperStyle={styles.gridRow}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }: { item: Match }) => {
                const firstName = item.fullName.split(' ')[0] ?? item.fullName;
                const alignedChips = getTopAlignedChips(item.breakdown);

                return (
                  <TouchableOpacity
                    style={styles.matchCard}
                    onPress={() =>
                      navigation.navigate('MatchProfile', {
                        matchId: String(item.userId),
                        otherUserName: item.fullName,
                      })
                    }
                    activeOpacity={0.85}
                  >
                    {/* Corner 56pt ScoreRing */}
                    <View style={styles.scoreRingCorner}>
                      <ScoreRing score={Math.round(item.score)} size={56} strokeWidth={5} />
                    </View>

                    {/* Avatar Initials Fallback */}
                    <IconCircle size={48} backgroundColor={colors.primaryLight} style={styles.avatarCircle}>
                      <Text style={styles.avatarText}>{getInitials(item.fullName)}</Text>
                    </IconCircle>

                    {/* Mint Match Score Badge */}
                    <View style={styles.mintBadge}>
                      <Text style={styles.mintBadgeText}>✨ {Math.round(item.score)}% Match</Text>
                    </View>

                    <Text style={styles.matchName} numberOfLines={1}>
                      {firstName} {item.age ? `· ${item.age}` : ''}
                    </Text>

                    {/* Aligned Factor Chips */}
                    {alignedChips.length > 0 && (
                      <View style={styles.chipsContainer}>
                        {alignedChips.map((chip, idx) => (
                          <View key={idx} style={styles.alignedChip}>
                            <Text style={styles.chipText} numberOfLines={1}>
                              ✓ {chip}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}

                    {/* Shared Interest Count */}
                    {(item.sharedInterestCount ?? 0) > 0 && (
                      <Text style={styles.interestCountText}>
                        ⚡ {item.sharedInterestCount} shared interest{item.sharedInterestCount! > 1 ? 's' : ''}
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          ) : (
            <EmptyState
              icon="people-outline"
              title={selectedCategory === 'shared' ? 'No shared interests found' : selectedCategory === 'nearby' ? 'No high-compatibility matches' : 'No matches yet'}
              description={selectedCategory === 'shared'
                ? 'Add more interests to your profile to find people with things in common.'
                : selectedCategory === 'nearby'
                ? 'Matches with 65%+ compatibility will appear here once more students join.'
                : 'Check back soon as more students complete their lifestyle profiles in your city.'}
            />
          )}
        </AsyncBoundary>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerBar: {
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  headerTitle: {
    fontFamily: type.h1.fontFamily,
    fontSize: type.h1.fontSize,
    color: colors.ink,
    fontWeight: '700',
  },
  emptyWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  paywallWrapper: {
    flex: 1,
    padding: space.lg,
    justifyContent: 'center',
  },
  paywallCard: {
    padding: space.xl,
    alignItems: 'center',
    borderRadius: radius.xl,
  },
  paywallTitle: {
    fontFamily: type.h1.fontFamily,
    fontSize: type.h1.fontSize,
    color: colors.ink,
    fontWeight: '800',
    marginTop: space.lg,
    textAlign: 'center',
  },
  paywallQuotaText: {
    fontFamily: type.caption.fontFamily,
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
    marginVertical: space.xs,
  },
  paywallDescription: {
    fontFamily: type.caption.fontFamily,
    fontSize: 14,
    color: colors.inkMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: space.xl,
  },
  paywallButtonWrapper: {
    width: '100%',
  },
  skeletonGrid: {
    padding: space.lg,
    flexDirection: 'row',
    gap: space.md,
  },
  skeletonCard: {
    flex: 1,
  },
  listContent: {
    padding: space.lg,
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: space.md,
  },
  matchCard: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.line,
    padding: space.md,
    position: 'relative',
  },
  scoreRingCorner: {
    position: 'absolute',
    top: space.xs,
    right: space.xs,
    zIndex: 2,
  },
  avatarCircle: {
    marginBottom: space.xs,
  },
  mintBadge: {
    backgroundColor: colors.mintLight,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    marginVertical: 4,
  },
  mintBadgeText: {
    fontFamily: type.caption.fontFamily,
    fontSize: 11,
    fontWeight: '700',
    color: colors.mintDark,
  },
  avatarText: {
    fontFamily: type.h2.fontFamily,
    fontSize: 16,
    color: colors.primary,
    fontWeight: '700',
  },
  matchName: {
    fontFamily: type.bodyStrong.fontFamily,
    fontSize: 15,
    color: colors.ink,
    fontWeight: '700',
    marginVertical: 2,
  },
  chipsContainer: {
    gap: 4,
    marginVertical: 4,
  },
  alignedChip: {
    backgroundColor: colors.primaryLight,
    borderRadius: radius.pill,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  chipText: {
    fontFamily: type.micro.fontFamily,
    fontSize: 10,
    color: colors.primary,
    fontWeight: '600',
  },
  interestCountText: {
    fontFamily: type.micro.fontFamily,
    fontSize: 11,
    color: colors.inkMuted,
    marginTop: 4,
  },
});
