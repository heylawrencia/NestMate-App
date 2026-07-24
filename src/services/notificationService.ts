import { NotificationItem } from '../types/notification';
import { fetchConversations } from './chatService';
import { fetchHousingStatus } from './userService';

/**
 * REAL notifications, derived from data that actually exists in the backend -
 * no notification event log/service exists, so rather than invent one this
 * builds the feed live from real sources each time it's fetched:
 *   - "message": one entry per chat conversation with unread messages
 *   - "allocation": one entry if the student has a confirmed room
 *
 * KNOWN GAP: "match"/"group"/"announcement" notifications from the old mock
 * have no backend concept to derive from (matching has no persisted "match"
 * record, there's no group-chat model, no announcements feature) - they're
 * dropped rather than faked. Revisit if those features grow real backends.
 */

// Session-local "dismissed" set so Mark All Read has a visible effect even
// though there's no real per-notification read state to persist server-side
// (a message's true unread state already lives in chat-service and clears
// itself the moment the student opens that thread).
const dismissed = new Set<string>();

function formatRelativeTime(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(ms / 60_000);
  if (minutes < 1) return 'now';
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

export async function fetchNotifications(): Promise<NotificationItem[]> {
  const items: NotificationItem[] = [];

  try {
    const conversations = await fetchConversations();
    for (const c of conversations) {
      if (c.unreadCount <= 0) continue;
      // Keyed on lastMessageAt too, so a dismissed conversation still
      // resurfaces once a genuinely new message arrives.
      const id = `message-${c.otherUserId}-${c.lastMessageAt}`;
      if (dismissed.has(id)) continue;
      items.push({
        id,
        type: 'message',
        title: `${c.otherUserName} sent you a message`,
        description: c.lastMessage,
        relativeTime: formatRelativeTime(c.lastMessageAt),
        read: false,
      });
    }
  } catch (e) {
    console.warn('fetchNotifications: conversations failed', e);
  }

  try {
    const housing = await fetchHousingStatus();
    if (housing.hasRoom && !dismissed.has('allocation')) {
      items.push({
        id: 'allocation',
        type: 'allocation',
        title: `Room allocated - Room ${housing.roomNumber ?? '?'}`,
        description: housing.hostelName ?? '',
        relativeTime: '',
        read: true,
      });
    }
  } catch (e) {
    console.warn('fetchNotifications: housing failed', e);
  }

  return items;
}

export async function markAllNotificationsRead(): Promise<void> {
  const items = await fetchNotifications();
  items.forEach((item) => dismissed.add(item.id));
}
