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
import { colors, spacing, typography, space, radius, type } from '../theme';
import { MainTabParamList, RootStackParamList } from '../navigation/types';
import { useDrawer } from '../context/DrawerContext';
import { useAsyncData } from '../hooks/useAsyncData';
import { ConversationSummary, fetchConversations } from '../services/chatService';
import { formatMessageTime } from '../utils/chatFormatting';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Chat'>,
  NativeStackScreenProps<RootStackParamList>
>;

import AppTextInput from '../components/AppTextInput';

export default function ChatScreen({ navigation }: Props) {
  const { openDrawer } = useDrawer();
  const { data: conversations, reload } = useAsyncData(fetchConversations, []);
  const [searchQuery, setSearchQuery] = React.useState('');

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  const filteredConversations = (conversations ?? []).filter((c) =>
    c.otherUserName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const unreadTotal = (conversations ?? []).reduce((acc, curr) => acc + (curr.unreadCount > 0 ? 1 : 0), 0);

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
        <IconCircle size={48} backgroundColor={colors.primaryLight}>
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
            {item.unreadCount > 0 ? (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>{item.unreadCount}</Text>
              </View>
            ) : null}
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerContainer}>
        <View style={styles.titleRow}>
          <Text style={styles.headerTitle}>Messages</Text>
          {unreadTotal > 0 && (
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>{unreadTotal} New</Text>
            </View>
          )}
        </View>

        <AppTextInput
          label=""
          placeholder="🔍 Search for messages or roommates..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {filteredConversations.length > 0 ? (
        <FlatList
          data={filteredConversations}
          keyExtractor={(item) => String(item.otherUserId)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <EmptyState
          icon="chatbubble-outline"
          title="No conversations found"
          description="Once you match with a roommate, you'll be able to chat here."
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  headerTitle: {
    fontFamily: type.h1.fontFamily,
    fontSize: 24,
    fontWeight: '800',
    color: colors.ink,
  },
  newBadge: {
    backgroundColor: colors.mintLight,
    paddingHorizontal: space.md,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  newBadgeText: {
    fontFamily: type.caption.fontFamily,
    fontSize: 12,
    fontWeight: '700',
    color: colors.mintDark,
  },
  listContent: {
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingVertical: space.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  avatarInitial: {
    fontSize: 18,
    fontWeight: '700',
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
    fontSize: 15,
    fontWeight: '700',
    color: colors.ink,
    flexShrink: 1,
  },
  time: {
    fontSize: 12,
    color: colors.inkMuted,
  },
  rowFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  preview: {
    fontSize: 14,
    color: colors.inkMuted,
    flex: 1,
    marginRight: space.xs,
  },
  unreadBadge: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadBadgeText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
});
