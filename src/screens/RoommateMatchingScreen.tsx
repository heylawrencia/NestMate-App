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
  fetchGroupSuggestions,
  fetchRoommateGroupMembers,
  respondToCandidate,
  respondToGroup,
} from '../services/roommateService';
import { RoommateGroupSuggestion } from '../types/roommate';
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
  const isGroupMode = roommatesNeeded >= 2;
  const { openDrawer } = useDrawer();

  const {
    data: candidates,
    loading: candidatesLoading,
    error: candidatesError,
    reload: reloadCandidates,
  } = useAsyncData(() => fetchCandidates(hostelId, roomTypeId), [hostelId, roomTypeId]);
  const {
    data: groupSuggestions,
    loading: groupsLoading,
    error: groupsError,
    reload: reloadGroups,
  } = useAsyncData(
    () => fetchGroupSuggestions(hostelId, roomTypeId, roommatesNeeded),
    [hostelId, roomTypeId, roommatesNeeded],
  );
  const { data: members, reload: reloadMembers } = useAsyncData(
    () => fetchRoommateGroupMembers(hostelId, roomTypeId),
    [hostelId, roomTypeId],
  );
  const [responding, setResponding] = useState(false);

  const candidate = candidates?.[0] ?? null;
  const suggestedGroup = groupSuggestions?.[0] ?? null;
  const isGroupComplete = roommatesNeeded > 0 && (members?.length ?? 0) >= roommatesNeeded;
  const loading = isGroupMode ? groupsLoading : candidatesLoading;
  const error = isGroupMode ? groupsError : candidatesError;
  const reload = isGroupMode ? reloadGroups : reloadCandidates;
  const noMoreToReview = isGroupMode ? (groupSuggestions?.length ?? 0) === 0 : !candidate;

  useFocusEffect(
    useCallback(() => {
      reloadCandidates();
      reloadGroups();
      reloadMembers();
    }, [reloadCandidates, reloadGroups, reloadMembers]),
  );

  async function handleRespond(candidateId: string, liked: boolean) {
    if (responding) {
      return;
    }
    setResponding(true);
    await respondToCandidate(hostelId, roomTypeId, candidateId, liked);
    setResponding(false);
    reloadCandidates();
    reloadMembers();
  }

  async function handleRespondToGroup(groupId: string, liked: boolean) {
    if (responding) {
      return;
    }
    setResponding(true);
    await respondToGroup(hostelId, roomTypeId, groupId, liked);
    setResponding(false);
    reloadGroups();
    reloadMembers();
  }

  function renderGroupSuggestion(group: RoommateGroupSuggestion) {
    return (
      <ElevatedCard style={styles.card}>
        <Text style={styles.groupHeading}>Suggested roommate group</Text>
        <Text style={styles.groupSubheading}>
          {group.members.length} student{group.members.length === 1 ? '' : 's'} · tap a name to view their profile
        </Text>

        {group.members.map((member) => (
          <TouchableOpacity
            key={member.id}
            style={styles.listRow}
            activeOpacity={0.7}
            onPress={() =>
              navigation.navigate('RoommateProfile', { hostelId, roomTypeId, candidateId: member.id })
            }
          >
            <IconCircle size={44} backgroundColor={colors.primaryLight}>
              <Text style={styles.listInitial}>{member.name.charAt(0).toUpperCase()}</Text>
            </IconCircle>
            <View style={styles.listTextGroup}>
              <View style={styles.listNameRow}>
                <Text style={styles.listName}>{member.name}</Text>
                <Badge label={`${member.matchPercent}%`} tone="success" />
              </View>
              <Text style={styles.listMeta}>
                {member.program} · {member.level}
              </Text>
            </View>
          </TouchableOpacity>
        ))}

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonMuted]}
            onPress={() => handleRespondToGroup(group.id, false)}
            disabled={responding}
            accessibilityLabel="Pass on this group"
            accessibilityRole="button"
          >
            <Ionicons name="close" size={22} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonPrimary]}
            onPress={() => handleRespondToGroup(group.id, true)}
            disabled={responding}
            accessibilityLabel="Accept this group"
            accessibilityRole="button"
          >
            <Ionicons name="heart" size={22} color={colors.white} />
          </TouchableOpacity>
        </View>
      </ElevatedCard>
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
          ) : isGroupMode ? (
            suggestedGroup ? (
              <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
                <Text style={styles.listSubtitle}>
                  Review this group and accept it if you'd like to room with all of them
                </Text>
                {renderGroupSuggestion(suggestedGroup)}
              </ScrollView>
            ) : (
              <EmptyState
                icon="checkmark-done-circle-outline"
                title="No more groups to review"
                description="You've gone through every suggested group. Check your group to see who you've matched with."
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

        {isGroupComplete || (noMoreToReview && !loading) ? (
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
  groupHeading: {
    fontSize: typography.body,
    fontWeight: typography.weightBold,
    color: colors.text,
    marginBottom: 2,
  },
  groupSubheading: {
    fontSize: typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
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
