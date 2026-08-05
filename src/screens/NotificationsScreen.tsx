import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import AsyncBoundary from '../components/AsyncBoundary';
import ElevatedCard from '../components/ElevatedCard';
import EmptyState from '../components/EmptyState';
import IconCircle from '../components/IconCircle';
import { colors, radius, space, type } from '../theme';
import { RootStackParamList } from '../navigation/types';
import { useAsyncData } from '../hooks/useAsyncData';
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../services/notificationService';
import { fetchConversations } from '../services/chatService';
import { NotificationItem, NotificationType } from '../types/notification';

type Props = NativeStackScreenProps<RootStackParamList, 'Notifications'>;

const TYPE_STYLES: Record<
  NotificationType,
  { icon: React.ComponentProps<typeof Ionicons>['name']; iconColor: string; iconBg: string }
> = {
  allocation: { icon: 'home',               iconColor: colors.mintDark,  iconBg: colors.mintLight },
  match:       { icon: 'heart',              iconColor: colors.primary,   iconBg: colors.primaryLight },
  group:       { icon: 'people',             iconColor: colors.primary,   iconBg: colors.primaryLight },
  message:     { icon: 'chatbubble-ellipses',iconColor: colors.inkMuted,  iconBg: colors.line },
  announcement:{ icon: 'megaphone',          iconColor: '#B8722A',        iconBg: '#FCEEDC' },
};

export default function NotificationsScreen({ navigation }: Props) {
  const { data: notificationsData, loading, error, reload } = useAsyncData(fetchNotifications, []);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  const visibleNotifications = (notificationsData ?? []).filter(
    (item) => !item.read && !dismissedIds.includes(item.id),
  );

  const unreadCount = visibleNotifications.length;

  async function handleMarkAllRead() {
    await markAllNotificationsRead();
    if (notificationsData) {
      setDismissedIds(notificationsData.map((i) => i.id));
    }
    reload();
  }

  const handlePressItem = async (item: NotificationItem) => {
    setDismissedIds((prev) => [...prev, item.id]);
    markNotificationRead(item.id);

    if (item.type === 'message') {
      let matchId = '1';
      let name = item.title;
      try {
        const conversations = await fetchConversations();
        const conv =
          conversations.find(
            (c) =>
              c.otherUserName.toLowerCase().includes(item.title.toLowerCase()) ||
              item.title.toLowerCase().includes(c.otherUserName.toLowerCase()),
          ) ?? conversations[0];
        if (conv) {
          matchId = String(conv.otherUserId);
          name = conv.otherUserName;
        }
      } catch (e) {
        // fallback
      }
      (navigation as any).navigate('IndividualChat', { matchId, name });
    } else if (item.type === 'group') {
      (navigation as any).navigate('GroupChat', { hostelId: '1', roomTypeId: '1' });
    } else if (item.type === 'allocation') {
      (navigation as any).navigate('HoldPending', { hostelId: '' });
    } else if (item.type === 'match') {
      (navigation as any).navigate('MatchProfile', { matchId: '1', otherUserName: item.title });
    } else {
      (navigation as any).navigate('HelpSupport');
    }
  };

  function renderItem(item: NotificationItem, index: number, all: NotificationItem[]) {
    const typeStyle = TYPE_STYLES[item.type];
    const isAllocation = item.type === 'allocation';
    const isLast = index === all.length - 1;

    return (
      <TouchableOpacity
        key={item.id}
        activeOpacity={0.75}
        style={[styles.row, isAllocation && styles.rowHighlighted, !isLast && styles.rowDivider]}
        onPress={() => handlePressItem(item)}
      >
        <IconCircle size={42} backgroundColor={typeStyle.iconBg}>
          <Ionicons name={typeStyle.icon} size={20} color={typeStyle.iconColor} />
        </IconCircle>

        <View style={styles.rowTextGroup}>
          <Text style={styles.rowTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.rowDescription} numberOfLines={2}>
            {item.description}
          </Text>
        </View>

        <View style={styles.rowMeta}>
          <Text style={styles.rowTime}>{item.relativeTime}</Text>
          {!item.read ? <View style={styles.unreadDot} /> : null}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Header Bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>

        <View style={styles.headerTitleRow}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.unreadCountBadge}>
              <Text style={styles.unreadCountText}>{unreadCount} new</Text>
            </View>
          )}
        </View>

        {unreadCount > 0 ? (
          <TouchableOpacity
            onPress={handleMarkAllRead}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.markAllText}>Clear all</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 56 }} />
        )}
      </View>

      {/* Content */}
      <AsyncBoundary loading={loading} error={error} onRetry={reload}>
        {visibleNotifications.length > 0 ? (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <ElevatedCard style={styles.card}>
              {visibleNotifications.map((item, idx, all) => renderItem(item, idx, all))}
            </ElevatedCard>
          </ScrollView>
        ) : (
          <EmptyState
            icon="notifications-off-outline"
            title="All caught up!"
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
    backgroundColor: colors.background,
  },
  // ── Header ──────────────────────────────────────────
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primary,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    gap: space.md,
  },
  headerTitleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
  headerTitle: {
    fontFamily: type.h2.fontFamily,
    fontSize: type.h2.fontSize,
    color: colors.white,
    fontWeight: '700',
  },
  unreadCountBadge: {
    backgroundColor: colors.mint,
    borderRadius: radius.pill,
    paddingHorizontal: space.sm,
    paddingVertical: 2,
  },
  unreadCountText: {
    fontFamily: type.micro.fontFamily,
    fontSize: 11,
    fontWeight: '700',
    color: colors.mintDark,
  },
  markAllText: {
    fontFamily: type.caption.fontFamily,
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '600',
  },
  // ── List ────────────────────────────────────────────
  scrollContent: {
    padding: space.lg,
    paddingBottom: space.xxl,
  },
  card: {
    borderRadius: radius.xl,
    padding: space.xs,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.md,
    paddingVertical: space.md,
    paddingHorizontal: space.md,
    borderRadius: radius.lg,
  },
  rowHighlighted: {
    backgroundColor: colors.mintLight,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  rowTextGroup: {
    flex: 1,
  },
  rowTitle: {
    fontFamily: type.bodyStrong.fontFamily,
    fontSize: 14,
    fontWeight: '600',
    color: colors.ink,
    marginBottom: 2,
  },
  rowDescription: {
    fontFamily: type.caption.fontFamily,
    fontSize: 13,
    color: colors.inkMuted,
    lineHeight: 18,
  },
  rowMeta: {
    alignItems: 'flex-end',
    gap: space.xs,
  },
  rowTime: {
    fontFamily: type.micro.fontFamily,
    fontSize: 11,
    color: colors.inkFaint,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.mint,
  },
});
