import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import AppButton from '../../components/AppButton';
import IconCircle from '../../components/IconCircle';
import { colors, spacing, typography } from '../../theme';
import { RootStackParamList } from '../../navigation/types';
import { register } from '../../services/authService';
import { createLifestyleProfile } from '../../services/profileService';

type Props = NativeStackScreenProps<RootStackParamList, 'OnboardingComplete'>;

type Status = 'saving' | 'error' | 'done';

export default function OnboardingCompleteScreen({ navigation, route }: Props) {
  const { data } = route.params;
  const progress = useRef(new Animated.Value(0)).current;
  const [status, setStatus] = useState<Status>('saving');
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  async function createAccount() {
    setStatus('saving');
    setErrorMessage(undefined);

    const result = await register(data.email, data.password, data.fullName ?? '');
    if (!result.success) {
      setStatus('error');
      setErrorMessage(result.errorMessage);
      return;
    }

    // Non-fatal: the account exists either way: the matching profile can be
    // finished later from Edit Profile if this fails.
    const profileResult = await createLifestyleProfile(data);
    if (!profileResult.success) {
      console.warn('createLifestyleProfile failed:', profileResult.errorMessage);
    }

    setStatus('done');
    Animated.timing(progress, { toValue: 1, duration: 1400, useNativeDriver: false }).start();
  }

  useEffect(() => {
    createAccount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const progressWidth = progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        {status === 'error' ? (
          <>
            <IconCircle size={96} backgroundColor="#F4E5E5" style={styles.iconCircle}>
              <Ionicons name="alert-circle-outline" size={40} color={colors.error} />
            </IconCircle>
            <Text style={styles.title}>Couldn&apos;t create your account</Text>
            <Text style={styles.subtitle}>{errorMessage ?? 'Something went wrong.'}</Text>
            <View style={styles.form}>
              <AppButton title="Try again" onPress={createAccount} />
            </View>
          </>
        ) : status === 'saving' ? (
          <>
            <ActivityIndicator size="large" color={colors.primary} style={styles.iconCircle} />
            <Text style={styles.title}>Setting up your account…</Text>
            <Text style={styles.subtitle}>This only takes a moment.</Text>
          </>
        ) : (
          <>
            <IconCircle size={96} style={styles.iconCircle}>
              <Ionicons name="checkmark" size={40} color={colors.primary} />
            </IconCircle>
            <Text style={styles.title}>You&apos;re all set!</Text>
            <Text style={styles.subtitle}>We&apos;re finding the best roommates for you.</Text>

            <View style={styles.progressTrack}>
              <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
            </View>

            <View style={styles.form}>
              <AppButton
                title="Verify your email"
                onPress={() => navigation.navigate('VerifyEmail', { email: data.email, name: data.fullName })}
              />
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  iconCircle: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.h1,
    fontWeight: typography.weightBold,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  progressTrack: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.surface,
    overflow: 'hidden',
    marginBottom: spacing.xxl,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  form: {
    width: '100%',
  },
});
