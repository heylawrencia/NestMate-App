import React, { useEffect, useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CompositeScreenProps } from '@react-navigation/native';
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
import { cancelHold, fetchMyHold } from '../services/hostelService';
import { useDrawer } from '../context/DrawerContext';

type Props = CompositeScreenProps<
  NativeStackScreenProps<ExploreStackParamList, 'HoldPending'>,
  NativeStackScreenProps<RootStackParamList>
>;

const REFRESH_INTERVAL_MS = 20_000;

function formatRemaining(ms: number): string {
  if (ms <= 0) return '0h 00m';
  const totalMinutes = Math.floor(ms / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${String(minutes).padStart(2, '0')}m`;
}

export default function HoldPendingScreen({ navigation, route }: Props) {
  const { hostelId, roomTypeId } = route.params;
  const { data: hold, loading, error, reload } = useAsyncData(() => fetchMyHold(), []);
  const { openDrawer } = useDrawer();
  const [now, setNow] = useState(() => Date.now());
  const [cancelling, setCancelling] = useState(false);

  // Backend is the source of truth on expiry - this timer is display-only.
  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(tick);
  }, []);

  // Re-checks the hold periodically in case it expired server-side.
  useEffect(() => {
    const poll = setInterval(reload, REFRESH_INTERVAL_MS);
    return () => clearInterval(poll);
  }, [reload]);

  const remainingMs = hold ? new Date(hold.expiresAt).getTime() - now : 0;

  function confirmCancel() {
    if (!hold) return;
    Alert.alert('Cancel this hold?', 'The bed goes back to open for anyone else.', [
      { text: 'Keep holding', style: 'cancel' },
      {
        text: 'Cancel hold',
        style: 'destructive',
        onPress: async () => {
          setCancelling(true);
          try {
            await cancelHold(hold.holdId);
            navigation.navigate('ChooseRoomType', { hostelId });
          } catch {
            setCancelling(false);
            reload();
          }
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <GradientHeader>
        <HeaderIconRow
          onBack={() => navigation.goBack()}
          onMenuPress={openDrawer}
          onNotificationsPress={() => navigation.navigate('Notifications')}
        />
        <Text style={styles.headerTitle}>Your hold</Text>
      </GradientHeader>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <AsyncBoundary loading={loading} error={error} onRetry={reload}>
          {hold && remainingMs > 0 ? (
            <ElevatedCard style={styles.card}>
              <View style={styles.centeredGroup}>
                <IconCircle size={80} backgroundColor="#FCEEDC" style={styles.iconCircle}>
                  <Ionicons name="time-outline" size={36} color="#B8722A" />
                </IconCircle>
                <Text style={styles.title}>Bed held for {formatRemaining(remainingMs)}</Text>
                <Text style={styles.subtitle}>
                  Pay GHS {hold.amount.toLocaleString()} at the {hold.hostelName} office (room{' '}
                  {hold.roomLabel}) to get your access code. Unpaid holds are released automatically.
                </Text>
              </View>

              <AppButton
                title="I have my code"
                onPress={() => navigation.navigate('AccessCode', { hostelId, roomTypeId })}
              />
              <View style={styles.spacer} />
              <AppButton
                title="Cancel hold"
                variant="outline"
                onPress={confirmCancel}
                loading={cancelling}
              />
            </ElevatedCard>
          ) : (
            <ElevatedCard style={styles.card}>
              <View style={styles.centeredGroup}>
                <IconCircle size={80} backgroundColor="#F4E5E5" style={styles.iconCircle}>
                  <Ionicons name="alert-circle-outline" size={36} color={colors.error} />
                </IconCircle>
                <Text style={styles.title}>No active hold</Text>
                <Text style={styles.subtitle}>
                  This hold expired or was cancelled. Pick a room again to start a new one.
                </Text>
              </View>
              <AppButton
                title="Choose a room"
                onPress={() => navigation.navigate('ChooseRoomType', { hostelId })}
              />
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
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  spacer: {
    height: spacing.sm,
  },
});
