import React from 'react';
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import IconCircle from './IconCircle';
import { resolveMediaUrl } from '../services/apiClient';
import { colors, shadows, spacing, typography } from '../theme';

export interface DrawerMenuItem {
  key: string;
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  onPress: () => void;
  active?: boolean;
  badgeCount?: number;
}

interface HomeDrawerMenuProps {
  visible: boolean;
  onClose: () => void;
  name: string;
  avatarUri?: string;
  verified?: boolean;
  items: DrawerMenuItem[];
  onLogOut: () => void;
}

export default function HomeDrawerMenu({
  visible,
  onClose,
  name,
  avatarUri,
  verified,
  items,
  onLogOut,
}: HomeDrawerMenuProps) {
  const insets = useSafeAreaInsets();
  const initial = name.charAt(0).toUpperCase();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.root}>
        <View
          style={[
            styles.panel,
            { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.lg },
          ]}
        >
          <View style={styles.profileRow}>
            {avatarUri ? (
              <Image source={{ uri: resolveMediaUrl(avatarUri) }} style={styles.drawerAvatarImage} />
            ) : (
              <IconCircle size={48} backgroundColor={colors.primaryLight}>
                <Text style={styles.initial}>{initial}</Text>
              </IconCircle>
            )}
            <View style={styles.profileText}>
              <Text style={styles.name} numberOfLines={1}>
                {name}
              </Text>
              {verified ? (
                <View style={styles.verifiedRow}>
                  <Ionicons name="checkmark-circle" size={14} color={colors.success} />
                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              ) : null}
            </View>
          </View>

          <View style={styles.divider} />

          <ScrollView contentContainerStyle={styles.itemsList} showsVerticalScrollIndicator={false}>
            {items.map((item) => (
              <TouchableOpacity
                key={item.key}
                style={[styles.item, item.active && styles.itemActive]}
                onPress={item.onPress}
                activeOpacity={0.8}
              >
                <Ionicons name={item.icon} size={20} color={item.active ? colors.primary : colors.text} />
                <Text style={[styles.itemLabel, item.active && styles.itemLabelActive]}>{item.label}</Text>
                {item.badgeCount ? (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.badgeCount}</Text>
                  </View>
                ) : null}
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.logOutRow} onPress={onLogOut} activeOpacity={0.8}>
            <Ionicons name="log-out-outline" size={20} color={colors.error} />
            <Text style={styles.logOutText}>Log Out</Text>
          </TouchableOpacity>
        </View>

        <Pressable style={styles.scrim} onPress={onClose} />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: 'row',
  },
  panel: {
    width: '78%',
    maxWidth: 320,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    borderTopRightRadius: 24,
    borderBottomRightRadius: 24,
    ...shadows.lg,
  },
  scrim: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.5)',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  initial: {
    fontSize: typography.h2,
    fontWeight: typography.weightBold,
    color: colors.primary,
  },
  drawerAvatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  profileText: {
    flex: 1,
  },
  name: {
    fontSize: typography.body,
    fontWeight: typography.weightBold,
    color: colors.text,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  verifiedText: {
    fontSize: typography.caption,
    fontWeight: typography.weightMedium,
    color: colors.success,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: spacing.sm,
  },
  itemsList: {
    paddingVertical: spacing.xs,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.sm,
    borderRadius: 12,
    marginBottom: spacing.xs,
  },
  itemActive: {
    backgroundColor: colors.primaryLight,
  },
  itemLabel: {
    flex: 1,
    fontSize: typography.body,
    fontWeight: typography.weightMedium,
    color: colors.text,
  },
  itemLabelActive: {
    color: colors.primary,
    fontWeight: typography.weightBold,
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  badgeText: {
    fontSize: typography.caption,
    fontWeight: typography.weightBold,
    color: colors.white,
  },
  logOutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.sm,
  },
  logOutText: {
    fontSize: typography.body,
    fontWeight: typography.weightBold,
    color: colors.error,
  },
});
