import React, { useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import AppButton from '../components/AppButton';
import AsyncBoundary from '../components/AsyncBoundary';
import Badge from '../components/Badge';
import ElevatedCard from '../components/ElevatedCard';
import ScreenHeader from '../components/ScreenHeader';
import { colors, spacing, typography } from '../theme';
import { RootStackParamList } from '../navigation/types';
import { useAsyncData } from '../hooks/useAsyncData';
import { logout } from '../services/authService';
import {
  ManagedHostel,
  PendingHold,
  fetchCommission,
  fetchMyHostels,
  fetchPendingHolds,
  generateCode,
  settleCommission,
} from '../services/managerService';

type Props = NativeStackScreenProps<RootStackParamList, 'ManagerDashboard'>;

function formatRemaining(expiresAt: string): string {
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (ms <= 0) return 'expired';
  const hours = Math.floor(ms / 3_600_000);
  const minutes = Math.floor((ms % 3_600_000) / 60_000);
  return `${hours}h ${String(minutes).padStart(2, '0')}m left`;
}

export default function ManagerDashboardScreen({ navigation }: Props) {
  const { data: hostels, loading: hostelsLoading, error: hostelsError, reload: reloadHostels } =
    useAsyncData<ManagedHostel[]>(fetchMyHostels, []);
  const { data: holds, loading: holdsLoading, error: holdsError, reload: reloadHolds } =
    useAsyncData<PendingHold[]>(fetchPendingHolds, []);
  const { data: ledger, loading: ledgerLoading, error: ledgerError, reload: reloadLedger } =
    useAsyncData(fetchCommission, []);

  const [generatingId, setGeneratingId] = useState<number | null>(null);
  const [codesById, setCodesById] = useState<Record<number, string>>({});
  const [settling, setSettling] = useState(false);

  async function handleGenerate(holdId: number) {
    setGeneratingId(holdId);
    const result = await generateCode(holdId);
    setGeneratingId(null);
    if (result.success && result.code) {
      setCodesById((prev) => ({ ...prev, [holdId]: result.code! }));
    } else {
      Alert.alert('Could not generate code', result.errorMessage ?? 'Try again.');
    }
  }

  async function handleSettle() {
    setSettling(true);
    const result = await settleCommission();
    setSettling(false);
    if (result.success) {
      Alert.alert(
        'Settled',
        `Cleared GHS ${result.settledAmountGHS} across ${result.settledCount} record(s).` +
          (result.reinstated ? ' Your account is reinstated.' : ''),
      );
      reloadLedger();
    } else {
      Alert.alert('Could not settle', result.errorMessage ?? 'Try again.');
    }
  }

  function handleLogOut() {
    logout();
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <ScreenHeader title="Manager Dashboard" />

        <AsyncBoundary loading={hostelsLoading} error={hostelsError} onRetry={reloadHostels}>
          <Text style={styles.sectionTitle}>Your hostels</Text>
          {hostels && hostels.length > 0 ? (
            hostels.map((h) => (
              <ElevatedCard key={h.id} style={styles.hostelCard}>
                <Ionicons name="business-outline" size={20} color={colors.primary} />
                <View style={styles.hostelTextGroup}>
                  <Text style={styles.hostelName}>{h.name}</Text>
                  <Text style={styles.hostelArea}>{h.area}, {h.city}</Text>
                </View>
              </ElevatedCard>
            ))
          ) : (
            <Text style={styles.emptyText}>No hostels assigned yet.</Text>
          )}
        </AsyncBoundary>

        <Text style={styles.sectionTitle}>Pending payments</Text>
        <AsyncBoundary loading={holdsLoading} error={holdsError} onRetry={reloadHolds}>
          {holds && holds.length > 0 ? (
            holds.map((h) => (
              <ElevatedCard key={h.holdId} style={styles.holdCard}>
                <View style={styles.holdHeaderRow}>
                  <Text style={styles.holdStudent}>{h.studentName}</Text>
                  <Badge label={formatRemaining(h.expiresAt)} tone="warning" />
                </View>
                <Text style={styles.holdMeta}>
                  {h.hostelName} · Room {h.roomLabel} · GHS {h.amount.toLocaleString()}
                </Text>
                {codesById[h.holdId] ? (
                  <View style={styles.codeRow}>
                    <Ionicons name="key-outline" size={16} color={colors.success} />
                    <Text style={styles.codeText}>{codesById[h.holdId]}</Text>
                    <Text style={styles.codeHint}>give this to the student</Text>
                  </View>
                ) : (
                  <AppButton
                    title="Generate code"
                    onPress={() => handleGenerate(h.holdId)}
                    loading={generatingId === h.holdId}
                  />
                )}
              </ElevatedCard>
            ))
          ) : (
            <Text style={styles.emptyText}>No one is waiting to pay right now.</Text>
          )}
        </AsyncBoundary>

        <Text style={styles.sectionTitle}>Platform commission</Text>
        <AsyncBoundary loading={ledgerLoading} error={ledgerError} onRetry={reloadLedger}>
          {ledger ? (
            <ElevatedCard style={styles.ledgerCard}>
              <View style={styles.ledgerRow}>
                <Text style={styles.ledgerLabel}>Owed</Text>
                <Text style={styles.ledgerValue}>GHS {ledger.owedGHS.toLocaleString()}</Text>
              </View>
              <View style={styles.ledgerRow}>
                <Text style={styles.ledgerLabel}>Overdue</Text>
                <Text style={[styles.ledgerValue, ledger.overdueCount > 0 && styles.overdueValue]}>
                  GHS {ledger.overdueGHS.toLocaleString()} ({ledger.overdueCount})
                </Text>
              </View>
              <View style={styles.ledgerRow}>
                <Text style={styles.ledgerLabel}>Account status</Text>
                <Badge
                  label={ledger.suspended ? 'Suspended' : 'Active'}
                  tone={ledger.suspended ? 'warning' : 'success'}
                />
              </View>
              {ledger.owedGHS > 0 ? (
                <View style={styles.settleButton}>
                  <AppButton title="Settle now" onPress={handleSettle} loading={settling} />
                </View>
              ) : null}
            </ElevatedCard>
          ) : null}
        </AsyncBoundary>

        <TouchableOpacity style={styles.logOutRow} onPress={handleLogOut}>
          <Ionicons name="log-out-outline" size={18} color={colors.textMuted} />
          <Text style={styles.logOutText}>Log out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surfaceTint,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  sectionTitle: {
    fontSize: typography.body,
    fontWeight: typography.weightBold,
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  hostelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  hostelTextGroup: {
    flex: 1,
  },
  hostelName: {
    fontSize: typography.body,
    fontWeight: typography.weightBold,
    color: colors.text,
  },
  hostelArea: {
    fontSize: typography.caption,
    color: colors.textMuted,
  },
  holdCard: {
    marginBottom: spacing.sm,
  },
  holdHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  holdStudent: {
    fontSize: typography.body,
    fontWeight: typography.weightBold,
    color: colors.text,
  },
  holdMeta: {
    fontSize: typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: '#E3F5EE',
    borderRadius: 12,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  codeText: {
    fontSize: typography.body,
    fontWeight: typography.weightBold,
    color: colors.success,
    letterSpacing: 2,
  },
  codeHint: {
    fontSize: typography.caption,
    color: colors.success,
    flex: 1,
    textAlign: 'right',
  },
  ledgerCard: {
    gap: spacing.sm,
  },
  ledgerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ledgerLabel: {
    fontSize: typography.body,
    color: colors.textMuted,
  },
  ledgerValue: {
    fontSize: typography.body,
    fontWeight: typography.weightBold,
    color: colors.text,
  },
  overdueValue: {
    color: colors.error,
  },
  settleButton: {
    marginTop: spacing.sm,
  },
  emptyText: {
    fontSize: typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  logOutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.xl,
    paddingVertical: spacing.md,
  },
  logOutText: {
    fontSize: typography.body,
    color: colors.textMuted,
    fontWeight: typography.weightMedium,
  },
});
