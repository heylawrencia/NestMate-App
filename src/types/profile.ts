export interface UserProfile {
  fullName: string;
  email?: string;
  dateOfBirth?: string;
  bio?: string;
  gender?: string;
  schoolLevel?: string;
  avatarUri?: string;
  photos?: string[];
}

export type UserProfileUpdate = Partial<UserProfile>;
