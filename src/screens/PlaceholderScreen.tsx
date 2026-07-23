import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import EmptyState from '../components/EmptyState';
import ScreenHeader from '../components/ScreenHeader';
import { colors, spacing } from '../theme';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Placeholder'>;

export default function PlaceholderScreen({ navigation, route }: Props) {
  const { title, description } = route.params;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title={title} onBack={() => navigation.goBack()} />
      <EmptyState
        icon="construct-outline"
        title={`${title} coming soon`}
        description={description ?? "We're still building this out."}
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
