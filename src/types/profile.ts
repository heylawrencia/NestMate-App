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
