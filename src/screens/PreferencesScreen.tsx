import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import AsyncBoundary from '../components/AsyncBoundary';
import RadioGroup from '../components/RadioGroup';
import ScreenHeader from '../components/ScreenHeader';
import { colors, spacing } from '../theme';
import { RootStackParamList } from '../navigation/types';
import { useAsyncData } from '../hooks/useAsyncData';
import { fetchProfile, updateProfile } from '../services/profileService';

type Props = NativeStackScreenProps<RootStackParamList, 'Preferences'>;

export default function PreferencesScreen({ navigation }: Props) {
  const { data: profile, loading, error, reload } = useAsyncData(fetchProfile, []);

  const [sleepSchedule, setSleepSchedule] = useState<string | undefined>();
  const [cleanliness, setCleanliness] = useState<string | undefined>();
  const [noiseLevel, setNoiseLevel] = useState<string | undefined>();
  const [socialEnergy, setSocialEnergy] = useState<string | undefined>();
  const [smoking, setSmoking] = useState<string | undefined>();
  const [petFriendly, setPetFriendly] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setSleepSchedule(profile.sleepSchedule);
      setCleanliness(profile.cleanliness);
      setNoiseLevel(profile.noiseLevel);
      setSocialEnergy(profile.socialEnergy);
      setSmoking(profile.smoking);
      setPetFriendly(profile.petFriendly);
    }
  }, [profile]);

  async function handleSave() {
    setSaving(true);
    await updateProfile({ sleepSchedule, cleanliness, noiseLevel, socialEnergy, smoking, petFriendly });
    setSaving(false);
    navigation.goBack();
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <AsyncBoundary loading={loading} error={error} onRetry={reload}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <ScreenHeader
            title="Preferences"
            subtitle="This is what powers your compatibility scores with other students."
            onBack={() => navigation.goBack()}
            rightAction={{ label: saving ? 'Saving...' : 'Save', onPress: handleSave }}
          />

          <RadioGroup
            label="Sleep Schedule"
            options={['Early Bird', 'Night Owl', 'Flexible']}
            value={sleepSchedule}
            onChange={setSleepSchedule}
          />
          <RadioGroup
            label="Cleanliness"
            options={['Very Clean', 'Clean', 'Average', 'Messy']}
            value={cleanliness}
            onChange={setCleanliness}
          />
          <RadioGroup
            label="Noise Level"
            options={['Quiet', 'Moderate', 'Loud']}
            value={noiseLevel}
            onChange={setNoiseLevel}
          />
          <RadioGroup
            label="Social Energy"
            options={['Very Social', 'Social', 'Balanced', 'Reserved', 'Very Reserved']}
            value={socialEnergy}
            onChange={setSocialEnergy}
          />
          <RadioGroup
            label="Smoking"
            options={['Smoker', 'Non-Smoker']}
            value={smoking}
            onChange={setSmoking}
          />
          <RadioGroup
            label="OK Living With Pets"
            options={['Yes', 'No']}
            value={petFriendly}
            onChange={setPetFriendly}
          />
        </ScrollView>
      </AsyncBoundary>
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
});
