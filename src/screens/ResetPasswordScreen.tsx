/**
 * ResetPasswordScreen — Execute password reset surface (Spec §5.6)
 *
 * Enforces strict B1 password policy (8-64 chars, letter + digit, no whitespace padding)
 * and uses 6-box CodeInput for code entry.
 */

import React, { useState } from 'react';
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
import PasswordField from '../components/PasswordField';
import { RootStackParamList } from '../navigation/types';
import { resetPassword } from '../services/authService';
import { colors, elevation, radius, space, type } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'ResetPassword'>;

const CODE_LENGTH = 6;

export default function ResetPasswordScreen({ navigation, route }: Props) {
  const { email } = route.params;
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{
    code?: string;
    newPassword?: string;
    confirmPassword?: string;
    form?: string;
  }>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const validate = () => {
    const newErrors: typeof errors = {};

    if (code.length < CODE_LENGTH) {
      newErrors.code = 'Please enter the complete 6-digit reset code.';
    }

    if (!newPassword) {
      newErrors.newPassword = 'New password is required.';
    } else if (newPassword.trim() !== newPassword) {
      newErrors.newPassword = 'Password cannot start or end with a whitespace character.';
    } else if (newPassword.length < 8 || newPassword.length > 64) {
      newErrors.newPassword = 'Password must be between 8 and 64 characters.';
    } else if (!/[A-Za-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      newErrors.newPassword = 'Password must contain at least one letter and one number.';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password.';
    } else if (confirmPassword !== newPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleReset = async () => {
    setErrors({});
    if (!validate()) return;

    setLoading(true);
    const result = await resetPassword(email, code, newPassword);
    setLoading(false);

    if (result.success) {
      setDone(true);
    } else {
      setErrors({ form: result.errorMessage ?? 'Invalid reset code. Please check and try again.' });
    }
  };

  if (done) {
    return (
      <View style={styles.container}>
        <View style={styles.doneContent}>
          <View style={styles.logoBadge}>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.headingTitle}>Password Changed!</Text>
          <Text style={styles.headingSubhead}>
            Your password has been successfully updated. You can now log in with your new credentials.
          </Text>

          <View style={styles.doneActionRow}>
            <AppButton
              title="Back to Log In"
              variant="primary"
              size="lg"
              onPress={() => navigation.navigate('Login')}
            />
          </View>
        </View>
      </View>
    );
  }

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
            <Text style={styles.headingTitle}>Reset Password</Text>
            <Text style={styles.headingSubhead}>
              Enter the 6-digit code sent to{'\n'}
              <Text style={styles.emailHighlight}>{email}</Text>
            </Text>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>Verification Code</Text>
            <View style={styles.codeContainer}>
              <CodeInput length={CODE_LENGTH} onChange={setCode} />
            </View>
            {errors.code ? <Text style={styles.inlineError}>{errors.code}</Text> : null}

            <PasswordField
              label="New Password"
              placeholder="Create new password"
              value={newPassword}
              onChangeText={(text) => {
                setNewPassword(text);
                if (errors.newPassword) setErrors((prev) => ({ ...prev, newPassword: undefined }));
              }}
              error={errors.newPassword}
              showStrengthMeter={true}
            />

            <PasswordField
              label="Confirm New Password"
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
              }}
              error={errors.confirmPassword}
              showStrengthMeter={false}
            />

            {errors.form ? <Text style={styles.inlineError}>{errors.form}</Text> : null}

            <View style={styles.actionRow}>
              <AppButton
                title="Reset password"
                onPress={handleReset}
                loading={loading}
                variant="primary"
                size="lg"
              />
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footerRow}>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.footerLink}>← Cancel and return to Log In</Text>
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
  doneContent: {
    flex: 1,
    paddingHorizontal: space.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doneActionRow: {
    width: '100%',
    marginTop: space.xl,
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
  },
  sectionLabel: {
    fontFamily: type.caption.fontFamily,
    fontSize: 13,
    color: colors.inkMuted,
    fontWeight: '500',
    marginBottom: space.sm,
  },
  codeContainer: {
    marginBottom: space.md,
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
    marginTop: space.xs,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerLink: {
    fontFamily: type.bodyStrong.fontFamily,
    fontSize: 15,
    color: colors.primary,
    fontWeight: '600',
  },
});
