import React from 'react';
import { StyleProp, StyleSheet, Text, TextStyle } from 'react-native';

import { colors, spacing, typography } from '../theme';

interface SectionLabelProps {
  label: string;
  style?: StyleProp<TextStyle>;
}

export default function SectionLabel({ label, style }: SectionLabelProps) {
  return <Text style={[styles.label, style]}>{label}</Text>;
}

const styles = StyleSheet.create({
  label: {
    fontSize: typography.caption,
    fontWeight: typography.weightBold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
});
