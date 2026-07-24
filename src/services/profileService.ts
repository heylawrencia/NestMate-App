import { UserProfile, UserProfileUpdate } from '../types/profile';
import { OnboardingData } from '../navigation/types';
import { api, ApiError } from './apiClient';

const MOCK_NETWORK_DELAY_MS = 400;

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), MOCK_NETWORK_DELAY_MS));
}

// ---------- Real profile (GET/PUT /api/profiles/me) ----------
// One backend endpoint serves both this identity-level editor (name/DOB/bio/
// gender/school/avatar) and the lifestyle/matching profile below (sleep
// schedule, cleanliness, etc.) - each PUT only sends the fields it owns, and
// the backend only overwrites fields that are actually present in the body.

interface BackendMyProfile {
  userId: number;
  email: string;
  fullName: string;
  avatarUri: string | null;
  gender: string | null;
  dateOfBirth: string | null;
  bio: string | null;
  schoolLevel: string | null;
  sleepSchedule: string | null;
  cleanliness: number | null;
  noiseTolerance: number | null;
  socialLevel: number | null;
  smoker: boolean | null;
  petsOk: boolean | null;
}

const GENDER_DISPLAY: Record<string, string> = {
  FEMALE: 'Female',
  MALE: 'Male',
  NON_BINARY: 'Non-binary',
  PREFER_NOT_TO_SAY: 'Prefer not to say',
};

const SLEEP_SCHEDULE_DISPLAY: Record<string, string> = {
  EARLY_BIRD: 'Early Bird',
  NIGHT_OWL: 'Night Owl',
  FLEXIBLE: 'Flexible',
};

function cleanlinessDisplay(value: number): string {
  if (value >= 5) return 'Very Clean';
  if (value === 4) return 'Clean';
  if (value === 3) return 'Average';
  return 'Messy';
}

function noiseLevelDisplay(value: number): string {
  if (value >= 5) return 'Loud';
  if (value <= 2) return 'Quiet';
  return 'Moderate';
}

function socialEnergyDisplay(value: number): string {
  switch (value) {
    case 5: return 'Very Social';
    case 4: return 'Social';
    case 2: return 'Reserved';
    case 1: return 'Very Reserved';
    default: return 'Balanced';
  }
}

function toUserProfile(p: BackendMyProfile): UserProfile {
  return {
    fullName: p.fullName,
    email: p.email,
    dateOfBirth: p.dateOfBirth ?? undefined,
    bio: p.bio ?? undefined,
    gender: p.gender ? GENDER_DISPLAY[p.gender] : undefined,
    schoolLevel: p.schoolLevel ?? undefined,
    avatarUri: p.avatarUri ?? undefined,
    sleepSchedule: p.sleepSchedule ? SLEEP_SCHEDULE_DISPLAY[p.sleepSchedule] : undefined,
    cleanliness: p.cleanliness != null ? cleanlinessDisplay(p.cleanliness) : undefined,
    noiseLevel: p.noiseTolerance != null ? noiseLevelDisplay(p.noiseTolerance) : undefined,
    socialEnergy: p.socialLevel != null ? socialEnergyDisplay(p.socialLevel) : undefined,
    smoking: p.smoker != null ? (p.smoker ? 'Smoker' : 'Non-Smoker') : undefined,
    petFriendly: p.petsOk != null ? (p.petsOk ? 'Yes' : 'No') : undefined,
  };
}

export async function fetchProfile(): Promise<UserProfile> {
  const p = await api<BackendMyProfile>('/api/profiles/me');
  return toUserProfile(p);
}

export async function updateProfile(update: UserProfileUpdate): Promise<UserProfile> {
  const p = await api<BackendMyProfile>('/api/profiles/me', {
    method: 'PUT',
    body: {
      fullName: update.fullName,
      dateOfBirth: update.dateOfBirth ? update.dateOfBirth.slice(0, 10) : undefined,
      bio: update.bio,
      gender: update.gender !== undefined ? mapGender(update.gender) : undefined,
      schoolLevel: update.schoolLevel,
      avatarUri: update.avatarUri,
      sleepSchedule: update.sleepSchedule !== undefined ? mapSleepSchedule(update.sleepSchedule) : undefined,
      cleanliness: update.cleanliness !== undefined ? mapCleanliness(update.cleanliness) : undefined,
      noiseTolerance: update.noiseLevel !== undefined ? mapNoiseTolerance(update.noiseLevel) : undefined,
      socialLevel: update.socialEnergy !== undefined ? mapSocialLevel(update.socialEnergy) : undefined,
      smoker: update.smoking !== undefined ? update.smoking === 'Smoker' : undefined,
      smokerOk: update.smoking !== undefined ? update.smoking === 'Smoker' : undefined,
      petsOk: update.petFriendly !== undefined ? update.petFriendly === 'Yes' : undefined,
    },
  });
  return toUserProfile(p);
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
        dateOfBirth: data.dateOfBirth ? data.dateOfBirth.slice(0, 10) : undefined,
        schoolLevel: data.schoolLevel,
        avatarUri: data.avatarUri ?? data.photos?.[0],
      },
    });
    return { success: true };
  } catch (e) {
    const message = e instanceof ApiError ? e.message : 'Could not save your profile.';
    return { success: false, errorMessage: message };
  }
}
