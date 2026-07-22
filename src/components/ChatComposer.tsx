import React from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing } from '../theme';

interface ChatComposerProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  placeholder: string;
  sending?: boolean;
}

const HIT_SLOP = { top: 8, bottom: 8, left: 8, right: 8 };

export default function ChatComposer({ value, onChangeText, onSend, placeholder, sending }: ChatComposerProps) {
  const canSend = value.trim().length > 0 && !sending;

  return (
    <View style={styles.row}>
      <Ionicons name="add" size={26} color={colors.textMuted} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        multiline
      />
      <TouchableOpacity
        style={[styles.sendButton, !canSend && styles.sendButtonDisabled]}
        onPress={onSend}
        disabled={!canSend}
        hitSlop={HIT_SLOP}
        accessibilityLabel="Send message"
        accessibilityRole="button"
      >
        <Ionicons name="send" size={16} color={colors.white} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  input: {
    flex: 1,
    maxHeight: 100,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.surface,
    fontSize: 15,
    color: colors.text,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
});
