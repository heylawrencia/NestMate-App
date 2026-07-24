export interface UserProfile {
  fullName: string;
  email?: string;
  dateOfBirth?: string;
  bio?: string;
  gender?: string;
  schoolLevel?: string;
  avatarUri?: string;
  photos?: string[];
  sleepSchedule?: string;
  cleanliness?: string;
  noiseLevel?: string;
  socialEnergy?: string;
  smoking?: string;
  petFriendly?: string;
}

export type UserProfileUpdate = Partial<UserProfile>;

export type SleepSchedule = 'EARLY_BIRD' | 'FLEXIBLE' | 'NIGHT_OWL';
export type SeekingType = 'SEEKING_ROOM' | 'OFFERING_ROOM';

export interface ProfileRequest {
  sleepSchedule: SleepSchedule;
  cleanliness: number;
  noiseTolerance: number;
  budgetMin: number;
  budgetMax: number;
  city: string;
  bio: string;
  smoker: boolean;
  smokerOk: boolean;
  hasPets: boolean;
  petsOk: boolean;
  seekingType: SeekingType;
  socialLevel?: number;
}

export interface BackendProfile extends ProfileRequest {
  userId: number;
  updatedAt: string;
}
