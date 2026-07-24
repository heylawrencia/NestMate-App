import { Client, IMessage } from '@stomp/stompjs';

import { ChatMessage } from '../types/chat';
import { api, getMyUserId, getToken, wsUrl } from './apiClient';

/**
 * REAL implementation for 1:1 roommate chat - calls the NESTMATE chat-service
 * via the gateway (REST for history/send, STOMP-over-WebSocket for live
 * delivery). `otherUserId` here is always the real backend user id (as a
 * string), e.g. the same id roommateService exposes as a match's `id`.
 *
 * chat-service has no concept of group/room chat (no Conversation entity,
 * nothing tying messages to a hostelId/roomTypeId) - GroupChatScreen keeps
 * using the mock functions below (fetchGroupMessages/sendGroupMessage) by
 * design, not as a placeholder for missing wiring.
 */

interface BackendMessage {
  id: number;
  conversationKey: string;
  senderId: number;
  recipientId: number;
  content: string;
  sentAt: string;
  readAt: string | null;
}

export interface ConversationSummary {
  otherUserId: number;
  otherUserName: string;
  lastMessage: string;
  lastMessageSenderId: number;
  lastMessageAt: string;
  unreadCount: number;
}

function toChatMessage(m: BackendMessage): ChatMessage {
  const myId = getMyUserId();
  return {
    id: String(m.id),
    senderId: myId != null && m.senderId === myId ? 'me' : String(m.senderId),
    text: m.content,
    sentAt: new Date(m.sentAt).getTime(),
  };
}

export async function fetchConversations(): Promise<ConversationSummary[]> {
  return api<ConversationSummary[]>('/api/chat/conversations');
}

/** Fetches a thread's full history and marks the other user's messages as read. */
export async function fetchThreadMessages(otherUserId: string): Promise<ChatMessage[]> {
  const messages = await api<BackendMessage[]>(`/api/chat/conversations/${otherUserId}/messages`);
  return messages.map(toChatMessage);
}

export async function sendThreadMessage(otherUserId: string, text: string): Promise<ChatMessage> {
  const message = await api<BackendMessage>('/api/chat/messages', {
    method: 'POST',
    body: { recipientId: Number(otherUserId), content: text.trim() },
  });
  return toChatMessage(message);
}

function conversationKey(otherUserId: string): string {
  const myId = getMyUserId();
  if (myId == null) return otherUserId;
  const other = Number(otherUserId);
  return `${Math.min(myId, other)}-${Math.max(myId, other)}`;
}

/**
 * Subscribes to live messages for a thread. Calls `onMessage` for every
 * message broadcast on the topic (including the current user's own sends -
 * callers should de-dupe by id against messages already shown). Returns an
 * unsubscribe function; safe to call even if the socket never connects.
 */
export function subscribeToThread(otherUserId: string, onMessage: (message: ChatMessage) => void): () => void {
  const token = getToken();
  if (!token) return () => {};

  const client = new Client({
    brokerURL: wsUrl('/ws/websocket'),
    connectHeaders: { Authorization: `Bearer ${token}` },
    reconnectDelay: 3000,
    onConnect: () => {
      client.subscribe(`/topic/chat.${conversationKey(otherUserId)}`, (frame: IMessage) => {
        try {
          onMessage(toChatMessage(JSON.parse(frame.body) as BackendMessage));
        } catch {
          // malformed frame - ignore
        }
      });
    },
  });
  client.activate();

  return () => {
    client.deactivate();
  };
}

// ---------------------------------------------------------------------------
// Mock implementation - used only by GroupChatScreen (see module doc above).
// ---------------------------------------------------------------------------

const MOCK_NETWORK_DELAY_MS = 300;

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), MOCK_NETWORK_DELAY_MS));
}

const mockThreads = new Map<string, ChatMessage[]>();
let nextMockMessageId = 1;

export async function fetchGroupMessages(threadId: string): Promise<ChatMessage[]> {
  return delay([...(mockThreads.get(threadId) ?? [])]);
}

export async function sendGroupMessage(threadId: string, text: string): Promise<ChatMessage> {
  const trimmed = text.trim();
  const message: ChatMessage = {
    id: `msg-${nextMockMessageId++}`,
    senderId: 'me',
    text: trimmed,
    sentAt: Date.now(),
  };
  mockThreads.set(threadId, [...(mockThreads.get(threadId) ?? []), message]);
  return delay(message);
}
