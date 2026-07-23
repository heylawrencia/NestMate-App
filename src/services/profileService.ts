import { apiClient } from './apiClient';
import { OnboardingData } from '../navigation/types';
import {
  BackendProfile,
  ProfileRequest,
  SeekingType,
  SleepSchedule,
  UserProfile,
  UserProfileUpdate,
} from '../types/profile';

export async function fetchMyProfile(): Promise<BackendProfile> {
  return apiClient.get<BackendProfile>('/api/profiles/me');
}

export async function fetchProfileByUserId(userId: number): Promise<BackendProfile> {
  return apiClient.get<BackendProfile>(`/api/profiles/${userId}`);
}

export async function saveMyProfile(request: ProfileRequest): Promise<BackendProfile> {
  return apiClient.put<BackendProfile>('/api/profiles/me', request);
}

const SLEEP_SCHEDULE_MAP: Record<string, SleepSchedule> = {
  'Early Bird': 'EARLY_BIRD',
  'Night Owl': 'NIGHT_OWL',
  Flexible: 'FLEXIBLE',
};

const CLEANLINESS_MAP: Record<string, number> = {
  'Very Clean': 5,
  Clean: 4,
  Average: 3,
  Messy: 1,
};

const NOISE_TOLERANCE_MAP: Record<string, number> = {
  Quiet: 2,
  Moderate: 3,
  Loud: 5,
};

const SOCIAL_LEVEL_MAP: Record<string, number> = {
  'Very Social': 5,
  Social: 4,
  Balanced: 3,
  Reserved: 2,
  'Very Reserved': 1,
};

const SMOKER_MAP: Record<string, boolean> = {
  Smoker: true,
  Occasionally: true,
  'Non-Smoker': false,
};

const YES_NO_MAP: Record<string, boolean> = { Yes: true, No: false };

const SEEKING_TYPE_MAP: Record<string, SeekingType> = {
  'Looking for a room': 'SEEKING_ROOM',
  'Offering a room': 'OFFERING_ROOM',
};

/**
 * Maps onboarding UI answers onto the backend's ProfileRequest shape. Returns null if
 * a required field is missing - the onboarding screens validate these before letting
 * the user reach OnboardingComplete, so null here indicates a real bug, not user error.
 * Note: `interests` has no backend Profile field and is intentionally dropped.
 */
export function buildProfileRequest(data: OnboardingData): ProfileRequest | null {
  const lifestyle = data.lifestyle;
  const sleepSchedule = lifestyle?.sleepSchedule ? SLEEP_SCHEDULE_MAP[lifestyle.sleepSchedule] : undefined;
  const cleanliness = lifestyle?.cleanliness ? CLEANLINESS_MAP[lifestyle.cleanliness] : undefined;
  const noiseTolerance = lifestyle?.noiseLevel ? NOISE_TOLERANCE_MAP[lifestyle.noiseLevel] : undefined;
  const socialLevel = lifestyle?.socialEnergy ? SOCIAL_LEVEL_MAP[lifestyle.socialEnergy] : undefined;
  const smoker = lifestyle?.smoking ? SMOKER_MAP[lifestyle.smoking] : undefined;
  const smokerOk = lifestyle?.smokerOk ? YES_NO_MAP[lifestyle.smokerOk] : undefined;
  const hasPets = lifestyle?.hasPets ? YES_NO_MAP[lifestyle.hasPets] : undefined;
  const petsOk = lifestyle?.petFriendly ? YES_NO_MAP[lifestyle.petFriendly] : undefined;
  const seekingType = lifestyle?.seekingType ? SEEKING_TYPE_MAP[lifestyle.seekingType] : undefined;
  const budgetMin = data.budgetMin ? Number(data.budgetMin) : undefined;
  const budgetMax = data.budgetMax ? Number(data.budgetMax) : undefined;

  if (
    !sleepSchedule ||
    cleanliness === undefined ||
    noiseTolerance === undefined ||
    smoker === undefined ||
    smokerOk === undefined ||
    hasPets === undefined ||
    petsOk === undefined ||
    !seekingType ||
    budgetMin === undefined ||
    budgetMax === undefined ||
    !data.city
  ) {
    return null;
  }

  return {
    sleepSchedule,
    cleanliness,
    noiseTolerance,
    socialLevel,
    budgetMin,
    budgetMax,
    city: data.city,
    bio: data.bio ?? '',
    smoker,
    smokerOk,
    hasPets,
    petsOk,
    seekingType,
  };
}

// --- Legacy in-memory mock. Account/EditProfile/Profile screens now use the real
// endpoints above; this only remains because roommateService.ts's still-mocked
// candidate matching (Phase 2 territory) reads it for gender-based filtering. ---
const MOCK_NETWORK_DELAY_MS = 400;

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), MOCK_NETWORK_DELAY_MS));
}

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
