import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import ChatComposer from '../components/ChatComposer';
import IconCircle from '../components/IconCircle';
import { colors, spacing, typography } from '../theme';
import { RootStackParamList } from '../navigation/types';
import { useAsyncData } from '../hooks/useAsyncData';
import { fetchMatchById } from '../services/roommateService';
import { ChatMessage } from '../types/chat';
import { fetchThreadMessages, sendThreadMessage, subscribeToThread } from '../services/chatService';
import { ChatListItem, buildChatListItems, formatMessageTime } from '../utils/chatFormatting';

type Props = NativeStackScreenProps<RootStackParamList, 'IndividualChat'>;

const HIT_SLOP = { top: 8, bottom: 8, left: 8, right: 8 };

function mergeMessage(list: ChatMessage[], incoming: ChatMessage): ChatMessage[] {
  if (list.some((m) => m.id === incoming.id)) return list;
  return [...list, incoming].sort((a, b) => a.sentAt - b.sentAt);
}

export default function IndividualChatScreen({ navigation, route }: Props) {
  const { matchId, name } = route.params;
  const { data: match } = useAsyncData(() => fetchMatchById(matchId), [matchId]);
  const { data: initialMessages, reload: reloadMessages } = useAsyncData(
    () => fetchThreadMessages(matchId),
    [matchId],
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (initialMessages) setMessages(initialMessages);
  }, [initialMessages]);

  useFocusEffect(
    useCallback(() => {
      reloadMessages();
    }, [reloadMessages]),
  );

  useEffect(() => {
    return subscribeToThread(matchId, (message) => {
      setMessages((prev) => mergeMessage(prev, message));
    });
  }, [matchId]);

  async function handleSend() {
    const text = draft.trim();
    if (!text || sending) {
      return;
    }
    setSending(true);
    setDraft('');
    const sent = await sendThreadMessage(matchId, text);
    setMessages((prev) => mergeMessage(prev, sent));
    setSending(false);
  }

  function renderItem({ item }: { item: ChatListItem }) {
    if (item.type === 'divider') {
      return (
        <View style={styles.dividerRow}>
          <Text style={styles.dividerText}>{item.label}</Text>
        </View>
      );
    }

    const isMine = item.message.senderId === 'me';
    return (
      <View style={[styles.bubbleRow, isMine && styles.bubbleRowMine]}>
        <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleTheirs]}>
          <Text style={[styles.bubbleText, isMine && styles.bubbleTextMine]}>{item.message.text}</Text>
        </View>
        <Text style={[styles.bubbleTime, isMine && styles.bubbleTimeMine]}>
          {formatMessageTime(item.message.sentAt)}
        </Text>
      </View>
    );
  }

  const displayName = match?.name ?? name ?? 'Roommate';
  const firstName = displayName.split(' ')[0] ?? '';
  const listItems = buildChatListItems(messages);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={HIT_SLOP}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.headerIdentity}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('MatchProfile', { matchId })}
        >
          <IconCircle size={36} backgroundColor={colors.primaryLight}>
            <Text style={styles.avatarInitial}>{displayName.charAt(0).toUpperCase()}</Text>
          </IconCircle>
          <View>
            <Text style={styles.headerName} numberOfLines={1}>
              {displayName}
            </Text>
            {match?.matchPercent != null ? (
              <Text style={styles.headerSubtitle}>{match.matchPercent}% match</Text>
            ) : null}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('MatchProfile', { matchId })}
          hitSlop={HIT_SLOP}
          accessibilityLabel="View profile"
          accessibilityRole="button"
        >
          <Ionicons name="information-circle-outline" size={24} color={colors.textMuted} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {listItems.length > 0 ? (
          <FlatList
            data={listItems}
            keyExtractor={(item) => item.key}
            renderItem={renderItem}
            contentContainerStyle={styles.messagesContent}
          />
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="chatbubble-ellipses-outline" size={32} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>No messages yet</Text>
            <Text style={styles.emptyDescription}>
              {firstName ? `Say hello to ${firstName} to start the conversation.` : 'Say hello to start the conversation.'}
            </Text>
          </View>
        )}

        <ChatComposer
          value={draft}
          onChangeText={setDraft}
          onSend={handleSend}
          sending={sending}
          placeholder={firstName ? `Message ${firstName}...` : 'Message...'}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  headerIdentity: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  avatarInitial: {
    fontSize: typography.body,
    fontWeight: typography.weightBold,
    color: colors.primary,
  },
  headerName: {
    fontSize: typography.body,
    fontWeight: typography.weightBold,
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: typography.caption,
    color: colors.success,
    fontWeight: typography.weightMedium,
  },
  messagesContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  dividerRow: {
    alignItems: 'center',
    marginVertical: spacing.sm,
  },
  dividerText: {
    fontSize: typography.caption,
    color: colors.textMuted,
  },
  bubbleRow: {
    marginBottom: spacing.md,
    maxWidth: '78%',
    alignSelf: 'flex-start',
  },
  bubbleRowMine: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  bubble: {
    borderRadius: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  bubbleTheirs: {
    backgroundColor: colors.surface,
    borderBottomLeftRadius: 4,
  },
  bubbleMine: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleText: {
    fontSize: typography.body,
    color: colors.text,
  },
  bubbleTextMine: {
    color: colors.white,
  },
  bubbleTime: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  bubbleTimeMine: {
    textAlign: 'right',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    fontSize: typography.body,
    fontWeight: typography.weightBold,
    color: colors.text,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  emptyDescription: {
    fontSize: typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
