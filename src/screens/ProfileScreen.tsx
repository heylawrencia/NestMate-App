/**
 * ProfileScreen — User Profile & Settings Screen (Spec §9.1, Task 6)
 *
 * Header with avatar, name, and completeness ScoreRing.
 * Grouped settings rows routing to Edit Profile Hub, Interests, Premium, Terms, Privacy, Support, About, and Log out.
 */

import React, { useCallback } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CompositeScreenProps, useFocusEffect } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import AppButton from '../components/AppButton';
import AsyncBoundary from '../components/AsyncBoundary';
import ElevatedCard from '../components/ElevatedCard';
import IconCircle from '../components/IconCircle';
import ListRow from '../components/ListRow';
import ScoreRing from '../components/ScoreRing';
import { useAuth } from '../context/AuthContext';
import { useAsyncData } from '../hooks/useAsyncData';
import { MainTabParamList, RootStackParamList } from '../navigation/types';
import { resolveMediaUrl } from '../services/apiClient';
import { fetchPlan } from '../services/planService';
import { fetchMyProfile, fetchProfileCompleteness } from '../services/profileService';
import { colors, radius, space, type } from '../theme';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Profile'>,
  NativeStackScreenProps<RootStackParamList>
>;

export default function ProfileScreen({ navigation }: Props) {
  const { email, fullName, logout } = useAuth();
  const { data: profile, loading, error, reload } = useAsyncData(fetchMyProfile, []);
  const { data: plan, reload: reloadPlan } = useAsyncData(fetchPlan, []);
  const { data: completeness, reload: reloadCompleteness } = useAsyncData(fetchProfileCompleteness, []);

  useFocusEffect(
    useCallback(() => {
      reload();
      reloadPlan();
      reloadCompleteness();
    }, [reload, reloadPlan, reloadCompleteness])
  );

  const score = completeness?.score ?? 70;
  const planSubtitle = plan
    ? plan.tier === 'PREMIUM'
      ? 'Premium Membership'
      : 'Free Plan (5 match checks/month)'
    : 'Free Plan';

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
            (navigation as any).reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          },
        },
      ],
      { cancelable: true }
    );
  };

  const avatarSource = profile?.avatarUri ? { uri: resolveMediaUrl(profile.avatarUri) } : undefined;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>My Account</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <AsyncBoundary loading={loading} error={error} onRetry={reload}>
          {profile ? (
            <>
              {/* Header Hero Section */}
              <ElevatedCard style={styles.profileHeroCard}>
                <View style={styles.avatarScoreRow}>
                  <View style={styles.avatarWrapper}>
                    {avatarSource ? (
                      <Image source={avatarSource} style={styles.avatarImage} />
                    ) : (
                      <IconCircle size={80} backgroundColor={colors.primaryLight}>
                        <Ionicons name="person" size={40} color={colors.primary} />
                      </IconCircle>
                    )}
                  </View>

                  <ScoreRing score={score} size={64} strokeWidth={6} />
                </View>

                <Text style={styles.name}>{profile.fullName || fullName || email}</Text>
                <Text style={styles.emailSubtext}>{email}</Text>

                <View style={styles.editBtnWrapper}>
                  <AppButton
                    title="Edit Profile Hub →"
                    variant="primary"
                    size="md"
                    onPress={() => (navigation as any).navigate('EditProfileHub')}
                  />
                </View>
              </ElevatedCard>

              {/* Grouped Settings Rows */}
              <Text style={styles.groupHeading}>Account & Preferences</Text>
              <ElevatedCard style={styles.listCard}>
                <ListRow
                  label="Edit Profile Sections"
                  subtitle="Basics, Lifestyle & Housing preferences"
                  icon="create-outline"
                  onPress={() => (navigation as any).navigate('EditProfileHub')}
                />
                <ListRow
                  label="Personal Interests"
                  subtitle="Tappable chip cloud in 6 categories"
                  icon="heart-outline"
                  onPress={() => (navigation as any).navigate('InterestPicker')}
                />
                <ListRow
                  label="Membership & Plan"
                  subtitle={planSubtitle}
                  icon="star-outline"
                  isLast
                  onPress={() => (navigation as any).navigate('UpgradePremium')}
                />
              </ElevatedCard>

              <Text style={styles.groupHeading}>Legal & Support</Text>
              <ElevatedCard style={styles.listCard}>
                <ListRow
                  label="Help & Support"
                  subtitle="WhatsApp support & FAQ accordions"
                  icon="headset-outline"
                  onPress={() => (navigation as any).navigate('HelpSupport')}
                />
                <ListRow
                  label="Terms of Service"
                  subtitle="Legal terms & §5 offline payments"
                  icon="document-text-outline"
                  onPress={() => (navigation as any).navigate('TermsOfService')}
                />
                <ListRow
                  label="Privacy Policy"
                  subtitle="Data security & storage rights"
                  icon="shield-checkmark-outline"
                  onPress={() => (navigation as any).navigate('PrivacyPolicy')}
                />
                <ListRow
                  label="About NESTMATE"
                  subtitle="Version 2.0.0"
                  icon="information-circle-outline"
                  isLast
                  onPress={() => (navigation as any).navigate('About')}
                />
              </ElevatedCard>

              {/* Log Out */}
              <View style={styles.logoutWrapper}>
                <AppButton
                  title="Log Out"
                  variant="outline"
                  size="md"
                  onPress={handleLogout}
                />
              </View>
            </>
          ) : null}
        </AsyncBoundary>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerBar: {
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  headerTitle: {
    fontFamily: type.h1.fontFamily,
    fontSize: type.h1.fontSize,
    color: colors.ink,
    fontWeight: '700',
  },
  scrollContent: {
    padding: space.lg,
    gap: space.md,
  },
  profileHeroCard: {
    padding: space.xl,
    borderRadius: radius.xl,
    alignItems: 'center',
  },
  avatarScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xl,
    marginBottom: space.md,
  },
  avatarWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
  },
  avatarImage: {
    width: 80,
    height: 80,
  },
  name: {
    fontFamily: type.h1.fontFamily,
    fontSize: type.h1.fontSize,
    color: colors.ink,
    fontWeight: '800',
  },
  emailSubtext: {
    fontFamily: type.caption.fontFamily,
    fontSize: 13,
    color: colors.inkMuted,
    marginTop: 2,
  },
  editBtnWrapper: {
    width: '100%',
    marginTop: space.lg,
  },
  groupHeading: {
    fontFamily: type.caption.fontFamily,
    fontSize: 14,
    color: colors.ink,
    fontWeight: '600',
    marginTop: space.xs,
  },
  listCard: {
    padding: space.sm,
    borderRadius: radius.xl,
  },
  logoutWrapper: {
    marginTop: space.md,
    marginBottom: space.xl,
  },
});
