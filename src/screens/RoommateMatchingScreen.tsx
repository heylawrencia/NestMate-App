import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CompositeScreenProps, useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import AsyncBoundary from '../components/AsyncBoundary';
import Badge from '../components/Badge';
import ElevatedCard from '../components/ElevatedCard';
import EmptyState from '../components/EmptyState';
import GradientHeader from '../components/GradientHeader';
import HeaderIconRow from '../components/HeaderIconRow';
import IconCircle from '../components/IconCircle';
import { colors, spacing, typography } from '../theme';
import { ExploreStackParamList, RootStackParamList } from '../navigation/types';
import { useAsyncData } from '../hooks/useAsyncData';
import { fetchHostelById, getRoomType } from '../services/hostelService';
import {
  fetchCandidates,
  fetchRoommateGroupMembers,
  respondToCandidate,
} from '../services/roommateService';
import { RoommateCandidate } from '../types/roommate';
import { useDrawer } from '../context/DrawerContext';

type Props = CompositeScreenProps<
  NativeStackScreenProps<ExploreStackParamList, 'RoommateMatching'>,
  NativeStackScreenProps<RootStackParamList>
>;

export default function RoommateMatchingScreen({ navigation, route }: Props) {
  const { hostelId, roomTypeId } = route.params;
  const { data: hostel } = useAsyncData(() => fetchHostelById(hostelId), [hostelId]);
  const roomType = hostel ? getRoomType(hostel, roomTypeId) : undefined;
  const roommatesNeeded = roomType ? roomType.capacity - 1 : 0;
  const isListMode = roommatesNeeded >= 2;
  const { openDrawer } = useDrawer();

  const {
    data: candidates,
    loading,
    error,
    reload,
  } = useAsyncData(() => fetchCandidates(hostelId, roomTypeId), [hostelId, roomTypeId]);
  const { data: members, reload: reloadMembers } = useAsyncData(
    () => fetchRoommateGroupMembers(hostelId, roomTypeId),
    [hostelId, roomTypeId],
  );
  const [responding, setResponding] = useState(false);

  const candidate = candidates?.[0] ?? null;
  const isGroupComplete = roommatesNeeded > 0 && (members?.length ?? 0) >= roommatesNeeded;
  const noMoreCandidates = isListMode ? (candidates?.length ?? 0) === 0 : !candidate;

  useFocusEffect(
    useCallback(() => {
      reload();
      reloadMembers();
    }, [reload, reloadMembers]),
  );

  async function handleRespond(candidateId: string, liked: boolean) {
    if (responding) {
      return;
    }
    setResponding(true);
    await respondToCandidate(hostelId, roomTypeId, candidateId, liked);
    setResponding(false);
    reload();
    reloadMembers();
  }

  function renderCandidateRow(item: RoommateCandidate) {
    return (
      <View key={item.id} style={styles.listRow}>
        <TouchableOpacity
          style={styles.listMain}
          activeOpacity={0.7}
          onPress={() =>
            navigation.navigate('RoommateProfile', { hostelId, roomTypeId, candidateId: item.id })
          }
        >
          <IconCircle size={48} backgroundColor={colors.primaryLight}>
            <Text style={styles.listInitial}>{item.name.charAt(0).toUpperCase()}</Text>
          </IconCircle>
          <View style={styles.listTextGroup}>
            <View style={styles.listNameRow}>
              <Text style={styles.listName}>{item.name}</Text>
              <Badge label={`${item.matchPercent}%`} tone="success" />
            </View>
            <Text style={styles.listMeta}>
              {item.program} · {item.level}
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.listActions}>
          <TouchableOpacity
            style={[styles.listActionButton, styles.listActionMuted]}
            onPress={() => handleRespond(item.id, false)}
            disabled={responding}
            accessibilityLabel={`Pass on ${item.name}`}
            accessibilityRole="button"
          >
            <Ionicons name="close" size={18} color={colors.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.listActionButton, styles.listActionPrimary]}
            onPress={() => handleRespond(item.id, true)}
            disabled={responding}
            accessibilityLabel={`Like ${item.name}`}
            accessibilityRole="button"
          >
            <Ionicons name="heart" size={18} color={colors.white} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <GradientHeader>
        <HeaderIconRow
          onBack={() => navigation.goBack()}
          onMenuPress={openDrawer}
          onNotificationsPress={() => navigation.navigate('Notifications')}
        />
        <View style={styles.titleRow}>
          <Text style={styles.headerTitle}>Matching · {hostel?.shortName ?? '...'}</Text>
          {roomType ? <Text style={styles.headerTag}>{roomType.label}</Text> : null}
        </View>
      </GradientHeader>

      <View style={styles.body}>
        <AsyncBoundary loading={loading} error={error} onRetry={reload}>
          {isGroupComplete ? (
            <EmptyState
              icon="checkmark-done-circle-outline"
              title="Your group is complete"
              description="You've found all the roommates you need for this room type."
            />
          ) : isListMode ? (
            candidates && candidates.length > 0 ? (
              <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
                <Text style={styles.listSubtitle}>
                  Tap a student to view their profile, or like/pass right from the list
                </Text>
                <ElevatedCard style={styles.listCard}>
                  {candidates.map(renderCandidateRow)}
                </ElevatedCard>
              </ScrollView>
            ) : (
              <EmptyState
                icon="checkmark-done-circle-outline"
                title="No more students to match"
                description="You've gone through everyone matching right now. Check your group to see who you've matched with."
              />
            )
          ) : candidate ? (
            <View style={styles.content}>
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

                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.actionButtonMuted]}
                    onPress={() => handleRespond(candidate.id, false)}
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
                    onPress={() => handleRespond(candidate.id, true)}
                    disabled={responding}
                    accessibilityLabel="Like"
                    accessibilityRole="button"
                  >
                    <Ionicons name="heart" size={22} color={colors.white} />
                  </TouchableOpacity>
                </View>
              </ElevatedCard>
            </View>
          ) : (
            <EmptyState
              icon="checkmark-done-circle-outline"
              title="No more students to match"
              description="You've gone through everyone matching right now. Check your group to see who you've matched with."
            />
          )}
        </AsyncBoundary>

        {isGroupComplete || (noMoreCandidates && !loading) ? (
          <View style={styles.viewGroupWrapper}>
            <TouchableOpacity
              style={styles.viewGroupButton}
              onPress={() => navigation.navigate('RoommateGroup', { hostelId, roomTypeId })}
            >
              <Text style={styles.viewGroupText}>View your roommate group</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surfaceTint,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: typography.h1,
    fontWeight: typography.weightBold,
    color: colors.white,
    flexShrink: 1,
  },
  headerTag: {
    fontSize: typography.caption,
    color: 'rgba(255,255,255,0.85)',
  },
  body: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  card: {
    padding: spacing.md,
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
    marginBottom: spacing.xl,
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
  listContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  listSubtitle: {
    fontSize: typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  listCard: {
    padding: spacing.sm,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  listMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  listInitial: {
    fontSize: typography.body,
    fontWeight: typography.weightBold,
    color: colors.primary,
  },
  listTextGroup: {
    flex: 1,
  },
  listNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  listName: {
    fontSize: typography.body,
    fontWeight: typography.weightBold,
    color: colors.text,
    flexShrink: 1,
    marginRight: spacing.sm,
  },
  listMeta: {
    fontSize: typography.caption,
    color: colors.textMuted,
  },
  listActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  listActionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listActionMuted: {
    backgroundColor: colors.surface,
  },
  listActionPrimary: {
    backgroundColor: colors.text,
  },
  viewGroupWrapper: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  viewGroupButton: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  viewGroupText: {
    fontSize: typography.body,
    fontWeight: typography.weightBold,
    color: colors.primary,
  },
});
