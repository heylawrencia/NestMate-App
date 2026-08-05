import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import AppButton from '../../components/AppButton';
import IconCircle from '../../components/IconCircle';
import { colors, radius, space, type } from '../../theme';
import { RootStackParamList } from '../../navigation/types';
import { useAuth } from '../../context/AuthContext';
import { createLifestyleProfile } from '../../services/profileService';

type Props = NativeStackScreenProps<RootStackParamList, 'OnboardingComplete'>;

type Status = 'saving' | 'error' | 'done';

export default function OnboardingCompleteScreen({ navigation, route }: Props) {
  const { data } = route.params;
  const { register } = useAuth();
  const progress = useRef(new Animated.Value(0)).current;
  const [status, setStatus] = useState<Status>('saving');
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  const [needsVerification, setNeedsVerification] = useState(true);

  async function createAccount() {
    setStatus('saving');
    setErrorMessage(undefined);

    const result = await register(data.email, data.password ?? '', data.fullName ?? '');
    if (!result.success) {
      setStatus('error');
      setErrorMessage(result.errorMessage);
      return;
    }

    const requiresVerification = result.requiresVerification !== false;
    setNeedsVerification(requiresVerification);

    // If verification is required, the account can't authenticate anything
    // yet - including saving its own profile - so that has to wait until
    // VerifyEmailScreen confirms the code. Only safe to save right away
    // when the account is already verified (e.g. verification disabled).
    if (!requiresVerification) {
      const profileResult = await createLifestyleProfile(data);
      if (!profileResult.success) {
        console.warn('createLifestyleProfile failed:', profileResult.errorMessage);
      }
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
              <Ionicons name="alert-circle-outline" size={40} color={colors.danger} />
            </IconCircle>
            <Text style={styles.title}>Couldn&apos;t create your account</Text>
            <Text style={styles.subtitle}>{errorMessage ?? 'Something went wrong.'}</Text>
            <View style={styles.form}>
              <AppButton title="Try again" onPress={createAccount} />
              <View style={styles.buttonSpacer} />
              <AppButton title="Back to Sign Up" variant="outline" onPress={() => navigation.navigate('SignUp')} />
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
              {needsVerification ? (
                <AppButton
                  title="Verify your email"
                  onPress={() => navigation.navigate('VerifyEmail', { email: data.email, name: data.fullName, data })}
                />
              ) : (
                <AppButton
                  title="Get Started"
                  onPress={() => navigation.replace('Home', { email: data.email, name: data.fullName })}
                />
              )}
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
    paddingHorizontal: space.xl,
  },
  iconCircle: {
    marginBottom: space.lg,
  },
  title: {
    fontFamily: type.h1.fontFamily,
    fontSize: type.h1.fontSize,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: space.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: type.body.fontFamily,
    fontSize: type.body.fontSize,
    color: colors.inkMuted,
    textAlign: 'center',
    marginBottom: space.xl,
  },
  progressTrack: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.line,
    overflow: 'hidden',
    marginBottom: space.xxl,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  form: {
    width: '100%',
  },
  buttonSpacer: {
    height: space.sm,
  },
});
