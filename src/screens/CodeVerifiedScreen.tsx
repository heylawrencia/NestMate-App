import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import AppButton from '../components/AppButton';
import AsyncBoundary from '../components/AsyncBoundary';
import Badge from '../components/Badge';
import ElevatedCard from '../components/ElevatedCard';
import GradientHeader from '../components/GradientHeader';
import HeaderIconRow from '../components/HeaderIconRow';
import IconCircle from '../components/IconCircle';
import StepProgressBar from '../components/StepProgressBar';
import { colors, spacing, typography } from '../theme';
import { ExploreStackParamList, RootStackParamList } from '../navigation/types';
import { useAsyncData } from '../hooks/useAsyncData';
import { CURRENT_ACADEMIC_YEAR, fetchHostelById, formatAccessCode } from '../services/hostelService';
import { useDrawer } from '../context/DrawerContext';

type Props = CompositeScreenProps<
  NativeStackScreenProps<ExploreStackParamList, 'CodeVerified'>,
  NativeStackScreenProps<RootStackParamList>
>;

export default function CodeVerifiedScreen({ navigation, route }: Props) {
  const { hostelId, code } = route.params;
  const { data: hostel, loading, error, reload } = useAsyncData(
    () => fetchHostelById(hostelId),
    [hostelId],
  );
  const { openDrawer } = useDrawer();

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
      <GradientHeader>
        <HeaderIconRow
          onBack={() => navigation.goBack()}
          onMenuPress={openDrawer}
          onNotificationsPress={() => navigation.navigate('Notifications')}
        />
        <Text style={styles.headerTitle}>Code Verified</Text>
      </GradientHeader>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <StepProgressBar totalSteps={2} currentStep={1} />

        <AsyncBoundary loading={loading} error={error} onRetry={reload}>
          {hostel ? (
            <ElevatedCard style={styles.card}>
              <View style={styles.centeredGroup}>
                <IconCircle size={80} backgroundColor="#E3F5EE" style={styles.iconCircle}>
                  <Ionicons name="lock-open-outline" size={36} color={colors.success} />
                </IconCircle>

                <Text style={styles.title}>Code verified!</Text>
                <Text style={styles.subtitle}>
                  Your payment is confirmed. You can now start your room allocation.
                </Text>
              </View>

              <View style={styles.detailsCard}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Hostel</Text>
                  <Text style={styles.detailValue}>
                    {hostel.name} · {hostel.location}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Code</Text>
                  <Text style={styles.detailValue}>{formatAccessCode(code)}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Session</Text>
                  <Text style={styles.detailValue}>{CURRENT_ACADEMIC_YEAR}</Text>
                </View>
                <View style={[styles.detailRow, styles.detailRowLast]}>
                  <Text style={styles.detailLabel}>Status</Text>
                  <Badge label="Paid" tone="success" />
                </View>
              </View>

              <View style={styles.infoRow}>
                <Ionicons name="information-circle-outline" size={16} color={colors.textMuted} />
                <Text style={styles.infoText}>
                  This code is now linked to your account — you won&apos;t need to enter it again
                </Text>
              </View>

              <AppButton
                title="Choose your room type"
                onPress={() => navigation.navigate('ChooseRoomType', { hostelId })}
              />
            </ElevatedCard>
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
  card: {
    width: '100%',
  },
  centeredGroup: {
    alignItems: 'center',
  },
  iconCircle: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.h2,
    fontWeight: typography.weightBold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  detailsCard: {
    width: '100%',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailRowLast: {
    borderBottomWidth: 0,
  },
  detailLabel: {
    fontSize: typography.body,
    color: colors.textMuted,
  },
  detailValue: {
    fontSize: typography.body,
    fontWeight: typography.weightBold,
    color: colors.text,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    marginBottom: spacing.xl,
  },
  infoText: {
    flex: 1,
    fontSize: typography.caption,
    color: colors.textMuted,
  },
  notFoundText: {
    fontSize: typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
