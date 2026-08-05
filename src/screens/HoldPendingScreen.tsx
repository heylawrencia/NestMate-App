/**
 * HoldPendingScreen — 48-hour bed hold pending screen (Spec §7.3 & Task 8)
 *
 * Prominent countdown timer, clear payment instructions, manager contact info,
 * and [Cancel hold] action. Clarity above all for the user's money decision.
 */

import React, { useEffect, useState } from 'react';
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import AppButton from '../components/AppButton';
import AsyncBoundary from '../components/AsyncBoundary';
import ElevatedCard from '../components/ElevatedCard';
import IconCircle from '../components/IconCircle';
import Skeleton from '../components/Skeleton';
import { useAsyncData } from '../hooks/useAsyncData';
import { HostelsStackParamList, RootStackParamList } from '../navigation/types';
import { cancelHold, fetchMyHold } from '../services/hostelService';
import { colors, elevation, radius, space, type } from '../theme';

type Props = CompositeScreenProps<
  NativeStackScreenProps<HostelsStackParamList, 'HoldPending'>,
  NativeStackScreenProps<RootStackParamList>
>;

function formatTimeRemaining(expiresAtIso: string): string {
  const diff = new Date(expiresAtIso).getTime() - Date.now();
  if (diff <= 0) return '00:00:00 (Expired)';
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const secs = Math.floor((diff % (1000 * 60)) / 1000);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(hours)}:${pad(mins)}:${pad(secs)}`;
}

export default function HoldPendingScreen({ navigation }: Props) {
  const {
    data: hold,
    loading,
    error,
    reload,
  } = useAsyncData(fetchMyHold, []);

  const [timeRemainingStr, setTimeRemainingStr] = useState<string>('');
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!hold?.expiresAt) return;
    setTimeRemainingStr(formatTimeRemaining(hold.expiresAt));

    const timer = setInterval(() => {
      setTimeRemainingStr(formatTimeRemaining(hold.expiresAt));
    }, 1000);

    return () => clearInterval(timer);
  }, [hold]);

  const handleCallManager = () => {
    Linking.openURL('tel:+233240000000').catch(() => {
      Alert.alert('Manager Phone', 'Hostel Manager Phone: +233 24 000 0000');
    });
  };

  const handleCancelHold = () => {
    if (!hold) return;
    Alert.alert(
      'Cancel Bed Hold',
      'Are you sure you want to release your hold on this bed? Someone else will be able to book it.',
      [
        { text: 'Keep Hold', style: 'cancel' },
        {
          text: 'Release Bed',
          style: 'destructive',
          onPress: async () => {
            setCancelling(true);
            try {
              await cancelHold(hold.holdId);
              setCancelling(false);
              navigation.navigate('HostelList');
            } catch (e) {
              setCancelling(false);
              Alert.alert('Error', 'Could not cancel hold. Please try again.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hold Pending</Text>
      </View>

      <AsyncBoundary loading={loading} error={error} onRetry={reload}>
        {loading ? (
          <View style={styles.skeletonContainer}>
            <Skeleton variant="card" height={160} />
            <Skeleton variant="card" height={200} />
          </View>
        ) : hold ? (
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Prominent 48-Hour Countdown Box */}
            <ElevatedCard style={styles.countdownCard}>
              <IconCircle size={56} backgroundColor={colors.surfaceTint}>
                <Ionicons name="time-outline" size={28} color={colors.accent} />
              </IconCircle>
              <Text style={styles.countdownBadgeLabel}>HOLD EXPIRATION COUNTDOWN</Text>
              <Text style={styles.countdownTimerText}>{timeRemainingStr}</Text>
              <Text style={styles.countdownSubtext}>
                Your bed in <Text style={{ fontWeight: '700' }}>{hold.hostelName}</Text> ({hold.roomLabel}) is reserved for you.
              </Text>
            </ElevatedCard>

            {/* Payment & Verification Steps */}
            <ElevatedCard style={styles.infoCard}>
              <Text style={styles.infoCardTitle}>How to Confirm Your Reservation</Text>

              <View style={styles.stepRow}>
                <View style={styles.stepNumCircle}>
                  <Text style={styles.stepNumText}>1</Text>
                </View>
                <View style={styles.stepTextCol}>
                  <Text style={styles.stepTitle}>Pay Manager Directly</Text>
                  <Text style={styles.stepDesc}>
                    Pay GH₵{hold.amount.toLocaleString()} directly to the hostel manager via Mobile Money or cash. NestMate never holds student funds.
                  </Text>
                </View>
              </View>

              <View style={styles.stepRow}>
                <View style={styles.stepNumCircle}>
                  <Text style={styles.stepNumText}>2</Text>
                </View>
                <View style={styles.stepTextCol}>
                  <Text style={styles.stepTitle}>Collect Access Code</Text>
                  <Text style={styles.stepDesc}>
                    The manager will issue a 6-digit access code (e.g. 123-456) upon payment receipt.
                  </Text>
                </View>
              </View>

              <View style={styles.stepRow}>
                <View style={styles.stepNumCircle}>
                  <Text style={styles.stepNumText}>3</Text>
                </View>
                <View style={styles.stepTextCol}>
                  <Text style={styles.stepTitle}>Enter Code in App</Text>
                  <Text style={styles.stepDesc}>
                    Tap [Enter Access Code] to confirm your room allocation instantly.
                  </Text>
                </View>
              </View>
            </ElevatedCard>

            {/* Manager Contact Card */}
            <ElevatedCard style={styles.infoCard}>
              <Text style={styles.infoCardTitle}>Hostel Manager Contact</Text>
              <View style={styles.managerRow}>
                <IconCircle size={44} backgroundColor={colors.primaryLight}>
                  <Ionicons name="call-outline" size={22} color={colors.primary} />
                </IconCircle>
                <View style={styles.managerTextCol}>
                  <Text style={styles.managerName}>Hostel Management</Text>
                  <Text style={styles.managerPhone}>+233 24 000 0000</Text>
                </View>
                <AppButton title="Call" variant="outline" size="md" onPress={handleCallManager} />
              </View>
            </ElevatedCard>

            {/* Actions */}
            <View style={styles.actionsContainer}>
              <AppButton
                title="Enter Access Code →"
                variant="primary"
                size="lg"
                onPress={() =>
                  navigation.navigate('AccessCode', { hostelId: '' })
                }
              />

              <TouchableOpacity
                style={styles.cancelBtn}
                disabled={cancelling}
                onPress={handleCancelHold}
              >
                <Text style={styles.cancelBtnText}>
                  {cancelling ? 'Releasing hold...' : 'Cancel Hold & Release Bed'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No Active Hold</Text>
            <Text style={styles.emptySubtitle}>
              You don&apos;t have an active bed hold right now.
            </Text>
            <AppButton
              title="Browse Hostels"
              variant="primary"
              size="lg"
              onPress={() => navigation.navigate('HostelList')}
            />
          </View>
        )}
      </AsyncBoundary>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  backBtn: {
    padding: space.xs,
    marginRight: space.sm,
  },
  headerTitle: {
    fontFamily: type.h2.fontFamily,
    fontSize: type.h2.fontSize,
    color: colors.ink,
    fontWeight: '700',
  },
  skeletonContainer: {
    padding: space.lg,
    gap: space.md,
  },
  scrollContent: {
    padding: space.lg,
    gap: space.md,
  },
  countdownCard: {
    padding: space.xl,
    alignItems: 'center',
    borderRadius: radius.xl,
  },
  countdownBadgeLabel: {
    fontFamily: type.micro.fontFamily,
    fontSize: 11,
    color: colors.accent,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: space.md,
  },
  countdownTimerText: {
    fontFamily: type.display.fontFamily,
    fontSize: 32,
    color: colors.ink,
    fontWeight: '800',
    marginVertical: space.xs,
  },
  countdownSubtext: {
    fontFamily: type.caption.fontFamily,
    fontSize: 13,
    color: colors.inkMuted,
    textAlign: 'center',
  },
  infoCard: {
    padding: space.lg,
    borderRadius: radius.xl,
  },
  infoCardTitle: {
    fontFamily: type.h3.fontFamily,
    fontSize: type.h3.fontSize,
    color: colors.ink,
    fontWeight: '600',
    marginBottom: space.md,
  },
  stepRow: {
    flexDirection: 'row',
    marginBottom: space.md,
  },
  stepNumCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: space.md,
  },
  stepNumText: {
    fontFamily: type.micro.fontFamily,
    fontSize: 12,
    color: colors.primary,
    fontWeight: '700',
  },
  stepTextCol: {
    flex: 1,
  },
  stepTitle: {
    fontFamily: type.bodyStrong.fontFamily,
    fontSize: 14,
    color: colors.ink,
    fontWeight: '600',
  },
  stepDesc: {
    fontFamily: type.caption.fontFamily,
    fontSize: 12,
    color: colors.inkMuted,
    marginTop: 2,
    lineHeight: 18,
  },
  managerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
  managerTextCol: {
    flex: 1,
  },
  managerName: {
    fontFamily: type.bodyStrong.fontFamily,
    fontSize: 14,
    color: colors.ink,
    fontWeight: '600',
  },
  managerPhone: {
    fontFamily: type.caption.fontFamily,
    fontSize: 13,
    color: colors.inkMuted,
    marginTop: 2,
  },
  actionsContainer: {
    gap: space.md,
    marginTop: space.sm,
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: space.sm,
  },
  cancelBtnText: {
    fontFamily: type.bodyStrong.fontFamily,
    fontSize: 14,
    color: colors.danger,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: space.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontFamily: type.h1.fontFamily,
    fontSize: type.h1.fontSize,
    color: colors.ink,
    fontWeight: '700',
    marginBottom: space.xs,
  },
  emptySubtitle: {
    fontFamily: type.caption.fontFamily,
    fontSize: 14,
    color: colors.inkMuted,
    marginBottom: space.xl,
  },
});
