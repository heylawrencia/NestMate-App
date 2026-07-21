import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import AsyncBoundary from '../components/AsyncBoundary';
import Badge from '../components/Badge';
import ElevatedCard from '../components/ElevatedCard';
import GradientHeader from '../components/GradientHeader';
import HeaderIconRow from '../components/HeaderIconRow';
import { colors, spacing, typography } from '../theme';
import { ExploreStackParamList, RootStackParamList } from '../navigation/types';
import { useAsyncData } from '../hooks/useAsyncData';
import { fetchCandidateById, respondToCandidate } from '../services/roommateService';
import { useDrawer } from '../context/DrawerContext';

type Props = CompositeScreenProps<
  NativeStackScreenProps<ExploreStackParamList, 'RoommateProfile'>,
  NativeStackScreenProps<RootStackParamList>
>;

export default function RoommateProfileScreen({ navigation, route }: Props) {
  const { hostelId, roomTypeId, candidateId } = route.params;
  const { openDrawer } = useDrawer();
  const {
    data: candidate,
    loading,
    error,
    reload,
  } = useAsyncData(() => fetchCandidateById(hostelId, roomTypeId, candidateId), [
    hostelId,
    roomTypeId,
    candidateId,
  ]);
  const [responding, setResponding] = useState(false);

  async function handleRespond(liked: boolean) {
    if (!candidate || responding) {
      return;
    }
    setResponding(true);
    await respondToCandidate(hostelId, roomTypeId, candidate.id, liked);
    setResponding(false);
    navigation.goBack();
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <GradientHeader>
        <HeaderIconRow
          onBack={() => navigation.goBack()}
          onMenuPress={openDrawer}
          onNotificationsPress={() => navigation.navigate('Notifications')}
        />
        <Text style={styles.headerTitle}>{candidate?.name ?? 'Profile'}</Text>
      </GradientHeader>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <AsyncBoundary loading={loading} error={error} onRetry={reload}>
          {candidate ? (
            <>
              <ElevatedCard style={styles.card}>
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="image-outline" size={40} color={colors.textMuted} />
                </View>

                <View style={styles.nameRow}>
                  <Text style={styles.name}>{candidate.name}</Text>
                  <Badge label={`${candidate.matchPercent}%`} tone="success" />
                </View>

                <Text style={styles.programText}>
                  {candidate.program} · {candidate.level}
                </Text>

                <View style={styles.traitsRow}>
                  {candidate.traits.map((trait) => (
                    <View key={trait} style={styles.traitPill}>
                      <Text style={styles.traitText}>{trait}</Text>
                    </View>
                  ))}
                </View>

                {candidate.bio ? <Text style={styles.bioText}>{candidate.bio}</Text> : null}
              </ElevatedCard>

              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.actionButtonMuted]}
                  onPress={() => handleRespond(false)}
                  disabled={responding}
                  accessibilityLabel="Pass"
                  accessibilityRole="button"
                >
                  <Ionicons name="close" size={22} color={colors.textMuted} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.actionButtonMuted]}
                  onPress={() =>
                    navigation.navigate('Placeholder', {
                      title: `Message ${candidate.name}`,
                      description: 'Chat before you match will be available soon.',
                    })
                  }
                  accessibilityLabel="Message"
                  accessibilityRole="button"
                >
                  <Ionicons name="chatbubble-outline" size={20} color={colors.textMuted} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.actionButtonPrimary]}
                  onPress={() => handleRespond(true)}
                  disabled={responding}
                  accessibilityLabel="Like"
                  accessibilityRole="button"
                >
                  <Ionicons name="heart" size={22} color={colors.white} />
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <Text style={styles.notFoundText}>This student is no longer available.</Text>
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
  actionButtonMuted: {
    backgroundColor: colors.surface,
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
