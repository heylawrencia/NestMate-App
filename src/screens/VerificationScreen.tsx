import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import EmptyState from '../components/EmptyState';
import ScreenHeader from '../components/ScreenHeader';
import { colors, spacing } from '../theme';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Verification'>;

export default function VerificationScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Verification" onBack={() => navigation.goBack()} />
      <EmptyState
        icon="shield-checkmark-outline"
        title="Verification coming soon"
        description="Soon you'll be able to verify your identity to build more trust with roommates."
      />
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
});
