import { ChatMessage } from '../types/chat';

export type ChatListItem =
  | { type: 'divider'; key: string; label: string }
  | { type: 'message'; key: string; message: ChatMessage };

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function formatMessageTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export function formatDayLabel(timestamp: number): string {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (isSameDay(date, today)) return 'Today';
  if (isSameDay(date, yesterday)) return 'Yesterday';
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

/** Inserts a day-divider item whenever the calendar day changes between messages. */
export function buildChatListItems(messages: ChatMessage[]): ChatListItem[] {
  const items: ChatListItem[] = [];
  let lastLabel: string | null = null;

  for (const message of messages) {
    const label = formatDayLabel(message.sentAt);
    if (label !== lastLabel) {
      items.push({ type: 'divider', key: `divider-${message.id}`, label });
      lastLabel = label;
    }
    items.push({ type: 'message', key: message.id, message });
  }

  return items;
}

/** "Ama", "Ama and Nana", "Ama, Nana and Kojo" */
export function joinWithAnd(names: string[]): string {
  if (names.length === 0) return '';
  if (names.length === 1) return names[0];
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}
