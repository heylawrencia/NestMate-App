/**
 * CodeVerifiedScreen — Confirmation & Next Action Screen (Spec §7.3 & Task 9)
 *
 * Confirmation headline, receipt summary, and TWO EQUALLY PROMINENT ACTIONS:
 * [Find roommates] and [Skip for now] (item 19). Skipping is equally easy.
 */

import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import AppButton from '../components/AppButton';
import ElevatedCard from '../components/ElevatedCard';
import IconCircle from '../components/IconCircle';
import { HostelsStackParamList, RootStackParamList } from '../navigation/types';
import { colors, radius, space, type } from '../theme';

type Props = CompositeScreenProps<
  NativeStackScreenProps<HostelsStackParamList, 'CodeVerified'>,
  NativeStackScreenProps<RootStackParamList>
>;

export default function CodeVerifiedScreen({ route, navigation }: Props) {
  const { code } = route.params;

  const handleFindRoommates = () => {
    (navigation as any).navigate('Matches');
  };

  const handleSkipForNow = () => {
    (navigation as any).reset({ index: 0, routes: [{ name: 'Home' }] });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <ElevatedCard style={styles.card}>
          <IconCircle size={72} backgroundColor={colors.primaryLight} style={styles.iconCenter}>
            <Ionicons name="checkmark-circle" size={44} color={colors.primary} />
          </IconCircle>

          <Text style={styles.headline}>Bed Allocation Confirmed! 🎉</Text>
          <Text style={styles.subheadline}>
            Your access code has been verified. Your room allocation for the 2026/27 academic year is officially confirmed.
          </Text>

          {/* Receipt Summary Box */}
          <View style={styles.receiptBox}>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Access Code</Text>
              <Text style={styles.receiptValue}>{code}</Text>
            </View>
            <View style={styles.receiptDivider} />
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Status</Text>
              <Text style={styles.statusConfirmed}>CONFIRMED</Text>
            </View>
          </View>

          <Text style={styles.promptTitle}>Would you like to match with roommates in your room?</Text>

          {/* TWO EQUALLY PROMINENT ACTIONS (item 19) */}
          <View style={styles.actionsGroup}>
            <AppButton
              title="Find Roommates →"
              variant="primary"
              size="lg"
              onPress={handleFindRoommates}
            />

            <AppButton
              title="Skip for Now"
              variant="secondary"
              size="lg"
              onPress={handleSkipForNow}
            />
          </View>
        </ElevatedCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: space.lg,
    justifyContent: 'center',
  },
  card: {
    padding: space.xl,
    borderRadius: radius.xl,
    alignItems: 'center',
  },
  iconCenter: {
    marginBottom: space.lg,
  },
  headline: {
    fontFamily: type.display.fontFamily,
    fontSize: type.display.fontSize,
    color: colors.ink,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: space.xs,
  },
  subheadline: {
    fontFamily: type.caption.fontFamily,
    fontSize: 14,
    color: colors.inkMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: space.xl,
  },
  receiptBox: {
    width: '100%',
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    padding: space.lg,
    marginBottom: space.xl,
  },
  receiptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  receiptLabel: {
    fontFamily: type.caption.fontFamily,
    fontSize: 13,
    color: colors.inkMuted,
  },
  receiptValue: {
    fontFamily: type.price.fontFamily,
    fontSize: 16,
    color: colors.ink,
    fontWeight: '700',
  },
  receiptDivider: {
    height: 1,
    backgroundColor: colors.line,
    marginVertical: space.sm,
  },
  statusConfirmed: {
    fontFamily: type.micro.fontFamily,
    fontSize: 12,
    color: colors.primary,
    fontWeight: '700',
  },
  promptTitle: {
    fontFamily: type.h3.fontFamily,
    fontSize: type.h3.fontSize,
    color: colors.ink,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: space.lg,
  },
  actionsGroup: {
    width: '100%',
    gap: space.md,
  },
});
