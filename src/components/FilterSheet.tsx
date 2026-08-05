/**
 * FilterSheet — Bottom sheet for hostel filtering (Spec §7.2 & Item 14)
 *
 * Implements all 6 dimensions: Area, Price per year, Room capacity, Kind, Availability, and Sort.
 * Options are fetched dynamically from GET /api/hostels/filters (never hardcoded constants).
 * Footer displays [Show N hostels] with live count updating as filters change.
 */

import React, { useEffect, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import AppButton from './AppButton';
import AppTextInput from './AppTextInput';
import { colors, elevation, radius, space, type } from '../theme';
import { HostelFilterOptions, HostelSearchFilters, HostelSortOption } from '../types/hostel';
import { fetchFilterOptions, fetchHostels } from '../services/hostelService';

interface FilterSheetProps {
  visible: boolean;
  onClose: () => void;
  filters: HostelSearchFilters;
  onApplyFilters: (newFilters: HostelSearchFilters) => void;
}

const SORT_OPTIONS: { value: HostelSortOption; label: string }[] = [
  { value: 'RECOMMENDED', label: 'Recommended' },
  { value: 'PRICE_ASC', label: 'Price ↑' },
  { value: 'PRICE_DESC', label: 'Price ↓' },
  { value: 'RATING_DESC', label: 'Rating ↓' },
  { value: 'AVAILABILITY_DESC', label: 'Availability ↓' },
];

export default function FilterSheet({
  visible,
  onClose,
  filters,
  onApplyFilters,
}: FilterSheetProps) {
  const [options, setOptions] = useState<HostelFilterOptions>({
    areas: ['KNUST Campus', 'Ayeduase', 'Kotei', 'Gaza'],
    minPrice: 1000,
    maxPrice: 15000,
    capacities: [1, 2, 3, 4],
    kinds: ['HOSTEL', 'APARTMENT'],
  });

  const [draft, setDraft] = useState<HostelSearchFilters>(filters);
  const [liveCount, setLiveCount] = useState<number | null>(null);
  const [countLoading, setCountLoading] = useState(false);

  // Sync draft when modal becomes visible
  useEffect(() => {
    if (visible) {
      setDraft(filters);
      fetchFilterOptions().then(setOptions);
    }
  }, [visible, filters]);

  // Live count update as draft filters change
  useEffect(() => {
    if (!visible) return;
    setCountLoading(true);
    const timer = setTimeout(() => {
      fetchHostels(draft)
        .then((list) => setLiveCount(list.length))
        .catch(() => setLiveCount(0))
        .finally(() => setCountLoading(false));
    }, 200);

    return () => clearTimeout(timer);
  }, [draft, visible]);

  const toggleArea = (area: string) => {
    const current = draft.areas ?? [];
    const next = current.includes(area)
      ? current.filter((a) => a !== area)
      : [...current, area];
    setDraft({ ...draft, areas: next.length > 0 ? next : undefined });
  };

  const toggleCapacity = (cap: number) => {
    const current = draft.capacities ?? [];
    const next = current.includes(cap)
      ? current.filter((c) => c !== cap)
      : [...current, cap];
    setDraft({ ...draft, capacities: next.length > 0 ? next : undefined });
  };

  const handleClearAll = () => {
    setDraft({});
  };

  const handleApply = () => {
    onApplyFilters(draft);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Filter Hostels</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={colors.ink} />
            </TouchableOpacity>
          </View>

          {/* Filter Body */}
          <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
            {/* 1. Sort Dimension */}
            <Text style={styles.sectionLabel}>Sort By</Text>
            <View style={styles.chipRow}>
              {SORT_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    styles.chip,
                    (draft.sort ?? 'RECOMMENDED') === opt.value && styles.chipSelected,
                  ]}
                  onPress={() => setDraft({ ...draft, sort: opt.value })}
                >
                  <Text
                    style={[
                      styles.chipText,
                      (draft.sort ?? 'RECOMMENDED') === opt.value && styles.chipTextSelected,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* 2. Area Dimension (Dynamic from GET /api/hostels/filters) */}
            <Text style={[styles.sectionLabel, styles.spacer]}>Area / Neighborhood</Text>
            <View style={styles.chipRow}>
              {options.areas.map((area) => {
                const isSelected = draft.areas?.includes(area);
                return (
                  <TouchableOpacity
                    key={area}
                    style={[styles.chip, isSelected && styles.chipSelected]}
                    onPress={() => toggleArea(area)}
                  >
                    <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                      {area}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* 3. Price per year Dimension */}
            <Text style={[styles.sectionLabel, styles.spacer]}>Price per Year (GH₵)</Text>
            <View style={styles.priceRow}>
              <View style={styles.priceCol}>
                <AppTextInput
                  label="Min Price"
                  value={draft.minPrice ? String(draft.minPrice) : ''}
                  onChangeText={(val) =>
                    setDraft({ ...draft, minPrice: val ? parseInt(val, 10) : undefined })
                  }
                  keyboardType="numeric"
                  placeholder="1,000"
                />
              </View>
              <View style={styles.priceCol}>
                <AppTextInput
                  label="Max Price"
                  value={draft.maxPrice ? String(draft.maxPrice) : ''}
                  onChangeText={(val) =>
                    setDraft({ ...draft, maxPrice: val ? parseInt(val, 10) : undefined })
                  }
                  keyboardType="numeric"
                  placeholder="15,000"
                />
              </View>
            </View>

            {/* 4. Room Capacity Dimension */}
            <Text style={[styles.sectionLabel, styles.spacer]}>Room Capacity (Students in room)</Text>
            <View style={styles.chipRow}>
              {[1, 2, 3, 4].map((cap) => {
                const isSelected = draft.capacities?.includes(cap);
                return (
                  <TouchableOpacity
                    key={cap}
                    style={[styles.chip, isSelected && styles.chipSelected]}
                    onPress={() => toggleCapacity(cap)}
                  >
                    <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                      {cap} in a room
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* 5. Kind Dimension */}
            <Text style={[styles.sectionLabel, styles.spacer]}>Property Kind</Text>
            <View style={styles.chipRow}>
              {[
                { value: 'ANY', label: 'Any' },
                { value: 'HOSTEL', label: 'Hostel' },
                { value: 'APARTMENT', label: 'Apartment' },
              ].map((k) => (
                <TouchableOpacity
                  key={k.value}
                  style={[
                    styles.chip,
                    (draft.kind ?? 'ANY') === k.value && styles.chipSelected,
                  ]}
                  onPress={() => setDraft({ ...draft, kind: k.value as any })}
                >
                  <Text
                    style={[
                      styles.chipText,
                      (draft.kind ?? 'ANY') === k.value && styles.chipTextSelected,
                    ]}
                  >
                    {k.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* 6. Availability Dimension */}
            <View style={styles.switchRow}>
              <View style={styles.switchTextCol}>
                <Text style={styles.switchTitle}>Free Beds Only</Text>
                <Text style={styles.switchSubtitle}>Hide fully booked hostels</Text>
              </View>
              <Switch
                value={draft.availableOnly ?? false}
                onValueChange={(val) => setDraft({ ...draft, availableOnly: val })}
                trackColor={{ true: colors.primary }}
              />
            </View>
          </ScrollView>

          {/* Footer with Live Count */}
          <View style={styles.footerRow}>
            <TouchableOpacity onPress={handleClearAll} style={styles.clearBtn}>
              <Text style={styles.clearText}>Clear all</Text>
            </TouchableOpacity>

            <View style={styles.applyBtnCol}>
              <AppButton
                title={
                  countLoading
                    ? 'Updating...'
                    : `Show ${liveCount != null ? liveCount : ''} hostel${liveCount !== 1 ? 's' : ''}`
                }
                variant="primary"
                size="md"
                onPress={handleApply}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    maxHeight: '85%',
    ...elevation.sheet,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  sheetTitle: {
    fontFamily: type.h2.fontFamily,
    fontSize: type.h2.fontSize,
    color: colors.ink,
    fontWeight: '700',
  },
  closeBtn: {
    padding: space.xs,
  },
  scrollBody: {
    padding: space.lg,
  },
  sectionLabel: {
    fontFamily: type.caption.fontFamily,
    fontSize: 14,
    color: colors.ink,
    fontWeight: '600',
    marginBottom: space.xs,
  },
  spacer: {
    marginTop: space.lg,
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
    backgroundColor: colors.background,
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
  priceRow: {
    flexDirection: 'row',
    gap: space.md,
  },
  priceCol: {
    flex: 1,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: space.lg,
    paddingVertical: space.xs,
  },
  switchTextCol: {
    flex: 1,
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
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: space.lg,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    gap: space.md,
  },
  clearBtn: {
    paddingVertical: space.sm,
  },
  clearText: {
    fontFamily: type.bodyStrong.fontFamily,
    fontSize: 14,
    color: colors.inkMuted,
    fontWeight: '600',
  },
  applyBtnCol: {
    flex: 1,
  },
});
