import { HousingStatus } from '../types/user';
import { api } from './apiClient';

interface BackendHousing {
  hasRoom: boolean;
  hostelName?: string;
  roomNumber?: string;
}

export async function fetchHousingStatus(): Promise<HousingStatus> {
  try {
    const housing = await api<BackendHousing>('/api/users/me/housing');
    return { hasRoom: housing.hasRoom, hostelName: housing.hostelName, roomNumber: housing.roomNumber };
  } catch (e) {
    console.warn('fetchHousingStatus failed:', e);
    return { hasRoom: false };
  }
}
