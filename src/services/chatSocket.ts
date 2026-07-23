import { Client, IMessage } from '@stomp/stompjs';

import { getApiBaseUrl } from './apiClient';
import { BackendMessage, mapBackendMessage } from './conversationService';
import { ChatMessage } from '../types/chat';

function toWebSocketUrl(): string {
  // The backend's SockJS endpoint (/ws) also serves a raw WebSocket transport at
  // /ws/websocket - connecting directly there avoids needing sockjs-client, whose
  // XHR-streaming fallbacks don't work well in React Native.
  return `${getApiBaseUrl().replace(/^http/, 'ws')}/ws/websocket`;
}

/**
 * Opens a STOMP connection and subscribes to a single conversation's topic.
 * Call `.deactivate()` on the returned client when the screen unmounts.
 */
export function subscribeToConversation(
  token: string,
  conversationKey: string,
  onMessage: (message: ChatMessage) => void,
): Client {
  const client = new Client({
    brokerURL: toWebSocketUrl(),
    connectHeaders: { Authorization: `Bearer ${token}` },
    reconnectDelay: 4000,
    onConnect: () => {
      client.subscribe(`/topic/chat.${conversationKey}`, (frame: IMessage) => {
        try {
          onMessage(mapBackendMessage(JSON.parse(frame.body) as BackendMessage));
        } catch {
          // Malformed frame - ignore rather than crash the chat screen.
        }
      });
    },
  });
  client.activate();
  return client;
}
