export interface ChatMessage {
  id: string;
  senderId: string;
  senderName?: string;
  text: string;
  sentAt: number;
}

export interface ConversationSummary {
  otherUserId: number;
  otherUserName: string;
  lastMessage: string;
  lastMessageSenderId: number;
  lastMessageAt: string;
  unreadCount: number;
}
