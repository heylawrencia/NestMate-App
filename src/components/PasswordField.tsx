/**
 * PasswordField — Password input with eye toggle, strength meter, and max 64 counter (Spec §3.6)
 *
 * Usage:
 * <PasswordField label="Password" value={password} onChangeText={setPassword} error={errors.password} />
 */

import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import AppTextInput, { AppTextInputProps } from './AppTextInput';
import { colors, radius, space, type } from '../theme';

export interface PasswordFieldProps extends Omit<AppTextInputProps, 'secureTextEntry' | 'maxCharacters'> {
  showStrengthMeter?: boolean;
}

export default function PasswordField({
  label = 'Password',
  value = '',
  onChangeText,
  error,
  showStrengthMeter = true,
  ...rest
}: PasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false);

  // Counter is shown from 48 characters up to 64
  const showCounter = value.length >= 48;

  // Strength calculation (advisory only, never blocks submission)
  const getStrength = (pwd: string) => {
    if (!pwd) return { level: 0, label: '', color: colors.inkFaint };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 2) return { level: 1, label: 'Weak', color: colors.danger };
    if (score <= 4) return { level: 2, label: 'Medium', color: colors.warning };
    return { level: 3, label: 'Strong', color: colors.success };
  };

  const strength = getStrength(value);

  return (
    <View style={styles.container}>
      <AppTextInput
        label={label}
        value={value}
        onChangeText={onChangeText}
        error={error}
        secureTextEntry={!showPassword}
        maxCharacters={64}
        showCounter={showCounter}
        autoCapitalize="none"
        autoCorrect={false}
        trailingIcon={
          <TouchableOpacity
            onPress={() => setShowPassword((prev) => !prev)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={showPassword ? 'eye-off' : 'eye'}
              size={20}
              color={colors.inkMuted}
            />
          </TouchableOpacity>
        }
        {...rest}
      />

      {showStrengthMeter && value.length > 0 ? (
        <View style={styles.strengthRow}>
          <View style={styles.barsContainer}>
            <View style={[styles.bar, strength.level >= 1 && { backgroundColor: strength.color }]} />
            <View style={[styles.bar, strength.level >= 2 && { backgroundColor: strength.color }]} />
            <View style={[styles.bar, strength.level >= 3 && { backgroundColor: strength.color }]} />
          </View>
          <Text style={[styles.strengthText, { color: strength.color }]}>
            {strength.label}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: space.xs,
  },
  strengthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -space.xs,
    marginBottom: space.sm,
    paddingHorizontal: space.xs,
    gap: space.sm,
  },
  barsContainer: {
    flexDirection: 'row',
    gap: 4,
    width: 60,
  },
  bar: {
    flex: 1,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.line,
  },
  strengthText: {
    fontFamily: type.micro.fontFamily,
    fontSize: 11,
    fontWeight: '500',
  },
});
