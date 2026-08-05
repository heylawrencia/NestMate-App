/**
 * EditPreferencesScreen — Housing Preferences Editor (Spec §9.1 & Item 18)
 *
 * Fields: Smoker, Smoker OK, Has Pets, Pets OK, Seeking Type.
 * Fits within one screen of scroll.
 */

import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import AppButton from '../components/AppButton';
import AsyncBoundary from '../components/AsyncBoundary';
import Skeleton from '../components/Skeleton';
import { useAsyncData } from '../hooks/useAsyncData';
import { RootStackParamList } from '../navigation/types';
import { fetchMyProfile, updateProfile } from '../services/profileService';
import { colors, radius, space, type } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'EditPreferences'>;

export default function EditPreferencesScreen({ navigation }: Props) {
  const [smoker, setSmoker] = useState(false);
  const [smokerOk, setSmokerOk] = useState(false);
  const [hasPets, setHasPets] = useState(false);
  const [petsOk, setPetsOk] = useState(true);
  const [seekingType, setSeekingType] = useState('SEEKING_ROOM');

  const [saving, setSaving] = useState(false);

  const {
    loading,
    error,
    reload,
  } = useAsyncData(async () => {
    const p = await fetchMyProfile();
    if (p) {
      setSmoker(p.smoker ?? false);
      setSmokerOk(p.smokerOk ?? false);
      setHasPets(p.hasPets ?? false);
      setPetsOk(p.petsOk ?? true);
      setSeekingType(p.seekingType ?? 'SEEKING_ROOM');
    }
    return p;
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({
        smoker,
        smokerOk,
        hasPets,
        petsOk,
        seekingType,
      });
      setSaving(false);
      navigation.goBack();
    } catch (e: any) {
      setSaving(false);
      Alert.alert('Save Failed', e?.message || 'Could not update preferences.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Housing Preferences</Text>
      </View>

      <AsyncBoundary loading={loading} error={error} onRetry={reload}>
        {loading ? (
          <View style={styles.skeletonContainer}>
            <Skeleton variant="card" height={100} />
            <Skeleton variant="card" height={120} />
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Seeking Type */}
            <Text style={styles.fieldLabel}>My Housing Intent</Text>
            <View style={styles.chipRow}>
              {[
                { value: 'SEEKING_ROOM', label: 'Seeking a Room 🔍' },
                { value: 'OFFERING_ROOM', label: 'Offering a Room 🔑' },
              ].map((st) => (
                <TouchableOpacity
                  key={st.value}
                  style={[styles.chip, seekingType === st.value && styles.chipSelected]}
                  onPress={() => setSeekingType(st.value)}
                >
                  <Text style={[styles.chipText, seekingType === st.value && styles.chipTextSelected]}>
                    {st.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Switches */}
            <View style={styles.switchGroup}>
              <View style={styles.switchRow}>
                <View style={styles.switchTextCol}>
                  <Text style={styles.switchTitle}>Do you smoke?</Text>
                  <Text style={styles.switchSubtitle}>Cigarettes or tobacco products</Text>
                </View>
                <Switch value={smoker} onValueChange={setSmoker} trackColor={{ true: colors.primary }} />
              </View>

              <View style={styles.switchRow}>
                <View style={styles.switchTextCol}>
                  <Text style={styles.switchTitle}>OK living with smokers?</Text>
                  <Text style={styles.switchSubtitle}>Accept roommates who smoke</Text>
                </View>
                <Switch value={smokerOk} onValueChange={setSmokerOk} trackColor={{ true: colors.primary }} />
              </View>

              <View style={styles.switchRow}>
                <View style={styles.switchTextCol}>
                  <Text style={styles.switchTitle}>Do you have pets?</Text>
                  <Text style={styles.switchSubtitle}>Dogs, cats, or small animals</Text>
                </View>
                <Switch value={hasPets} onValueChange={setHasPets} trackColor={{ true: colors.primary }} />
              </View>

              <View style={styles.switchRow}>
                <View style={styles.switchTextCol}>
                  <Text style={styles.switchTitle}>OK living with pets?</Text>
                  <Text style={styles.switchSubtitle}>Accept roommates with pets</Text>
                </View>
                <Switch value={petsOk} onValueChange={setPetsOk} trackColor={{ true: colors.primary }} />
              </View>
            </View>
          </ScrollView>
        )}
      </AsyncBoundary>

      <View style={styles.footerBar}>
        <AppButton
          title="Save Preferences"
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
  switchGroup: {
    marginTop: space.sm,
    gap: space.md,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: space.xs,
  },
  switchTextCol: {
    flex: 1,
    marginRight: space.md,
  },
  switchTitle: {
    fontFamily: type.body.fontFamily,
    fontSize: 14,
    color: colors.ink,
    fontWeight: '600',
  },
  switchSubtitle: {
    fontFamily: type.caption.fontFamily,
    fontSize: 12,
    color: colors.inkMuted,
  },
  footerBar: {
    padding: space.lg,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    backgroundColor: colors.surface,
  },
});
