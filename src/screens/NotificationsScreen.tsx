import React, { useCallback } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import AsyncBoundary from '../components/AsyncBoundary';
import ElevatedCard from '../components/ElevatedCard';
import EmptyState from '../components/EmptyState';
import IconCircle from '../components/IconCircle';
import ScreenHeader from '../components/ScreenHeader';
import { colors, spacing, typography } from '../theme';
import { RootStackParamList } from '../navigation/types';
import { useAsyncData } from '../hooks/useAsyncData';
import { fetchNotifications, markAllNotificationsRead } from '../services/notificationService';
import { NotificationItem, NotificationType } from '../types/notification';

type Props = NativeStackScreenProps<RootStackParamList, 'Notifications'>;

const TYPE_STYLES: Record<
  NotificationType,
  { icon: React.ComponentProps<typeof Ionicons>['name']; iconColor: string; iconBg: string }
> = {
  allocation: { icon: 'home', iconColor: colors.success, iconBg: colors.white },
  match: { icon: 'heart', iconColor: colors.primary, iconBg: colors.primaryLight },
  group: { icon: 'people', iconColor: colors.primary, iconBg: colors.primaryLight },
  message: { icon: 'chatbubble-ellipses', iconColor: colors.textMuted, iconBg: colors.surface },
  announcement: { icon: 'megaphone', iconColor: '#B8722A', iconBg: '#FCEEDC' },
};

export default function NotificationsScreen({ navigation }: Props) {
  const { data: notifications, loading, error, reload } = useAsyncData(fetchNotifications, []);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  const unreadCount = notifications?.filter((item) => !item.read).length ?? 0;

  async function handleMarkAllRead() {
    await markAllNotificationsRead();
    reload();
  }

  function renderItem(item: NotificationItem, index: number, all: NotificationItem[]) {
    const typeStyle = TYPE_STYLES[item.type];
    const isHighlighted = item.type === 'allocation';
    const isLast = index === all.length - 1;

    return (
      <View
        key={item.id}
        style={[styles.row, isHighlighted && styles.rowHighlighted, !isLast && styles.rowDivider]}
      >
        <IconCircle size={40} backgroundColor={typeStyle.iconBg}>
          <Ionicons name={typeStyle.icon} size={18} color={typeStyle.iconColor} />
        </IconCircle>
        <View style={styles.rowTextGroup}>
          <Text style={styles.rowTitle}>{item.title}</Text>
          <Text style={styles.rowDescription}>{item.description}</Text>
        </View>
        <View style={styles.rowMeta}>
          <Text style={styles.rowTime}>{item.relativeTime}</Text>
          {!item.read ? <View style={styles.unreadDot} /> : null}
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader
        title="Notifications"
        onBack={() => navigation.goBack()}
        rightAction={
          unreadCount > 0 ? { label: 'Mark all read', onPress: handleMarkAllRead } : undefined
        }
      />

      <AsyncBoundary loading={loading} error={error} onRetry={reload}>
        {notifications && notifications.length > 0 ? (
          <ScrollView showsVerticalScrollIndicator={false}>
            <ElevatedCard style={styles.card}>{notifications.map(renderItem)}</ElevatedCard>
          </ScrollView>
        ) : (
          <EmptyState
            icon="notifications-off-outline"
            title="Nothing yet"
            description="New messages and your room allocation will appear here"
          />
        )}
      </AsyncBoundary>
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
    padding: spacing.sm,
    marginBottom: spacing.xl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: 14,
  },
  rowHighlighted: {
    backgroundColor: '#E3F5EE',
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowTextGroup: {
    flex: 1,
  },
  rowTitle: {
    fontSize: typography.body,
    fontWeight: typography.weightBold,
    color: colors.text,
    marginBottom: 2,
  },
  rowDescription: {
    fontSize: typography.caption,
    color: colors.textMuted,
  },
  rowMeta: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  rowTime: {
    fontSize: typography.caption,
    color: colors.textMuted,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
});
