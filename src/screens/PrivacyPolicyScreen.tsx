/**
 * PrivacyPolicyScreen — Privacy Policy Legal Screen (Spec §10.2)
 *
 * Renders all 7 Privacy Policy sections from src/constants/legal.ts (works offline).
 * Sticky section index, "Last updated" line, type.body at 15/22.
 */

import React, { useRef, useState } from 'react';
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

import { LAST_UPDATED_DATE, PRIVACY_POLICY_SECTIONS } from '../constants/legal';
import { RootStackParamList } from '../navigation/types';
import { colors, radius, space, type } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'PrivacyPolicy'>;

export default function PrivacyPolicyScreen({ navigation }: Props) {
  const [activeSectionId, setActiveSectionId] = useState<string>('collection');
  const scrollViewRef = useRef<ScrollView>(null);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.ink} />
        </TouchableOpacity>
        <View style={styles.headerTextCol}>
          <Text style={styles.headerTitle}>Privacy Policy</Text>
          <Text style={styles.lastUpdatedText}>Last updated: {LAST_UPDATED_DATE}</Text>
        </View>
      </View>

      {/* Sticky Section Index Chips */}
      <View style={styles.stickyIndexContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.stickyIndexContent}>
          {PRIVACY_POLICY_SECTIONS.map((section, idx) => (
            <TouchableOpacity
              key={section.id}
              style={[
                styles.indexChip,
                activeSectionId === section.id && styles.indexChipSelected,
              ]}
              onPress={() => setActiveSectionId(section.id)}
            >
              <Text
                style={[
                  styles.indexChipText,
                  activeSectionId === section.id && styles.indexChipTextSelected,
                ]}
              >
                §{idx + 1} {section.title.split('.')[1]?.trim() ?? section.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Main Legal Body */}
      <ScrollView ref={scrollViewRef} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {PRIVACY_POLICY_SECTIONS.map((section) => (
          <View key={section.id} style={styles.sectionBlock}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionBody}>{section.content}</Text>
          </View>
        ))}
      </ScrollView>
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
  headerTextCol: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: type.h2.fontFamily,
    fontSize: type.h2.fontSize,
    color: colors.ink,
    fontWeight: '700',
  },
  lastUpdatedText: {
    fontFamily: type.micro.fontFamily,
    fontSize: 11,
    color: colors.inkMuted,
  },
  stickyIndexContainer: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    paddingVertical: space.xs,
  },
  stickyIndexContent: {
    paddingHorizontal: space.lg,
    gap: space.xs,
  },
  indexChip: {
    paddingHorizontal: space.sm + 2,
    paddingVertical: space.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.line,
  },
  indexChipSelected: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  indexChipText: {
    fontFamily: type.caption.fontFamily,
    fontSize: 12,
    color: colors.inkMuted,
  },
  indexChipTextSelected: {
    fontFamily: type.bodyStrong.fontFamily,
    color: colors.primary,
    fontWeight: '600',
  },
  scrollContent: {
    padding: space.lg,
    gap: space.xl,
  },
  sectionBlock: {
    gap: space.xs,
  },
  sectionTitle: {
    fontFamily: type.h2.fontFamily,
    fontSize: 16,
    color: colors.ink,
    fontWeight: '700',
  },
  sectionBody: {
    fontFamily: type.body.fontFamily,
    fontSize: 15,
    color: colors.ink,
    lineHeight: 22,
  },
});
