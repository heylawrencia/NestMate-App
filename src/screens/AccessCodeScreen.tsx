import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import AppButton from '../components/AppButton';
import AsyncBoundary from '../components/AsyncBoundary';
import CodeInput from '../components/CodeInput';
import ElevatedCard from '../components/ElevatedCard';
import GradientHeader from '../components/GradientHeader';
import HeaderIconRow from '../components/HeaderIconRow';
import StepProgressBar from '../components/StepProgressBar';
import { colors, spacing, typography } from '../theme';
import { ExploreStackParamList, RootStackParamList } from '../navigation/types';
import { useAsyncData } from '../hooks/useAsyncData';
import { fetchHostelById, verifyAccessCode } from '../services/hostelService';
import { useDrawer } from '../context/DrawerContext';

type Props = CompositeScreenProps<
  NativeStackScreenProps<ExploreStackParamList, 'AccessCode'>,
  NativeStackScreenProps<RootStackParamList>
>;

const CODE_LENGTH = 6;

export default function AccessCodeScreen({ navigation, route }: Props) {
  const { hostelId, roomTypeId } = route.params;
  const { data: hostel, loading, error, reload } = useAsyncData(
    () => fetchHostelById(hostelId),
    [hostelId],
  );
  const { openDrawer } = useDrawer();

  const [code, setCode] = useState('');
  const [formError, setFormError] = useState<string | undefined>();
  const [verifying, setVerifying] = useState(false);

  async function handleVerify() {
    if (code.length < CODE_LENGTH) {
      setFormError('Enter the full 6-character code.');
      return;
    }
    setFormError(undefined);

    setVerifying(true);
    const result = await verifyAccessCode(hostelId, code);
    setVerifying(false);

    if (result.success) {
      navigation.navigate('CodeVerified', { hostelId, code, roomTypeId });
    } else {
      setFormError('That code doesn’t look right. Check your receipt and try again.');
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <GradientHeader>
        <HeaderIconRow
          onBack={() => navigation.goBack()}
          onMenuPress={openDrawer}
          onNotificationsPress={() => navigation.navigate('Notifications')}
        />
        <Text style={styles.headerTitle}>{hostel?.shortName ?? 'Hostel'} access</Text>
      </GradientHeader>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <AsyncBoundary loading={loading} error={error} onRetry={reload}>
          <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            <StepProgressBar totalSteps={2} currentStep={0} />

            <ElevatedCard style={styles.card}>
              <Text style={styles.prompt}>Enter the code from your payment receipt</Text>

              <View style={styles.codeWrapper}>
                <CodeInput length={CODE_LENGTH} onChange={setCode} characters />
              </View>

              {formError ? <Text style={styles.formError}>{formError}</Text> : null}

              <View style={styles.infoRow}>
                <Ionicons name="information-circle-outline" size={16} color={colors.textMuted} />
                <Text style={styles.infoText}>Codes are one-time and tied to your payment</Text>
              </View>

              <AppButton title="Verify code" onPress={handleVerify} loading={verifying} />
            </ElevatedCard>

            <Text style={styles.footerText}>No code? Visit the hostel office to pay</Text>
          </ScrollView>
        </AsyncBoundary>
      </KeyboardAvoidingView>
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
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  card: {
    marginBottom: spacing.md,
  },
  prompt: {
    fontSize: typography.body,
    fontWeight: typography.weightMedium,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  codeWrapper: {
    marginBottom: spacing.md,
  },
  formError: {
    color: colors.error,
    fontSize: typography.caption,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  infoText: {
    flex: 1,
    fontSize: typography.caption,
    color: colors.textMuted,
  },
  footerText: {
    fontSize: typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
