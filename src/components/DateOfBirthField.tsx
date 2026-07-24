import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import SelectField from './SelectField';
import { colors, spacing, typography } from '../theme';

interface DateOfBirthFieldProps {
  label: string;
  value?: Date;
  onChange: (date: Date) => void;
  maximumDate?: Date;
  error?: string;
}

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function daysInMonth(month: number, year: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export default function DateOfBirthField({
  label,
  value,
  onChange,
  maximumDate,
  error,
}: DateOfBirthFieldProps) {
  const maxYear = (maximumDate ?? new Date()).getFullYear();
  const minYear = maxYear - 100;

  const dayOptions = Array.from({ length: 31 }, (_, index) => String(index + 1));
  const yearOptions = Array.from({ length: maxYear - minYear + 1 }, (_, index) => String(maxYear - index));

  const [day, setDay] = useState<number | undefined>(value?.getDate());
  const [month, setMonth] = useState<number | undefined>(value?.getMonth());
  const [year, setYear] = useState<number | undefined>(value?.getFullYear());

  // `value` often arrives after mount (async profile load) - useState's
  // initializer only runs once, so pick up later changes here too.
  useEffect(() => {
    if (value) {
      setDay(value.getDate());
      setMonth(value.getMonth());
      setYear(value.getFullYear());
    }
  }, [value]);

  function commit(nextDay?: number, nextMonth?: number, nextYear?: number) {
    setDay(nextDay);
    setMonth(nextMonth);
    setYear(nextYear);

    if (nextDay === undefined || nextMonth === undefined || nextYear === undefined) {
      return;
    }
    const clampedDay = Math.min(nextDay, daysInMonth(nextMonth, nextYear));
    onChange(new Date(nextYear, nextMonth, clampedDay));
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        <SelectField
          style={styles.day}
          placeholder="Day"
          value={day ? String(day) : undefined}
          options={dayOptions}
          onChange={(selected) => commit(Number(selected), month, year)}
        />
        <SelectField
          style={styles.month}
          placeholder="Month"
          value={month !== undefined ? MONTHS[month] : undefined}
          options={MONTHS}
          onChange={(selected) => commit(day, MONTHS.indexOf(selected), year)}
        />
        <SelectField
          style={styles.year}
          placeholder="Year"
          value={year ? String(year) : undefined}
          options={yearOptions}
          onChange={(selected) => commit(day, month, Number(selected))}
        />
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.caption,
    fontWeight: typography.weightMedium,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  day: {
    flex: 3,
    marginBottom: 0,
  },
  month: {
    flex: 5,
    marginBottom: 0,
  },
  year: {
    flex: 4,
    marginBottom: 0,
  },
  errorText: {
    marginTop: spacing.xs,
    fontSize: typography.caption,
    color: colors.error,
  },
});
