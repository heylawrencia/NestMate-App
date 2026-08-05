/**
 * EssentialsScreen — Step 1 of 2 profile setup (Spec §5.2)
 *
 * Collects required gender, city, DOB (with D2 age 18 gate), and optional school level.
 * Saves immediately via PUT /api/profiles/me.
 */

import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import AppButton from '../components/AppButton';
import DatePickerField from '../components/DatePickerField';
import { RootStackParamList } from '../navigation/types';
import { updateProfile } from '../services/profileService';
import { colors, elevation, radius, space, type } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Essentials'>;

const GENDER_OPTIONS = [
  { value: 'FEMALE', label: 'Female' },
  { value: 'MALE', label: 'Male' },
  { value: 'NON_BINARY', label: 'Non-binary' },
  { value: 'PREFER_NOT_TO_SAY', label: 'Prefer not to say' },
];

const CITY_OPTIONS = ['Kumasi', 'Accra', 'Tamale', 'Cape Coast'];

const SCHOOL_LEVEL_OPTIONS = ['Undergraduate', 'Postgraduate', 'Other'];

export default function EssentialsScreen({ navigation }: Props) {
  const [gender, setGender] = useState<string>('');
  const [city, setCity] = useState<string>('Kumasi');
  const [dob, setDob] = useState<string>('');
  const [schoolLevel, setSchoolLevel] = useState<string>('Undergraduate');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ gender?: string; dob?: string; city?: string; form?: string }>({});

  const validate = () => {
    const newErrors: typeof errors = {};

    // Gender is strictly required (Matching Root Cause R2)
    if (!gender) {
      newErrors.gender = 'Gender selection is required for room matching';
    }

    if (!city) {
      newErrors.city = 'City selection is required';
    }

    if (!dob) {
      newErrors.dob = 'Date of birth is required';
    } else {
      const birthDate = new Date(dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      if (age < 18) {
        newErrors.dob = 'You must be at least 18 years old to use NestMate';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = async () => {
    setErrors({});
    if (!validate()) return;

    setLoading(true);
    try {
      await updateProfile({
        gender,
        city,
        dateOfBirth: dob,
        schoolLevel,
      });
      setLoading(false);
      navigation.navigate('OnboardingLifestyle', { data: { email: '' } });
    } catch (e) {
      setLoading(false);
      setErrors({ form: 'Could not save profile details. Please try again.' });
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Step Indicator */}
        <View style={styles.stepHeader}>
          <Text style={styles.stepBadge}>Step 1 of 2</Text>
          <Text style={styles.headingTitle}>The Essentials</Text>
          <Text style={styles.headingSubhead}>Basic information used for roommate matching</Text>
        </View>

        {/* Form Card */}
        <View style={styles.card}>
          {/* Gender selection (Required - R2) */}
          <Text style={styles.fieldLabel}>
            Gender <Text style={styles.requiredStar}>*</Text>
          </Text>
          <Text style={styles.fieldHint}>Halls are single-gender. Required for matching.</Text>
          <View style={styles.radioGroup}>
            {GENDER_OPTIONS.map((opt) => (
              <Pressable
                key={opt.value}
                style={[styles.radioOption, gender === opt.value && styles.radioOptionSelected]}
                onPress={() => {
                  setGender(opt.value);
                  if (errors.gender) setErrors((prev) => ({ ...prev, gender: undefined }));
                }}
              >
                <View style={[styles.radioDot, gender === opt.value && styles.radioDotSelected]}>
                  {gender === opt.value && <View style={styles.radioDotInner} />}
                </View>
                <Text style={[styles.radioText, gender === opt.value && styles.radioTextSelected]}>
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>
          {errors.gender ? <Text style={styles.inlineError}>{errors.gender}</Text> : null}

          {/* Date of Birth Picker with D2 18-year gate */}
          <View style={styles.spacer}>
            <DatePickerField
              label="Date of Birth *"
              value={dob}
              onChange={(iso) => {
                setDob(iso);
                if (errors.dob) setErrors((prev) => ({ ...prev, dob: undefined }));
              }}
              minAge={18}
              error={errors.dob}
            />
          </View>

          {/* City selection (Asked, never hardcoded - R4) */}
          <Text style={styles.fieldLabel}>
            City <Text style={styles.requiredStar}>*</Text>
          </Text>
          <View style={styles.chipRow}>
            {CITY_OPTIONS.map((c) => (
              <TouchableOpacity
                key={c}
                style={[styles.chip, city === c && styles.chipSelected]}
                onPress={() => setCity(c)}
              >
                <Text style={[styles.chipText, city === c && styles.chipTextSelected]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* School Level selection (Optional) */}
          <Text style={[styles.fieldLabel, styles.spacer]}>School Level</Text>
          <View style={styles.chipRow}>
            {SCHOOL_LEVEL_OPTIONS.map((sl) => (
              <TouchableOpacity
                key={sl}
                style={[styles.chip, schoolLevel === sl && styles.chipSelected]}
                onPress={() => setSchoolLevel(sl)}
              >
                <Text style={[styles.chipText, schoolLevel === sl && styles.chipTextSelected]}>{sl}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {errors.form ? <Text style={styles.inlineError}>{errors.form}</Text> : null}

          <View style={styles.actionRow}>
            <AppButton
              title="Continue to Lifestyle →"
              onPress={handleContinue}
              loading={loading}
              variant="primary"
              size="lg"
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: space.lg,
    paddingTop: space.xxl,
    paddingBottom: space.xl,
  },
  stepHeader: {
    alignItems: 'center',
    marginBottom: space.xl,
  },
  stepBadge: {
    fontFamily: type.micro.fontFamily,
    fontSize: 12,
    color: colors.primary,
    fontWeight: '700',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: space.md,
    paddingVertical: space.xs,
    borderRadius: radius.pill,
    marginBottom: space.sm,
  },
  headingTitle: {
    fontFamily: type.display.fontFamily,
    fontSize: type.display.fontSize,
    color: colors.ink,
    textAlign: 'center',
    marginBottom: space.xs,
  },
  headingSubhead: {
    fontFamily: type.body.fontFamily,
    fontSize: type.body.fontSize,
    color: colors.inkMuted,
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: space.xl,
    ...elevation.card,
    marginBottom: space.xl,
  },
  fieldLabel: {
    fontFamily: type.caption.fontFamily,
    fontSize: 14,
    color: colors.ink,
    fontWeight: '600',
    marginBottom: 4,
  },
  fieldHint: {
    fontFamily: type.caption.fontFamily,
    fontSize: 12,
    color: colors.inkMuted,
    marginBottom: space.sm,
  },
  requiredStar: {
    color: colors.danger,
  },
  radioGroup: {
    gap: space.xs,
    marginBottom: space.xs,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: space.sm + 2,
    paddingHorizontal: space.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  radioOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceTint,
  },
  radioDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: space.md,
  },
  radioDotSelected: {
    borderColor: colors.primary,
  },
  radioDotInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  radioText: {
    fontFamily: type.body.fontFamily,
    fontSize: 15,
    color: colors.ink,
  },
  radioTextSelected: {
    fontFamily: type.bodyStrong.fontFamily,
    color: colors.primary,
    fontWeight: '600',
  },
  spacer: {
    marginTop: space.lg,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.sm,
    marginTop: space.xs,
  },
  chip: {
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.line,
  },
  chipSelected: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  chipText: {
    fontFamily: type.caption.fontFamily,
    fontSize: 13,
    color: colors.inkMuted,
  },
  chipTextSelected: {
    fontFamily: type.bodyStrong.fontFamily,
    color: colors.primary,
    fontWeight: '600',
  },
  inlineError: {
    fontFamily: type.caption.fontFamily,
    fontSize: 13,
    color: colors.danger,
    marginTop: space.xs,
  },
  actionRow: {
    marginTop: space.xl,
  },
});
