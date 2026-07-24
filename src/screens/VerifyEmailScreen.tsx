import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import AppButton from '../components/AppButton';
import CodeInput from '../components/CodeInput';
import ScreenHeader from '../components/ScreenHeader';
import { colors, spacing, typography } from '../theme';
import { RootStackParamList } from '../navigation/types';
import { resendVerification, verifyEmail } from '../services/authService';

type Props = NativeStackScreenProps<RootStackParamList, 'VerifyEmail'>;

const CODE_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 30;

export default function VerifyEmailScreen({ navigation, route }: Props) {
  const { email, name } = route.params;
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);
  const [resetKey, setResetKey] = useState(0);

  useEffect(() => {
    if (cooldown === 0) {
      return;
    }
    const timer = setInterval(() => {
      setCooldown((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  function goHome() {
    navigation.reset({ index: 0, routes: [{ name: 'Home', params: { email, name } }] });
  }

  async function handleResend() {
    if (cooldown > 0) {
      return;
    }
    setCode('');
    setError(undefined);
    setCooldown(RESEND_COOLDOWN_SECONDS);
    setResetKey((prev) => prev + 1);
    await resendVerification(email);
  }

  async function handleVerify() {
    if (code.length < CODE_LENGTH) {
      setError('Enter the full 6-digit code.');
      return;
    }
    setError(undefined);

    setLoading(true);
    const result = await verifyEmail(email, code);
    setLoading(false);

    if (result.success) {
      goHome();
    } else {
      setError(result.errorMessage ?? 'That code doesn’t look right. Try again.');
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <ScreenHeader title="Verify Your Email" />
          <Text style={styles.subtitle}>
            Enter the 6-digit code sent to{'\n'}{email}
            {'\n\n'}Verification is required before you can use NESTMATE.
          </Text>

          <View style={styles.codeRow}>
            <CodeInput key={resetKey} length={CODE_LENGTH} onChange={setCode} />
          </View>

          {error ? <Text style={styles.formError}>{error}</Text> : null}

          <TouchableOpacity
            style={styles.resendRow}
            onPress={handleResend}
            disabled={cooldown > 0}
          >
            <Text style={styles.resendText}>
              Didn&apos;t receive code?{' '}
              <Text style={cooldown > 0 ? styles.resendMuted : styles.resendLink}>
                {cooldown > 0 ? `Resend (${cooldown}s)` : 'Resend'}
              </Text>
            </Text>
          </TouchableOpacity>

          <View style={styles.form}>
            <AppButton title="Verify" onPress={handleVerify} loading={loading} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  subtitle: {
    fontSize: typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  codeRow: {
    marginBottom: spacing.lg,
  },
  formError: {
    color: colors.error,
    fontSize: typography.caption,
    marginBottom: spacing.md,
  },
  resendRow: {
    marginBottom: spacing.xl,
  },
  resendText: {
    fontSize: typography.caption,
    color: colors.textMuted,
  },
  resendMuted: {
    color: colors.textMuted,
    fontWeight: typography.weightMedium,
  },
  resendLink: {
    color: colors.primary,
    fontWeight: typography.weightBold,
  },
  form: {
    width: '100%',
  },
});
