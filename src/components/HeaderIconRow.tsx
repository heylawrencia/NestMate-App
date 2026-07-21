import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing } from '../theme';

interface HeaderIconRowProps {
  onMenuPress: () => void;
  onNotificationsPress?: () => void;
  onBack?: () => void;
}

const HIT_SLOP = { top: 8, bottom: 8, left: 8, right: 8 };

export default function HeaderIconRow({ onMenuPress, onNotificationsPress, onBack }: HeaderIconRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.leftGroup}>
        {onBack ? (
          <TouchableOpacity
            onPress={onBack}
            hitSlop={HIT_SLOP}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <Ionicons name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity
          onPress={onMenuPress}
          hitSlop={HIT_SLOP}
          accessibilityLabel="Menu"
          accessibilityRole="button"
        >
          <Ionicons name="menu" size={26} color={colors.white} />
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        onPress={onNotificationsPress}
        hitSlop={HIT_SLOP}
        accessibilityLabel="Notifications"
        accessibilityRole="button"
      >
        <Ionicons name="notifications-outline" size={24} color={colors.white} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
});
