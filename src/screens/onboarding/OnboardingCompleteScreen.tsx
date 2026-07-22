import React, { useEffect, useRef } from 'react';
import { Animated, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import AppButton from '../../components/AppButton';
import IconCircle from '../../components/IconCircle';
import { colors, spacing, typography } from '../../theme';
import { RootStackParamList } from '../../navigation/types';
import { updateProfile } from '../../services/profileService';

type Props = NativeStackScreenProps<RootStackParamList, 'OnboardingComplete'>;

export default function OnboardingCompleteScreen({ navigation, route }: Props) {
  const { data } = route.params;
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: 1400,
      useNativeDriver: false,
    }).start();

    updateProfile({
      email: data.email,
      fullName: data.fullName ?? '',
      dateOfBirth: data.dateOfBirth,
      bio: data.bio,
      gender: data.gender,
      schoolLevel: data.schoolLevel,
      avatarUri: data.avatarUri,
      photos: data.photos,
    });
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

        <View style={styles.form}>
          <AppButton
            title="Go to Home"
            onPress={() =>
              navigation.reset({
                index: 0,
                routes: [{ name: 'Home', params: { email: data.email, name: data.fullName } }],
              })
            }
          />
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
});
