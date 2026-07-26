import React, { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import AppTextInput from '../../components/AppTextInput';
import AppButton from '../../components/AppButton';
import DateOfBirthField from '../../components/DateOfBirthField';
import IconCircle from '../../components/IconCircle';
import ScreenHeader from '../../components/ScreenHeader';
import SelectField from '../../components/SelectField';
import OnboardingProgressBar from '../../components/OnboardingProgressBar';
import { colors, spacing, typography } from '../../theme';
import { RootStackParamList } from '../../navigation/types';
import { isWithinWordLimit } from '../../utils/limitWords';
import { resolveMediaUrl } from '../../services/apiClient';

type Props = NativeStackScreenProps<RootStackParamList, 'OnboardingAboutYou'>;

const GENDER_OPTIONS = ['Female', 'Male', 'Non-binary', 'Prefer not to say'];
const SCHOOL_LEVEL_OPTIONS = ['Undergraduate', 'Graduate', 'PhD', 'Not a student'];
const BIO_WORD_LIMIT = 3;

interface FormErrors {
  fullName?: string;
  dateOfBirth?: string;
  gender?: string;
  schoolLevel?: string;
  city?: string;
  budget?: string;
}

export default function AboutYouScreen({ navigation, route }: Props) {
  const { data } = route.params;
  const [avatarUri, setAvatarUri] = useState<string | undefined>(data.avatarUri);
  const [fullName, setFullName] = useState(data.fullName ?? '');
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>(
    data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
  );
  const [bio, setBio] = useState(data.bio ?? '');
  const [gender, setGender] = useState(data.gender);
  const [schoolLevel, setSchoolLevel] = useState(data.schoolLevel);
  const [city, setCity] = useState(data.city ?? '');
  const [budgetMin, setBudgetMin] = useState(data.budgetMin ?? '');
  const [budgetMax, setBudgetMax] = useState(data.budgetMax ?? '');
  const [errors, setErrors] = useState<FormErrors>({});

  function handleBioChange(text: string) {
    if (isWithinWordLimit(text, BIO_WORD_LIMIT)) {
      setBio(text);
    }
  }

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

  function validate(): boolean {
    const nextErrors: FormErrors = {};
    if (!fullName.trim()) {
      nextErrors.fullName = 'Full name is required.';
    }
    if (!dateOfBirth) {
      nextErrors.dateOfBirth = 'Date of birth is required.';
    }
    if (!gender) {
      nextErrors.gender = 'Please select a gender.';
    }
    if (!schoolLevel) {
      nextErrors.schoolLevel = 'Please select your school / level.';
    }
    if (!city.trim()) {
      nextErrors.city = 'City is required.';
    }
    const min = Number(budgetMin);
    const max = Number(budgetMax);
    if (!budgetMin || !budgetMax || Number.isNaN(min) || Number.isNaN(max)) {
      nextErrors.budget = 'Enter a valid budget range.';
    } else if (max < min) {
      nextErrors.budget = 'Max budget must be at least min budget.';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleContinue() {
    if (!validate() || !dateOfBirth) {
      return;
    }
    navigation.navigate('OnboardingPhotos', {
      data: {
        ...data,
        avatarUri,
        fullName: fullName.trim(),
        dateOfBirth: dateOfBirth.toISOString(),
        bio: bio.trim(),
        gender,
        schoolLevel,
        city: city.trim(),
        budgetMin,
        budgetMax,
      },
    });
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <ScreenHeader title="Tell Me About Yourself" onBack={() => navigation.goBack()} />

          <OnboardingProgressBar totalSteps={8} currentStep={0} />

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
            <AppTextInput
              label="Full Name"
              placeholder="Full Name"
              value={fullName}
              onChangeText={setFullName}
              error={errors.fullName}
              autoCapitalize="words"
            />

            <DateOfBirthField
              label="Date of Birth"
              value={dateOfBirth}
              onChange={setDateOfBirth}
              maximumDate={new Date()}
              error={errors.dateOfBirth}
            />

            <AppTextInput
              label="Describe Yourself in 3 Words"
              placeholder="e.g. Chill, Tidy, Friendly"
              value={bio}
              onChangeText={handleBioChange}
              autoCapitalize="words"
            />

            <SelectField
              label="Gender"
              placeholder="Gender"
              value={gender}
              options={GENDER_OPTIONS}
              onChange={setGender}
              error={errors.gender}
            />

            <SelectField
              label="School / Level"
              placeholder="School / Level"
              value={schoolLevel}
              options={SCHOOL_LEVEL_OPTIONS}
              onChange={setSchoolLevel}
              error={errors.schoolLevel}
            />

            <AppTextInput
              label="City"
              placeholder="e.g. Kumasi"
              value={city}
              onChangeText={setCity}
              error={errors.city}
              autoCapitalize="words"
            />

            <View style={styles.budgetRow}>
              <View style={styles.budgetField}>
                <AppTextInput
                  label="Min Budget (GH₵/yr)"
                  placeholder="e.g. 2000"
                  value={budgetMin}
                  onChangeText={setBudgetMin}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.budgetField}>
                <AppTextInput
                  label="Max Budget (GH₵/yr)"
                  placeholder="e.g. 5000"
                  value={budgetMax}
                  onChangeText={setBudgetMax}
                  keyboardType="numeric"
                />
              </View>
            </View>
            {errors.budget ? <Text style={styles.budgetError}>{errors.budget}</Text> : null}

            <AppButton title="Continue" onPress={handleContinue} />
          </View>
        </ScrollView>
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
  avatarTouchable: {
    alignSelf: 'center',
    marginVertical: spacing.lg,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  form: {
    width: '100%',
  },
  budgetRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  budgetField: {
    flex: 1,
  },
  budgetError: {
    color: colors.error,
    fontSize: typography.caption,
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
  },
});
