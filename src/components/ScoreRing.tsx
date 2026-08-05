/**
 * ScoreRing — Animated circular compatibility score indicator (Spec §3.6)
 *
 * Usage:
 * <ScoreRing score={85} size={70} showLabel={true} />
 */

import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

import { colors, motion, type } from '../theme';

export interface ScoreRingProps {
  score: number | null; // 0 - 100 or null for Unscored
  size?: number;
  showLabel?: boolean;
  strokeWidth?: number;
}

export default function ScoreRing({
  score,
  size = 64,
  showLabel = true,
  strokeWidth = 6,
}: ScoreRingProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (score !== null) {
      Animated.timing(animatedValue, {
        toValue: Math.min(100, Math.max(0, score)),
        duration: motion.scoreRingFill,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }).start();
    }
  }, [score]);

  // Color from compatibility scale (§3.2)
  const getScoreColor = (val: number | null) => {
    if (val === null) return colors.inkFaint;
    if (val >= 80) return colors.success;
    if (val >= 60) return colors.warning;
    return colors.danger;
  };

  const ringColor = getScoreColor(score);
  const isUnscored = score === null;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <View
        style={[
          styles.outerRing,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: ringColor + '30', // 30% background track
          },
        ]}
      />
      <View
        style={[
          styles.activeRing,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: ringColor,
          },
        ]}
      />
      {showLabel && (
        <View style={styles.labelContainer}>
          <Text style={[styles.scoreText, { fontSize: size * 0.35, color: ringColor }]}>
            {isUnscored ? '—' : Math.round(score)}
          </Text>
          {!isUnscored && <Text style={[styles.percentText, { fontSize: size * 0.2 }]}>%</Text>}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerRing: {
    position: 'absolute',
  },
  activeRing: {
    position: 'absolute',
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  scoreText: {
    fontFamily: type.score.fontFamily,
    fontWeight: '700',
  },
  percentText: {
    fontFamily: type.micro.fontFamily,
    color: colors.inkMuted,
    fontWeight: '600',
  },
});
