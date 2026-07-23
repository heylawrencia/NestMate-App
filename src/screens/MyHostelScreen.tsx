import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import AsyncBoundary from '../components/AsyncBoundary';
import ElevatedCard from '../components/ElevatedCard';
import EmptyState from '../components/EmptyState';
import IconCircle from '../components/IconCircle';
import ScreenHeader from '../components/ScreenHeader';
import { colors, spacing, typography } from '../theme';
import { RootStackParamList } from '../navigation/types';
import { useAsyncData } from '../hooks/useAsyncData';
import { fetchHousingStatus } from '../services/userService';

type Props = NativeStackScreenProps<RootStackParamList, 'MyHostel'>;

export default function MyHostelScreen({ navigation }: Props) {
  const { data: housingStatus, loading, error, reload } = useAsyncData(fetchHousingStatus, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="My Hostel" onBack={() => navigation.goBack()} />

      <AsyncBoundary loading={loading} error={error} onRetry={reload}>
        {housingStatus?.hasRoom ? (
          <ElevatedCard style={styles.card}>
            <View style={styles.row}>
              <IconCircle size={48} backgroundColor={colors.primaryLight}>
                <Ionicons name="bed-outline" size={22} color={colors.primary} />
              </IconCircle>
              <View style={styles.textGroup}>
                <Text style={styles.roomTitle}>Room {housingStatus.roomNumber}</Text>
                <Text style={styles.roomSubtitle}>
                  {housingStatus.hostelName}
                  {housingStatus.floor ? ` · ${housingStatus.floor}` : ''}
                </Text>
              </View>
            </View>
          </ElevatedCard>
        ) : (
          <EmptyState
            icon="business-outline"
            title="No room yet"
            description="Once you select a room, your hostel details and roommates will show up here."
          />
        )}
      </AsyncBoundary>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  card: {
    padding: spacing.md,
    marginTop: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  textGroup: {
    flex: 1,
  },
  roomTitle: {
    fontSize: typography.body,
    fontWeight: typography.weightBold,
    color: colors.text,
  },
  roomSubtitle: {
    fontSize: typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
});
