import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import AppButton from '../components/AppButton';
import AsyncBoundary from '../components/AsyncBoundary';
import Badge from '../components/Badge';
import GradientHeader from '../components/GradientHeader';
import HeaderIconRow from '../components/HeaderIconRow';
import SelectableCard from '../components/SelectableCard';
import { colors, spacing, typography } from '../theme';
import { ExploreStackParamList, RootStackParamList } from '../navigation/types';
import { useAsyncData } from '../hooks/useAsyncData';
import { fetchRoomsForType, holdBed } from '../services/hostelService';
import { RoomSummary } from '../types/hostel';
import { ApiError } from '../services/apiClient';
import { useDrawer } from '../context/DrawerContext';

type Props = CompositeScreenProps<
  NativeStackScreenProps<ExploreStackParamList, 'PickRoom'>,
  NativeStackScreenProps<RootStackParamList>
>;

function compatibilityTone(score: number): 'success' | 'warning' | 'neutral' {
  if (score >= 70) return 'success';
  if (score >= 40) return 'warning';
  return 'neutral';
}

export default function PickRoomScreen({ navigation, route }: Props) {
  const { hostelId, roomTypeId } = route.params;
  const { data: rooms, loading, error, reload } = useAsyncData(
    () => fetchRoomsForType(hostelId, roomTypeId),
    [hostelId, roomTypeId],
  );
  const { openDrawer } = useDrawer();

  const [selectedRoomId, setSelectedRoomId] = useState<string | undefined>();
  const [holding, setHolding] = useState(false);
  const [holdError, setHoldError] = useState<string | undefined>();

  const selectedRoom = rooms?.find((r) => r.id === selectedRoomId);

  async function handleContinue() {
    if (!selectedRoom?.freeBedId) return;
    setHoldError(undefined);
    setHolding(true);
    try {
      await holdBed(selectedRoom.freeBedId);
      navigation.replace('HoldPending', { hostelId, roomTypeId });
    } catch (e) {
      setHolding(false);
      setHoldError(
        e instanceof ApiError
          ? e.message
          : 'Could not hold that bed. Check your connection and try again.',
      );
      reload();
    }
  }

  function renderRoom(room: RoomSummary) {
    const isFull = room.bedsAvailable === 0;
    const isSelected = room.id === selectedRoomId;

    return (
      <SelectableCard
        key={room.id}
        selected={isSelected}
        disabled={isFull}
        onPress={() => setSelectedRoomId(room.id)}
      >
        <View style={styles.roomRow}>
          <View style={styles.roomTextGroup}>
            <Text style={styles.roomLabel}>Room {room.label}</Text>
            <Text style={styles.roomMeta}>
              {isFull ? 'Full' : `${room.bedsAvailable} of ${room.capacity} beds open`}
            </Text>
          </View>
          {room.myAvgCompatibility != null ? (
            <Badge
              label={`${Math.round(room.myAvgCompatibility)}% fit`}
              tone={compatibilityTone(room.myAvgCompatibility)}
            />
          ) : (
            <Badge label="Empty room" tone="neutral" />
          )}
        </View>
      </SelectableCard>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <GradientHeader>
        <HeaderIconRow
          onBack={() => navigation.goBack()}
          onMenuPress={openDrawer}
          onNotificationsPress={() => navigation.navigate('Notifications')}
        />
        <Text style={styles.headerTitle}>Choose a room</Text>
      </GradientHeader>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <AsyncBoundary loading={loading} error={error} onRetry={reload}>
          {rooms && rooms.length > 0 ? (
            <>
              <Text style={styles.subtitle}>
                Compatibility shown is your average fit with whoever already lives there.
              </Text>
              <View style={styles.roomList}>{rooms.map(renderRoom)}</View>

              {holdError ? <Text style={styles.holdError}>{holdError}</Text> : null}

              <AppButton
                title="Hold this room (48 hours)"
                onPress={handleContinue}
                loading={holding}
                disabled={!selectedRoom?.freeBedId}
              />
            </>
          ) : (
            <Text style={styles.notFoundText}>No rooms of this type right now.</Text>
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
  roomList: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  roomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  roomTextGroup: {
    flex: 1,
  },
  roomLabel: {
    fontSize: typography.body,
    fontWeight: typography.weightBold,
    color: colors.text,
    marginBottom: 2,
  },
  roomMeta: {
    fontSize: typography.caption,
    color: colors.textMuted,
  },
  holdError: {
    color: colors.error,
    fontSize: typography.caption,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  notFoundText: {
    fontSize: typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
