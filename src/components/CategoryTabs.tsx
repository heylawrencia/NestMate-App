import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radius, space, type } from '../theme';

export interface CategoryOption {
  id: string;
  label: string;
}

interface CategoryTabsProps {
  categories: CategoryOption[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export default function CategoryTabs({ categories, selectedId, onSelect }: CategoryTabsProps) {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {categories.map((cat) => {
          const isSelected = cat.id === selectedId;
          return (
            <TouchableOpacity
              key={cat.id}
              onPress={() => onSelect(cat.id)}
              activeOpacity={0.8}
              style={[
                styles.tabPill,
                isSelected ? styles.tabPillActive : styles.tabPillInactive,
              ]}
            >
              <Text style={[styles.tabText, isSelected ? styles.tabTextActive : styles.tabTextInactive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: space.sm,
  },
  scrollContent: {
    paddingHorizontal: space.lg,
    gap: space.sm,
  },
  tabPill: {
    paddingHorizontal: space.md + 2,
    paddingVertical: space.xs + 4,
    borderRadius: radius.pill,
  },
  tabPillActive: {
    backgroundColor: colors.primary,
  },
  tabPillInactive: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
  },
  tabText: {
    fontFamily: type.caption.fontFamily,
    fontSize: 13,
    fontWeight: '600',
  },
  tabTextActive: {
    color: colors.white,
  },
  tabTextInactive: {
    color: colors.inkMuted,
  },
});
