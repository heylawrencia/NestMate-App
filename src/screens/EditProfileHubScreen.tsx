/**
 * EditProfileHubScreen — Four-Section Profile Edit Hub (Spec §9.1 & Item 18)
 *
 * Replaces one long form with four focused sections:
 * 1. Basics (Name, Avatar, DOB, Gender, City, School Level, Bio)
 * 2. Lifestyle (Sleep, Cleanliness, Noise, Social Energy, Budget Range)
 * 3. Preferences (Smoker, Smoker OK, Pets, Pets OK, Seeking Type)
 * 4. Interests (Routes to InterestPickerScreen from F7)
 *
 * Each row displays the section title, a one-line summary of current values, and a completeness checkmark.
 */

import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import AsyncBoundary from '../components/AsyncBoundary';
import ElevatedCard from '../components/ElevatedCard';
import IconCircle from '../components/IconCircle';
import ScoreRing from '../components/ScoreRing';
import Skeleton from '../components/Skeleton';
import { useAsyncData } from '../hooks/useAsyncData';
import { RootStackParamList } from '../navigation/types';
import { fetchMyProfile, fetchProfileCompleteness } from '../services/profileService';
import { colors, radius, space, type } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'EditProfileHub'>;

export default function EditProfileHubScreen({ navigation }: Props) {
  const {
    data: profile,
    loading: profileLoading,
    error: profileError,
    reload,
  } = useAsyncData(fetchMyProfile, []);

  const { data: completeness } = useAsyncData(fetchProfileCompleteness, []);

  const score = completeness?.score ?? 70;

  // Summaries
  const basicsSummary = profile
    ? [profile.fullName, profile.gender, profile.city].filter(Boolean).join(' · ') || 'Name, DOB, gender & bio'
    : 'Name, DOB, gender & bio';

  const lifestyleSummary = profile
    ? [profile.sleepSchedule, profile.cleanliness, profile.socialEnergy].filter(Boolean).join(' · ') || 'Sleep, cleanliness & noise'
    : 'Sleep, cleanliness & noise';

  const preferencesSummary = profile
    ? [profile.smoking, profile.seekingType === 'SEEKING_ROOM' ? 'Seeking Room' : 'Offering Room'].filter(Boolean).join(' · ') || 'Smoking, pets & seeking type'
    : 'Smoking, pets & seeking type';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile Hub</Text>
      </View>

      <AsyncBoundary loading={profileLoading} error={profileError} onRetry={reload}>
        {profileLoading ? (
          <View style={styles.skeletonContainer}>
            <Skeleton variant="card" height={100} />
            <Skeleton variant="card" height={80} />
            <Skeleton variant="card" height={80} />
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Completeness Summary Header */}
            <ElevatedCard style={styles.heroCard}>
              <ScoreRing score={score} size={64} strokeWidth={6} />
              <View style={styles.heroTextCol}>
                <Text style={styles.heroTitle}>Profile Completeness</Text>
                <Text style={styles.heroSubtitle}>
                  {score >= 80
                    ? 'Your profile is thorough and gets 3x more roommate matches!'
                    : 'Complete all 4 sections to maximize roommate compatibility.'}
                </Text>
              </View>
            </ElevatedCard>

            <Text style={styles.sectionHeading}>Profile Sections</Text>

            {/* Section 1: Basics */}
            <TouchableOpacity
              style={styles.hubRowCard}
              onPress={() => navigation.navigate('EditBasics' as any)}
              activeOpacity={0.8}
            >
              <IconCircle size={44} backgroundColor={colors.primaryLight}>
                <Ionicons name="person-outline" size={22} color={colors.primary} />
              </IconCircle>

              <View style={styles.hubTextCol}>
                <View style={styles.titleCheckRow}>
                  <Text style={styles.hubRowTitle}>1. Basic Details & Photo</Text>
                  {profile?.fullName ? (
                    <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
                  ) : null}
                </View>
                <Text style={styles.hubRowSummary} numberOfLines={1}>
                  {basicsSummary}
                </Text>
              </View>

              <Ionicons name="chevron-forward" size={20} color={colors.inkMuted} />
            </TouchableOpacity>

            {/* Section 2: Lifestyle */}
            <TouchableOpacity
              style={styles.hubRowCard}
              onPress={() => navigation.navigate('EditLifestyle' as any)}
              activeOpacity={0.8}
            >
              <IconCircle size={44} backgroundColor={colors.surfaceTint}>
                <Ionicons name="sunny-outline" size={22} color={colors.accent} />
              </IconCircle>

              <View style={styles.hubTextCol}>
                <View style={styles.titleCheckRow}>
                  <Text style={styles.hubRowTitle}>2. Lifestyle Fit</Text>
                  {profile?.sleepSchedule ? (
                    <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
                  ) : null}
                </View>
                <Text style={styles.hubRowSummary} numberOfLines={1}>
                  {lifestyleSummary}
                </Text>
              </View>

              <Ionicons name="chevron-forward" size={20} color={colors.inkMuted} />
            </TouchableOpacity>

            {/* Section 3: Preferences */}
            <TouchableOpacity
              style={styles.hubRowCard}
              onPress={() => navigation.navigate('EditPreferences' as any)}
              activeOpacity={0.8}
            >
              <IconCircle size={44} backgroundColor={colors.primaryLight}>
                <Ionicons name="options-outline" size={22} color={colors.primary} />
              </IconCircle>

              <View style={styles.hubTextCol}>
                <View style={styles.titleCheckRow}>
                  <Text style={styles.hubRowTitle}>3. Housing Preferences</Text>
                  {profile?.seekingType ? (
                    <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
                  ) : null}
                </View>
                <Text style={styles.hubRowSummary} numberOfLines={1}>
                  {preferencesSummary}
                </Text>
              </View>

              <Ionicons name="chevron-forward" size={20} color={colors.inkMuted} />
            </TouchableOpacity>

            {/* Section 4: Interests */}
            <TouchableOpacity
              style={styles.hubRowCard}
              onPress={() => navigation.navigate('InterestPicker' as any)}
              activeOpacity={0.8}
            >
              <IconCircle size={44} backgroundColor={colors.surfaceTint}>
                <Ionicons name="heart-outline" size={22} color={colors.accent} />
              </IconCircle>

              <View style={styles.hubTextCol}>
                <View style={styles.titleCheckRow}>
                  <Text style={styles.hubRowTitle}>4. Personal Interests</Text>
                  <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
                </View>
                <Text style={styles.hubRowSummary} numberOfLines={1}>
                  Tappable chip cloud in 6 categories
                </Text>
              </View>

              <Ionicons name="chevron-forward" size={20} color={colors.inkMuted} />
            </TouchableOpacity>
          </ScrollView>
        )}
      </AsyncBoundary>
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
  heroCard: {
    padding: space.lg,
    borderRadius: radius.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
  heroTextCol: {
    flex: 1,
  },
  heroTitle: {
    fontFamily: type.h3.fontFamily,
    fontSize: type.h3.fontSize,
    color: colors.ink,
    fontWeight: '700',
  },
  heroSubtitle: {
    fontFamily: type.caption.fontFamily,
    fontSize: 12,
    color: colors.inkMuted,
    marginTop: 2,
    lineHeight: 17,
  },
  sectionHeading: {
    fontFamily: type.caption.fontFamily,
    fontSize: 14,
    color: colors.ink,
    fontWeight: '600',
    marginTop: space.sm,
  },
  hubRowCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: space.lg,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.line,
  },
  hubTextCol: {
    flex: 1,
    marginLeft: space.md,
    marginRight: space.sm,
  },
  titleCheckRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
  },
  hubRowTitle: {
    fontFamily: type.bodyStrong.fontFamily,
    fontSize: 15,
    color: colors.ink,
    fontWeight: '700',
  },
  hubRowSummary: {
    fontFamily: type.caption.fontFamily,
    fontSize: 13,
    color: colors.inkMuted,
    marginTop: 4,
  },
});
