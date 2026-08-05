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
  seekingType?: string;
  hasPets?: string;
  smokerOk?: string;
}

export interface OnboardingData {
  email: string;
  password?: string;
  fullName?: string;
  dateOfBirth?: string;
  bio?: string;
  gender?: string;
  schoolLevel?: string;
  avatarUri?: string;
  photos?: string[];
  interests?: string[];
  lifestyle?: OnboardingLifestyle;
  city?: string;
  budgetMin?: string;
  budgetMax?: string;
}

export type HostelsStackParamList = {
  HostelList: undefined;
  HostelDetail: { hostelId: string };
  AccessCode: { hostelId: string; roomTypeId?: string };
  CodeVerified: { hostelId: string; code: string; roomTypeId?: string };
  ChooseRoomType: { hostelId: string };
  PickRoom: { hostelId: string; roomTypeId: string };
  HoldPending: { hostelId: string; roomTypeId: string };
  FindRoommates: { hostelId: string; roomTypeId: string };
  RoommateMatching: { hostelId: string; roomTypeId: string };
  RoommateProfile: { hostelId: string; roomTypeId: string; candidateId: string };
  RoommateGroup: { hostelId: string; roomTypeId: string };
  Allocation: { hostelId: string; roomTypeId: string };
};

export type MatchesStackParamList = {
  MatchesList: undefined;
  MatchProfile: { matchId: string; otherUserName?: string; name?: string };
};

// Backward compatibility alias for pre-F6 screens
export type ExploreStackParamList = HostelsStackParamList;

export type MainTabParamList = {
  HomeTab: { email: string; name?: string };
  HostelsStack: NavigatorScreenParams<HostelsStackParamList> | undefined;
  Chats: undefined;
  Chat: undefined;
  Matches: undefined;
  Manage: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Splash: undefined;
  GetStarted: undefined;
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  ResetPassword: { email: string };
  VerifyEmail: { email: string; name?: string; data?: OnboardingData };
  ChooseIntent: undefined;
  Essentials: undefined;
  OnboardingAboutYou: { data: OnboardingData };
  OnboardingLifestyle: { data: OnboardingData };
  OnboardingComplete: { data: OnboardingData };
  Home: { email: string; name?: string };
  ManagerDashboard: { email: string };
  Invites: undefined;
  MyHostel: undefined;
  Verification: undefined;
  Settings: undefined;
  EditProfileHub: undefined;
  EditBasics: undefined;
  EditLifestyle: undefined;
  EditPreferences: undefined;
  EditInterests: undefined;
  Account: undefined;
  Privacy: undefined;
  PrivacyPolicy: undefined;
  TermsOfService: undefined;
  About: undefined;
  HelpSupport: undefined;
  EditProfile: undefined;
  Preferences: undefined;
  Notifications: undefined;
  MatchProfile: { matchId: string; otherUserName?: string; name?: string };
  IndividualChat: { matchId: string; otherUserName?: string; name?: string };
  GroupChat: { hostelId: string; roomTypeId: string };
  UpgradePremium: undefined;
  InterestPicker: undefined;
  HostelDetail: { hostelId: string };
  ChooseRoomType: { hostelId: string };
  PickRoom: { hostelId: string; roomTypeId: string };
  AccessCode: { hostelId: string; roomTypeId?: string };
  CodeVerified: { hostelId: string; code: string; roomTypeId?: string };
  HoldPending: { hostelId?: string; roomTypeId?: string };
};
