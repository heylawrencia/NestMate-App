import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import AppButton from '../components/AppButton';
import AsyncBoundary from '../components/AsyncBoundary';
import GradientHeader from '../components/GradientHeader';
import HeaderIconRow from '../components/HeaderIconRow';
import SelectableCard from '../components/SelectableCard';
import { colors, spacing, typography } from '../theme';
import { ExploreStackParamList, RootStackParamList } from '../navigation/types';
import { useAsyncData } from '../hooks/useAsyncData';
import { fetchHostelById } from '../services/hostelService';
import { RoomType } from '../types/hostel';
import { useDrawer } from '../context/DrawerContext';

type Props = CompositeScreenProps<
  NativeStackScreenProps<ExploreStackParamList, 'ChooseRoomType'>,
  NativeStackScreenProps<RootStackParamList>
>;

export default function ChooseRoomTypeScreen({ navigation, route }: Props) {
  const { hostelId } = route.params;
  const { data: hostel, loading, error, reload } = useAsyncData(
    () => fetchHostelById(hostelId),
    [hostelId],
  );
  const { openDrawer } = useDrawer();

  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState<string | undefined>();

  function renderRoomTypeRow(roomType: RoomType) {
    const isFull = roomType.bedsLeft === 0;
    const isSelected = roomType.id === selectedRoomTypeId;

    return (
      <SelectableCard
        key={roomType.id}
        selected={isSelected}
        onPress={() => setSelectedRoomTypeId(roomType.id)}
      >
        <View style={styles.roomTypeRow}>
          <View style={styles.roomTypeTextGroup}>
            <Text style={styles.roomTypeLabel}>{roomType.label}</Text>
            <Text style={styles.roomTypeMeta}>
              GHS {roomType.pricePerYear.toLocaleString()}/yr
              {isFull
                ? ' · Full — join the waitlist'
                : roomType.studentsMatching
                ? ` · ${roomType.studentsMatching} students matching`
                : ''}
            </Text>
          </View>
          <View style={[styles.radio, isSelected && styles.radioSelected]}>
            {isSelected ? <View style={styles.radioDot} /> : null}
          </View>
        </View>
      </SelectableCard>
    );
  }

  function handleContinue() {
    if (!selectedRoomTypeId) {
      return;
    }
    navigation.navigate('PickRoom', { hostelId, roomTypeId: selectedRoomTypeId });
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <GradientHeader>
        <HeaderIconRow
          onBack={() => navigation.goBack()}
          onMenuPress={openDrawer}
          onNotificationsPress={() => navigation.navigate('Notifications')}
        />
        <Text style={styles.headerTitle}>Choose room type</Text>
      </GradientHeader>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <AsyncBoundary loading={loading} error={error} onRetry={reload}>
          {hostel ? (
            <>
              <View style={styles.verifiedBadge}>
                <Ionicons name="business-outline" size={16} color={colors.success} />
                <Text style={styles.verifiedText}>{hostel.shortName}</Text>
              </View>

              <Text style={styles.subtitle}>What room size do you want?</Text>

              <View style={styles.roomTypeList}>{hostel.roomTypes.map(renderRoomTypeRow)}</View>

              <AppButton
                title="Continue"
                onPress={handleContinue}
                disabled={!selectedRoomTypeId}
              />
            </>
          ) : (
            <Text style={styles.notFoundText}>Hostel not found.</Text>
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
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    backgroundColor: '#E3F5EE',
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.lg,
  },
  verifiedText: {
    fontSize: typography.caption,
    fontWeight: typography.weightBold,
    color: colors.success,
  },
  subtitle: {
    fontSize: typography.body,
    fontWeight: typography.weightMedium,
    color: colors.text,
    marginBottom: spacing.md,
  },
  roomTypeList: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  roomTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  roomTypeTextGroup: {
    flex: 1,
  },
  roomTypeLabel: {
    fontSize: typography.body,
    fontWeight: typography.weightBold,
    color: colors.text,
    marginBottom: 2,
  },
  roomTypeMeta: {
    fontSize: typography.caption,
    color: colors.textMuted,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  radioSelected: {
    borderColor: colors.primary,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  notFoundText: {
    fontSize: typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
