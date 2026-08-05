import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import AsyncBoundary from '../components/AsyncBoundary';
import GradientHeader from '../components/GradientHeader';
import HeaderIconRow from '../components/HeaderIconRow';
import IconCircle from '../components/IconCircle';
import SelectableCard from '../components/SelectableCard';
import { colors, spacing, typography } from '../theme';
import { ExploreStackParamList, RootStackParamList } from '../navigation/types';
import { useAsyncData } from '../hooks/useAsyncData';
import { fetchHostelById, getRoomType } from '../services/hostelService';
import { useDrawer } from '../context/DrawerContext';

type Props = CompositeScreenProps<
  NativeStackScreenProps<ExploreStackParamList, 'FindRoommates'>,
  NativeStackScreenProps<RootStackParamList>
>;

export default function FindRoommatesScreen({ navigation, route }: Props) {
  const { hostelId, roomTypeId } = route.params;
  const { data: hostel, loading, error, reload } = useAsyncData(
    () => fetchHostelById(hostelId),
    [hostelId],
  );
  const roomType = hostel ? getRoomType(hostel, roomTypeId) : undefined;
  const roommatesNeeded = roomType ? roomType.capacity - 1 : 0;
  const { openDrawer } = useDrawer();

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
      <GradientHeader>
        <HeaderIconRow
          onBack={() => navigation.goBack()}
          onMenuPress={openDrawer}
          onNotificationsPress={() => navigation.navigate('Notifications')}
        />
        <Text style={styles.headerTitle}>Find your roommates</Text>
      </GradientHeader>

      <AsyncBoundary loading={loading} error={error} onRetry={reload}>
        {hostel && roomType ? (
          <View style={styles.content}>
            <Text style={styles.subtitle}>
              {roomType.label} · {hostel.shortName} · you need {roommatesNeeded} roommate
              {roommatesNeeded === 1 ? '' : 's'}
            </Text>

            <SelectableCard
              selected
              onPress={() => navigation.navigate('RoommateMatching', { hostelId, roomTypeId })}
              style={styles.optionCard}
            >
              <IconCircle size={44} backgroundColor={colors.primaryLight}>
                <Ionicons name="sparkles" size={20} color={colors.primary} />
              </IconCircle>
              <Text style={styles.optionTitle}>Match with students</Text>
              <Text style={styles.optionDescription}>
                Like or pass on compatible students who paid for the same room type
              </Text>
            </SelectableCard>

            <SelectableCard
              onPress={() => (navigation as any).navigate('RoommateGroup', { hostelId, roomTypeId })}
              style={styles.optionCard}
            >
              <IconCircle size={44} backgroundColor={colors.surface}>
                <Ionicons name="people" size={20} color={colors.textMuted} />
              </IconCircle>
              <Text style={styles.optionTitle}>Room with friends</Text>
              <Text style={styles.optionDescription}>
                Add friends who also paid — go to management as a group
              </Text>
            </SelectableCard>

            <Text style={styles.footerNote}>
              You can mix both — match some, invite some
            </Text>
          </View>
        ) : (
          <Text style={styles.notFoundText}>Room type not found.</Text>
        )}
      </AsyncBoundary>
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
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  subtitle: {
    fontSize: typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  optionCard: {
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  optionTitle: {
    fontSize: typography.body,
    fontWeight: typography.weightBold,
    color: colors.text,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  optionDescription: {
    fontSize: typography.caption,
    color: colors.textMuted,
  },
  footerNote: {
    fontSize: typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  notFoundText: {
    fontSize: typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
