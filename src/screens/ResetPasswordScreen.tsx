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
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import AppButton from '../components/AppButton';
import AppTextInput from '../components/AppTextInput';
import CodeInput from '../components/CodeInput';
import ScreenHeader from '../components/ScreenHeader';
import { colors, spacing, typography } from '../theme';
import { RootStackParamList } from '../navigation/types';
import { resetPassword } from '../services/authService';

type Props = NativeStackScreenProps<RootStackParamList, 'ResetPassword'>;

const CODE_LENGTH = 6;

export default function ResetPasswordScreen({ navigation, route }: Props) {
  const { email } = route.params;
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleReset() {
    if (code.length < CODE_LENGTH) {
      setError('Enter the full 6-digit code.');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setError(undefined);

    setLoading(true);
    const result = await resetPassword(email, code, newPassword);
    setLoading(false);

    if (result.success) {
      setDone(true);
    } else {
      setError(result.errorMessage ?? 'That code doesn’t look right. Try again.');
    }
  }

  if (done) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <ScreenHeader title="Password Reset" />
          <Text style={styles.subtitle}>
            Your password has been changed. Log in with your new password.
          </Text>
          <AppButton title="Back to Log In" onPress={() => navigation.navigate('Login')} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <ScreenHeader title="Reset Password" />
          <Text style={styles.subtitle}>
            Enter the 6-digit code sent to{'\n'}{email}
          </Text>

          <CodeInput length={CODE_LENGTH} onChange={setCode} />

          <View style={styles.fieldSpacing}>
            <AppTextInput
              label="New Password"
              placeholder="At least 8 characters"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <AppTextInput
            label="Confirm New Password"
            placeholder="Re-enter your new password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />

          {error ? <Text style={styles.formError}>{error}</Text> : null}

          <AppButton title="Reset Password" onPress={handleReset} loading={loading} />
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  subtitle: {
    fontSize: typography.body,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  fieldSpacing: {
    marginTop: spacing.lg,
  },
  formError: {
    color: colors.error,
    fontSize: typography.caption,
    marginBottom: spacing.md,
  },
});
