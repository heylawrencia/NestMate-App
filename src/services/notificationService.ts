import { apiClient } from './apiClient';
import { NotificationItem, NotificationType } from '../types/notification';

interface BackendNotification {
  id: number;
  type: 'MESSAGE' | 'ALLOCATION' | 'GROUP' | 'ANNOUNCEMENT';
  title: string;
  description: string | null;
  read: boolean;
  createdAt: string;
}

const TYPE_MAP: Record<BackendNotification['type'], NotificationType> = {
  MESSAGE: 'message',
  ALLOCATION: 'allocation',
  GROUP: 'group',
  ANNOUNCEMENT: 'announcement',
};

function formatRelativeTime(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(ms / 60_000);
  if (minutes < 1) return 'now';
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

function toItem(n: BackendNotification): NotificationItem {
  return {
    id: String(n.id),
    type: TYPE_MAP[n.type],
    title: n.title,
    description: n.description ?? '',
    relativeTime: formatRelativeTime(n.createdAt),
    read: n.read,
  };
}

export async function fetchNotifications(): Promise<NotificationItem[]> {
  const list = await apiClient.get<BackendNotification[]>('/api/notifications');
  return list.map(toItem);
}

export async function markAllNotificationsRead(): Promise<void> {
  await apiClient.post('/api/notifications/read-all');
}

export async function markNotificationRead(id: string): Promise<void> {
  try {
    await apiClient.post(`/api/notifications/${id}/read`);
  } catch (e) {
    // ignore
  }
}
