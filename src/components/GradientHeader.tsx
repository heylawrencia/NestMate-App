import React from 'react';
import { ImageBackground, StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing } from '../theme';

interface GradientHeaderProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  imageUri?: string;
}

export default function GradientHeader({ children, style, imageUri }: GradientHeaderProps) {
  const insets = useSafeAreaInsets();
  const contentStyle = [styles.gradient, { paddingTop: insets.top + spacing.sm }, style];

  if (imageUri) {
    return (
      <ImageBackground source={{ uri: imageUri }} style={contentStyle} imageStyle={styles.roundedCorners}>
        <StatusBar style="light" />
        <LinearGradient
          colors={['rgba(15,23,42,0.15)', 'rgba(15,23,42,0.55)']}
          style={StyleSheet.absoluteFill}
        />
        {children}
      </ImageBackground>
    );
  }

  return (
    <LinearGradient
      colors={[colors.primary, colors.primaryDark]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={contentStyle}
    >
      <StatusBar style="light" />
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
  },
  roundedCorners: {
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
});
