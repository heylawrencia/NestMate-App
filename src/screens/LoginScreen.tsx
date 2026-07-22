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
import ScreenHeader from '../components/ScreenHeader';
import { colors, spacing, typography } from '../theme';
import { RootStackParamList } from '../navigation/types';
import * as authService from '../services/authService';
import { updateProfile } from '../services/profileService';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FormErrors {
  email?: string;
  password?: string;
}

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    const nextErrors: FormErrors = {};

    if (!email.trim()) {
      nextErrors.email = 'Email is required.';
    } else if (!EMAIL_REGEX.test(email.trim())) {
      nextErrors.email = 'Enter a valid email address.';
    }

    if (!password) {
      nextErrors.password = 'Password is required.';
    } else if (password.length < 6) {
      nextErrors.password = 'Password must be at least 6 characters.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleLogin() {
    setFormError(undefined);

    if (!validate()) {
      return;
    }

    setLoading(true);
    const result = await authService.login(email.trim(), password);
    setLoading(false);

    if (result.success) {
      await updateProfile({ email: email.trim() });
      navigation.reset({ index: 0, routes: [{ name: 'Home', params: { email: email.trim() } }] });
    } else {
      setFormError(result.errorMessage ?? 'Something went wrong. Please try again.');
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
          <ScreenHeader
            title="Log In"
            onBack={() =>
              navigation.canGoBack() ? navigation.goBack() : navigation.replace('GetStarted')
            }
          />

          <View style={styles.form}>
            <AppTextInput
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              error={errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <AppTextInput
              label="Password"
              placeholder="Your password"
              value={password}
              onChangeText={setPassword}
              error={errors.password}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              rightAccessory={
                <TouchableOpacity
                  onPress={() => setShowPassword((prev) => !prev)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color={colors.textMuted}
                  />
                </TouchableOpacity>
              }
            />

            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={() => navigation.navigate('ForgotPassword')}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            {formError ? <Text style={styles.formError}>{formError}</Text> : null}

            <AppButton title="Log In" onPress={handleLogin} loading={loading} />

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <AppButton
              title="Continue with Google"
              variant="outline"
              onPress={() => {}}
              icon={<Ionicons name="logo-google" size={18} color={colors.text} />}
            />
            <View style={styles.spacer} />
            <AppButton
              title="Continue with Apple"
              variant="outline"
              onPress={() => {}}
              icon={<Ionicons name="logo-apple" size={18} color={colors.text} />}
            />

            <View style={styles.signUpRow}>
              <Text style={styles.signUpText}>Don&apos;t have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                <Text style={styles.signUpLink}>Sign up</Text>
              </TouchableOpacity>
            </View>
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  form: {
    width: '100%',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: spacing.lg,
  },
  forgotPasswordText: {
    fontSize: typography.caption,
    color: colors.primary,
    fontWeight: typography.weightMedium,
  },
  formError: {
    color: colors.error,
    fontSize: typography.caption,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    marginHorizontal: spacing.md,
    fontSize: typography.caption,
    color: colors.textMuted,
  },
  spacer: {
    height: spacing.md,
  },
  signUpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  signUpText: {
    fontSize: typography.body,
    color: colors.textMuted,
  },
  signUpLink: {
    fontSize: typography.body,
    color: colors.primary,
    fontWeight: typography.weightBold,
  },
});
