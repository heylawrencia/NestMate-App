import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import DetailRow from '../components/DetailRow';
import ElevatedCard from '../components/ElevatedCard';
import ScreenHeader from '../components/ScreenHeader';
import SectionLabel from '../components/SectionLabel';
import { colors, spacing, typography } from '../theme';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Privacy'>;

export default function PrivacyScreen({ navigation }: Props) {
  const [showInExplore, setShowInExplore] = useState(true);
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);
  const [showCompatibilityScore, setShowCompatibilityScore] = useState(true);
  const [readReceipts, setReadReceipts] = useState(false);

  function renderSwitch(value: boolean, onValueChange: (next: boolean) => void) {
    return (
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor={colors.background}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Privacy" subtitle="Control what others can see" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <SectionLabel label="Visibility" style={styles.firstLabel} />
        <ElevatedCard style={styles.card}>
          <DetailRow
            icon="eye-outline"
            title="Show in Explore"
            right={renderSwitch(showInExplore, setShowInExplore)}
          />
          <DetailRow
            icon="ellipse-outline"
            title="Show online status"
            right={renderSwitch(showOnlineStatus, setShowOnlineStatus)}
          />
          <DetailRow
            icon="bar-chart-outline"
            title="Show compatibility score"
            right={renderSwitch(showCompatibilityScore, setShowCompatibilityScore)}
          />
          <DetailRow
            icon="checkmark-done-outline"
            title="Read receipts"
            isLast
            right={renderSwitch(readReceipts, setReadReceipts)}
          />
        </ElevatedCard>

        <SectionLabel label="Connections" />
        <ElevatedCard style={styles.card}>
          <DetailRow
            icon="ban-outline"
            title="Blocked users"
            isLast
            onPress={() =>
              navigation.navigate('Placeholder', {
                title: 'Blocked users',
                description: "You haven't blocked anyone yet.",
              })
            }
            right={
              <View style={styles.valueRow}>
                <Text style={styles.valueText}>0</Text>
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              </View>
            }
          />
        </ElevatedCard>

        <SectionLabel label="Your data" />
        <ElevatedCard style={styles.card}>
          <DetailRow
            icon="download-outline"
            title="Download my data"
            onPress={() =>
              navigation.navigate('Placeholder', {
                title: 'Download my data',
                description: 'Exporting your data will be available soon.',
              })
            }
          />
          <DetailRow
            icon="document-text-outline"
            title="Privacy Policy"
            isLast
            onPress={() =>
              navigation.navigate('Placeholder', {
                title: 'Privacy Policy',
                description: 'The full privacy policy will be available here soon.',
              })
            }
          />
        </ElevatedCard>

        <Text style={styles.footerNote}>
          NestMate never shares your contact details until you both start a conversation.
        </Text>
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
  firstLabel: {
    marginTop: 0,
  },
  card: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  valueText: {
    fontSize: typography.body,
    color: colors.textMuted,
  },
  footerNote: {
    fontSize: typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
    lineHeight: 18,
  },
});
