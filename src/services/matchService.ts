import { apiClient, ApiError } from './apiClient';
import { Match, PaywallQuota } from '../types/match';

export async function fetchMatches(limit?: number): Promise<Match[]> {
  const query = limit ? `?limit=${limit}` : '';
  return apiClient.get<Match[]>(`/api/matches${query}`);
}

export function isPaywallError(err: unknown): boolean {
  return err instanceof ApiError && err.status === 402;
}

export function parsePaywallQuota(err: unknown): PaywallQuota {
  if (err instanceof ApiError && err.status === 402) {
    const data = (err as any).data;
    if (data && typeof data.used === 'number') {
      return {
        used: data.used,
        limit: data.limit ?? 5,
        resetsOn: data.resetsOn,
      };
    }
  }
  return {
    used: 5,
    limit: 5,
    resetsOn: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  };
}

export async function blockUser(blockedId: number): Promise<void> {
  await apiClient.post(`/api/moderation/block/${blockedId}`);
}

export async function reportUser(
  reportedId: number,
  reason: string,
  details?: string
): Promise<void> {
  await apiClient.post('/api/moderation/report', {
    reportedId,
    reason,
    details,
  });
}
