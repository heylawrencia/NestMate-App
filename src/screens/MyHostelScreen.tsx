import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
          <>
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

            <TouchableOpacity
              style={styles.actionRow}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('Invites')}
            >
              <IconCircle size={40} backgroundColor="#E3F5EE">
                <Ionicons name="people-outline" size={20} color={colors.success} />
              </IconCircle>
              <View style={styles.textGroup}>
                <Text style={styles.actionTitle}>Find roommates & invite</Text>
                <Text style={styles.actionSubtitle}>
                  See who fits your room and share your invite code
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionRow}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('Home', { email: '' })}
            >
              <IconCircle size={40} backgroundColor="#FCEEDC">
                <Ionicons name="chatbubble-ellipses-outline" size={20} color="#B8722A" />
              </IconCircle>
              <View style={styles.textGroup}>
                <Text style={styles.actionTitle}>Message your roommates</Text>
                <Text style={styles.actionSubtitle}>Open Chat from the bottom tab</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </>
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
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: 16,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionTitle: {
    fontSize: typography.body,
    fontWeight: typography.weightBold,
    color: colors.text,
  },
  actionSubtitle: {
    fontSize: typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
});
