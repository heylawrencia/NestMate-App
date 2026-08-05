/**
 * CollapsingHeader — Scroll-driven collapsing header component (Spec §3.6 & §6.4)
 *
 * Usage:
 * const scrollY = useRef(new Animated.Value(0)).current;
 * <CollapsingHeader scrollY={scrollY} expandedHeight={180} collapsedHeight={60} expandedContent={<LargeTitle />} collapsedContent={<SmallTitle />} />
 */

import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { colors, elevation, space } from '../theme';

export interface CollapsingHeaderProps {
  scrollY: Animated.Value;
  expandedHeight?: number;
  collapsedHeight?: number;
  expandedContent: React.ReactNode;
  collapsedContent: React.ReactNode;
}

export default function CollapsingHeader({
  scrollY,
  expandedHeight = 160,
  collapsedHeight = 60,
  expandedContent,
  collapsedContent,
}: CollapsingHeaderProps) {
  const scrollRange = expandedHeight - collapsedHeight;

  const headerHeight = scrollY.interpolate({
    inputRange: [0, scrollRange],
    outputRange: [expandedHeight, collapsedHeight],
    extrapolate: 'clamp',
  });

  const expandedOpacity = scrollY.interpolate({
    inputRange: [0, scrollRange * 0.5, scrollRange],
    outputRange: [1, 0.3, 0],
    extrapolate: 'clamp',
  });

  const collapsedOpacity = scrollY.interpolate({
    inputRange: [0, scrollRange * 0.7, scrollRange],
    outputRange: [0, 0.5, 1],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View style={[styles.header, { height: headerHeight }]}>
      <Animated.View
        style={[
          styles.contentContainer,
          { opacity: expandedOpacity },
        ]}
        pointerEvents={scrollY ? 'auto' : 'none'}
      >
        {expandedContent}
      </Animated.View>

      <Animated.View
        style={[
          styles.contentContainer,
          styles.collapsedOverlay,
          { opacity: collapsedOpacity },
        ]}
      >
        {collapsedContent}
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  header: {
    width: '100%',
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    overflow: 'hidden',
    zIndex: 10,
    ...elevation.card,
  },
  contentContainer: {
    ...StyleSheet.absoluteFillObject,
    paddingHorizontal: space.lg,
    justifyContent: 'center',
  },
  collapsedOverlay: {
    justifyContent: 'center',
  },
});
