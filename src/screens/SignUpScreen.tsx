import React, { useState } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import AppTextInput from '../components/AppTextInput';
import AppButton from '../components/AppButton';
import ScreenHeader from '../components/ScreenHeader';
import { colors, spacing, typography } from '../theme';
import { RootStackParamList } from '../navigation/types';
import { useAuth } from '../context/AuthContext';

type Props = NativeStackScreenProps<RootStackParamList, 'SignUp'>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Backend requires passwords of at least 8 characters (AuthDtos.RegisterRequest).
const MIN_PASSWORD_LENGTH = 8;

interface FormErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  terms?: string;
}

export default function SignUpScreen({ navigation }: Props) {
  const { register } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    const nextErrors: FormErrors = {};

    if (!fullName.trim()) {
      nextErrors.fullName = 'Full name is required.';
    }

    if (!email.trim()) {
      nextErrors.email = 'Email is required.';
    } else if (!EMAIL_REGEX.test(email.trim())) {
      nextErrors.email = 'Enter a valid email address.';
    } else if (!email.trim().toLowerCase().endsWith('@gmail.com')) {
      nextErrors.email = 'Please use a Gmail address (e.g. name@gmail.com).';
    }

    if (!password) {
      nextErrors.password = 'Password is required.';
    } else if (password.length < MIN_PASSWORD_LENGTH) {
      nextErrors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
    }

    if (confirmPassword !== password) {
      nextErrors.confirmPassword = 'Passwords do not match.';
    }

    if (!agreedToTerms) {
      nextErrors.terms = 'You must agree to the Terms of Service and Privacy Policy.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSignUp() {
    setFormError(undefined);

    if (!validate()) {
      return;
    }

    setLoading(true);
    const result = await register(email.trim(), password, fullName.trim());
    setLoading(false);

    if (result.success) {
      navigation.navigate('VerifyEmail', {
        email: email.trim(),
        fullName: fullName.trim(),
        mode: 'signup',
      });
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
          <ScreenHeader title="Create Account" onBack={() => navigation.goBack()} />

          <View style={styles.form}>
            <AppTextInput
              label="Full Name"
              placeholder="Your full name"
              value={fullName}
              onChangeText={setFullName}
              error={errors.fullName}
              autoCapitalize="words"
            />

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

            <AppTextInput
              label="Confirm Password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              error={errors.confirmPassword}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              autoCorrect={false}
              rightAccessory={
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword((prev) => !prev)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons
                    name={showConfirmPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color={colors.textMuted}
                  />
                </TouchableOpacity>
              }
            />

            <TouchableOpacity
              style={styles.termsRow}
              onPress={() => setAgreedToTerms((prev) => !prev)}
              activeOpacity={0.8}
            >
              <View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}>
                {agreedToTerms ? (
                  <Ionicons name="checkmark" size={14} color={colors.white} />
                ) : null}
              </View>
              <Text style={styles.termsText}>
                I agree to the Terms of Service and Privacy Policy
              </Text>
            </TouchableOpacity>
            {errors.terms ? <Text style={styles.formError}>{errors.terms}</Text> : null}
            {formError ? <Text style={styles.formError}>{formError}</Text> : null}

            <AppButton title="Sign Up" onPress={handleSignUp} loading={loading} />

            <View style={styles.logInRow}>
              <Text style={styles.logInText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.logInLink}>Log in</Text>
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
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  termsText: {
    flex: 1,
    fontSize: typography.caption,
    color: colors.textMuted,
  },
  formError: {
    color: colors.error,
    fontSize: typography.caption,
    marginBottom: spacing.md,
  },
  logInRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  logInText: {
    fontSize: typography.body,
    color: colors.textMuted,
  },
  logInLink: {
    fontSize: typography.body,
    color: colors.primary,
    fontWeight: typography.weightBold,
  },
});
