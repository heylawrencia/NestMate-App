import React, { useState } from 'react';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import AsyncBoundary from '../components/AsyncBoundary';
import ElevatedCard from '../components/ElevatedCard';
import ScreenHeader from '../components/ScreenHeader';
import { colors, spacing, typography } from '../theme';
import { RootStackParamList } from '../navigation/types';
import { useAsyncData } from '../hooks/useAsyncData';
import { fetchPlan, initiateUpgrade, verifyUpgrade } from '../services/planService';

type Props = NativeStackScreenProps<RootStackParamList, 'UpgradePremium'>;

export default function UpgradePremiumScreen({ navigation }: Props) {
  const { data: plan, loading, error, reload } = useAsyncData(fetchPlan, []);
  const [reference, setReference] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  async function handlePay() {
    setPaying(true);
    setStatusMessage(null);
    try {
      const { authorizationUrl, reference: ref } = await initiateUpgrade(1);
      setReference(ref);
      await Linking.openURL(authorizationUrl);
    } catch (e) {
      setStatusMessage(e instanceof Error ? e.message : 'Could not start payment - try again.');
    } finally {
      setPaying(false);
    }
  }

  async function handleVerify() {
    if (!reference) return;
    setVerifying(true);
    try {
      const updated = await verifyUpgrade(reference);
      setStatusMessage(
        updated.paymentStatus === 'SUCCESS'
          ? "You're Premium! Enjoy unlimited matching."
          : "We haven't seen your payment yet - if you just paid, wait a few seconds and try again.",
      );
      reload();
    } catch (e) {
      setStatusMessage(e instanceof Error ? e.message : 'Could not verify payment - try again.');
    } finally {
      setVerifying(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Upgrade to Premium" onBack={() => navigation.goBack()} />

      <AsyncBoundary loading={loading} error={error} onRetry={reload}>
        {plan ? (
          <ElevatedCard style={styles.card}>
            <View style={styles.priceRow}>
              <Ionicons name="star" size={26} color={colors.primary} />
              <Text style={styles.price}>
                GH₵20<Text style={styles.perMonth}>/month</Text>
              </Text>
            </View>
            <Text style={styles.description}>
              Unlimited roommate matching, every day - no free-tier limit.
            </Text>

            {plan.tier === 'PREMIUM' ? (
              <View style={styles.premiumRow}>
                <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                <Text style={styles.premiumText}>
                  You&apos;re Premium
                  {plan.premiumUntil ? ` until ${new Date(plan.premiumUntil).toLocaleDateString()}` : ''}
                </Text>
              </View>
            ) : (
              <>
                <TouchableOpacity
                  style={[styles.button, styles.payButton]}
                  onPress={handlePay}
                  disabled={paying}
                  accessibilityRole="button"
                  accessibilityLabel="Pay with Paystack"
                >
                  <Text style={styles.payButtonText}>
                    {paying ? 'Starting payment...' : 'Pay with Paystack'}
                  </Text>
                </TouchableOpacity>

                {reference ? (
                  <TouchableOpacity
                    style={[styles.button, styles.verifyButton]}
                    onPress={handleVerify}
                    disabled={verifying}
                    accessibilityRole="button"
                    accessibilityLabel="I've completed payment"
                  >
                    <Text style={styles.verifyButtonText}>
                      {verifying ? 'Checking...' : "I've completed payment"}
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </>
            )}

            {statusMessage ? <Text style={styles.statusText}>{statusMessage}</Text> : null}
          </ElevatedCard>
        ) : null}
      </AsyncBoundary>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surfaceTint,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  card: {
    padding: spacing.lg,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  price: {
    fontSize: typography.h1,
    fontWeight: typography.weightBold,
    color: colors.text,
  },
  perMonth: {
    fontSize: typography.body,
    fontWeight: typography.weightMedium,
    color: colors.textMuted,
  },
  description: {
    fontSize: typography.body,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  button: {
    borderRadius: 14,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  payButton: {
    backgroundColor: colors.primary,
  },
  payButtonText: {
    color: colors.white,
    fontSize: typography.body,
    fontWeight: typography.weightBold,
  },
  verifyButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  verifyButtonText: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: typography.weightMedium,
  },
  premiumRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  premiumText: {
    fontSize: typography.body,
    fontWeight: typography.weightMedium,
    color: colors.success,
  },
  statusText: {
    fontSize: typography.caption,
    color: colors.textMuted,
    marginTop: spacing.md,
    textAlign: 'center',
  },
});
