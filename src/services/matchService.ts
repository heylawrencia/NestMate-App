import { apiClient, ApiError } from './apiClient';
import { Match } from '../types/match';

export async function fetchMatches(limit?: number): Promise<Match[]> {
  const query = limit ? `?limit=${limit}` : '';
  return apiClient.get<Match[]>(`/api/matches${query}`);
}

export function isPaywallError(err: unknown): boolean {
  return err instanceof ApiError && err.status === 402;
}
