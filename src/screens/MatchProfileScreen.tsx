import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import AsyncBoundary from '../components/AsyncBoundary';
import Badge from '../components/Badge';
import ElevatedCard from '../components/ElevatedCard';
import GradientHeader from '../components/GradientHeader';
import HeaderIconRow from '../components/HeaderIconRow';
import { colors, spacing, typography } from '../theme';
import { RootStackParamList } from '../navigation/types';
import { useAsyncData } from '../hooks/useAsyncData';
import { fetchMatches } from '../services/matchService';
import { fetchProfileByUserId } from '../services/profileService';
import { useDrawer } from '../context/DrawerContext';

type Props = NativeStackScreenProps<RootStackParamList, 'MatchProfile'>;

const SLEEP_SCHEDULE_LABELS: Record<string, string> = {
  EARLY_BIRD: 'Early Bird',
  NIGHT_OWL: 'Night Owl',
  FLEXIBLE: 'Flexible',
};

export default function MatchProfileScreen({ navigation, route }: Props) {
  const { matchId } = route.params;
  const userId = Number(matchId);
  const { openDrawer } = useDrawer();
  const { data, loading, error, reload } = useAsyncData(async () => {
    const [matches, profile] = await Promise.all([fetchMatches(), fetchProfileByUserId(userId)]);
    return { match: matches.find((m) => m.userId === userId), profile };
  }, [userId]);

  const match = data?.match;
  const profile = data?.profile;
  const facts = profile
    ? [
        profile.city,
        SLEEP_SCHEDULE_LABELS[profile.sleepSchedule] ?? profile.sleepSchedule,
        `GH₵${profile.budgetMin.toLocaleString()}–${profile.budgetMax.toLocaleString()}/yr`,
      ].filter(Boolean)
    : [];

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
      <GradientHeader>
        <HeaderIconRow
          onBack={() => navigation.goBack()}
          onMenuPress={openDrawer}
          onNotificationsPress={() => navigation.navigate('Notifications')}
        />
        <Text style={styles.headerTitle}>{match?.fullName ?? 'Profile'}</Text>
      </GradientHeader>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <AsyncBoundary loading={loading} error={error} onRetry={reload}>
          {match ? (
            <>
              <ElevatedCard style={styles.card}>
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="image-outline" size={40} color={colors.textMuted} />
                </View>

                <View style={styles.nameRow}>
                  <Text style={styles.name}>{match.fullName}</Text>
                  <Badge label={`${Math.round(match.score)}%`} tone="success" />
                </View>

                {facts.length > 0 ? (
                  <View style={styles.traitsRow}>
                    {facts.map((fact) => (
                      <View key={fact} style={styles.traitPill}>
                        <Text style={styles.traitText}>{fact}</Text>
                      </View>
                    ))}
                  </View>
                ) : null}

                {profile?.bio ? <Text style={styles.bioText}>{profile.bio}</Text> : null}
              </ElevatedCard>

              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.actionButtonPrimary]}
                  onPress={() =>
                    navigation.navigate('IndividualChat', {
                      matchId: String(match.userId),
                      otherUserName: match.fullName,
                    })
                  }
                  accessibilityLabel={`Message ${match.fullName}`}
                  accessibilityRole="button"
                >
                  <Ionicons name="chatbubble" size={22} color={colors.white} />
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <Text style={styles.notFoundText}>This match is no longer available.</Text>
          )}
        </AsyncBoundary>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surfaceTint,
  },
  headerTitle: {
    fontSize: typography.h1,
    fontWeight: typography.weightBold,
    color: colors.white,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  card: {
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  imagePlaceholder: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: 16,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  name: {
    fontSize: typography.h2,
    fontWeight: typography.weightBold,
    color: colors.text,
  },
  programText: {
    fontSize: typography.body,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  traitsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  traitPill: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  traitText: {
    fontSize: typography.caption,
    fontWeight: typography.weightMedium,
    color: colors.text,
  },
  bioText: {
    fontSize: typography.body,
    color: colors.textMuted,
    lineHeight: 20,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  actionButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonPrimary: {
    backgroundColor: colors.text,
  },
  notFoundText: {
    fontSize: typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
