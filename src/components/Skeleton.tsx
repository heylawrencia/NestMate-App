/**
 * Skeleton — Animated shimmer placeholder loading indicator (Spec §3.6)
 *
 * Usage:
 * <Skeleton variant="card" width="100%" height={180} />
 */

import React, { useEffect, useRef } from 'react';
import { Animated, DimensionValue, Easing, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { colors, motion, radius, space } from '../theme';

export interface SkeletonProps {
  variant?: 'card' | 'row' | 'text';
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

export default function Skeleton({
  variant = 'card',
  width,
  height,
  borderRadius,
  style,
}: SkeletonProps) {
  const opacityAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 0.8,
          duration: motion.skeletonLoop / 2,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.3,
          duration: motion.skeletonLoop / 2,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacityAnim]);

  let defaultHeight = 20;
  let defaultRadius = radius.sm;

  if (variant === 'card') {
    defaultHeight = 160;
    defaultRadius = radius.lg;
  } else if (variant === 'row') {
    defaultHeight = 60;
    defaultRadius = radius.md;
  }

  const finalHeight = height ?? defaultHeight;
  const finalRadius = borderRadius ?? defaultRadius;

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width: width ?? '100%',
          height: finalHeight,
          borderRadius: finalRadius,
          opacity: opacityAnim,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: colors.line,
  },
});
