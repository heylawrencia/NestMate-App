/**
 * EditLifestyleScreen — Lifestyle Profile Editor (Spec §9.1 & Item 18)
 *
 * Fields: Sleep schedule, Cleanliness, Noise tolerance, Social level, Budget range.
 * Fits within one screen of scroll.
 */

import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import AppButton from '../components/AppButton';
import AppTextInput from '../components/AppTextInput';
import AsyncBoundary from '../components/AsyncBoundary';
import Skeleton from '../components/Skeleton';
import { useAsyncData } from '../hooks/useAsyncData';
import { RootStackParamList } from '../navigation/types';
import { fetchMyProfile, updateProfile } from '../services/profileService';
import { colors, radius, space, type } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'EditLifestyle'>;

const SLEEP_OPTIONS = [
  { value: 'EARLY_BIRD', label: 'Early Bird 🌅' },
  { value: 'FLEXIBLE', label: 'Flexible ⚖️' },
  { value: 'NIGHT_OWL', label: 'Night Owl 🌙' },
];

export default function EditLifestyleScreen({ navigation }: Props) {
  const [sleepSchedule, setSleepSchedule] = useState('NIGHT_OWL');
  const [cleanliness, setCleanliness] = useState(4);
  const [noiseTolerance, setNoiseTolerance] = useState(3);
  const [socialLevel, setSocialLevel] = useState(3);
  const [budgetMin, setBudgetMin] = useState('2000');
  const [budgetMax, setBudgetMax] = useState('8000');

  const [saving, setSaving] = useState(false);

  const {
    loading,
    error,
    reload,
  } = useAsyncData(async () => {
    const p = await fetchMyProfile();
    if (p) {
      if (p.sleepSchedule) {
        if (p.sleepSchedule.includes('Early')) setSleepSchedule('EARLY_BIRD');
        else if (p.sleepSchedule.includes('Night')) setSleepSchedule('NIGHT_OWL');
        else setSleepSchedule('FLEXIBLE');
      }
      if (p.cleanliness) setCleanliness(4);
      if (p.noiseTolerance) setNoiseTolerance(p.noiseTolerance);
      if (p.socialLevel) setSocialLevel(p.socialLevel);
      if (p.budgetMin) setBudgetMin(String(p.budgetMin));
      if (p.budgetMax) setBudgetMax(String(p.budgetMax));
    }
    return p;
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({
        sleepSchedule,
        cleanliness,
        noiseTolerance,
        socialLevel,
        budgetMin: budgetMin ? parseInt(budgetMin, 10) : 2000,
        budgetMax: budgetMax ? parseInt(budgetMax, 10) : 8000,
      });
      setSaving(false);
      navigation.goBack();
    } catch (e: any) {
      setSaving(false);
      Alert.alert('Save Failed', e?.message || 'Could not update lifestyle settings.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Lifestyle Fit</Text>
      </View>

      <AsyncBoundary loading={loading} error={error} onRetry={reload}>
        {loading ? (
          <View style={styles.skeletonContainer}>
            <Skeleton variant="card" height={120} />
            <Skeleton variant="card" height={160} />
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Sleep Schedule */}
            <Text style={styles.fieldLabel}>Sleep Schedule</Text>
            <View style={styles.chipRow}>
              {SLEEP_OPTIONS.map((s) => (
                <TouchableOpacity
                  key={s.value}
                  style={[styles.chip, sleepSchedule === s.value && styles.chipSelected]}
                  onPress={() => setSleepSchedule(s.value)}
                >
                  <Text style={[styles.chipText, sleepSchedule === s.value && styles.chipTextSelected]}>
                    {s.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Cleanliness Level */}
            <Text style={styles.fieldLabel}>Cleanliness Level: {cleanliness}/5</Text>
            <View style={styles.chipRow}>
              {[1, 2, 3, 4, 5].map((lvl) => (
                <TouchableOpacity
                  key={lvl}
                  style={[styles.numChip, cleanliness === lvl && styles.chipSelected]}
                  onPress={() => setCleanliness(lvl)}
                >
                  <Text style={[styles.chipText, cleanliness === lvl && styles.chipTextSelected]}>
                    {lvl}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Noise Level */}
            <Text style={styles.fieldLabel}>Noise Tolerance: {noiseTolerance}/5</Text>
            <View style={styles.chipRow}>
              {[1, 2, 3, 4, 5].map((lvl) => (
                <TouchableOpacity
                  key={lvl}
                  style={[styles.numChip, noiseTolerance === lvl && styles.chipSelected]}
                  onPress={() => setNoiseTolerance(lvl)}
                >
                  <Text style={[styles.chipText, noiseTolerance === lvl && styles.chipTextSelected]}>
                    {lvl}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Social Energy */}
            <Text style={styles.fieldLabel}>Social Energy: {socialLevel}/5</Text>
            <View style={styles.chipRow}>
              {[1, 2, 3, 4, 5].map((lvl) => (
                <TouchableOpacity
                  key={lvl}
                  style={[styles.numChip, socialLevel === lvl && styles.chipSelected]}
                  onPress={() => setSocialLevel(lvl)}
                >
                  <Text style={[styles.chipText, socialLevel === lvl && styles.chipTextSelected]}>
                    {lvl}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Budget Range */}
            <Text style={styles.fieldLabel}>Annual Budget Range (GH₵)</Text>
            <View style={styles.priceRow}>
              <View style={styles.priceCol}>
                <AppTextInput
                  label="Min Budget"
                  value={budgetMin}
                  onChangeText={setBudgetMin}
                  keyboardType="numeric"
                  placeholder="2,000"
                />
              </View>
              <View style={styles.priceCol}>
                <AppTextInput
                  label="Max Budget"
                  value={budgetMax}
                  onChangeText={setBudgetMax}
                  keyboardType="numeric"
                  placeholder="8,000"
                />
              </View>
            </View>
          </ScrollView>
        )}
      </AsyncBoundary>

      <View style={styles.footerBar}>
        <AppButton
          title="Save Lifestyle Fit"
          variant="primary"
          size="lg"
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
  headerTitle: {
    fontFamily: type.h2.fontFamily,
    fontSize: type.h2.fontSize,
    color: colors.ink,
    fontWeight: '700',
  },
  skeletonContainer: {
    padding: space.lg,
    gap: space.md,
  },
  scrollContent: {
    padding: space.lg,
    gap: space.md,
  },
  fieldLabel: {
    fontFamily: type.caption.fontFamily,
    fontSize: 14,
    color: colors.ink,
    fontWeight: '600',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.xs,
  },
  chip: {
    paddingHorizontal: space.md,
    paddingVertical: space.xs + 2,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
  },
  numChip: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipSelected: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  chipText: {
    fontFamily: type.caption.fontFamily,
    fontSize: 13,
    color: colors.inkMuted,
  },
  chipTextSelected: {
    fontFamily: type.bodyStrong.fontFamily,
    color: colors.primary,
    fontWeight: '600',
  },
  priceRow: {
    flexDirection: 'row',
    gap: space.md,
  },
  priceCol: {
    flex: 1,
  },
  footerBar: {
    padding: space.lg,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    backgroundColor: colors.surface,
  },
});
