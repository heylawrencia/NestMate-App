import React, { useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import AsyncBoundary from '../components/AsyncBoundary';
import DetailRow from '../components/DetailRow';
import ElevatedCard from '../components/ElevatedCard';
import ScreenHeader from '../components/ScreenHeader';
import SectionLabel from '../components/SectionLabel';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, typography } from '../theme';
import { RootStackParamList } from '../navigation/types';
import { useAsyncData } from '../hooks/useAsyncData';
import { fetchProfile } from '../services/profileService';
import { forgotPassword } from '../services/authService';

type Props = NativeStackScreenProps<RootStackParamList, 'Account'>;

export default function AccountScreen({ navigation }: Props) {
  const { logout } = useAuth();
  const { data: profile, loading, error, reload } = useAsyncData(fetchProfile, []);
  const [sendingCode, setSendingCode] = useState(false);

  function handleLogOut() {
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
            navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
          },
        },
      ],
      { cancelable: true }
    );
  }

  async function handleChangePassword() {
    if (!profile?.email || sendingCode) return;
    setSendingCode(true);
    await forgotPassword(profile.email);
    setSendingCode(false);
    navigation.navigate('ResetPassword', { email: profile.email });
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Account" subtitle="Manage your login and account" onBack={() => navigation.goBack()} />

      <AsyncBoundary loading={loading} error={error} onRetry={reload}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <SectionLabel label="Login details" style={styles.firstLabel} />
          <ElevatedCard style={styles.card}>
            <View style={styles.emailRow}>
              <Ionicons name="mail-outline" size={20} color={colors.textMuted} />
              <View style={styles.emailTextGroup}>
                <Text style={styles.emailLabel}>Email</Text>
                <Text style={styles.emailValue}>{profile?.email || 'Not set'}</Text>
              </View>
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={14} color={colors.success} />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            </View>
            <DetailRow
              icon="lock-closed-outline"
              title="Change password"
              subtitle={sendingCode ? 'Sending code...' : undefined}
              isLast
              disabled={sendingCode}
              onPress={handleChangePassword}
              right={sendingCode ? <ActivityIndicator color={colors.textMuted} /> : undefined}
            />
          </ElevatedCard>

          <SectionLabel label="Security" />
          <ElevatedCard style={styles.card}>
            <DetailRow icon="shield-outline" title="Two-factor authentication" subtitle="Coming soon" disabled />
            <DetailRow
              icon="phone-portrait-outline"
              title="Active sessions"
              subtitle="1 device signed in"
              isLast
              onPress={() => (navigation as any).navigate('Privacy')}
            />
          </ElevatedCard>

          <SectionLabel label="Account actions" />
          <ElevatedCard style={styles.card}>
            <DetailRow icon="log-out-outline" title="Log out" onPress={handleLogOut} />
            <DetailRow
              icon="trash-outline"
              title="Delete account"
              destructive
              isLast
              onPress={() => (navigation as any).navigate('HelpSupport')}
            />
          </ElevatedCard>
        </ScrollView>
      </AsyncBoundary>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  firstLabel: {
    marginTop: 0,
  },
  card: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  emailTextGroup: {
    flex: 1,
  },
  emailLabel: {
    fontSize: typography.caption,
    color: colors.textMuted,
  },
  emailValue: {
    fontSize: typography.body,
    fontWeight: typography.weightBold,
    color: colors.text,
    marginTop: 2,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E3F5EE',
    borderRadius: 12,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  verifiedText: {
    fontSize: typography.caption,
    fontWeight: typography.weightBold,
    color: colors.success,
  },
});
