/**
 * LoginScreen — Redesigned login surface (Spec §5.2)
 *
 * Features 72pt logo badge, inline validation errors, PasswordField, and zero Google/OAuth buttons.
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
import AppTextInput from '../components/AppTextInput';
import PasswordField from '../components/PasswordField';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList } from '../navigation/types';
import { colors, elevation, radius, space, type } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});
  const [needsVerification, setNeedsVerification] = useState(false);

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email.trim())) {
      newErrors.email = 'Enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    setErrors({});
    setNeedsVerification(false);
    if (!validate()) return;

    setLoading(true);
    const result = await login(email.trim(), password);
    setLoading(false);

    if (result.success) {
      (navigation as any).reset({
        index: 0,
        routes: [{ name: 'Home', params: { email: email.trim() } }],
      });
    } else if (result.needsVerification || result.requiresVerification) {
      setNeedsVerification(true);
      setErrors({ form: 'Your email address is not verified yet.' });
    } else {
      setErrors({ form: result.errorMessage || 'Invalid email or password.' });
    }
  };

  return (
    <SafeAreaContainer style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Top Logo Badge */}
          <View style={styles.headerContainer}>
            <View style={styles.logoBadge}>
              <Image
                source={require('../../assets/logo.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.headingTitle}>Welcome back</Text>
            <Text style={styles.headingSubhead}>Sign in to continue finding your ideal room</Text>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
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
              placeholder="Enter your password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
              }}
              error={errors.password}
              showStrengthMeter={false}
            />

            <TouchableOpacity
              style={styles.forgotPasswordRow}
              onPress={() => navigation.navigate('ForgotPassword')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.forgotPasswordText}>Forgot password?</Text>
            </TouchableOpacity>

            {errors.form ? <Text style={styles.inlineFormError}>{errors.form}</Text> : null}

            {needsVerification ? (
              <View style={styles.verifyPrompt}>
                <AppButton
                  title="Verify your email now"
                  variant="secondary"
                  size="md"
                  onPress={() => navigation.navigate('VerifyEmail', { email: email.trim() })}
                />
              </View>
            ) : null}

            <View style={styles.actionRow}>
              <AppButton
                title="Log in"
                onPress={handleLogin}
                loading={loading}
                variant="primary"
                size="lg"
              />
            </View>
          </View>

          {/* Footer Navigation */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>New here? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
              <Text style={styles.footerLink}>Create an account</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaContainer>
  );
}

function SafeAreaContainer({ children, style }: { children: React.ReactNode; style: any }) {
  return <View style={style}>{children}</View>;
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
  forgotPasswordRow: {
    alignSelf: 'flex-end',
    marginBottom: space.md,
    marginTop: -space.xs,
  },
  forgotPasswordText: {
    fontFamily: type.caption.fontFamily,
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
  },
  inlineFormError: {
    fontFamily: type.caption.fontFamily,
    fontSize: 13,
    color: colors.danger,
    textAlign: 'center',
    marginBottom: space.md,
  },
  verifyPrompt: {
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
