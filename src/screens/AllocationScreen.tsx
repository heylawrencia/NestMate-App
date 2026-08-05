import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import AsyncBoundary from '../components/AsyncBoundary';
import ElevatedCard from '../components/ElevatedCard';
import GradientHeader from '../components/GradientHeader';
import HeaderIconRow from '../components/HeaderIconRow';
import IconCircle from '../components/IconCircle';
import { colors, radius, space, type } from '../theme';
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
    <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
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
                onPress={() => (navigation as any).navigate('HostelList')}
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
    backgroundColor: colors.background,
  },
  headerTitle: {
    fontFamily: type.h1.fontFamily,
    fontSize: type.h1.fontSize,
    fontWeight: '700',
    color: colors.white,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: space.lg,
    paddingVertical: space.lg,
  },
  pendingCard: {
    backgroundColor: '#FCEEDC',
    marginBottom: space.lg,
  },
  pendingTitle: {
    fontFamily: type.bodyStrong.fontFamily,
    fontSize: 15,
    fontWeight: '700',
    color: '#8A5A20',
    marginTop: space.sm,
    marginBottom: 2,
  },
  pendingSubtitle: {
    fontFamily: type.caption.fontFamily,
    fontSize: 13,
    color: '#8A5A20',
  },
  resultCard: {
    backgroundColor: colors.mintLight,
    marginBottom: space.lg,
  },
  resultTitle: {
    fontFamily: type.bodyStrong.fontFamily,
    fontSize: 15,
    fontWeight: '700',
    color: colors.mintDark,
    marginTop: space.sm,
    marginBottom: 2,
  },
  resultSubtitle: {
    fontFamily: type.caption.fontFamily,
    fontSize: 13,
    color: colors.mintDark,
  },
  sectionTitle: {
    fontFamily: type.h3.fontFamily,
    fontSize: type.h3.fontSize,
    fontWeight: '600',
    color: colors.ink,
    marginBottom: space.sm,
  },
  avatarRow: {
    flexDirection: 'row',
    gap: space.sm,
    marginBottom: space.lg,
  },
  avatarInitial: {
    fontFamily: type.bodyStrong.fontFamily,
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
    paddingVertical: space.md,
    paddingHorizontal: space.md,
    marginBottom: space.sm,
  },
  actionText: {
    fontFamily: type.bodyStrong.fontFamily,
    fontSize: 15,
    fontWeight: '500',
    color: colors.ink,
  },
});

