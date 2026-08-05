/**
 * SplashScreen — Initial boot and session restoration splash screen (Spec §5.1)
 *
 * Displays logo animation while AuthContext restores persisted credentials.
 */

import React, { useEffect, useRef } from 'react';
import { Animated, Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { colors, radius, space, type } from '../theme';
import { RootStackParamList } from '../navigation/types';
import { useAuth } from '../context/AuthContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

const SPLASH_DURATION_MS = 1400;
const MAX_SPLASH_WAIT_MS = 2500;

export default function SplashScreen({ navigation }: Props) {
  const progress = useRef(new Animated.Value(0)).current;
  const { token, isLoading, email } = useAuth();
  const navigated = useRef(false);

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: SPLASH_DURATION_MS,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  useEffect(() => {
    const doNavigate = () => {
      if (navigated.current) return;
      navigated.current = true;
      if (token) {
        navigation.replace('Home', { email: email || '' });
      } else {
        navigation.replace('GetStarted');
      }
    };

    // If session restoration finished, navigate after splash duration
    if (!isLoading) {
      const timer = setTimeout(doNavigate, SPLASH_DURATION_MS);
      return () => clearTimeout(timer);
    }

    // Safety fallback: Force navigation after 2.5 seconds max even if AuthContext is still loading
    const fallbackTimer = setTimeout(doNavigate, MAX_SPLASH_WAIT_MS);
    return () => clearTimeout(fallbackTimer);
  }, [navigation, isLoading, token, email]);

  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <View style={styles.logoBadge}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.appName}>NestMate</Text>
        <Text style={styles.tagline}>Find your ideal hostel & roommate</Text>

        <View style={styles.progressTrack}>
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
    paddingHorizontal: space.xl,
  },
  logoBadge: {
    width: 84,
    height: 84,
    borderRadius: radius.xl,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.lg,
  },
  logoImage: {
    width: 56,
    height: 56,
  },
  appName: {
    fontFamily: type.display.fontFamily,
    fontSize: type.display.fontSize,
    color: colors.ink,
    marginBottom: space.xs,
  },
  tagline: {
    fontFamily: type.body.fontFamily,
    fontSize: type.body.fontSize,
    color: colors.inkMuted,
    textAlign: 'center',
  },
  progressTrack: {
    height: 4,
    width: 120,
    borderRadius: radius.pill,
    backgroundColor: colors.line,
    marginTop: space.xxl,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
});
