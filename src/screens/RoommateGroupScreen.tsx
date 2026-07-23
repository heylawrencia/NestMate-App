import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CompositeScreenProps, useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import AppButton from '../components/AppButton';
import AsyncBoundary from '../components/AsyncBoundary';
import ElevatedCard from '../components/ElevatedCard';
import GradientHeader from '../components/GradientHeader';
import HeaderIconRow from '../components/HeaderIconRow';
import IconCircle from '../components/IconCircle';
import { colors, spacing, typography } from '../theme';
import { ExploreStackParamList, RootStackParamList } from '../navigation/types';
import { useAsyncData } from '../hooks/useAsyncData';
import { fetchHostelById, getRoomType } from '../services/hostelService';
import { fetchRoommateGroupMembers, submitGroupForAllocation } from '../services/roommateService';
import { RoommateGroupMember } from '../types/roommate';
import { useDrawer } from '../context/DrawerContext';

type Props = CompositeScreenProps<
  NativeStackScreenProps<ExploreStackParamList, 'RoommateGroup'>,
  NativeStackScreenProps<RootStackParamList>
>;

export default function RoommateGroupScreen({ navigation, route }: Props) {
  const { hostelId, roomTypeId } = route.params;
  const { data: hostel } = useAsyncData(() => fetchHostelById(hostelId), [hostelId]);
  const roomType = hostel ? getRoomType(hostel, roomTypeId) : undefined;
  const roommatesNeeded = roomType ? roomType.capacity - 1 : 0;
  const { openDrawer } = useDrawer();

  const {
    data: members,
    loading,
    error,
    reload,
  } = useAsyncData(() => fetchRoommateGroupMembers(hostelId, roomTypeId), [hostelId, roomTypeId]);
  const [submitting, setSubmitting] = useState(false);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  const isComplete = (members?.length ?? 0) >= roommatesNeeded;

  function renderMember(member: RoommateGroupMember) {
    const initial = member.name.charAt(0).toUpperCase();
    const isFriend = member.status === 'friend';

    return (
      <View key={member.id} style={styles.memberRow}>
        <IconCircle size={44} backgroundColor={colors.primaryLight}>
          <Text style={styles.memberInitial}>{initial}</Text>
        </IconCircle>
        <View style={styles.memberTextGroup}>
          <Text style={styles.memberName}>{member.name}</Text>
          <View style={styles.memberStatusRow}>
            {isFriend ? (
              <Ionicons name="person-add-outline" size={14} color={colors.textMuted} />
            ) : null}
            <Text style={[styles.memberStatus, isFriend ? styles.memberStatusFriend : styles.memberStatusMatched]}>
              {isFriend ? `Friend · code ${member.friendCode}` : `Matched · ${member.matchPercent}%`}
            </Text>
          </View>
        </View>
      </View>
    );
  }

  async function handleSubmit() {
    setSubmitting(true);
    await submitGroupForAllocation(hostelId, roomTypeId);
    setSubmitting(false);
    navigation.navigate('Allocation', { hostelId, roomTypeId });
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
      <GradientHeader>
        <HeaderIconRow
          onBack={() => navigation.goBack()}
          onMenuPress={openDrawer}
          onNotificationsPress={() => navigation.navigate('Notifications')}
        />
        <Text style={styles.headerTitle}>Your roommate group</Text>
      </GradientHeader>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <AsyncBoundary loading={loading} error={error} onRetry={reload}>
          {hostel && roomType && members ? (
            <>
              <Text style={styles.subtitle}>
                {roomType.label} · {members.length} of {roommatesNeeded} roommates found
              </Text>

              <ElevatedCard style={styles.membersCard}>
                {members.map(renderMember)}
              </ElevatedCard>

              {members.length > 0 ? (
                <TouchableOpacity
                  style={styles.groupChatRow}
                  onPress={() => navigation.navigate('GroupChat', { hostelId, roomTypeId })}
                >
                  <Ionicons name="chatbubbles-outline" size={18} color={colors.text} />
                  <Text style={styles.groupChatText}>Group chat with your roommates</Text>
                  <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                </TouchableOpacity>
              ) : null}

              <Text style={styles.infoText}>
                {isComplete
                  ? `All members confirmed. Submitting sends your group to ${hostel.shortName} management for room allocation.`
                  : `Keep matching or invite friends until you have ${roommatesNeeded} roommates.`}
              </Text>

              <AppButton
                title="Submit group for allocation"
                onPress={handleSubmit}
                disabled={!isComplete}
                loading={submitting}
              />
            </>
          ) : (
            <Text style={styles.notFoundText}>Room type not found.</Text>
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
  subtitle: {
    fontSize: typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  membersCard: {
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  memberInitial: {
    fontSize: typography.body,
    fontWeight: typography.weightBold,
    color: colors.primary,
  },
  memberTextGroup: {
    flex: 1,
  },
  memberName: {
    fontSize: typography.body,
    fontWeight: typography.weightBold,
    color: colors.text,
    marginBottom: 2,
  },
  memberStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  memberStatus: {
    fontSize: typography.caption,
    fontWeight: typography.weightMedium,
  },
  memberStatusMatched: {
    color: colors.success,
  },
  memberStatusFriend: {
    color: colors.textMuted,
  },
  groupChatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.background,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  groupChatText: {
    flex: 1,
    fontSize: typography.body,
    fontWeight: typography.weightMedium,
    color: colors.text,
  },
  infoText: {
    fontSize: typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  notFoundText: {
    fontSize: typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
