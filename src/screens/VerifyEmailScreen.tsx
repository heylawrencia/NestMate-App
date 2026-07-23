import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import AppButton from '../components/AppButton';
import CodeInput from '../components/CodeInput';
import ScreenHeader from '../components/ScreenHeader';
import { colors, spacing, typography } from '../theme';
import { RootStackParamList } from '../navigation/types';
import * as authService from '../services/authService';

type Props = NativeStackScreenProps<RootStackParamList, 'VerifyEmail'>;

const CODE_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 30;

export default function VerifyEmailScreen({ navigation, route }: Props) {
  const { email, fullName, mode = 'reset' } = route.params;
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

  async function handleResend() {
    if (cooldown > 0) {
      return;
    }
    setCode('');
    setError(undefined);
    setCooldown(RESEND_COOLDOWN_SECONDS);
    setResetKey((prev) => prev + 1);

    // The 'reset' (forgot-password) path has no backend support yet - only
    // account email verification exists, not password reset - so it stays mocked.
    if (mode === 'signup') {
      const result = await authService.resendVerification(email);
      if (!result.success) {
        setError(result.errorMessage);
      }
    }
  }

  async function handleVerify() {
    if (code.length < CODE_LENGTH) {
      setError('Enter the full 6-digit code.');
      return;
    }
    setError(undefined);
    setLoading(true);

    if (mode === 'signup') {
      const result = await authService.verifyEmail(email, code);
      setLoading(false);
      if (result.success) {
        navigation.navigate('OnboardingAboutYou', { data: { email, fullName } });
      } else {
        setError(result.errorMessage);
      }
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 800));
    setLoading(false);
    navigation.navigate('Login');
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
          <Text style={styles.subtitle}>Enter the 6-digit code sent to{'\n'}{email}</Text>

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

          <TouchableOpacity
            style={styles.footerLink}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.footerLinkText}>Change Email</Text>
          </TouchableOpacity>
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
  footerLink: {
    marginTop: spacing.lg,
  },
  footerLinkText: {
    fontSize: typography.body,
    color: colors.primary,
    fontWeight: typography.weightBold,
  },
});
