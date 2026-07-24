import React, { useCallback } from 'react';
import { Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CompositeScreenProps, useFocusEffect } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import AppButton from '../components/AppButton';
import AsyncBoundary from '../components/AsyncBoundary';
import ElevatedCard from '../components/ElevatedCard';
import GradientHeader from '../components/GradientHeader';
import HeaderIconRow from '../components/HeaderIconRow';
import IconCircle from '../components/IconCircle';
import ListRow from '../components/ListRow';
import { colors, spacing, typography } from '../theme';
import { MainTabParamList, RootStackParamList } from '../navigation/types';
import { useDrawer } from '../context/DrawerContext';
import { useAsyncData } from '../hooks/useAsyncData';
import { fetchProfile } from '../services/profileService';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Profile'>,
  NativeStackScreenProps<RootStackParamList>
>;

export default function ProfileScreen({ navigation }: Props) {
  const { openDrawer } = useDrawer();
  const { data: profile, loading, error, reload } = useAsyncData(fetchProfile, []);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <GradientHeader imageUri={profile?.photos?.[0]}>
        <HeaderIconRow
          onMenuPress={openDrawer}
          onNotificationsPress={() => navigation.navigate('Notifications')}
        />
        <Text style={styles.header}>Profile</Text>
      </GradientHeader>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <AsyncBoundary loading={loading} error={error} onRetry={reload}>
          {profile ? (
            <>
              <View style={styles.avatarSection}>
                <View style={styles.avatarWrapper}>
                  <IconCircle size={96}>
                    {profile.avatarUri ? (
                      <Image source={{ uri: profile.avatarUri }} style={styles.avatarImage} />
                    ) : (
                      <Ionicons name="person" size={40} color={colors.textMuted} />
                    )}
                  </IconCircle>
                  <TouchableOpacity style={styles.editBadge} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Ionicons name="camera" size={14} color={colors.white} />
                  </TouchableOpacity>
                </View>

                <Text style={styles.name}>{profile.fullName || 'Add your name'}</Text>
                {profile.bio ? <Text style={styles.subtitle}>{profile.bio}</Text> : null}

                <View style={styles.editButton}>
                  <AppButton
                    title="Edit Profile"
                    variant="outline"
                    onPress={() => navigation.navigate('EditProfile')}
                  />
                </View>
              </View>

              <ElevatedCard style={styles.listCard}>
                <ListRow
                  label="Personal Info"
                  icon="person-outline"
                  onPress={() => navigation.navigate('EditProfile')}
                />
                <ListRow
                  label="Preferences"
                  icon="options-outline"
                  onPress={() => navigation.navigate('Preferences')}
                />
                <ListRow
                  label="Photos"
                  icon="images-outline"
                  onPress={() => navigation.navigate('Placeholder', { title: 'Photos' })}
                />
                <ListRow
                  label="Account Settings"
                  icon="settings-outline"
                  isLast
                  onPress={() => navigation.navigate('Settings')}
                />
              </ElevatedCard>
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
    backgroundColor: colors.surfaceTint,
  },
  header: {
    fontSize: typography.h1,
    fontWeight: typography.weightBold,
    color: colors.white,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  avatarWrapper: {
    marginBottom: spacing.md,
  },
  editBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surfaceTint,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  name: {
    fontSize: typography.h2,
    fontWeight: typography.weightBold,
    color: colors.text,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: typography.body,
    color: colors.textMuted,
  },
  editButton: {
    width: '100%',
    marginTop: spacing.lg,
  },
  listCard: {
    padding: spacing.md,
  },
});
