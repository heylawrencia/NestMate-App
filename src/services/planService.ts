import { apiClient } from './apiClient';

export interface PlanView {
  tier: 'FREE' | 'PREMIUM';
  premiumUntil: string | null;
  matchRequestsUsed: number;
  matchRequestsLimit: number | 'UNLIMITED';
  chargedGHS?: number;
  paymentStatus?: string;
}

export interface InitiateUpgradeResponse {
  authorizationUrl: string;
  reference: string;
  amountGHS: number;
}

export async function fetchPlan(): Promise<PlanView> {
  return apiClient.get<PlanView>('/api/plan/me');
}

export async function initiateUpgrade(months: number): Promise<InitiateUpgradeResponse> {
  return apiClient.post<InitiateUpgradeResponse>('/api/plan/upgrade/initiate', { months });
}

export async function verifyUpgrade(reference: string): Promise<PlanView> {
  return apiClient.get<PlanView>(`/api/plan/upgrade/verify/${encodeURIComponent(reference)}`);
}
