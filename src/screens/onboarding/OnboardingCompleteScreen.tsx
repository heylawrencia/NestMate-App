import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import AppButton from '../../components/AppButton';
import IconCircle from '../../components/IconCircle';
import { colors, spacing, typography } from '../../theme';
import { RootStackParamList } from '../../navigation/types';
import { ApiError } from '../../services/apiClient';
import { buildProfileRequest, saveMyProfile } from '../../services/profileService';

type Props = NativeStackScreenProps<RootStackParamList, 'OnboardingComplete'>;

export default function OnboardingCompleteScreen({ navigation, route }: Props) {
  const { data } = route.params;
  const progress = useRef(new Animated.Value(0)).current;
  const [saveError, setSaveError] = useState<string | undefined>();

  async function saveProfile() {
    setSaveError(undefined);
    const request = buildProfileRequest(data);
    if (!request) {
      setSaveError('Something went wrong building your profile. Please go back and check your answers.');
      return;
    }
    try {
      await saveMyProfile(request);
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : 'Could not save your profile. Please try again.');
    }
  }

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: 1400,
      useNativeDriver: false,
    }).start();

    saveProfile();
  }, [progress]);

  const progressWidth = progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <IconCircle size={96} style={styles.iconCircle}>
          <Ionicons name="checkmark" size={40} color={colors.primary} />
        </IconCircle>

        <Text style={styles.title}>You&apos;re all set!</Text>
        <Text style={styles.subtitle}>We&apos;re finding the best roommates for you.</Text>

        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
        </View>

        {saveError ? <Text style={styles.errorText}>{saveError}</Text> : null}

        <View style={styles.form}>
          {saveError ? (
            <AppButton title="Try Again" onPress={saveProfile} />
          ) : (
            <AppButton
              title="Go to Home"
              onPress={() =>
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Home' }],
                })
              }
            />
          )}
        </View>
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
  errorText: {
    color: colors.error,
    fontSize: typography.caption,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
});
