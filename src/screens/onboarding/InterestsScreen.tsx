import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import AppButton from '../../components/AppButton';
import OnboardingProgressBar from '../../components/OnboardingProgressBar';
import ScreenHeader from '../../components/ScreenHeader';
import { colors, spacing, typography } from '../../theme';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'OnboardingInterests'>;

const MIN_INTERESTS = 3;

const INTEREST_OPTIONS = [
  'Cooking',
  'Fitness',
  'Gaming',
  'Reading',
  'Music',
  'Movies & TV',
  'Travel',
  'Sports',
  'Art & Design',
  'Photography',
  'Pets',
  'Outdoors',
];

export default function InterestsScreen({ navigation, route }: Props) {
  const { data } = route.params;
  const [selected, setSelected] = useState<string[]>(data.interests ?? []);

  function toggleInterest(interest: string) {
    setSelected((prev) =>
      prev.includes(interest) ? prev.filter((item) => item !== interest) : [...prev, interest],
    );
  }

  function handleContinue() {
    if (selected.length < MIN_INTERESTS) {
      return;
    }
    navigation.navigate('OnboardingLifestyle', { data: { ...data, interests: selected } });
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ScreenHeader title="Select Your Interests" onBack={() => navigation.goBack()} />

        <OnboardingProgressBar totalSteps={8} currentStep={2} />

        <Text style={styles.subtitle}>Choose all that apply</Text>

        <View style={styles.grid}>
          {INTEREST_OPTIONS.map((interest) => {
            const isSelected = selected.includes(interest);
            return (
              <TouchableOpacity
                key={interest}
                style={[styles.chip, isSelected && styles.chipSelected]}
                onPress={() => toggleInterest(interest)}
                activeOpacity={0.8}
              >
                <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>{interest}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.form}>
          <AppButton title="Continue" onPress={handleContinue} disabled={selected.length < MIN_INTERESTS} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  subtitle: {
    fontSize: typography.body,
    color: colors.textMuted,
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: typography.body,
    color: colors.text,
  },
  chipTextSelected: {
    color: colors.white,
    fontWeight: typography.weightMedium,
  },
  form: {
    width: '100%',
    marginTop: spacing.xl,
  },
});
