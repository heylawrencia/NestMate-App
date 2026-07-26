import React, { useEffect, useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import AppTextInput from '../components/AppTextInput';
import AsyncBoundary from '../components/AsyncBoundary';
import IconCircle from '../components/IconCircle';
import ScreenHeader from '../components/ScreenHeader';
import SelectField from '../components/SelectField';
import { colors, spacing, typography } from '../theme';
import { RootStackParamList } from '../navigation/types';
import { useAsyncData } from '../hooks/useAsyncData';
import { ApiError, resolveMediaUrl } from '../services/apiClient';
import {
  buildProfileRequest,
  ensureUploadedAvatar,
  fetchMyProfile,
  saveMyProfile,
} from '../services/profileService';

type Props = NativeStackScreenProps<RootStackParamList, 'EditProfile'>;

const SLEEP_SCHEDULE_OPTIONS = ['Early Bird', 'Night Owl', 'Flexible'];
const CLEANLINESS_OPTIONS = ['Very Clean', 'Clean', 'Average', 'Messy'];
const CLEANLINESS_SCALE = [5, 4, 3, 1];
const NOISE_OPTIONS = ['Quiet', 'Moderate', 'Loud'];
const NOISE_SCALE = [2, 3, 5];
const SOCIAL_OPTIONS = ['Very Social', 'Social', 'Balanced', 'Reserved', 'Very Reserved'];
const SOCIAL_SCALE = [5, 4, 3, 2, 1];
const SEEKING_OPTIONS = ['Looking for a room', 'Offering a room'];
const SMOKING_OPTIONS = ['Smoker', 'Non-Smoker'];
const YES_NO_OPTIONS = ['Yes', 'No'];

const SLEEP_SCHEDULE_REVERSE: Record<string, string> = {
  EARLY_BIRD: 'Early Bird',
  NIGHT_OWL: 'Night Owl',
  FLEXIBLE: 'Flexible',
};
const SEEKING_TYPE_REVERSE: Record<string, string> = {
  SEEKING_ROOM: 'Looking for a room',
  OFFERING_ROOM: 'Offering a room',
};

function closestLabel(value: number, options: string[], scale: number[]): string {
  let best = options[0];
  let bestDiff = Infinity;
  options.forEach((label, i) => {
    const diff = Math.abs(scale[i] - value);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = label;
    }
  });
  return best;
}

export default function EditProfileScreen({ navigation }: Props) {
  const { data: profile, loading, error, reload } = useAsyncData(fetchMyProfile, []);

  const [avatarUri, setAvatarUri] = useState<string | undefined>();
  const [city, setCity] = useState('');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [bio, setBio] = useState('');
  const [sleepSchedule, setSleepSchedule] = useState<string | undefined>();
  const [cleanliness, setCleanliness] = useState<string | undefined>();
  const [noiseLevel, setNoiseLevel] = useState<string | undefined>();
  const [socialEnergy, setSocialEnergy] = useState<string | undefined>();
  const [smoking, setSmoking] = useState<string | undefined>();
  const [smokerOk, setSmokerOk] = useState<string | undefined>();
  const [hasPets, setHasPets] = useState<string | undefined>();
  const [petFriendly, setPetFriendly] = useState<string | undefined>();
  const [seekingType, setSeekingType] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | undefined>();

  useEffect(() => {
    if (!profile) {
      return;
    }
    setAvatarUri(profile.avatarUri);
    setCity(profile.city ?? '');
    setBudgetMin(profile.budgetMin ? String(profile.budgetMin) : '');
    setBudgetMax(profile.budgetMax ? String(profile.budgetMax) : '');
    setBio(profile.bio ?? '');
    setSleepSchedule(profile.sleepSchedule ? SLEEP_SCHEDULE_REVERSE[profile.sleepSchedule] : undefined);
    setCleanliness(typeof profile.cleanliness === 'number' ? closestLabel(profile.cleanliness, CLEANLINESS_OPTIONS, CLEANLINESS_SCALE) : (profile.cleanliness ?? 'Average'));
    setNoiseLevel(typeof profile.noiseTolerance === 'number' ? closestLabel(profile.noiseTolerance, NOISE_OPTIONS, NOISE_SCALE) : (profile.noiseLevel ?? 'Moderate'));
    setSocialEnergy(closestLabel(profile.socialLevel ?? 3, SOCIAL_OPTIONS, SOCIAL_SCALE));
    setSmoking(profile.smoker ? 'Smoker' : 'Non-Smoker');
    setSmokerOk(profile.smokerOk ? 'Yes' : 'No');
    setHasPets(profile.hasPets ? 'Yes' : 'No');
    setPetFriendly(profile.petsOk ? 'Yes' : 'No');
    setSeekingType(profile.seekingType ? SEEKING_TYPE_REVERSE[profile.seekingType] : undefined);
  }, [profile]);

  async function handlePickAvatar() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      setAvatarUri(result.assets[0].uri);
    }
  }

  async function handleSave() {
    setSaveError(undefined);
    setSaving(true);
    const uploadedAvatarUri = await ensureUploadedAvatar(avatarUri);
    // buildProfileRequest takes an OnboardingData-shaped bag - `email` is unused by
    // the mapping itself, so a placeholder here is harmless.
    const request = buildProfileRequest({
      email: '',
      avatarUri: uploadedAvatarUri,
      city,
      budgetMin,
      budgetMax,
      bio,
      lifestyle: {
        sleepSchedule,
        cleanliness,
        noiseLevel,
        socialEnergy,
        smoking,
        smokerOk,
        hasPets,
        petFriendly,
        seekingType,
      },
    });
    if (!request) {
      setSaveError('Please fill in every field before saving.');
      setSaving(false);
      return;
    }
    try {
      await saveMyProfile(request);
      navigation.goBack();
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : 'Could not save your profile. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <AsyncBoundary loading={loading} error={error} onRetry={reload}>
          <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            <ScreenHeader
              title="Edit Profile"
              onBack={() => navigation.goBack()}
              rightAction={{ label: saving ? 'Saving…' : 'Save', onPress: handleSave }}
            />

            <TouchableOpacity style={styles.avatarTouchable} onPress={handlePickAvatar} activeOpacity={0.8}>
              <IconCircle size={88}>
                {avatarUri ? (
                  <Image source={{ uri: resolveMediaUrl(avatarUri) }} style={styles.avatarImage} />
                ) : (
                  <Ionicons name="camera" size={28} color={colors.textMuted} />
                )}
              </IconCircle>
            </TouchableOpacity>

            <View style={styles.form}>
              <AppTextInput label="City" value={city} onChangeText={setCity} autoCapitalize="words" />

              <View style={styles.budgetRow}>
                <View style={styles.budgetField}>
                  <AppTextInput
                    label="Min Budget (GH₵/yr)"
                    value={budgetMin}
                    onChangeText={setBudgetMin}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.budgetField}>
                  <AppTextInput
                    label="Max Budget (GH₵/yr)"
                    value={budgetMax}
                    onChangeText={setBudgetMax}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <AppTextInput label="Bio" value={bio} onChangeText={setBio} autoCapitalize="sentences" />

              <SelectField
                label="Sleep Schedule"
                placeholder="Sleep Schedule"
                value={sleepSchedule}
                options={SLEEP_SCHEDULE_OPTIONS}
                onChange={setSleepSchedule}
              />
              <SelectField
                label="Cleanliness"
                placeholder="Cleanliness"
                value={cleanliness}
                options={CLEANLINESS_OPTIONS}
                onChange={setCleanliness}
              />
              <SelectField
                label="Noise Level"
                placeholder="Noise Level"
                value={noiseLevel}
                options={NOISE_OPTIONS}
                onChange={setNoiseLevel}
              />
              <SelectField
                label="Social Energy"
                placeholder="Social Energy"
                value={socialEnergy}
                options={SOCIAL_OPTIONS}
                onChange={setSocialEnergy}
              />
              <SelectField
                label="Looking for a room or offering one?"
                placeholder="Seeking type"
                value={seekingType}
                options={SEEKING_OPTIONS}
                onChange={setSeekingType}
              />
              <SelectField
                label="Do you smoke?"
                placeholder="Smoking"
                value={smoking}
                options={SMOKING_OPTIONS}
                onChange={setSmoking}
              />
              <SelectField
                label="Okay living with a smoker?"
                placeholder="Smoker ok"
                value={smokerOk}
                options={YES_NO_OPTIONS}
                onChange={setSmokerOk}
              />
              <SelectField
                label="Do you have pets?"
                placeholder="Has pets"
                value={hasPets}
                options={YES_NO_OPTIONS}
                onChange={setHasPets}
              />
              <SelectField
                label="Okay living with pets?"
                placeholder="Pets ok"
                value={petFriendly}
                options={YES_NO_OPTIONS}
                onChange={setPetFriendly}
              />

              {saveError ? <Text style={styles.errorText}>{saveError}</Text> : null}
            </View>
          </ScrollView>
        </AsyncBoundary>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  form: {
    width: '100%',
  },
  avatarTouchable: {
    alignSelf: 'center',
    marginVertical: spacing.lg,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  budgetRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  budgetField: {
    flex: 1,
  },
  errorText: {
    color: colors.error,
    fontSize: typography.caption,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
});
