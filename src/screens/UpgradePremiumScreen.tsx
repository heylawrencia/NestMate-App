/**
 * UpgradePremiumScreen — Upgrade to Premium Membership Screen (Spec §8.2 & Task 7)
 *
 * Describes what Premium unlocks (daily matching, unlimited match checks), GH₵20/month,
 * and initiates Paystack checkout via planService.
 * Handles 503 response cleanly if PAYSTACK_SECRET_KEY is absent.
 */

import React, { useState } from 'react';
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
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import AppButton from '../components/AppButton';
import ElevatedCard from '../components/ElevatedCard';
import IconCircle from '../components/IconCircle';
import { RootStackParamList } from '../navigation/types';
import { ApiError } from '../services/apiClient';
import { initiateUpgrade } from '../services/planService';
import { colors, radius, space, type } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'UpgradePremium'>;

export default function UpgradePremiumScreen({ navigation }: Props) {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleUpgrade = async () => {
    setErrorMessage('');
    setLoading(true);
    try {
      const res = await initiateUpgrade(1);
      setLoading(false);
      if (res.authorizationUrl) {
        Linking.openURL(res.authorizationUrl).catch(() => {
          Alert.alert('Checkout', `Open this link to pay: ${res.authorizationUrl}`);
        });
      }
    } catch (e: any) {
      setLoading(false);
      if (e instanceof ApiError && (e.status === 503 || e.status === 500)) {
        setErrorMessage(
          'Online payment gateway is temporarily unconfigured. Please contact support or pay via Mobile Money offline.'
        );
      } else {
        setErrorMessage(
          e?.message || 'Could not initiate upgrade. Please try again later.'
        );
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Upgrade to Premium</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Banner Card */}
        <ElevatedCard style={styles.heroCard}>
          <IconCircle size={64} backgroundColor={colors.surfaceTint} style={styles.iconCenter}>
            <Ionicons name="sparkles" size={32} color={colors.accent} />
          </IconCircle>

          <Text style={styles.heroTitle}>Unlock Daily Roommate Matching</Text>
          <Text style={styles.heroPrice}>
            GH₵20 <Text style={styles.periodText}>/ month</Text>
          </Text>
          <Text style={styles.heroSubtitle}>
            Get unlimited access to student matching, compatibility breakdowns, and instant messaging.
          </Text>
        </ElevatedCard>

        {/* Feature List */}
        <ElevatedCard style={styles.featuresCard}>
          <Text style={styles.featuresTitle}>What Premium Unlocks</Text>

          <View style={styles.featureRow}>
            <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
            <Text style={styles.featureText}>Unlimited daily match checks</Text>
          </View>

          <View style={styles.featureRow}>
            <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
            <Text style={styles.featureText}>Full 5-factor compatibility explanations</Text>
          </View>

          <View style={styles.featureRow}>
            <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
            <Text style={styles.featureText}>Direct student messaging before room booking</Text>
          </View>

          <View style={styles.featureRow}>
            <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
            <Text style={styles.featureText}>Priority listing in roommate suggestions</Text>
          </View>
        </ElevatedCard>

        {errorMessage ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={20} color={colors.danger} />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        {/* Action Button */}
        <View style={styles.actionWrapper}>
          <AppButton
            title="Subscribe for GH₵20 / month →"
            variant="primary"
            size="lg"
            loading={loading}
            onPress={handleUpgrade}
          />
        </View>
      </ScrollView>
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
  scrollContent: {
    padding: space.lg,
    gap: space.md,
  },
  heroCard: {
    padding: space.xl,
    alignItems: 'center',
    borderRadius: radius.xl,
  },
  iconCenter: {
    marginBottom: space.md,
  },
  heroTitle: {
    fontFamily: type.h1.fontFamily,
    fontSize: type.h1.fontSize,
    color: colors.ink,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: space.xs,
  },
  heroPrice: {
    fontFamily: type.price.fontFamily,
    fontSize: 28,
    color: colors.primary,
    fontWeight: '800',
    marginVertical: space.xs,
  },
  periodText: {
    fontFamily: type.body.fontFamily,
    fontSize: 14,
    color: colors.inkMuted,
    fontWeight: '400',
  },
  heroSubtitle: {
    fontFamily: type.caption.fontFamily,
    fontSize: 13,
    color: colors.inkMuted,
    textAlign: 'center',
  },
  featuresCard: {
    padding: space.lg,
    borderRadius: radius.xl,
  },
  featuresTitle: {
    fontFamily: type.h3.fontFamily,
    fontSize: type.h3.fontSize,
    color: colors.ink,
    fontWeight: '600',
    marginBottom: space.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    marginBottom: space.md,
  },
  featureText: {
    fontFamily: type.body.fontFamily,
    fontSize: 14,
    color: colors.ink,
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: radius.md,
    padding: space.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
  errorText: {
    flex: 1,
    fontFamily: type.caption.fontFamily,
    fontSize: 13,
    color: colors.danger,
  },
  actionWrapper: {
    marginTop: space.sm,
  },
});
