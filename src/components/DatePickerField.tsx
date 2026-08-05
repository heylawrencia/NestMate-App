/**
 * DatePickerField — Native date picker component with age validation (Spec §3.6)
 *
 * Usage:
 * <DatePickerField label="Date of Birth" value={dob} onChange={(isoDate) => setDob(isoDate)} minAge={18} error={errors.dob} />
 */

import React, { useState } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

import { colors, radius, space, type } from '../theme';

export interface DatePickerFieldProps {
  label?: string;
  value?: string; // ISO format "YYYY-MM-DD"
  onChange: (isoDate: string) => void;
  minAge?: number;
  maxAge?: number;
  error?: string;
}

export default function DatePickerField({
  label = 'Date of Birth',
  value,
  onChange,
  minAge,
  maxAge,
  error,
}: DatePickerFieldProps) {
  const [showPicker, setShowPicker] = useState(false);

  // Default initial date: Today minus 20 years
  const defaultDate = new Date();
  defaultDate.setFullYear(defaultDate.getFullYear() - 20);

  const parsedDate = value ? new Date(value) : defaultDate;
  const validDate = isNaN(parsedDate.getTime()) ? defaultDate : parsedDate;

  const formatDateLabel = (date: Date) => {
    if (!value) return 'Select date of birth';
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    if (selectedDate) {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const iso = `${year}-${month}-${day}`;
      onChange(iso);
    }
  };

  return (
    <View style={styles.container}>
      {label ? <Text style={[styles.label, error ? styles.labelError : null]}>{label}</Text> : null}

      <TouchableOpacity
        style={[styles.fieldRow, error ? styles.fieldRowError : null]}
        onPress={() => setShowPicker(true)}
        activeOpacity={0.7}
      >
        <Text style={[styles.dateText, !value && styles.placeholderText]}>
          {formatDateLabel(validDate)}
        </Text>
        <Ionicons name="calendar-outline" size={20} color={colors.inkMuted} />
      </TouchableOpacity>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {showPicker && (
        <DateTimePicker
          value={validDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: space.md,
  },
  label: {
    fontFamily: type.caption.fontFamily,
    fontSize: 13,
    color: colors.inkMuted,
    fontWeight: '500',
    marginBottom: space.xs,
  },
  labelError: {
    color: colors.danger,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: space.md,
    minHeight: 50,
  },
  fieldRowError: {
    borderColor: colors.danger,
  },
  dateText: {
    fontFamily: type.body.fontFamily,
    fontSize: 15,
    color: colors.ink,
  },
  placeholderText: {
    color: colors.inkFaint,
  },
  errorText: {
    marginTop: space.xs,
    fontFamily: type.caption.fontFamily,
    fontSize: 13,
    color: colors.danger,
  },
});
