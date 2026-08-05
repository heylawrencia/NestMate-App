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
import { colors, radius, space, type } from '../theme';
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
    if (!text || sending) return;
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
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>{item.label}</Text>
          <View style={styles.dividerLine} />
        </View>
      );
    }

    const isMine = item.message.senderId === 'me';
    return (
      <View style={[styles.bubbleRow, isMine && styles.bubbleRowMine]}>
        <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleTheirs]}>
          <Text style={[styles.bubbleText, isMine && styles.bubbleTextMine]}>
            {item.message.text}
          </Text>
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

  const matchPct = match?.matchPercent;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ── Header ─────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={HIT_SLOP}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.headerIdentity}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('MatchProfile', { matchId })}
        >
          <IconCircle size={38} backgroundColor={'rgba(255,255,255,0.2)'}>
            <Text style={styles.avatarInitial}>{displayName.charAt(0).toUpperCase()}</Text>
          </IconCircle>
          <View>
            <Text style={styles.headerName} numberOfLines={1}>
              {displayName}
            </Text>
            {matchPct != null ? (
              <Text style={styles.headerSubtitle}>✨ {matchPct}% match</Text>
            ) : null}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('MatchProfile', { matchId })}
          hitSlop={HIT_SLOP}
          accessibilityLabel="View profile"
          accessibilityRole="button"
        >
          <Ionicons name="information-circle-outline" size={24} color="rgba(255,255,255,0.8)" />
        </TouchableOpacity>
      </View>

      {/* ── Messages ───────────────────────────────── */}
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
            <IconCircle size={60} backgroundColor={colors.primaryLight}>
              <Ionicons name="chatbubble-ellipses-outline" size={30} color={colors.primary} />
            </IconCircle>
            <Text style={styles.emptyTitle}>No messages yet</Text>
            <Text style={styles.emptyDescription}>
              {firstName
                ? `Say hello to ${firstName} to start the conversation.`
                : 'Say hello to start the conversation.'}
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
  // ── Header ─────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingHorizontal: space.lg,
    paddingVertical: space.sm + 2,
    backgroundColor: colors.primary,
  },
  headerIdentity: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
  avatarInitial: {
    fontFamily: type.h3.fontFamily,
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
  headerName: {
    fontFamily: type.bodyStrong.fontFamily,
    fontSize: 15,
    fontWeight: '700',
    color: colors.white,
  },
  headerSubtitle: {
    fontFamily: type.micro.fontFamily,
    fontSize: 12,
    color: colors.mint,
    fontWeight: '600',
  },
  // ── Messages ───────────────────────────────────────
  messagesContent: {
    flexGrow: 1,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    marginVertical: space.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.line,
  },
  dividerText: {
    fontFamily: type.micro.fontFamily,
    fontSize: 11,
    color: colors.inkFaint,
    letterSpacing: 0.3,
  },
  bubbleRow: {
    marginBottom: space.md,
    maxWidth: '78%',
    alignSelf: 'flex-start',
  },
  bubbleRowMine: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  bubble: {
    borderRadius: radius.lg,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
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
    fontFamily: type.body.fontFamily,
    fontSize: 15,
    lineHeight: 21,
    color: colors.ink,
  },
  bubbleTextMine: {
    color: colors.white,
  },
  bubbleTime: {
    fontFamily: type.micro.fontFamily,
    fontSize: 11,
    color: colors.inkFaint,
    marginTop: 2,
  },
  bubbleTimeMine: {
    textAlign: 'right',
  },
  // ── Empty State ────────────────────────────────────
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.xl,
    gap: space.sm,
  },
  emptyTitle: {
    fontFamily: type.h3.fontFamily,
    fontSize: type.h3.fontSize,
    fontWeight: '600',
    color: colors.ink,
  },
  emptyDescription: {
    fontFamily: type.caption.fontFamily,
    fontSize: 13,
    color: colors.inkMuted,
    textAlign: 'center',
    lineHeight: 19,
  },
});
