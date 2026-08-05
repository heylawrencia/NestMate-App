/**
 * EditBasicsScreen — Basic Profile Details & Avatar Photo Editor (Spec §9.1 & §9.2, Items 8, 18)
 *
 * Fields: Name, Avatar, DOB, Gender, City, School Level, Bio.
 * Avatar Action Sheet:
 *  - Take a photo (launchCameraAsync) with permission rationale & graceful gallery fallback
 *  - Choose from gallery (launchImageLibraryAsync)
 *  - Remove photo (destructive action)
 * Both paths use allowsEditing: true, aspect: [1, 1], quality: 0.7.
 * Fits within one screen of scroll.
 */

import React, { useState } from 'react';
import {
  ActionSheetIOS,
  Alert,
  Image,
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

import AppButton from '../components/AppButton';
import AppTextInput from '../components/AppTextInput';
import AsyncBoundary from '../components/AsyncBoundary';
import DatePickerField from '../components/DatePickerField';
import IconCircle from '../components/IconCircle';
import Skeleton from '../components/Skeleton';
import { useAsyncData } from '../hooks/useAsyncData';
import { RootStackParamList } from '../navigation/types';
import { fetchMyProfile, updateProfile, uploadAvatarPhoto } from '../services/profileService';
import { colors, radius, space, type } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'EditBasics'>;

const CITIES = ['Kumasi', 'Accra', 'Tamale', 'Cape Coast'];

export default function EditBasicsScreen({ navigation }: Props) {
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('PREFER_NOT_TO_SAY');
  const [city, setCity] = useState('Kumasi');
  const [schoolLevel, setSchoolLevel] = useState('Level 200');
  const [bio, setBio] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | undefined>(undefined);

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [saving, setSaving] = useState(false);

  const {
    loading,
    error,
    reload,
  } = useAsyncData(async () => {
    const p = await fetchMyProfile();
    if (p) {
      setFullName(p.fullName ?? '');
      setDob(p.dateOfBirth ?? '2004-01-01');
      setGender(p.gender ?? 'PREFER_NOT_TO_SAY');
      setCity(p.city ?? 'Kumasi');
      setSchoolLevel(p.schoolLevel ?? 'Level 200');
      setBio(p.bio ?? '');
      setAvatarUri(p.avatarUri);
    }
    return p;
  }, []);

  const handlePickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      uploadPhotoUri(result.assets[0].uri);
    }
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Camera Permission',
        'Camera access is required to take a profile photo. Would you like to choose from your gallery instead?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Gallery', onPress: handlePickFromGallery },
        ]
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      uploadPhotoUri(result.assets[0].uri);
    }
  };

  const uploadPhotoUri = async (localUri: string) => {
    setAvatarUri(localUri); // Immediate local preview
    setUploadingAvatar(true);
    try {
      const serverUri = await uploadAvatarPhoto(localUri);
      setAvatarUri(serverUri);
      setUploadingAvatar(false);
    } catch (e) {
      setUploadingAvatar(false);
      Alert.alert(
        'Upload Failed',
        'Could not upload photo to server. Local preview retained.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleRemovePhoto = () => {
    setAvatarUri(undefined);
  };

  const handleAvatarTap = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: avatarUri
            ? ['Take a photo', 'Choose from gallery', 'Remove photo', 'Cancel']
            : ['Take a photo', 'Choose from gallery', 'Cancel'],
          destructiveButtonIndex: avatarUri ? 2 : undefined,
          cancelButtonIndex: avatarUri ? 3 : 2,
        },
        (buttonIndex) => {
          if (buttonIndex === 0) handleTakePhoto();
          if (buttonIndex === 1) handlePickFromGallery();
          if (avatarUri && buttonIndex === 2) handleRemovePhoto();
        }
      );
    } else {
      Alert.alert('Profile Photo', 'Choose an option', [
        { text: 'Take a photo', onPress: handleTakePhoto },
        { text: 'Choose from gallery', onPress: handlePickFromGallery },
        ...(avatarUri
          ? [{ text: 'Remove photo', style: 'destructive' as const, onPress: handleRemovePhoto }]
          : []),
        { text: 'Cancel', style: 'cancel' as const },
      ]);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({
        fullName,
        dateOfBirth: dob,
        gender,
        city,
        schoolLevel,
        bio,
        avatarUri,
      });
      setSaving(false);
      navigation.goBack();
    } catch (e: any) {
      setSaving(false);
      Alert.alert('Save Failed', e?.message || 'Could not update profile details.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Basic Details</Text>
      </View>

      <AsyncBoundary loading={loading} error={error} onRetry={reload}>
        {loading ? (
          <View style={styles.skeletonContainer}>
            <Skeleton variant="card" height={100} />
            <Skeleton variant="card" height={160} />
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Avatar Section with Action Sheet */}
            <View style={styles.avatarSection}>
              <TouchableOpacity onPress={handleAvatarTap} activeOpacity={0.8} style={styles.avatarWrapper}>
                {avatarUri ? (
                  <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
                ) : (
                  <IconCircle size={88} backgroundColor={colors.primaryLight}>
                    <Ionicons name="person" size={44} color={colors.primary} />
                  </IconCircle>
                )}

                <View style={styles.cameraIconPill}>
                  <Ionicons name="camera" size={16} color={colors.white} />
                </View>
              </TouchableOpacity>

              <Text style={styles.avatarTapHint}>
                {uploadingAvatar ? 'Uploading photo...' : 'Tap to change photo'}
              </Text>
            </View>

            {/* Inputs */}
            <AppTextInput
              label="Full Name"
              value={fullName}
              onChangeText={setFullName}
              placeholder="e.g. Ama Mensah"
            />

            <DatePickerField
              label="Date of Birth"
              value={dob}
              onChange={setDob}
            />

            <Text style={styles.fieldLabel}>City / Campus Location</Text>
            <View style={styles.chipRow}>
              {CITIES.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[styles.chip, city === c && styles.chipSelected]}
                  onPress={() => setCity(c)}
                >
                  <Text style={[styles.chipText, city === c && styles.chipTextSelected]}>
                    {c}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <AppTextInput
              label="Bio / Short Description"
              value={bio}
              onChangeText={setBio}
              placeholder="Tell prospective roommates a little about yourself..."
              multiline
              numberOfLines={3}
            />
          </ScrollView>
        )}
      </AsyncBoundary>

      <View style={styles.footerBar}>
        <AppButton
          title="Save Basic Details"
          variant="primary"
          size="lg"
          loading={saving}
          onPress={handleSave}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  backBtn: {
    padding: space.xs,
    marginRight: space.sm,
  },
  headerTitle: {
    fontFamily: type.h2.fontFamily,
    fontSize: type.h2.fontSize,
    color: colors.ink,
    fontWeight: '700',
  },
  skeletonContainer: {
    padding: space.lg,
    gap: space.md,
  },
  scrollContent: {
    padding: space.lg,
    gap: space.md,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: space.sm,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarImage: {
    width: 88,
    height: 88,
    borderRadius: 44,
  },
  cameraIconPill: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
  },
  avatarTapHint: {
    fontFamily: type.caption.fontFamily,
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
    marginTop: space.xs,
  },
  fieldLabel: {
    fontFamily: type.caption.fontFamily,
    fontSize: 14,
    color: colors.ink,
    fontWeight: '600',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.xs,
  },
  chip: {
    paddingHorizontal: space.md,
    paddingVertical: space.xs + 2,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
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
  footerBar: {
    padding: space.lg,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    backgroundColor: colors.surface,
  },
});
