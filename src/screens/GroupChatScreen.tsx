import React, { useCallback, useState } from 'react';
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
import { colors, radius, space, type } from '../theme';
import { RootStackParamList } from '../navigation/types';
import { useAsyncData } from '../hooks/useAsyncData';
import { fetchHostelById, getRoomType } from '../services/hostelService';
import { fetchRoommateGroupMembers } from '../services/roommateService';
import { fetchGroupMessages, sendGroupMessage } from '../services/chatService';
import {
  ChatListItem,
  buildChatListItems,
  formatMessageTime,
  joinWithAnd,
} from '../utils/chatFormatting';

type Props = NativeStackScreenProps<RootStackParamList, 'GroupChat'>;

const HIT_SLOP = { top: 8, bottom: 8, left: 8, right: 8 };
const CLUSTER_TONES = [colors.primaryLight, colors.mintLight, '#FCEEDC'];

export default function GroupChatScreen({ navigation, route }: Props) {
  const { hostelId, roomTypeId } = route.params;
  const threadId = `${hostelId}:${roomTypeId}`;

  const { data: hostel } = useAsyncData(() => fetchHostelById(hostelId), [hostelId]);
  const roomType = hostel ? getRoomType(hostel, roomTypeId) : undefined;
  const { data: members } = useAsyncData(
    () => fetchRoommateGroupMembers(hostelId, roomTypeId),
    [hostelId, roomTypeId],
  );
  const { data: messages, reload: reloadMessages } = useAsyncData(
    () => fetchGroupMessages(threadId),
    [threadId],
  );
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);

  useFocusEffect(
    useCallback(() => {
      reloadMessages();
    }, [reloadMessages]),
  );

  async function handleSend() {
    const text = draft.trim();
    if (!text || sending) return;
    setSending(true);
    setDraft('');
    await sendGroupMessage(threadId, text);
    await reloadMessages();
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
        {!isMine && item.message.senderName ? (
          <Text style={styles.senderName}>{item.message.senderName}</Text>
        ) : null}
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

  const matchedMembers = members?.filter((member) => member.status === 'matched') ?? [];
  const totalCount = roomType ? roomType.capacity : matchedMembers.length + 1;
  const title = `${totalCount} Roomies`;
  const roomieNames = matchedMembers.map((member) => member.name.split(' ')[0]);
  const introText =
    roomieNames.length > 0 ? `You and ${joinWithAnd(roomieNames)} are now roomies 🎉` : null;

  const listItems: ChatListItem[] = introText
    ? [{ type: 'divider', key: 'intro', label: introText }, ...buildChatListItems(messages ?? [])]
    : buildChatListItems(messages ?? []);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
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
          onPress={() => navigation.goBack()}
        >
          {/* Overlapping avatar cluster */}
          <View style={styles.avatarCluster}>
            {matchedMembers.slice(0, 3).map((member, index) => (
              <View
                key={member.id}
                style={[styles.clusterAvatarWrap, index > 0 && styles.clusterAvatarOverlap]}
              >
                <IconCircle size={32} backgroundColor={CLUSTER_TONES[index % CLUSTER_TONES.length]}>
                  <Text style={styles.clusterInitial}>{member.name.charAt(0).toUpperCase()}</Text>
                </IconCircle>
              </View>
            ))}
            {matchedMembers.length === 0 && (
              <IconCircle size={32} backgroundColor={'rgba(255,255,255,0.2)'}>
                <Ionicons name="people" size={16} color={colors.white} />
              </IconCircle>
            )}
          </View>

          <View>
            <Text style={styles.headerName} numberOfLines={1}>
              {title}
            </Text>
            <Text style={styles.headerSubtitle}>{totalCount} members</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={HIT_SLOP}
          accessibilityLabel="View group"
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
        <FlatList
          data={listItems}
          keyExtractor={(item) => item.key}
          renderItem={renderItem}
          contentContainerStyle={styles.messagesContent}
        />

        <ChatComposer
          value={draft}
          onChangeText={setDraft}
          onSend={handleSend}
          sending={sending}
          placeholder="Message the group..."
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
  avatarCluster: {
    flexDirection: 'row',
  },
  clusterAvatarWrap: {
    borderRadius: 17,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  clusterAvatarOverlap: {
    marginLeft: -10,
  },
  clusterInitial: {
    fontFamily: type.micro.fontFamily,
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
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
    color: 'rgba(255,255,255,0.75)',
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
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  senderName: {
    fontFamily: type.micro.fontFamily,
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 2,
    marginLeft: space.xs,
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
});
