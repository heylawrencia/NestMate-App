import { ChatMessage } from '../types/chat';

const MOCK_NETWORK_DELAY_MS = 300;

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), MOCK_NETWORK_DELAY_MS));
}

const threads = new Map<string, ChatMessage[]>();
let nextMessageId = 1;

export async function fetchMessages(threadId: string): Promise<ChatMessage[]> {
  return delay([...(threads.get(threadId) ?? [])]);
}

export async function sendMessage(threadId: string, text: string): Promise<ChatMessage> {
  const trimmed = text.trim();
  const message: ChatMessage = {
    id: `msg-${nextMessageId++}`,
    senderId: 'me',
    text: trimmed,
    sentAt: Date.now(),
  };
  threads.set(threadId, [...(threads.get(threadId) ?? []), message]);
  return delay(message);
}
