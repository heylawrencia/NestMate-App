import { apiClient } from './apiClient';
import { ChatMessage, ConversationSummary } from '../types/chat';

export interface BackendMessage {
  id: number;
  conversationKey: string;
  senderId: number;
  recipientId: number;
  content: string;
  sentAt: string;
  readAt: string | null;
}

export function mapBackendMessage(message: BackendMessage): ChatMessage {
  return {
    id: String(message.id),
    senderId: String(message.senderId),
    text: message.content,
    sentAt: new Date(message.sentAt).getTime(),
  };
}

export async function fetchConversations(): Promise<ConversationSummary[]> {
  return apiClient.get<ConversationSummary[]>('/api/chat/conversations');
}

export async function fetchConversationMessages(otherUserId: number): Promise<ChatMessage[]> {
  const messages = await apiClient.get<BackendMessage[]>(
    `/api/chat/conversations/${otherUserId}/messages`,
  );
  return messages.map(mapBackendMessage);
}

export async function sendConversationMessage(
  recipientId: number,
  content: string,
): Promise<ChatMessage> {
  const message = await apiClient.post<BackendMessage>('/api/chat/messages', {
    recipientId,
    content,
  });
  return mapBackendMessage(message);
}
