import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
import { fetchMatchById } from '../services/roommateService';
import { useDrawer } from '../context/DrawerContext';

type Props = NativeStackScreenProps<RootStackParamList, 'MatchProfile'>;

export default function MatchProfileScreen({ navigation, route }: Props) {
  const { matchId } = route.params;
  const { openDrawer } = useDrawer();
  const { data: match, loading, error, reload } = useAsyncData(() => fetchMatchById(matchId), [matchId]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <GradientHeader>
        <HeaderIconRow
          onBack={() => navigation.goBack()}
          onMenuPress={openDrawer}
          onNotificationsPress={() => navigation.navigate('Notifications')}
        />
        <Text style={styles.headerTitle}>{match?.name ?? 'Profile'}</Text>
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
                  <Text style={styles.name}>{match.name}</Text>
                  {match.matchPercent != null ? (
                    <Badge label={`${match.matchPercent}%`} tone="success" />
                  ) : null}
                </View>

                {match.program || match.level ? (
                  <Text style={styles.programText}>
                    {[match.program, match.level].filter(Boolean).join(' · ')}
                  </Text>
                ) : null}

                {match.traits && match.traits.length > 0 ? (
                  <View style={styles.traitsRow}>
                    {match.traits.map((trait) => (
                      <View key={trait} style={styles.traitPill}>
                        <Text style={styles.traitText}>{trait}</Text>
                      </View>
                    ))}
                  </View>
                ) : null}

                {match.bio ? <Text style={styles.bioText}>{match.bio}</Text> : null}
              </ElevatedCard>

              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.actionButtonPrimary]}
                  onPress={() => navigation.navigate('IndividualChat', { matchId: match.id })}
                  accessibilityLabel={`Message ${match.name}`}
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
