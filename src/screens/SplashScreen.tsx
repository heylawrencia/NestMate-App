import React, { useEffect, useRef } from 'react';
import { Animated, Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { colors, moderateScale, spacing, typography } from '../theme';
import { RootStackParamList } from '../navigation/types';
import { useAuth } from '../context/AuthContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

const SPLASH_DURATION_MS = 1600;

export default function SplashScreen({ navigation }: Props) {
  const progress = useRef(new Animated.Value(0)).current;
  const { token, isLoading } = useAuth();

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: SPLASH_DURATION_MS,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const timer = setTimeout(() => {
      navigation.replace(token ? 'Home' : 'GetStarted');
    }, SPLASH_DURATION_MS);

    return () => clearTimeout(timer);
  }, [navigation, isLoading, token]);

  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <Image
          source={require('../../assets/logo.png')}
          style={[styles.logo, { width: moderateScale(120), height: moderateScale(120) }]}
          resizeMode="contain"
        />
        <Text style={styles.appName}>NestMate</Text>
        <Text style={styles.tagline}>Find your perfect roommates.</Text>

        <View style={[styles.progressTrack, { width: moderateScale(120) }]}>
          <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
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
  logo: {
    marginBottom: spacing.lg,
  },
  appName: {
    fontSize: typography.h1,
    fontWeight: typography.weightBold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  tagline: {
    fontSize: typography.body,
    color: colors.textMuted,
    textAlign: 'center',
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
    marginTop: spacing.xl,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: colors.text,
  },
});
