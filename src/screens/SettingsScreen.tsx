import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import ElevatedCard from '../components/ElevatedCard';
import ListRow from '../components/ListRow';
import ScreenHeader from '../components/ScreenHeader';
import { colors, spacing } from '../theme';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export default function SettingsScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Settings" onBack={() => navigation.goBack()} />

      <ElevatedCard style={styles.card}>
        <ListRow label="Account" onPress={() => navigation.navigate('Account')} />
        <ListRow label="Privacy" onPress={() => navigation.navigate('Privacy')} />
        <ListRow
          label="Notifications"
          onPress={() => navigation.navigate('Placeholder', { title: 'Notifications' })}
        />
        <ListRow label="Help & Support" onPress={() => navigation.navigate('HelpSupport')} />
        <ListRow label="About NestMate" isLast onPress={() => navigation.navigate('About')} />
      </ElevatedCard>

      <ElevatedCard style={styles.card}>
        <ListRow
          label="Log Out"
          destructive
          showChevron={false}
          isLast
          onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Login' }] })}
        />
      </ElevatedCard>

      <View style={styles.spacer} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surfaceTint,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  card: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  spacer: {
    flex: 1,
  },
});
