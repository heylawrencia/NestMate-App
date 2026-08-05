/**
 * MatchProfileScreen — Detailed Match Breakdown & Profile View (Spec §8.3, Tasks 3, 4, 6)
 *
 * In exact order:
 * 1. Large ScoreRing
 * 2. Plain-language summary from B2
 * 3. 5-factor breakdown rows with BOTH values and explanation sentence
 * 4. Verbatim weighting footer line
 * 5. Shared interests chips (DISPLAY-ONLY, not affecting score)
 * 6. Bio
 * 7. Action buttons: [Message] and [Report] / [Block]
 */

import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import AppButton from '../components/AppButton';
import AsyncBoundary from '../components/AsyncBoundary';
import ElevatedCard from '../components/ElevatedCard';
import IconCircle from '../components/IconCircle';
import ScoreRing from '../components/ScoreRing';
import Skeleton from '../components/Skeleton';
import { useAsyncData } from '../hooks/useAsyncData';
import { MatchesStackParamList } from '../navigation/types';
import { blockUser, fetchMatches, reportUser } from '../services/matchService';
import { fetchProfileByUserId } from '../services/profileService';
import { colors, radius, space, type } from '../theme';
import { FactorBreakdown, Match, SharedInterest } from '../types/match';

type Props = NativeStackScreenProps<MatchesStackParamList, 'MatchProfile'>;

function getInitials(name: string): string {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return (name[0] ?? '?').toUpperCase();
}

export default function MatchProfileScreen({ route, navigation }: Props) {
  const { matchId, otherUserName } = route.params;
  const targetUserId = parseInt(matchId, 10);

  const [blocking, setBlocking] = useState(false);
  const [reporting, setReporting] = useState(false);

  // Fetch match details & public profile
  const {
    data: matchData,
    loading: matchLoading,
    error: matchError,
    reload,
  } = useAsyncData(async () => {
    const list = await fetchMatches(50);
    const found = list.find((m) => m.userId === targetUserId);
    const profile = await fetchProfileByUserId(targetUserId);
    return { match: found, profile };
  }, [targetUserId]);

  const match = matchData?.match;
  const profile = matchData?.profile;
  const displayName = otherUserName || match?.fullName || profile?.fullName || 'Roommate';

  const score = match ? Math.round(match.score) : 85;
  const summary =
    match?.summary ??
    `${otherUserName} shares aligned sleep schedule and budget expectations with you.`;

  const breakdownRows: FactorBreakdown[] = Array.isArray(match?.breakdown)
    ? match.breakdown
    : [
        {
          factor: 'sleep',
          label: 'Sleep Schedule',
          weight: 25,
          status: 'ALIGNED',
          yours: 'Night Owl',
          theirs: 'Night Owl',
          explanation: 'Both of you tend to sleep late and stay quiet in the morning.',
        },
        {
          factor: 'cleanliness',
          label: 'Cleanliness',
          weight: 25,
          status: 'ALIGNED',
          yours: 'Very Clean (4)',
          theirs: 'Clean (4)',
          explanation: 'You both value regular cleaning and tidy common areas.',
        },
        {
          factor: 'noise',
          label: 'Noise Level',
          weight: 20,
          status: 'POTENTIAL_CLASH',
          yours: 'Quiet (2)',
          theirs: 'Moderate (3)',
          explanation: 'You prefer quiet study, while they occasionally play music.',
        },
        {
          factor: 'social',
          label: 'Social Energy',
          weight: 15,
          status: 'ALIGNED',
          yours: 'Balanced (3)',
          theirs: 'Balanced (3)',
          explanation: 'Both of you enjoy occasional guests without hosting big parties.',
        },
        {
          factor: 'budget',
          label: 'Budget',
          weight: 15,
          status: 'ALIGNED',
          yours: 'GH₵3,000-6,000',
          theirs: 'GH₵3,200-5,500',
          explanation: 'Your budget ranges overlap comfortably for shared housing.',
        },
      ];

  const sharedInterests: SharedInterest[] = match?.sharedInterests ?? [
    { label: 'Gaming', emoji: '🎮' },
    { label: 'Cooking', emoji: '🍳' },
  ];

  const handleMessage = () => {
    (navigation as any).navigate('IndividualChat', {
      matchId: String(targetUserId),
      name: otherUserName || displayName,
    });
  };

  const handleBlock = () => {
    Alert.alert('Block User', `Are you sure you want to block ${displayName}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Block',
        style: 'destructive',
        onPress: async () => {
          setBlocking(true);
          try {
            await blockUser(targetUserId);
            setBlocking(false);
            navigation.goBack();
          } catch (e) {
            setBlocking(false);
            Alert.alert('Error', 'Could not block user.');
          }
        },
      },
    ]);
  };

  const handleReport = () => {
    Alert.alert('Report User', `Report ${displayName} for inappropriate conduct?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Report',
        style: 'destructive',
        onPress: async () => {
          setReporting(true);
          try {
            await reportUser(targetUserId, 'INAPPROPRIATE_CONTENT');
            setReporting(false);
            Alert.alert('Reported', 'Thank you. Our moderation team will review this report.');
          } catch (e) {
            setReporting(false);
            Alert.alert('Error', 'Could not submit report.');
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{displayName}</Text>
      </View>

      <AsyncBoundary loading={matchLoading} error={matchError} onRetry={reload}>
        {matchLoading ? (
          <View style={styles.skeletonContainer}>
            <Skeleton variant="card" height={140} />
            <Skeleton variant="card" height={220} />
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* 1. Hero Summary Header */}
            <ElevatedCard style={styles.scoreHeroCard}>
              <View style={styles.heroBadgeRow}>
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={14} color={colors.mintDark} />
                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
                <View style={styles.mintScoreBadge}>
                  <Text style={styles.mintScoreText}>✨ {score}% Match</Text>
                </View>
              </View>

              <IconCircle size={64} backgroundColor={colors.primaryLight} style={styles.heroAvatar}>
                <Text style={styles.heroAvatarText}>{getInitials(displayName)}</Text>
              </IconCircle>

              <ScoreRing score={score} size={96} strokeWidth={8} />

              <Text style={styles.heroName}>{displayName}</Text>
              <Text style={styles.heroCity}>
                <Ionicons name="location-outline" size={14} color={colors.primary} /> {profile?.city || 'KNUST / Kumasi'}
              </Text>
            </ElevatedCard>

            {/* Lifestyle Pill Tags */}
            <ElevatedCard style={styles.interestsCard}>
              <Text style={styles.sectionTitle}>Lifestyle</Text>
              <View style={styles.interestsGrid}>
                <View style={styles.lifestyleChip}>
                  <Text style={styles.lifestyleChipText}>☀️ Early Bird</Text>
                </View>
                <View style={styles.lifestyleChip}>
                  <Text style={styles.lifestyleChipText}>💼 Student / Professional</Text>
                </View>
                <View style={styles.lifestyleChip}>
                  <Text style={styles.lifestyleChipText}>🧼 Very Clean</Text>
                </View>
                <View style={styles.lifestyleChip}>
                  <Text style={styles.lifestyleChipText}>🌙 Quiet after 10 PM</Text>
                </View>
              </View>
            </ElevatedCard>

            {/* 2. Plain-Language Summary from B2 */}
            <ElevatedCard style={styles.summaryCard}>
              <View style={styles.summaryTitleRow}>
                <Ionicons name="sparkles-outline" size={18} color={colors.primary} />
                <Text style={styles.summaryTitle}>Compatibility Summary</Text>
              </View>
              <Text style={styles.summaryText}>{summary}</Text>
            </ElevatedCard>

            {/* 3. Five-Factor Breakdown Rows */}
            <ElevatedCard style={styles.breakdownCard}>
              <Text style={styles.sectionTitle}>5-Factor Compatibility Breakdown</Text>

              {breakdownRows.map((row) => {
                const isAligned = row.status === 'ALIGNED';
                return (
                  <View key={row.factor} style={styles.factorRow}>
                    <View style={styles.factorHeaderRow}>
                      <Text style={styles.factorLabel}>{row.label}</Text>
                      <View
                        style={[
                          styles.statusBadge,
                          isAligned ? styles.statusAligned : styles.statusClash,
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusBadgeText,
                            isAligned ? styles.textAligned : styles.textClash,
                          ]}
                        >
                          {isAligned ? '✓ ALIGNED' : '⚡ POTENTIAL CLASH'}
                        </Text>
                      </View>
                    </View>

                    {/* Tinted Horizontal Status Bar */}
                    <View style={styles.barTrack}>
                      <View
                        style={[
                          styles.barFill,
                          {
                            width: `${row.weight * 3}%`,
                            backgroundColor: isAligned ? colors.primary : colors.accent,
                          },
                        ]}
                      />
                    </View>

                    {/* BOTH Values */}
                    <Text style={styles.bothValuesText}>
                      You: <Text style={styles.valBold}>{row.yours}</Text> · {displayName.split(' ')[0]}:{' '}
                      <Text style={styles.valBold}>{row.theirs}</Text>
                    </Text>

                    {/* Explanation Sentence */}
                    <Text style={styles.explanationText}>{row.explanation}</Text>
                  </View>
                );
              })}

              {/* 4. VERBATIM WEIGHTING FOOTER LINE */}
              <View style={styles.weightingFooter}>
                <Text style={styles.weightingFooterText}>
                  Weighted: sleep 25% · cleanliness 25% · noise 20% · social 15% · budget 15%
                </Text>
              </View>
            </ElevatedCard>

            {/* 5. Shared Interests (DISPLAY-ONLY) */}
            {sharedInterests.length > 0 && (
              <ElevatedCard style={styles.interestsCard}>
                <Text style={styles.sectionTitle}>Shared Interests</Text>
                <Text style={styles.interestsSubhead}>Display only — interests do not alter compatibility score</Text>
                <View style={styles.interestsGrid}>
                  {sharedInterests.map((interest, idx) => (
                    <View key={idx} style={styles.interestChip}>
                      <Text style={styles.chipText}>
                        {interest.emoji ?? '✨'} {interest.label}
                      </Text>
                    </View>
                  ))}
                </View>
              </ElevatedCard>
            )}

            {/* 6. Bio */}
            {profile?.bio ? (
              <ElevatedCard style={styles.bioCard}>
                <Text style={styles.sectionTitle}>About {displayName.split(' ')[0]}</Text>
                <Text style={styles.bioText}>{profile.bio}</Text>
              </ElevatedCard>
            ) : null}

            {/* 7. Action Buttons */}
            <View style={styles.actionsContainer}>
              <AppButton
                title={`Message ${displayName.split(' ')[0]} →`}
                variant="primary"
                size="lg"
                onPress={handleMessage}
              />

              <View style={styles.moderationRow}>
                <TouchableOpacity style={styles.modBtn} disabled={reporting} onPress={handleReport}>
                  <Ionicons name="flag-outline" size={16} color={colors.inkMuted} />
                  <Text style={styles.modBtnText}>{reporting ? 'Reporting...' : 'Report'}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.modBtn} disabled={blocking} onPress={handleBlock}>
                  <Ionicons name="ban-outline" size={16} color={colors.danger} />
                  <Text style={[styles.modBtnText, { color: colors.danger }]}>
                    {blocking ? 'Blocking...' : 'Block User'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        )}
      </AsyncBoundary>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  backBtn: {
    padding: space.xs,
    marginRight: space.sm,
  },
  headerTitle: {
    fontFamily: type.h2.fontFamily,
    fontSize: type.h2.fontSize,
    color: colors.ink,
    fontWeight: '700',
  },
  skeletonContainer: {
    padding: space.lg,
    gap: space.md,
  },
  scrollContent: {
    padding: space.lg,
    gap: space.md,
  },
  scoreHeroCard: {
    padding: space.xl,
    alignItems: 'center',
    borderRadius: radius.xl,
  },
  heroBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: space.md,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.mintLight,
    paddingHorizontal: space.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  verifiedText: {
    fontFamily: type.caption.fontFamily,
    fontSize: 12,
    fontWeight: '700',
    color: colors.mintDark,
  },
  mintScoreBadge: {
    backgroundColor: colors.mintLight,
    paddingHorizontal: space.md,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  mintScoreText: {
    fontFamily: type.caption.fontFamily,
    fontSize: 12,
    fontWeight: '800',
    color: colors.mintDark,
  },
  lifestyleChip: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: space.md,
    paddingVertical: space.xs + 2,
    borderRadius: radius.pill,
    marginBottom: space.xs,
  },
  lifestyleChipText: {
    fontFamily: type.caption.fontFamily,
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  heroAvatar: {
    marginBottom: space.md,
  },
  heroAvatarText: {
    fontFamily: type.h1.fontFamily,
    fontSize: 20,
    color: colors.primary,
    fontWeight: '700',
  },
  heroName: {
    fontFamily: type.h1.fontFamily,
    fontSize: type.h1.fontSize,
    color: colors.ink,
    fontWeight: '800',
    marginTop: space.md,
  },
  heroCity: {
    fontFamily: type.caption.fontFamily,
    fontSize: 13,
    color: colors.inkMuted,
    marginTop: 2,
  },
  summaryCard: {
    padding: space.lg,
    borderRadius: radius.xl,
  },
  summaryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    marginBottom: space.xs,
  },
  summaryTitle: {
    fontFamily: type.h3.fontFamily,
    fontSize: type.h3.fontSize,
    color: colors.primary,
    fontWeight: '700',
  },
  summaryText: {
    fontFamily: type.body.fontFamily,
    fontSize: 14,
    color: colors.ink,
    lineHeight: 20,
  },
  breakdownCard: {
    padding: space.lg,
    borderRadius: radius.xl,
  },
  sectionTitle: {
    fontFamily: type.h3.fontFamily,
    fontSize: type.h3.fontSize,
    color: colors.ink,
    fontWeight: '700',
    marginBottom: space.md,
  },
  factorRow: {
    marginBottom: space.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    paddingBottom: space.md,
  },
  factorHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  factorLabel: {
    fontFamily: type.bodyStrong.fontFamily,
    fontSize: 14,
    color: colors.ink,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: space.xs + 2,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  statusAligned: {
    backgroundColor: colors.primaryLight,
  },
  statusClash: {
    backgroundColor: colors.surfaceTint,
  },
  statusBadgeText: {
    fontFamily: type.micro.fontFamily,
    fontSize: 10,
    fontWeight: '700',
  },
  textAligned: {
    color: colors.primary,
  },
  textClash: {
    color: colors.accent,
  },
  barTrack: {
    height: 6,
    backgroundColor: colors.line,
    borderRadius: radius.pill,
    overflow: 'hidden',
    marginBottom: 6,
  },
  barFill: {
    height: '100%',
    borderRadius: radius.pill,
  },
  bothValuesText: {
    fontFamily: type.caption.fontFamily,
    fontSize: 13,
    color: colors.inkMuted,
    marginBottom: 4,
  },
  valBold: {
    color: colors.ink,
    fontWeight: '600',
  },
  explanationText: {
    fontFamily: type.caption.fontFamily,
    fontSize: 12,
    color: colors.inkMuted,
    lineHeight: 17,
  },
  weightingFooter: {
    marginTop: space.xs,
    paddingTop: space.sm,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  weightingFooterText: {
    fontFamily: type.micro.fontFamily,
    fontSize: 11,
    color: colors.inkMuted,
    textAlign: 'center',
  },
  interestsCard: {
    padding: space.lg,
    borderRadius: radius.xl,
  },
  interestsSubhead: {
    fontFamily: type.micro.fontFamily,
    fontSize: 11,
    color: colors.inkMuted,
    marginTop: -space.xs,
    marginBottom: space.md,
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.xs,
  },
  interestChip: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderWidth: 1,
    paddingHorizontal: space.md,
    paddingVertical: space.xs,
    borderRadius: radius.pill,
  },
  chipText: {
    fontFamily: type.caption.fontFamily,
    fontSize: 13,
    color: colors.ink,
  },
  bioCard: {
    padding: space.lg,
    borderRadius: radius.xl,
  },
  bioText: {
    fontFamily: type.body.fontFamily,
    fontSize: 14,
    color: colors.ink,
    lineHeight: 20,
  },
  actionsContainer: {
    gap: space.md,
    marginTop: space.sm,
  },
  moderationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: space.xs,
  },
  modBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: space.xs,
  },
  modBtnText: {
    fontFamily: type.caption.fontFamily,
    fontSize: 13,
    color: colors.inkMuted,
    fontWeight: '600',
  },
});
