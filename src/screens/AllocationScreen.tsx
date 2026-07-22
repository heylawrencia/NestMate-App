import React, { useEffect } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import AsyncBoundary from '../components/AsyncBoundary';
import ElevatedCard from '../components/ElevatedCard';
import GradientHeader from '../components/GradientHeader';
import HeaderIconRow from '../components/HeaderIconRow';
import IconCircle from '../components/IconCircle';
import { colors, spacing, typography } from '../theme';
import { ExploreStackParamList, RootStackParamList } from '../navigation/types';
import { useAsyncData } from '../hooks/useAsyncData';
import { fetchHostelById, getRoomType } from '../services/hostelService';
import { fetchAllocationStatus, fetchRoommateGroupMembers } from '../services/roommateService';
import { useDrawer } from '../context/DrawerContext';

type Props = CompositeScreenProps<
  NativeStackScreenProps<ExploreStackParamList, 'Allocation'>,
  NativeStackScreenProps<RootStackParamList>
>;

const POLL_INTERVAL_MS = 1500;

export default function AllocationScreen({ navigation, route }: Props) {
  const { hostelId, roomTypeId } = route.params;
  const { data: hostel } = useAsyncData(() => fetchHostelById(hostelId), [hostelId]);
  const roomType = hostel ? getRoomType(hostel, roomTypeId) : undefined;
  const { openDrawer } = useDrawer();

  const {
    data: allocation,
    loading,
    error,
    reload,
  } = useAsyncData(() => fetchAllocationStatus(hostelId, roomTypeId), [hostelId, roomTypeId]);
  const { data: members } = useAsyncData(
    () => fetchRoommateGroupMembers(hostelId, roomTypeId),
    [hostelId, roomTypeId],
  );

  useEffect(() => {
    if (allocation?.status === 'assigned') {
      return;
    }
    const timer = setInterval(reload, POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [allocation?.status, reload]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <GradientHeader>
        <HeaderIconRow
          onBack={() => navigation.goBack()}
          onMenuPress={openDrawer}
          onNotificationsPress={() => navigation.navigate('Notifications')}
        />
        <Text style={styles.headerTitle}>Allocation</Text>
      </GradientHeader>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <AsyncBoundary loading={loading} error={error} onRetry={reload}>
          {allocation?.status === 'assigned' && hostel && roomType ? (
            <>
              <ElevatedCard style={styles.resultCard}>
                <Ionicons name="sparkles" size={20} color={colors.success} />
                <Text style={styles.resultTitle}>
                  Room {allocation.roomNumber} · {allocation.floor}
                </Text>
                <Text style={styles.resultSubtitle}>
                  {hostel.shortName} · {roomType.label} · {allocation.academicYear}
                </Text>
              </ElevatedCard>

              <Text style={styles.sectionTitle}>Your roommates</Text>
              <View style={styles.avatarRow}>
                {members?.map((member) => (
                  <IconCircle key={member.id} size={44} backgroundColor={colors.primaryLight}>
                    <Text style={styles.avatarInitial}>{member.name.charAt(0).toUpperCase()}</Text>
                  </IconCircle>
                ))}
              </View>

              <TouchableOpacity
                style={styles.actionRow}
                onPress={() => navigation.navigate('GroupChat', { hostelId, roomTypeId })}
              >
                <Ionicons name="chatbubbles-outline" size={18} color={colors.text} />
                <Text style={styles.actionText}>Room chat</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionRow}
                onPress={() =>
                  navigation.navigate('Placeholder', {
                    title: 'Allocation Letter',
                    description: 'Downloading your allocation letter will be available soon.',
                  })
                }
              >
                <Ionicons name="download-outline" size={18} color={colors.text} />
                <Text style={styles.actionText}>Letter</Text>
              </TouchableOpacity>
            </>
          ) : (
            <ElevatedCard style={styles.pendingCard}>
              <Ionicons name="hourglass-outline" size={20} color="#B8722A" />
              <Text style={styles.pendingTitle}>Awaiting room assignment</Text>
              <Text style={styles.pendingSubtitle}>
                {hostel?.shortName ?? 'Hostel'} management is allocating your group
              </Text>
            </ElevatedCard>
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
  pendingCard: {
    backgroundColor: '#FCEEDC',
    marginBottom: spacing.lg,
  },
  pendingTitle: {
    fontSize: typography.body,
    fontWeight: typography.weightBold,
    color: '#8A5A20',
    marginTop: spacing.sm,
    marginBottom: 2,
  },
  pendingSubtitle: {
    fontSize: typography.caption,
    color: '#8A5A20',
  },
  resultCard: {
    backgroundColor: '#E3F5EE',
    marginBottom: spacing.lg,
  },
  resultTitle: {
    fontSize: typography.body,
    fontWeight: typography.weightBold,
    color: colors.success,
    marginTop: spacing.sm,
    marginBottom: 2,
  },
  resultSubtitle: {
    fontSize: typography.caption,
    color: colors.success,
  },
  sectionTitle: {
    fontSize: typography.body,
    fontWeight: typography.weightBold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  avatarRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  avatarInitial: {
    fontSize: typography.body,
    fontWeight: typography.weightBold,
    color: colors.primary,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.white,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  actionText: {
    fontSize: typography.body,
    fontWeight: typography.weightMedium,
    color: colors.text,
  },
});
