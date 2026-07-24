import React, { useState } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import AppTextInput from '../components/AppTextInput';
import AppButton from '../components/AppButton';
import IconCircle from '../components/IconCircle';
import ScreenHeader from '../components/ScreenHeader';
import { colors, spacing, typography } from '../theme';
import { RootStackParamList } from '../navigation/types';
import { forgotPassword } from '../services/authService';

type Props = NativeStackScreenProps<RootStackParamList, 'ForgotPassword'>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  async function handleSendResetLink() {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError('Email is required.');
      return;
    }
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setError('Enter a valid email address.');
      return;
    }
    setError(undefined);

    setLoading(true);
    await forgotPassword(trimmedEmail);
    setLoading(false);

    navigation.navigate('ResetPassword', { email: trimmedEmail });
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
          <ScreenHeader title="Forgot Password" />

          <IconCircle size={96} style={styles.iconCircle}>
            <Ionicons name="mail-outline" size={40} color={colors.text} />
          </IconCircle>

          <Text style={styles.subtitle}>
            Enter your email and we&apos;ll send you a code to reset your password.
          </Text>

          <View style={styles.form}>
            <AppTextInput
              label="Email"
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              error={error}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <AppButton title="Send Reset Code" onPress={handleSendResetLink} loading={loading} />
          </View>

          <TouchableOpacity style={styles.footerLink} onPress={() => navigation.goBack()}>
            <Text style={styles.footerLinkText}>Back to Log In</Text>
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
  iconCircle: {
    marginBottom: spacing.lg,
  },
  subtitle: {
    fontSize: typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.xl,
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
