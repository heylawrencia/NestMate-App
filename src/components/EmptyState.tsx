/**
 * EmptyState — Centered illustration, title, body, and action button (Spec §3.6 & §3.7)
 *
 * Usage:
 * <EmptyState icon="heart-dislike-outline" title="No matches in Kumasi yet" body="Try adjusting your budget or lifestyle preferences." actionLabel="Adjust Preferences" onAction={handleOpenFilters} />
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import AppButton from './AppButton';
import { colors, radius, space, type } from '../theme';

export interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  customIllustration?: React.ReactNode;
  title: string;
  body?: string;
  description?: string; // Backward compatibility prop for pre-F2 screens
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon = 'compass-outline',
  customIllustration,
  title,
  body,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const bodyText = description || body || '';
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        {customIllustration || <Ionicons name={icon} size={36} color={colors.primary} />}
      </View>

      <Text style={styles.title}>{title}</Text>
      {bodyText ? <Text style={styles.body}>{bodyText}</Text> : null}

      {actionLabel && onAction ? (
        <View style={styles.actionContainer}>
          <AppButton title={actionLabel} onPress={onAction} variant="secondary" size="md" />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.xl,
    paddingVertical: space.xxl,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.lg,
  },
  title: {
    fontFamily: type.h2.fontFamily,
    fontSize: type.h2.fontSize,
    color: colors.ink,
    textAlign: 'center',
    marginBottom: space.sm,
    fontWeight: '600',
  },
  body: {
    fontFamily: type.body.fontFamily,
    fontSize: type.body.fontSize,
    color: colors.inkMuted,
    textAlign: 'center',
    lineHeight: type.body.lineHeight,
    marginBottom: space.lg,
  },
  actionContainer: {
    marginTop: space.sm,
  },
});
