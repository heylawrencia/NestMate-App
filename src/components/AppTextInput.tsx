/**
 * AppTextInput — Form input field with focus ring, error slot, and character counter (Spec §3.6)
 *
 * Usage:
 * <AppTextInput label="Email Address" placeholder="you@knust.edu.gh" value={email} onChangeText={setEmail} error={errors.email} />
 */

import React, { useRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';

import { colors, radius, space, type } from '../theme';

export interface AppTextInputProps extends TextInputProps {
  label: string;
  error?: string;
  hint?: string;
  rightAccessory?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  maxCharacters?: number;
  showCounter?: boolean;
}

export default function AppTextInput({
  label,
  error,
  hint,
  rightAccessory,
  trailingIcon,
  maxCharacters,
  showCounter,
  value,
  style,
  onFocus,
  onBlur,
  ...rest
}: AppTextInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const accessory = rightAccessory || trailingIcon;
  const currentLength = value ? value.length : 0;
  const displayCounter = showCounter || maxCharacters !== undefined;

  let borderColor = colors.line;
  if (error) {
    borderColor = colors.danger;
  } else if (isFocused) {
    borderColor = colors.primary;
  }

  return (
    <View style={styles.container}>
      <Pressable onPress={() => inputRef.current?.focus()} style={styles.labelRow}>
        <Text style={[styles.label, error ? styles.labelError : isFocused ? styles.labelFocused : null]}>
          {label}
        </Text>
        {displayCounter && maxCharacters ? (
          <Text style={styles.counterText}>
            {currentLength}/{maxCharacters}
          </Text>
        ) : null}
      </Pressable>

      <Pressable
        onPress={() => inputRef.current?.focus()}
        style={[
          styles.inputRow,
          { borderColor },
          isFocused && !error && styles.inputRowFocused,
        ]}
      >
        <TextInput
          ref={inputRef}
          style={[styles.input, style]}
          placeholderTextColor={colors.inkFaint}
          value={value}
          maxLength={maxCharacters}
          onFocus={(e) => {
            setIsFocused(true);
            if (onFocus) onFocus(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            if (onBlur) onBlur(e);
          }}
          {...rest}
        />
        {accessory}
      </Pressable>

      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : hint ? (
        <Text style={styles.hintText}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: space.md,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: space.xs,
  },
  label: {
    fontFamily: type.caption.fontFamily,
    fontSize: 13,
    color: colors.inkMuted,
    fontWeight: '500',
  },
  labelFocused: {
    color: colors.primary,
  },
  labelError: {
    color: colors.danger,
  },
  counterText: {
    fontFamily: type.micro.fontFamily,
    fontSize: 11,
    color: colors.inkFaint,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: space.md,
    minHeight: 50,
  },
  inputRowFocused: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    flex: 1,
    paddingVertical: space.sm + 2,
    fontFamily: type.body.fontFamily,
    fontSize: 15,
    color: colors.ink,
  },
  errorText: {
    marginTop: space.xs,
    fontFamily: type.caption.fontFamily,
    fontSize: 13,
    color: colors.danger,
  },
  hintText: {
    marginTop: space.xs,
    fontFamily: type.caption.fontFamily,
    fontSize: 13,
    color: colors.inkMuted,
  },
});
