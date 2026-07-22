import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing, typography } from '../theme';

interface DetailRowProps {
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  subtitle?: string;
  onPress?: () => void;
  disabled?: boolean;
  destructive?: boolean;
  right?: React.ReactNode;
  showChevron?: boolean;
  isLast?: boolean;
}

export default function DetailRow({
  icon,
  title,
  subtitle,
  onPress,
  disabled = false,
  destructive = false,
  right,
  showChevron = true,
  isLast = false,
}: DetailRowProps) {
  const isInteractive = Boolean(onPress) && !disabled;

  const content = (
    <View style={[styles.row, !isLast && styles.rowDivider]}>
      {icon ? <Ionicons name={icon} size={20} color={destructive ? colors.error : colors.textMuted} /> : null}
      <View style={styles.textGroup}>
        <Text style={[styles.title, destructive && styles.titleDestructive, disabled && styles.titleDisabled]}>
          {title}
        </Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {right !== undefined ? (
        right
      ) : isInteractive && showChevron && !destructive ? (
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      ) : null}
    </View>
  );

  if (!isInteractive) {
    return content;
  }

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      {content}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  textGroup: {
    flex: 1,
  },
  title: {
    fontSize: typography.body,
    fontWeight: typography.weightBold,
    color: colors.text,
  },
  titleDestructive: {
    color: colors.error,
  },
  titleDisabled: {
    color: colors.textMuted,
  },
  subtitle: {
    fontSize: typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
});
