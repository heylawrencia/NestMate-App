import { api, ApiError } from './apiClient';

/**
 * REAL implementation - calls booking-service's invite-code endpoints via the
 * gateway. An "invite" here is a shareable single-use code tied to a room
 * (not a targeted friend-request) - anyone who redeems it claims the room's
 * next free bed and gets a Hold, exactly like picking a room manually.
 */

export interface MyHousing {
  hasRoom: boolean;
  roomId?: number;
  hostelName?: string;
  roomNumber?: string;
  floor?: string;
}

export interface InviteCode {
  code: string;
  expiresAt: string;
}

export interface RoomSuggestion {
  userId: number;
  fullName: string;
  score: number;
}

export interface RedeemedHold {
  holdId: number;
  bedId: number;
  roomLabel: string;
  hostelName: string;
  amount: number;
  expiresAt: string;
  status: string;
}

export async function fetchMyHousing(): Promise<MyHousing> {
  return api<MyHousing>('/api/users/me/housing');
}

export async function generateInviteCode(roomId: number): Promise<InviteCode> {
  return api<InviteCode>(`/api/rooms/${roomId}/invites`, { method: 'POST' });
}

export async function fetchRoomSuggestions(roomId: number, limit = 10): Promise<RoomSuggestion[]> {
  return api<RoomSuggestion[]>(`/api/rooms/${roomId}/suggestions?limit=${limit}`);
}

export async function redeemInviteCode(
  code: string,
): Promise<{ success: boolean; hold?: RedeemedHold; errorMessage?: string }> {
  try {
    const hold = await api<RedeemedHold>('/api/invites/redeem', {
      method: 'POST',
      body: { code: code.trim().toUpperCase() },
    });
    return { success: true, hold };
  } catch (e) {
    const message = e instanceof ApiError ? e.message : 'Could not redeem this code. Try again.';
    return { success: false, errorMessage: message };
  }
}
