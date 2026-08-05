/**
 * InterestPickerScreen — Tappable Chip Cloud Interest Selector (Spec §8.4 & Task 5)
 *
 * 40 interests from GET /api/interests, grouped into 6 categories with emoji,
 * laid out as a TAPPABLE CHIP CLOUD (not a checkbox list).
 * Selected chips fill in colors.primaryLight.
 * Live counter "Pick at least 3" (e.g. 3 selected).
 * Saves via PUT /api/profiles/me/interests. Reached from ProfileCompletenessCard & EditProfile.
 */

import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import AppButton from '../components/AppButton';
import AsyncBoundary from '../components/AsyncBoundary';
import Skeleton from '../components/Skeleton';
import { useAsyncData } from '../hooks/useAsyncData';
import { RootStackParamList } from '../navigation/types';
import { fetchInterests, fetchProfile, InterestItem, updateMyInterests } from '../services/profileService';
import { colors, radius, space, type } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'InterestPicker'>;

interface GroupedCategory {
  category: string;
  emoji: string;
  items: InterestItem[];
}

export default function InterestPickerScreen({ navigation }: Props) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);

  const {
    data: allInterests,
    loading: interestsLoading,
    error: interestsError,
    reload,
  } = useAsyncData(async () => {
    const list = await fetchInterests();
    // Also load user's existing profile to pre-select their interests if any
    try {
      const myProfile = await fetchProfile();
      if ((myProfile as any).interests) {
        const ids = (myProfile as any).interests.map((i: any) => i.id);
        setSelectedIds(ids);
      }
    } catch {
      // ignore
    }
    return list;
  }, []);

  // Group interests into categories
  const categoryMap = new Map<string, GroupedCategory>();
  (allInterests ?? []).forEach((item) => {
    const key = item.category || 'General';
    if (!categoryMap.has(key)) {
      categoryMap.set(key, {
        category: key,
        emoji: item.emoji || '✨',
        items: [],
      });
    }
    categoryMap.get(key)!.items.push(item);
  });

  const categories = Array.from(categoryMap.values());

  const toggleInterest = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateMyInterests(selectedIds);
      setSaving(false);
      navigation.goBack();
    } catch (e) {
      setSaving(false);
      navigation.goBack();
    }
  };

  const count = selectedIds.length;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.ink} />
        </TouchableOpacity>
        <View style={styles.headerTextCol}>
          <Text style={styles.headerTitle}>Pick Your Interests</Text>
          <Text style={styles.headerSubtitle}>
            {count >= 3 ? `${count} selected` : `Pick at least 3 (${count}/3)`}
          </Text>
        </View>
      </View>

      <AsyncBoundary loading={interestsLoading} error={interestsError} onRetry={reload}>
        {interestsLoading ? (
          <View style={styles.skeletonContainer}>
            <Skeleton variant="card" height={100} />
            <Skeleton variant="card" height={140} />
            <Skeleton variant="card" height={120} />
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {categories.map((cat) => (
              <View key={cat.category} style={styles.categorySection}>
                <Text style={styles.categoryTitle}>
                  {cat.emoji} {cat.category}
                </Text>

                {/* TAPPABLE CHIP CLOUD */}
                <View style={styles.chipCloud}>
                  {cat.items.map((item) => {
                    const isSelected = selectedIds.includes(item.id);
                    return (
                      <TouchableOpacity
                        key={item.id}
                        style={[styles.chip, isSelected && styles.chipSelected]}
                        onPress={() => toggleInterest(item.id)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.chipEmoji}>{item.emoji}</Text>
                        <Text style={[styles.chipLabel, isSelected && styles.chipLabelSelected]}>
                          {item.label}
                        </Text>
                        {isSelected && (
                          <Ionicons name="checkmark" size={14} color={colors.primary} style={styles.checkIcon} />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ))}
          </ScrollView>
        )}
      </AsyncBoundary>

      {/* Footer Save Button */}
      <View style={styles.footerBar}>
        <AppButton
          title={count >= 3 ? `Save ${count} Interests` : `Pick ${3 - count} more`}
          variant="primary"
          size="lg"
          disabled={count < 3}
          loading={saving}
          onPress={handleSave}
        />
      </View>
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
  headerSubtitle: {
    fontFamily: type.caption.fontFamily,
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  skeletonContainer: {
    padding: space.lg,
    gap: space.md,
  },
  scrollContent: {
    padding: space.lg,
    paddingBottom: space.xxl,
  },
  categorySection: {
    marginBottom: space.xl,
  },
  categoryTitle: {
    fontFamily: type.h3.fontFamily,
    fontSize: type.h3.fontSize,
    color: colors.ink,
    fontWeight: '600',
    marginBottom: space.sm,
  },
  chipCloud: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.xs,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderWidth: 1,
    paddingHorizontal: space.md,
    paddingVertical: space.xs + 2,
    borderRadius: radius.pill,
    gap: 6,
  },
  chipSelected: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  chipEmoji: {
    fontSize: 14,
  },
  chipLabel: {
    fontFamily: type.caption.fontFamily,
    fontSize: 13,
    color: colors.ink,
  },
  chipLabelSelected: {
    fontFamily: type.bodyStrong.fontFamily,
    color: colors.primary,
    fontWeight: '600',
  },
  checkIcon: {
    marginLeft: 2,
  },
  footerBar: {
    padding: space.lg,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    backgroundColor: colors.surface,
  },
});
