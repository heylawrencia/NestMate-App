import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import ChatComposer from '../components/ChatComposer';
import IconCircle from '../components/IconCircle';
import { colors, spacing, typography } from '../theme';
import { RootStackParamList } from '../navigation/types';
import { useAuth } from '../context/AuthContext';
import { useAsyncData } from '../hooks/useAsyncData';
import { fetchConversationMessages, sendConversationMessage } from '../services/conversationService';
import { subscribeToConversation } from '../services/chatSocket';
import { ChatMessage } from '../types/chat';
import { ChatListItem, buildChatListItems, formatMessageTime } from '../utils/chatFormatting';

type Props = NativeStackScreenProps<RootStackParamList, 'IndividualChat'>;

const HIT_SLOP = { top: 8, bottom: 8, left: 8, right: 8 };

export default function IndividualChatScreen({ navigation, route }: Props) {
  const { matchId, otherUserName } = route.params;
  const otherUserId = Number(matchId);
  const { userId, token } = useAuth();
  const { data: messages, reload: reloadMessages } = useAsyncData(
    () => fetchConversationMessages(otherUserId),
    [otherUserId],
  );
  const [liveMessages, setLiveMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);

  useFocusEffect(
    useCallback(() => {
      reloadMessages();
    }, [reloadMessages]),
  );

  function appendMessage(message: ChatMessage) {
    setLiveMessages((prev) => (prev.some((m) => m.id === message.id) ? prev : [...prev, message]));
  }

  useEffect(() => {
    if (!token || !userId) {
      return;
    }
    const conversationKey = [userId, otherUserId].sort((a, b) => a - b).join('-');
    const client = subscribeToConversation(token, conversationKey, appendMessage);
    return () => {
      client.deactivate();
    };
  }, [token, userId, otherUserId]);

  const allMessages = useMemo(() => {
    const byId = new Map<string, ChatMessage>();
    for (const message of messages ?? []) {
      byId.set(message.id, message);
    }
    for (const message of liveMessages) {
      byId.set(message.id, message);
    }
    return Array.from(byId.values()).sort((a, b) => a.sentAt - b.sentAt);
  }, [messages, liveMessages]);

  async function handleSend() {
    const text = draft.trim();
    if (!text || sending) {
      return;
    }
    setSending(true);
    setDraft('');
    const message = await sendConversationMessage(otherUserId, text);
    appendMessage(message);
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

    const isMine = Number(item.message.senderId) === userId;
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

  const firstName = otherUserName?.split(' ')[0] ?? '';
  const listItems = buildChatListItems(allMessages);

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
            <Text style={styles.avatarInitial}>{(otherUserName ?? '?').charAt(0).toUpperCase()}</Text>
          </IconCircle>
          <View>
            <Text style={styles.headerName} numberOfLines={1}>
              {otherUserName ?? 'Roommate'}
            </Text>
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
