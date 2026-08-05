/**
 * ForgotPasswordScreen — Password reset request surface (Spec §5.6)
 *
 * Uses v2 card styling, inline error validation, and smooth navigation to ResetPassword.
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
import { RootStackParamList } from '../navigation/types';
import { forgotPassword } from '../services/authService';
import { colors, elevation, radius, space, type } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'ForgotPassword'>;

export default function ForgotPasswordScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  const handleSendResetLink = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Email address is required.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(trimmedEmail)) {
      setError('Enter a valid email address.');
      return;
    }
    setError(undefined);

    setLoading(true);
    await forgotPassword(trimmedEmail);
    setLoading(false);

    navigation.navigate('ResetPassword', { email: trimmedEmail });
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
            <Text style={styles.headingTitle}>Forgot Password?</Text>
            <Text style={styles.headingSubhead}>
              Enter your registered email address to receive a 6-digit reset code
            </Text>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            <AppTextInput
              label="Email"
              placeholder="you@knust.edu.gh"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (error) setError(undefined);
              }}
              error={error}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <View style={styles.actionRow}>
              <AppButton
                title="Send reset code"
                onPress={handleSendResetLink}
                loading={loading}
                variant="primary"
                size="lg"
              />
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footerRow}>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.footerLink}>← Back to Log In</Text>
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
    paddingHorizontal: space.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: space.xl,
    ...elevation.card,
    marginBottom: space.xl,
  },
  actionRow: {
    marginTop: space.sm,
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
