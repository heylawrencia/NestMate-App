import { NavigatorScreenParams } from '@react-navigation/native';

export interface OnboardingLifestyle {
  cleanliness?: string;
  organization?: string;
  choreHabits?: string;
  socialEnergy?: string;
  studyEnvironment?: string;
  sleepSchedule?: string;
  guestsComfort?: string;
  smoking?: string;
  drinking?: string;
  noiseLevel?: string;
  communication?: string;
  petFriendly?: string;
  // Backend hard-filters matches on these - no equivalent quiz question existed before.
  seekingType?: string;
  smokerOk?: string;
  hasPets?: string;
}

export interface OnboardingData {
  email: string;
  fullName?: string;
  dateOfBirth?: string;
  bio?: string;
  gender?: string;
  schoolLevel?: string;
  avatarUri?: string;
  photos?: string[];
  interests?: string[];
  lifestyle?: OnboardingLifestyle;
  // Backend Profile hard-filters matches on budget overlap and city - collected in AboutYouScreen.
  city?: string;
  budgetMin?: string;
  budgetMax?: string;
}

export type RootStackParamList = {
  Splash: undefined;
  GetStarted: undefined;
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  // mode 'signup' hits the real verify-email/resend endpoints and continues to onboarding;
  // 'reset' (the forgot-password entry point) stays a mock - backend has no password-reset flow yet.
  VerifyEmail: { email: string; fullName?: string; mode?: 'signup' | 'reset' };
  OnboardingAboutYou: { data: OnboardingData };
  OnboardingPhotos: { data: OnboardingData };
  OnboardingInterests: { data: OnboardingData };
  OnboardingLifestyle: { data: OnboardingData };
  OnboardingComplete: { data: OnboardingData };
  Home: undefined;
  MyHostel: undefined;
  Verification: undefined;
  Settings: undefined;
  Account: undefined;
  Privacy: undefined;
  About: undefined;
  HelpSupport: undefined;
  EditProfile: undefined;
  Notifications: undefined;
  Placeholder: { title: string; description?: string };
  MatchProfile: { matchId: string };
  IndividualChat: { matchId: string; otherUserName?: string };
  GroupChat: { hostelId: string; roomTypeId: string };
};

export type ExploreStackParamList = {
  ExploreList: undefined;
  HostelDetail: { hostelId: string };
  AccessCode: { hostelId: string };
  CodeVerified: { hostelId: string; code: string };
  ChooseRoomType: { hostelId: string };
  FindRoommates: { hostelId: string; roomTypeId: string };
  RoommateMatching: { hostelId: string; roomTypeId: string };
  RoommateProfile: { hostelId: string; roomTypeId: string; candidateId: string };
  RoommateGroup: { hostelId: string; roomTypeId: string };
  Allocation: { hostelId: string; roomTypeId: string };
};

export type MainTabParamList = {
  HomeTab: undefined;
  Explore: NavigatorScreenParams<ExploreStackParamList> | undefined;
  Chat: undefined;
  Matches: undefined;
  Profile: undefined;
};
