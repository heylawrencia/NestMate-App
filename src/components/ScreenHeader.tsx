import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing, typography } from '../theme';

interface ScreenHeaderRightAction {
  label: string;
  onPress: () => void;
}

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightAction?: ScreenHeaderRightAction;
}

export default function ScreenHeader({ title, subtitle, onBack, rightAction }: ScreenHeaderProps) {
  if (!onBack) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <TouchableOpacity
          onPress={onBack}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, styles.titleWithBack]}>{title}</Text>
        {rightAction ? (
          <TouchableOpacity onPress={rightAction.onPress} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.rightActionText}>{rightAction.label}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      {subtitle ? <Text style={styles.subtitleWithBack}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  centeredContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.h2,
    fontWeight: typography.weightBold,
    color: colors.text,
  },
  titleWithBack: {
    flex: 1,
    marginLeft: spacing.md,
  },
  subtitle: {
    fontSize: typography.body,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  subtitleWithBack: {
    fontSize: typography.body,
    color: colors.textMuted,
    marginTop: spacing.xs,
    marginLeft: 24 + spacing.md,
  },
  rightActionText: {
    fontSize: typography.body,
    fontWeight: typography.weightBold,
    color: colors.primary,
  },
});
