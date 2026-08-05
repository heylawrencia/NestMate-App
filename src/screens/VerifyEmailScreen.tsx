/**
 * VerifyEmailScreen — 6-digit email code verification surface (Spec §5.4)
 *
 * Features 6-box CodeInput with auto-advance and paste support, 30s countdown resend cooldown,
 * clear verification requirements text, and inline error feedback.
 */

import React, { useEffect, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import AppButton from '../components/AppButton';
import CodeInput from '../components/CodeInput';
import { RootStackParamList } from '../navigation/types';
import { resendVerification, verifyEmail } from '../services/authService';
import { colors, elevation, radius, space, type } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'VerifyEmail'>;

const CODE_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 30;

export default function VerifyEmailScreen({ navigation, route }: Props) {
  const { email } = route.params;
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);
  const [resetKey, setResetKey] = useState(0);

  useEffect(() => {
    if (cooldown === 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleResend = async () => {
    if (cooldown > 0) return;
    setCode('');
    setError(undefined);
    setCooldown(RESEND_COOLDOWN_SECONDS);
    setResetKey((prev) => prev + 1);
    await resendVerification(email);
  };

  const handleVerify = async () => {
    if (code.length < CODE_LENGTH) {
      setError('Please enter the complete 6-digit code.');
      return;
    }
    setError(undefined);

    setLoading(true);
    const result = await verifyEmail(email, code);
    setLoading(false);

    if (result.success) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'ChooseIntent' }],
      });
    } else {
      setError(result.errorMessage ?? 'Invalid verification code. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.headerContainer}>
            <View style={styles.logoBadge}>
              <Image
                source={require('../../assets/logo.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.headingTitle}>Verify Your Email</Text>
            <Text style={styles.headingSubhead}>
              We sent a 6-digit code to{'\n'}
              <Text style={styles.emailHighlight}>{email}</Text>
            </Text>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            <Text style={styles.noticeText}>
              Verification is required before you can log in or access NestMate features.
            </Text>

            <View style={styles.codeContainer}>
              <CodeInput key={resetKey} length={CODE_LENGTH} onChange={setCode} />
            </View>

            {error ? <Text style={styles.inlineError}>{error}</Text> : null}

            <View style={styles.actionRow}>
              <AppButton
                title="Verify email"
                onPress={handleVerify}
                loading={loading}
                variant="primary"
                size="lg"
              />
            </View>

            <TouchableOpacity
              style={styles.resendRow}
              onPress={handleResend}
              disabled={cooldown > 0}
            >
              <Text style={styles.resendText}>
                Didn&apos;t receive code?{' '}
                <Text style={cooldown > 0 ? styles.resendMuted : styles.resendLink}>
                  {cooldown > 0 ? `Resend code (${cooldown}s)` : 'Resend code'}
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: space.lg,
    paddingTop: space.xxl,
    paddingBottom: space.xl,
    justifyContent: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: space.xl,
  },
  logoBadge: {
    width: 72,
    height: 72,
    borderRadius: radius.xl,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.lg,
  },
  logoImage: {
    width: 48,
    height: 48,
  },
  headingTitle: {
    fontFamily: type.display.fontFamily,
    fontSize: type.display.fontSize,
    color: colors.ink,
    textAlign: 'center',
    marginBottom: space.xs,
  },
  headingSubhead: {
    fontFamily: type.body.fontFamily,
    fontSize: type.body.fontSize,
    color: colors.inkMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  emailHighlight: {
    fontFamily: type.bodyStrong.fontFamily,
    color: colors.ink,
    fontWeight: '600',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: space.xl,
    ...elevation.card,
    marginBottom: space.xl,
    alignItems: 'center',
  },
  noticeText: {
    fontFamily: type.caption.fontFamily,
    fontSize: 13,
    color: colors.inkMuted,
    textAlign: 'center',
    marginBottom: space.lg,
    lineHeight: 18,
  },
  codeContainer: {
    marginBottom: space.lg,
    width: '100%',
    alignItems: 'center',
  },
  inlineError: {
    fontFamily: type.caption.fontFamily,
    fontSize: 13,
    color: colors.danger,
    textAlign: 'center',
    marginBottom: space.md,
  },
  actionRow: {
    width: '100%',
    marginTop: space.xs,
    marginBottom: space.lg,
  },
  resendRow: {
    alignItems: 'center',
  },
  resendText: {
    fontFamily: type.caption.fontFamily,
    fontSize: 13,
    color: colors.inkMuted,
  },
  resendMuted: {
    color: colors.inkFaint,
  },
  resendLink: {
    fontFamily: type.bodyStrong.fontFamily,
    color: colors.primary,
    fontWeight: '600',
  },
});
