import React, { useState } from 'react';
import { Linking, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import DetailRow from '../components/DetailRow';
import ElevatedCard from '../components/ElevatedCard';
import ScreenHeader from '../components/ScreenHeader';
import SearchInput from '../components/SearchInput';
import SectionLabel from '../components/SectionLabel';
import { colors, spacing, typography } from '../theme';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'HelpSupport'>;

const CATEGORIES = ['Account', 'Bookings', 'Payments', 'Safety'];
const EMERGENCY_NUMBER = '112';

export default function HelpSupportScreen({ navigation }: Props) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string | null>(null);

  function handleCallEmergency() {
    Linking.openURL(`tel:${EMERGENCY_NUMBER}`);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Health & Support" subtitle="Help, safety and wellbeing" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <SearchInput value={query} onChangeText={setQuery} placeholder="Search help articles" />

        <View style={styles.categoriesRow}>
          {CATEGORIES.map((item) => {
            const selected = category === item;
            return (
              <TouchableOpacity
                key={item}
                style={[styles.categoryPill, selected && styles.categoryPillSelected]}
                onPress={() => setCategory(selected ? null : item)}
                activeOpacity={0.7}
              >
                <Text style={[styles.categoryText, selected && styles.categoryTextSelected]}>{item}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <SectionLabel label="Get help" />
        <ElevatedCard style={styles.card}>
          <DetailRow
            icon="help-circle-outline"
            title="Help Center"
            subtitle="Browse FAQs and guides"
            onPress={() =>
              navigation.navigate('Placeholder', {
                title: 'Help Center',
                description: 'FAQs and guides will be available here soon.',
              })
            }
          />
          <DetailRow
            icon="chatbubbles-outline"
            title="Contact support"
            subtitle="Reply within a day"
            onPress={() =>
              navigation.navigate('Placeholder', {
                title: 'Contact support',
                description: 'In-app support replies will be available soon.',
              })
            }
          />
          <DetailRow
            icon="flag-outline"
            title="Report a problem"
            isLast
            onPress={() =>
              navigation.navigate('Placeholder', {
                title: 'Report a problem',
                description: 'Reporting a problem from the app will be available soon.',
              })
            }
          />
        </ElevatedCard>

        <ElevatedCard style={styles.emergencyCard}>
          <View style={styles.emergencyHeader}>
            <Ionicons name="medkit-outline" size={20} color="#B8722A" />
            <Text style={styles.emergencyTitle}>If you&apos;re in immediate danger</Text>
          </View>
          <Text style={styles.emergencyText}>
            Contact local emergency services right away. Ghana&apos;s national line is {EMERGENCY_NUMBER}.
          </Text>
          <TouchableOpacity onPress={handleCallEmergency} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.emergencyCall}>Call {EMERGENCY_NUMBER}</Text>
          </TouchableOpacity>
        </ElevatedCard>
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
  categoriesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  categoryPill: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.background,
  },
  categoryPillSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  categoryText: {
    fontSize: typography.caption,
    fontWeight: typography.weightMedium,
    color: colors.text,
  },
  categoryTextSelected: {
    color: colors.primary,
  },
  card: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  emergencyCard: {
    backgroundColor: '#FCEEDC',
    padding: spacing.md,
    marginBottom: spacing.xl,
  },
  emergencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  emergencyTitle: {
    fontSize: typography.body,
    fontWeight: typography.weightBold,
    color: '#8A5A20',
  },
  emergencyText: {
    fontSize: typography.caption,
    color: '#8A5A20',
    marginBottom: spacing.sm,
    lineHeight: 18,
  },
  emergencyCall: {
    fontSize: typography.body,
    fontWeight: typography.weightBold,
    color: colors.primary,
  },
});
