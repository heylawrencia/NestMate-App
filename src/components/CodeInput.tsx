import React, { useRef, useState } from 'react';
import {
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  TextInput,
  TextInputKeyPressEventData,
} from 'react-native';

import { colors, moderateScale, spacing, typography } from '../theme';

interface CodeInputProps {
  length?: number;
  onChange: (code: string) => void;
  characters?: boolean;
}

export default function CodeInput({ length = 6, onChange, characters = false }: CodeInputProps) {
  const [values, setValues] = useState<string[]>(Array(length).fill(''));
  const inputRefs = useRef<Array<TextInput | null>>([]);

  function handleChange(text: string, index: number) {
    const char = characters ? text.slice(-1).toUpperCase() : text.slice(-1);

    const next = [...values];
    next[index] = char;
    setValues(next);
    onChange(next.join(''));

    if (char && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyPress(event: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) {
    if (event.nativeEvent.key === 'Backspace' && !values[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  const focusNextEmpty = () => {
    const emptyIndex = values.findIndex((val) => !val);
    const target = emptyIndex !== -1 ? emptyIndex : length - 1;
    inputRefs.current[target]?.focus();
  };

  return (
    <Pressable onPress={focusNextEmpty} style={styles.row}>
      {values.map((value, index) => (
        <TextInput
          key={index}
          ref={(ref) => {
            inputRefs.current[index] = ref;
          }}
          style={[
            styles.box,
            { width: moderateScale(44, 0.3), height: moderateScale(52, 0.3) },
            value ? styles.boxFilled : null,
          ]}
          value={value}
          onChangeText={(text) => handleChange(text, index)}
          onKeyPress={(event) => handleKeyPress(event, index)}
          keyboardType={characters ? 'default' : 'number-pad'}
          autoCapitalize={characters ? 'characters' : 'none'}
          maxLength={1}
          textAlign="center"
        />
      ))}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  box: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
    fontSize: typography.h2,
    color: colors.text,
  },
  boxFilled: {
    borderColor: colors.primary,
  },
});
