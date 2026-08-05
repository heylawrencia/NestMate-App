/**
 * LifestyleFitScreen — Step 2 of 2 profile setup (Spec §5.2)
 *
 * Live ScoreRing completeness score, 3 illustrated sleep cards, 1-5 sliders with word labels,
 * GH₵ budget range (ASKED - R4), and 4 separate switches (smoker, smokerOk, hasPets, petsOk - C4).
 * Saves immediately via PUT /api/profiles/me on Finish → Home.
 */

import React, { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import AppButton from '../../components/AppButton';
import ScoreRing from '../../components/ScoreRing';
import AppTextInput from '../../components/AppTextInput';
import { RootStackParamList } from '../../navigation/types';
import { fetchProfileCompleteness, updateProfile } from '../../services/profileService';
import { colors, elevation, radius, space, type } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'OnboardingLifestyle'>;

const SLEEP_CARDS = [
  { value: 'EARLY_BIRD', label: 'Early Bird', icon: 'sunny-outline', desc: 'Up before 7 AM' },
  { value: 'FLEXIBLE', label: 'Flexible', icon: 'time-outline', desc: 'Goes with the flow' },
  { value: 'NIGHT_OWL', label: 'Night Owl', icon: 'moon-outline', desc: 'Active late at night' },
];

const CLEANLINESS_LEVELS = [
  { value: 1, label: 'Messy' },
  { value: 3, label: 'Average' },
  { value: 4, label: 'Clean' },
  { value: 5, label: 'Very Clean' },
];

const NOISE_LEVELS = [
  { value: 1, label: 'Very Quiet' },
  { value: 2, label: 'Quiet' },
  { value: 3, label: 'Moderate' },
  { value: 5, label: 'Loud' },
];

const SOCIAL_LEVELS = [
  { value: 1, label: 'Very Reserved' },
  { value: 2, label: 'Reserved' },
  { value: 3, label: 'Balanced' },
  { value: 4, label: 'Social' },
  { value: 5, label: 'Very Social' },
];

export default function LifestyleFitScreen({ navigation }: Props) {
  const [completenessScore, setCompletenessScore] = useState<number>(60);

  // Lifestyle states
  const [sleepSchedule, setSleepSchedule] = useState<string>('FLEXIBLE');
  const [cleanliness, setCleanliness] = useState<number>(4);
  const [noiseTolerance, setNoiseTolerance] = useState<number>(3);
  const [socialLevel, setSocialLevel] = useState<number>(3);

  // Budget states (Asked, never hardcoded - R4)
  const [budgetMin, setBudgetMin] = useState<string>('2000');
  const [budgetMax, setBudgetMax] = useState<string>('9000');

  // Four separate switches (C4)
  const [smoker, setSmoker] = useState<boolean>(false);
  const [smokerOk, setSmokerOk] = useState<boolean>(true);
  const [hasPets, setHasPets] = useState<boolean>(false);
  const [petsOk, setPetsOk] = useState<boolean>(true);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchProfileCompleteness().then((res) => {
      setCompletenessScore(res.score || 60);
    });
  }, []);

  const handleFinish = async () => {
    setError('');
    const minVal = parseInt(budgetMin, 10) || 2000;
    const maxVal = parseInt(budgetMax, 10) || 9000;

    if (minVal > maxVal) {
      setError('Minimum budget cannot exceed maximum budget.');
      return;
    }

    setLoading(true);
    try {
      await updateProfile({
        sleepSchedule,
        cleanliness,
        noiseTolerance,
        socialLevel,
        budgetMin: minVal,
        budgetMax: maxVal,
        smoker,
        smokerOk,
        hasPets,
        petsOk,
      });

      setLoading(false);
      navigation.reset({ index: 0, routes: [{ name: 'Home', params: { email: '' } }] });
    } catch (e) {
      setLoading(false);
      setError('Failed to save lifestyle choices. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header with live ScoreRing */}
        <View style={styles.stepHeader}>
          <Text style={styles.stepBadge}>Step 2 of 2</Text>
          <View style={styles.scoreRow}>
            <ScoreRing score={completenessScore} size={64} strokeWidth={6} />
            <View style={styles.scoreTextGroup}>
              <Text style={styles.headingTitle}>Lifestyle & Fit</Text>
              <Text style={styles.scoreSubtitle}>Your profile is {completenessScore}% complete</Text>
            </View>
          </View>
        </View>

        {/* Card 1: Sleep Schedule */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sleep Schedule</Text>
          <View style={styles.sleepRow}>
            {SLEEP_CARDS.map((item) => (
              <Pressable
                key={item.value}
                style={[
                  styles.sleepCard,
                  sleepSchedule === item.value && styles.sleepCardSelected,
                ]}
                onPress={() => setSleepSchedule(item.value)}
              >
                <Ionicons
                  name={item.icon as any}
                  size={24}
                  color={sleepSchedule === item.value ? colors.primary : colors.inkMuted}
                />
                <Text
                  style={[
                    styles.sleepLabel,
                    sleepSchedule === item.value && styles.sleepLabelSelected,
                  ]}
                >
                  {item.label}
                </Text>
                <Text style={styles.sleepDesc}>{item.desc}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Card 2: Living Habits Sliders */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Living Habits</Text>

          {/* Cleanliness */}
          <Text style={styles.sliderLabel}>Cleanliness</Text>
          <View style={styles.levelRow}>
            {CLEANLINESS_LEVELS.map((lvl) => (
              <TouchableOpacity
                key={lvl.value}
                style={[
                  styles.levelPill,
                  cleanliness === lvl.value && styles.levelPillSelected,
                ]}
                onPress={() => setCleanliness(lvl.value)}
              >
                <Text
                  style={[
                    styles.levelText,
                    cleanliness === lvl.value && styles.levelTextSelected,
                  ]}
                >
                  {lvl.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Noise Tolerance */}
          <Text style={[styles.sliderLabel, styles.spacer]}>Noise Tolerance</Text>
          <View style={styles.levelRow}>
            {NOISE_LEVELS.map((lvl) => (
              <TouchableOpacity
                key={lvl.value}
                style={[
                  styles.levelPill,
                  noiseTolerance === lvl.value && styles.levelPillSelected,
                ]}
                onPress={() => setNoiseTolerance(lvl.value)}
              >
                <Text
                  style={[
                    styles.levelText,
                    noiseTolerance === lvl.value && styles.levelTextSelected,
                  ]}
                >
                  {lvl.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Social Energy */}
          <Text style={[styles.sliderLabel, styles.spacer]}>Social Energy</Text>
          <View style={styles.levelRow}>
            {SOCIAL_LEVELS.map((lvl) => (
              <TouchableOpacity
                key={lvl.value}
                style={[
                  styles.levelPill,
                  socialLevel === lvl.value && styles.levelPillSelected,
                ]}
                onPress={() => setSocialLevel(lvl.value)}
              >
                <Text
                  style={[
                    styles.levelText,
                    socialLevel === lvl.value && styles.levelTextSelected,
                  ]}
                >
                  {lvl.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Card 3: Budget Range (GH₵/year - ASKED, R4) */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Budget Range (GH₵/year)</Text>
          <Text style={styles.fieldHint}>Specify your annual room budget</Text>
          <View style={styles.budgetRow}>
            <View style={styles.budgetCol}>
              <AppTextInput
                label="Min (GH₵)"
                value={budgetMin}
                onChangeText={setBudgetMin}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.budgetCol}>
              <AppTextInput
                label="Max (GH₵)"
                value={budgetMax}
                onChangeText={setBudgetMax}
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        {/* Card 4: Four Separate Switches (C4) */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Personal Preferences</Text>

          <View style={styles.switchRow}>
            <View style={styles.switchTextGroup}>
              <Text style={styles.switchTitle}>I smoke</Text>
              <Text style={styles.switchSubtitle}>Personal smoking status</Text>
            </View>
            <Switch value={smoker} onValueChange={setSmoker} trackColor={{ true: colors.primary }} />
          </View>

          <View style={styles.switchRow}>
            <View style={styles.switchTextGroup}>
              <Text style={styles.switchTitle}>I'm fine living with a smoker</Text>
              <Text style={styles.switchSubtitle}>Tolerance for smoking roommates</Text>
            </View>
            <Switch value={smokerOk} onValueChange={setSmokerOk} trackColor={{ true: colors.primary }} />
          </View>

          <View style={styles.switchRow}>
            <View style={styles.switchTextGroup}>
              <Text style={styles.switchTitle}>I have pets</Text>
              <Text style={styles.switchSubtitle}>Personal pet ownership status</Text>
            </View>
            <Switch value={hasPets} onValueChange={setHasPets} trackColor={{ true: colors.primary }} />
          </View>

          <View style={styles.switchRow}>
            <View style={styles.switchTextGroup}>
              <Text style={styles.switchTitle}>I'm fine living with pets</Text>
              <Text style={styles.switchSubtitle}>Tolerance for pet-owning roommates</Text>
            </View>
            <Switch value={petsOk} onValueChange={setPetsOk} trackColor={{ true: colors.primary }} />
          </View>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/* Submit */}
        <View style={styles.actionRow}>
          <AppButton
            title="Finish Setup & Go to Home"
            onPress={handleFinish}
            loading={loading}
            variant="primary"
            size="lg"
          />
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
    paddingTop: space.xl,
    paddingBottom: space.xl,
  },
  stepHeader: {
    marginBottom: space.lg,
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
    alignSelf: 'flex-start',
    marginBottom: space.sm,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
  scoreTextGroup: {
    flex: 1,
  },
  headingTitle: {
    fontFamily: type.h1.fontFamily,
    fontSize: type.h1.fontSize,
    color: colors.ink,
  },
  scoreSubtitle: {
    fontFamily: type.caption.fontFamily,
    fontSize: 13,
    color: colors.inkMuted,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: space.lg,
    ...elevation.card,
    marginBottom: space.md,
  },
  cardTitle: {
    fontFamily: type.h3.fontFamily,
    fontSize: type.h3.fontSize,
    color: colors.ink,
    marginBottom: space.sm,
    fontWeight: '600',
  },
  sleepRow: {
    flexDirection: 'row',
    gap: space.xs,
  },
  sleepCard: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: space.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.line,
  },
  sleepCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  sleepLabel: {
    fontFamily: type.caption.fontFamily,
    fontSize: 12,
    color: colors.ink,
    fontWeight: '600',
    marginTop: space.xs,
  },
  sleepLabelSelected: {
    color: colors.primary,
  },
  sleepDesc: {
    fontFamily: type.micro.fontFamily,
    fontSize: 10,
    color: colors.inkMuted,
    textAlign: 'center',
    marginTop: 2,
  },
  sliderLabel: {
    fontFamily: type.caption.fontFamily,
    fontSize: 13,
    color: colors.ink,
    fontWeight: '600',
    marginBottom: space.xs,
  },
  spacer: {
    marginTop: space.md,
  },
  levelRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.xs,
  },
  levelPill: {
    paddingHorizontal: space.sm + 2,
    paddingVertical: space.xs + 2,
    borderRadius: radius.pill,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.line,
  },
  levelPillSelected: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  levelText: {
    fontFamily: type.micro.fontFamily,
    fontSize: 11,
    color: colors.inkMuted,
  },
  levelTextSelected: {
    color: colors.primary,
    fontWeight: '700',
  },
  fieldHint: {
    fontFamily: type.caption.fontFamily,
    fontSize: 12,
    color: colors.inkMuted,
    marginBottom: space.sm,
  },
  budgetRow: {
    flexDirection: 'row',
    gap: space.md,
  },
  budgetCol: {
    flex: 1,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: space.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  switchTextGroup: {
    flex: 1,
    marginRight: space.md,
  },
  switchTitle: {
    fontFamily: type.body.fontFamily,
    fontSize: 14,
    color: colors.ink,
    fontWeight: '500',
  },
  switchSubtitle: {
    fontFamily: type.caption.fontFamily,
    fontSize: 11,
    color: colors.inkMuted,
  },
  errorText: {
    fontFamily: type.caption.fontFamily,
    fontSize: 13,
    color: colors.danger,
    textAlign: 'center',
    marginBottom: space.md,
  },
  actionRow: {
    marginTop: space.md,
  },
});
