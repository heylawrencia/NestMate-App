import { apiClient } from './apiClient';
import { HousingStatus } from '../types/user';

export async function fetchHousingStatus(): Promise<HousingStatus> {
  return apiClient.get<HousingStatus>('/api/users/me/housing');
}
