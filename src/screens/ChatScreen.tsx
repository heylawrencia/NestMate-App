import React, { useCallback } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CompositeScreenProps, useFocusEffect } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import AsyncBoundary from '../components/AsyncBoundary';
import Badge from '../components/Badge';
import EmptyState from '../components/EmptyState';
import GradientHeader from '../components/GradientHeader';
import HeaderIconRow from '../components/HeaderIconRow';
import IconCircle from '../components/IconCircle';
import { colors, spacing, typography } from '../theme';
import { MainTabParamList, RootStackParamList } from '../navigation/types';
import { useAsyncData } from '../hooks/useAsyncData';
import { fetchConversations } from '../services/conversationService';
import { ConversationSummary } from '../types/chat';
import { useDrawer } from '../context/DrawerContext';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Chat'>,
  NativeStackScreenProps<RootStackParamList>
>;

export default function ChatScreen({ navigation }: Props) {
  const { openDrawer } = useDrawer();
  const { data: conversations, loading, error, reload } = useAsyncData(fetchConversations, []);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  function renderItem({ item }: { item: ConversationSummary }) {
    return (
      <TouchableOpacity
        style={styles.row}
        activeOpacity={0.7}
        onPress={() =>
          navigation.navigate('IndividualChat', {
            matchId: String(item.otherUserId),
            otherUserName: item.otherUserName,
          })
        }
      >
        <IconCircle size={48} backgroundColor={colors.primaryLight}>
          <Text style={styles.avatarInitial}>{item.otherUserName.charAt(0).toUpperCase()}</Text>
        </IconCircle>
        <View style={styles.textGroup}>
          <Text style={styles.name} numberOfLines={1}>
            {item.otherUserName}
          </Text>
          <Text style={styles.preview} numberOfLines={1}>
            {item.lastMessage}
          </Text>
        </View>
        {item.unreadCount > 0 ? <Badge label={String(item.unreadCount)} tone="success" /> : null}
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
      <GradientHeader>
        <HeaderIconRow
          onMenuPress={openDrawer}
          onNotificationsPress={() => navigation.navigate('Notifications')}
        />
        <Text style={styles.header}>Chat</Text>
      </GradientHeader>

      <AsyncBoundary loading={loading} error={error} onRetry={reload}>
        <FlatList
          data={conversations ?? []}
          keyExtractor={(item) => String(item.otherUserId)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <EmptyState
              icon="chatbubble-outline"
              title="No conversations yet"
              description="Once you match with a roommate, you'll be able to chat here."
            />
          }
        />
      </AsyncBoundary>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surfaceTint,
  },
  header: {
    fontSize: typography.h1,
    fontWeight: typography.weightBold,
    color: colors.white,
  },
  listContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  avatarInitial: {
    fontSize: typography.body,
    fontWeight: typography.weightBold,
    color: colors.primary,
  },
  textGroup: {
    flex: 1,
  },
  name: {
    fontSize: typography.body,
    fontWeight: typography.weightBold,
    color: colors.text,
  },
  preview: {
    fontSize: typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
});
