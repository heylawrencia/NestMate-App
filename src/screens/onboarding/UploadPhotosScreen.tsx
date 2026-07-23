import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import AppButton from '../../components/AppButton';
import OnboardingProgressBar from '../../components/OnboardingProgressBar';
import ScreenHeader from '../../components/ScreenHeader';
import { colors, spacing, typography } from '../../theme';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'OnboardingPhotos'>;

const MIN_PHOTOS = 1;
const MAX_PHOTOS = 2;

export default function UploadPhotosScreen({ navigation, route }: Props) {
  const { data } = route.params;
  const [photos, setPhotos] = useState<Array<string | undefined>>(() => {
    const initial = [...(data.photos ?? [])];
    while (initial.length < MAX_PHOTOS) {
      initial.push(undefined as unknown as string);
    }
    return initial.slice(0, MAX_PHOTOS);
  });

  const selectedCount = photos.filter(Boolean).length;

  async function handlePickPhoto(index: number) {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });
    if (!result.canceled) {
      setPhotos((prev) => {
        const next = [...prev];
        next[index] = result.assets[0].uri;
        return next;
      });
    }
  }

  function handleRemovePhoto(index: number) {
    setPhotos((prev) => {
      const next = [...prev];
      next[index] = undefined as unknown as string;
      return next;
    });
  }

  function handleContinue() {
    if (selectedCount < MIN_PHOTOS) {
      return;
    }
    navigation.navigate('OnboardingInterests', {
      data: { ...data, photos: photos.filter((uri): uri is string => Boolean(uri)) },
    });
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ScreenHeader title="Upload Photos" onBack={() => navigation.goBack()} />

        <OnboardingProgressBar totalSteps={8} currentStep={1} />

        <Text style={styles.subtitle}>
          Add at least {MIN_PHOTOS} photo{MIN_PHOTOS === 1 ? '' : 's'}
        </Text>

        <View style={styles.grid}>
          {photos.map((uri, index) => (
            <TouchableOpacity
              key={index}
              style={styles.photoBox}
              onPress={() => (uri ? undefined : handlePickPhoto(index))}
              activeOpacity={0.8}
            >
              {uri ? (
                <>
                  <Image source={{ uri }} style={styles.photoImage} />
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemovePhoto(index)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="close" size={14} color={colors.white} />
                  </TouchableOpacity>
                </>
              ) : (
                <Ionicons name="add" size={28} color={colors.textMuted} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.helperText}>Your photos help build trust in the community</Text>

        <View style={styles.form}>
          <AppButton title="Continue" onPress={handleContinue} disabled={selectedCount < MIN_PHOTOS} />
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
    textAlign: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  photoBox: {
    width: '47%',
    aspectRatio: 3 / 4,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  helperText: {
    fontSize: typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  form: {
    width: '100%',
  },
});
