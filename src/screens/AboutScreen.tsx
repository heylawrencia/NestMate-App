import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import DetailRow from '../components/DetailRow';
import ElevatedCard from '../components/ElevatedCard';
import IconCircle from '../components/IconCircle';
import ScreenHeader from '../components/ScreenHeader';
import SectionLabel from '../components/SectionLabel';
import { colors, spacing, typography } from '../theme';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'About'>;

const APP_VERSION = '1.0.0';

export default function AboutScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="About" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.brandSection}>
          <IconCircle size={64} backgroundColor={colors.primaryLight}>
            <Ionicons name="home" size={28} color={colors.primary} />
          </IconCircle>
          <Text style={styles.appName}>NestMate</Text>
          <Text style={styles.tagline}>Find a roommate who fits your vibe</Text>
          <Text style={styles.version}>Version {APP_VERSION}</Text>
        </View>

        <Text style={styles.description}>
          NestMate helps students find compatible roommates and available hostel rooms in one place, matching
          on lifestyle, budget and study habits.
        </Text>

        <SectionLabel label="Legal" style={styles.legalLabel} />
        <ElevatedCard style={styles.card}>
          <DetailRow
            icon="document-text-outline"
            title="Terms of Service"
            onPress={() => navigation.navigate('Placeholder', { title: 'Terms of Service' })}
          />
          <DetailRow
            icon="lock-closed-outline"
            title="Privacy Policy"
            onPress={() => navigation.navigate('Placeholder', { title: 'Privacy Policy' })}
          />
          <DetailRow
            icon="code-slash-outline"
            title="Open source licenses"
            isLast
            onPress={() => navigation.navigate('Placeholder', { title: 'Open source licenses' })}
          />
        </ElevatedCard>

        <Text style={styles.footer}>Built by the NestMate team</Text>
        <Text style={styles.footer}>© {new Date().getFullYear()} NestMate. All rights reserved.</Text>
      </ScrollView>
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
  brandSection: {
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  appName: {
    fontSize: typography.h1,
    fontWeight: typography.weightBold,
    color: colors.text,
    marginTop: spacing.md,
  },
  tagline: {
    fontSize: typography.body,
    color: colors.textMuted,
    marginTop: 2,
  },
  version: {
    fontSize: typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  description: {
    fontSize: typography.body,
    color: colors.textMuted,
    lineHeight: 20,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  legalLabel: {
    marginTop: spacing.sm,
  },
  card: {
    padding: spacing.md,
    marginBottom: spacing.xl,
  },
  footer: {
    fontSize: typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
