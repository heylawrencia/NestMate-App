import React, { useCallback } from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CompositeScreenProps, useFocusEffect } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import EmptyState from '../components/EmptyState';
import GradientHeader from '../components/GradientHeader';
import HeaderIconRow from '../components/HeaderIconRow';
import IconCircle from '../components/IconCircle';
import Badge from '../components/Badge';
import { colors, spacing, typography } from '../theme';
import { MainTabParamList, RootStackParamList } from '../navigation/types';
import { useDrawer } from '../context/DrawerContext';
import { useAsyncData } from '../hooks/useAsyncData';
import { ConversationSummary, fetchConversations } from '../services/chatService';
import { formatMessageTime } from '../utils/chatFormatting';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Chat'>,
  NativeStackScreenProps<RootStackParamList>
>;

export default function ChatScreen({ navigation }: Props) {
  const { openDrawer } = useDrawer();
  const { data: conversations, reload } = useAsyncData(fetchConversations, []);

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
            name: item.otherUserName,
          })
        }
      >
        <IconCircle size={44} backgroundColor={colors.primaryLight}>
          <Text style={styles.avatarInitial}>{item.otherUserName.charAt(0).toUpperCase()}</Text>
        </IconCircle>
        <View style={styles.rowText}>
          <View style={styles.rowHeader}>
            <Text style={styles.name} numberOfLines={1}>
              {item.otherUserName}
            </Text>
            <Text style={styles.time}>{formatMessageTime(new Date(item.lastMessageAt).getTime())}</Text>
          </View>
          <View style={styles.rowFooter}>
            <Text style={styles.preview} numberOfLines={1}>
              {item.lastMessage}
            </Text>
            {item.unreadCount > 0 ? <Badge label={String(item.unreadCount)} tone="success" /> : null}
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <GradientHeader>
        <HeaderIconRow
          onMenuPress={openDrawer}
          onNotificationsPress={() => navigation.navigate('Notifications')}
        />
        <Text style={styles.header}>Chat</Text>
      </GradientHeader>
      {conversations && conversations.length > 0 ? (
        <FlatList
          data={conversations}
          keyExtractor={(item) => String(item.otherUserId)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <EmptyState
          icon="chatbubble-outline"
          title="No conversations yet"
          description="Once you match with a roommate, you'll be able to chat here."
        />
      )}
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  avatarInitial: {
    fontSize: typography.body,
    fontWeight: typography.weightBold,
    color: colors.primary,
  },
  rowText: {
    flex: 1,
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: typography.body,
    fontWeight: typography.weightBold,
    color: colors.text,
    flexShrink: 1,
  },
  time: {
    fontSize: typography.caption,
    color: colors.textMuted,
  },
  rowFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  preview: {
    fontSize: typography.caption,
    color: colors.textMuted,
    flex: 1,
    marginRight: spacing.sm,
  },
});
