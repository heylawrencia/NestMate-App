/**
 * SignUpScreen — Account registration screen (Spec §5.3–§5.5)
 *
 * Features fullName, email, PasswordField, confirm password, strict password rules,
 * inline validation, live Terms & Privacy links, and zero Google/OAuth stubs.
 */

import React, { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import AppButton from '../components/AppButton';
import AppTextInput from '../components/AppTextInput';
import PasswordField from '../components/PasswordField';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList } from '../navigation/types';
import { colors, elevation, radius, space, type } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'SignUp'>;

export default function SignUpScreen({ navigation }: Props) {
  const { register } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    form?: string;
  }>({});

  const validate = () => {
    const newErrors: typeof errors = {};

    // Full name rule
    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    // Email rule
    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email.trim())) {
      newErrors.email = 'Enter a valid email address';
    }

    // Password rules (Server B1 rules: 8-64 chars, letter + digit, no leading/trailing whitespace)
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.trim() !== password) {
      newErrors.password = 'Password cannot start or end with a whitespace character';
    } else if (password.length < 8 || password.length > 64) {
      newErrors.password = 'Password must be between 8 and 64 characters';
    } else if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
      newErrors.password = 'Password must contain at least one letter and one number';
    }

    // Confirm password rule
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    setErrors({});
    if (!validate()) return;

    setLoading(true);
    const result = await register(email.trim(), password, fullName.trim());
    setLoading(false);

    if (result.success) {
      if (result.requiresVerification || result.needsVerification) {
        navigation.navigate('VerifyEmail', { email: email.trim() });
      } else {
        (navigation as any).navigate('ChooseIntent');
      }
    } else {
      setErrors({ form: result.errorMessage || 'Could not create account.' });
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
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
            <Text style={styles.headingTitle}>Create Account</Text>
            <Text style={styles.headingSubhead}>Join NestMate to connect with verified roommates</Text>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            <AppTextInput
              label="Full Name"
              placeholder="Ama Mensah"
              value={fullName}
              onChangeText={(text) => {
                setFullName(text);
                if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: undefined }));
              }}
              error={errors.fullName}
              autoCapitalize="words"
            />

            <AppTextInput
              label="Email"
              placeholder="you@knust.edu.gh"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
              }}
              error={errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <PasswordField
              label="Password"
              placeholder="Create a password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
              }}
              error={errors.password}
              showStrengthMeter={true}
            />

            <PasswordField
              label="Confirm Password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
              }}
              error={errors.confirmPassword}
              showStrengthMeter={false}
            />

            {errors.form ? <Text style={styles.inlineFormError}>{errors.form}</Text> : null}

            <View style={styles.actionRow}>
              <AppButton
                title="Create account"
                onPress={handleSignUp}
                loading={loading}
                variant="primary"
                size="lg"
              />
            </View>

            {/* Terms and Privacy notice */}
            <View style={styles.termsContainer}>
              <Text style={styles.termsText}>
                By creating an account you agree to our{' '}
                <Text
                  style={styles.termsLink}
                  onPress={() => (navigation as any).navigate('TermsOfService')}
                >
                  Terms of Service
                </Text>{' '}
                and{' '}
                <Text
                  style={styles.termsLink}
                  onPress={() => navigation.navigate('Privacy')}
                >
                  Privacy Policy
                </Text>
                .
              </Text>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.footerLink}>Log in</Text>
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
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: space.xl,
    ...elevation.card,
    marginBottom: space.xl,
  },
  inlineFormError: {
    fontFamily: type.caption.fontFamily,
    fontSize: 13,
    color: colors.danger,
    textAlign: 'center',
    marginBottom: space.md,
  },
  actionRow: {
    marginTop: space.xs,
  },
  termsContainer: {
    marginTop: space.lg,
  },
  termsText: {
    fontFamily: type.caption.fontFamily,
    fontSize: 12,
    color: colors.inkMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    fontFamily: type.bodyStrong.fontFamily,
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontFamily: type.body.fontFamily,
    fontSize: 15,
    color: colors.inkMuted,
  },
  footerLink: {
    fontFamily: type.bodyStrong.fontFamily,
    fontSize: 15,
    color: colors.primary,
    fontWeight: '600',
  },
});
