import { api, ApiError } from './apiClient';

/**
 * REAL implementation - calls the NESTMATE backend's manager endpoints.
 * Seeded demo managers (password: password123):
 *   evandy.manager@seed.nestmate.com · unity.manager@seed.nestmate.com
 *   court.manager@seed.nestmate.com
 */

export interface ManagedHostel {
  id: number;
  name: string;
  area: string;
  city: string;
}

export interface PendingHold {
  holdId: number;
  bedId: number;
  roomLabel: string;
  hostelName: string;
  amount: number;
  expiresAt: string;
  studentUserId: number;
  studentName: string;
}

export interface CommissionRecordRow {
  commissionRecordId: number;
  hostelId: number;
  bookingAmountGHS: number;
  commissionAmountGHS: number;
  createdAt: string;
  dueAt: string | null;
  overdue: boolean;
}

export interface CommissionLedger {
  managerId: number;
  suspended: boolean;
  owedGHS: number;
  overdueGHS: number;
  overdueCount: number;
  records: CommissionRecordRow[];
}

export async function fetchMyHostels(): Promise<ManagedHostel[]> {
  const hostels = await api<{ id: number; name: string; area: string; city: string }[]>(
    '/api/manager/hostels',
  );
  return hostels;
}

export async function fetchPendingHolds(): Promise<PendingHold[]> {
  return api<PendingHold[]>('/api/manager/holds/pending');
}

export async function generateCode(
  holdId: number,
): Promise<{ success: boolean; code?: string; expiresAt?: string; errorMessage?: string }> {
  try {
    const res = await api<{ code: string; expiresAt: string }>(
      `/api/manager/holds/${holdId}/generate-code`,
      { method: 'POST' },
    );
    return { success: true, code: res.code, expiresAt: res.expiresAt };
  } catch (e) {
    const message = e instanceof ApiError ? e.message : 'Could not generate a code.';
    return { success: false, errorMessage: message };
  }
}

export async function fetchCommission(): Promise<CommissionLedger> {
  return api<CommissionLedger>('/api/manager/commission');
}

export async function settleCommission(): Promise<{
  success: boolean;
  settledAmountGHS?: number;
  settledCount?: number;
  reinstated?: boolean;
  errorMessage?: string;
}> {
  try {
    const res = await api<{ settledAmountGHS: number; settledCount: number; reinstated: boolean }>(
      '/api/manager/commission/settle',
      { method: 'POST' },
    );
    return { success: true, ...res };
  } catch (e) {
    const message = e instanceof ApiError ? e.message : 'Could not settle the ledger.';
    return { success: false, errorMessage: message };
  }
}
