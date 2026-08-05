/**
 * SectionHeader — Heading title with optional right action link (Spec §3.6)
 *
 * Usage:
 * <SectionHeader title="Popular Hostels" actionLabel="Explore more →" onAction={() => navigation.navigate('HostelsStack')} />
 */

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { colors, space, type } from '../theme';

export interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function SectionHeader({
  title,
  actionLabel,
  onAction,
}: SectionHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {actionLabel && onAction ? (
        <TouchableOpacity onPress={onAction} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.actionText}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: space.md,
    paddingHorizontal: space.lg,
  },
  title: {
    fontFamily: type.h2.fontFamily,
    fontSize: type.h2.fontSize,
    color: colors.ink,
    fontWeight: '600',
  },
  actionText: {
    fontFamily: type.bodyStrong.fontFamily,
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
});
