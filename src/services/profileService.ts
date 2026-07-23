import { UserProfile, UserProfileUpdate } from '../types/profile';
import { OnboardingData } from '../navigation/types';
import { api, ApiError } from './apiClient';

const MOCK_NETWORK_DELAY_MS = 400;

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), MOCK_NETWORK_DELAY_MS));
}

/**
 * Mock in-memory profile store standing in for a real profile API.
 * `updateProfile` mutates this so Edit Profile's changes are reflected
 * back on the My Profile screen within the session.
 *
 * STILL MOCKED: dateOfBirth, gender, schoolLevel, avatarUri and photos have
 * no home in the backend today (neither User nor Profile has these columns),
 * so EditProfileScreen/ProfileScreen/AccountScreen stay on this mock until
 * that schema decision is made. `createLifestyleProfile` below is the real,
 * backend-backed one - it saves the separate lifestyle/matching profile.
 */
let mockProfile: UserProfile = {
  fullName: '',
  bio: '',
};

export async function fetchProfile(): Promise<UserProfile> {
  return delay({ ...mockProfile });
}

export async function updateProfile(update: UserProfileUpdate): Promise<UserProfile> {
  mockProfile = { ...mockProfile, ...update };
  return delay({ ...mockProfile });
}

// ---------- Real lifestyle/matching profile (PUT /api/profiles/me) ----------

type SleepSchedule = 'EARLY_BIRD' | 'FLEXIBLE' | 'NIGHT_OWL';
type Gender = 'FEMALE' | 'MALE' | 'NON_BINARY' | 'PREFER_NOT_TO_SAY';

function mapGender(value?: string): Gender {
  switch (value) {
    case 'Female': return 'FEMALE';
    case 'Male': return 'MALE';
    case 'Non-binary': return 'NON_BINARY';
    default: return 'PREFER_NOT_TO_SAY';
  }
}

function mapSleepSchedule(value?: string): SleepSchedule {
  if (value === 'Early Bird') return 'EARLY_BIRD';
  if (value === 'Night Owl') return 'NIGHT_OWL';
  return 'FLEXIBLE';
}

function mapCleanliness(value?: string): number {
  switch (value) {
    case 'Very Clean': return 5;
    case 'Clean': return 4;
    case 'Average': return 3;
    case 'Messy': return 1;
    default: return 3;
  }
}

function mapNoiseTolerance(value?: string): number {
  switch (value) {
    case 'Quiet': return 2;
    case 'Moderate': return 3;
    case 'Loud': return 5;
    default: return 3;
  }
}

function mapSocialLevel(value?: string): number {
  switch (value) {
    case 'Very Social': return 5;
    case 'Social': return 4;
    case 'Balanced': return 3;
    case 'Reserved': return 2;
    case 'Very Reserved': return 1;
    default: return 3;
  }
}

/**
 * Creates the lifestyle/matching profile from onboarding answers - this is
 * what powers compatibility scoring, separate from the identity mock above.
 *
 * KNOWN GAP: city and budget are required by the backend but never asked
 * during onboarding, so they default to values matching the seeded demo
 * hostels (Kumasi, GHS 2,000-9,000). Add real questions for these before
 * launching beyond the current single-city demo.
 *
 * Also a simplification: onboarding only asks "are you a smoker", not
 * separately "are you OK living with one" - smokerOk is set equal to smoker.
 */
export async function createLifestyleProfile(
  data: OnboardingData,
): Promise<{ success: boolean; errorMessage?: string }> {
  const smoker = data.lifestyle?.smoking ? data.lifestyle.smoking !== 'Non-Smoker' : false;
  try {
    await api('/api/profiles/me', {
      method: 'PUT',
      body: {
        gender: mapGender(data.gender),
        sleepSchedule: mapSleepSchedule(data.lifestyle?.sleepSchedule),
        cleanliness: mapCleanliness(data.lifestyle?.cleanliness),
        noiseTolerance: mapNoiseTolerance(data.lifestyle?.noiseLevel),
        socialLevel: mapSocialLevel(data.lifestyle?.socialEnergy),
        budgetMin: 2000,
        budgetMax: 9000,
        city: 'Kumasi',
        bio: data.bio ?? '',
        smoker,
        smokerOk: smoker,
        hasPets: false,
        petsOk: data.lifestyle?.petFriendly !== 'No',
        seekingType: 'SEEKING_ROOM',
      },
    });
    return { success: true };
  } catch (e) {
    const message = e instanceof ApiError ? e.message : 'Could not save your profile.';
    return { success: false, errorMessage: message };
  }
}
