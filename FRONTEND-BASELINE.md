# NESTMATE v2 — Frontend Baseline Audit & Report

**Date**: 2026-07-27  
**SDK Version**: Expo SDK 54 (`expo ~54.0.0`, `react-native 0.81.5`)  
**Target Build Mode**: Expo Go  

---

## 1. Directory Structure & File Counts

The app directory structure matches the v1 reference structure (`App.tsx`, `index.ts`, `src/{components,context,data,hooks,navigation,screens,services,theme,types,utils}`):

| Directory | File Count | Notes / Key Exports |
|---|---|---|
| **Root** | 6 files | `App.tsx`, `index.ts`, `app.json`, `package.json`, `tsconfig.json`, `.env` |
| `src/components/` | 25 files | Base UI components (`AppButton`, `AppTextInput`, `AsyncBoundary`, `CodeInput`, etc.) |
| `src/context/` | 2 files | `AuthContext.tsx`, `DrawerContext.tsx` |
| `src/data/` | 1 file | `hostels.ts` (Mock hostel data fallback) |
| `src/hooks/` | 1 file | `useAsyncData.ts` |
| `src/navigation/` | 4 files | `RootNavigator.tsx`, `MainTabNavigator.tsx`, `ExploreStackNavigator.tsx`, `types.ts` |
| `src/screens/` | 45 files | 40 root screen files + 5 in `onboarding/` subdirectory |
| `src/services/` | 15 files | REST API client & service modules |
| `src/theme/` | 6 files | `colors.ts`, `spacing.ts`, `typography.ts`, `shadows.ts`, `responsive.ts`, `index.ts` |
| `src/types/` | 8 files | TypeScript interfaces (`auth.ts`, `hostel.ts`, `match.ts`, `profile.ts`, etc.) |
| `src/utils/` | 4 files | `chatFormatting.ts`, `formatName.ts`, `jwt.ts`, `limitWords.ts` |

**Total Screen Files**: 45 screen files (40 root + 5 onboarding).

---

## 2. Environment Configuration

- `EXPO_PUBLIC_API_BASE_URL` is configured in `.env`.
- **Target KIND**: Tunnel URL (`https://jelly-tiptoeing-rope.ngrok-free.dev` ngrok tunnel to gateway).
- **Secrets Policy**: No secret values printed or committed.
- **Other Keys**: Confirmed no other `EXPO_PUBLIC_*` key is required for initial baseline.

---

## 3. TypeScript Typecheck Baseline

```bash
$ npm run typecheck
> tsc --noEmit
```
- **Typecheck Baseline Error Count**: **0 errors** (0 TypeScript errors across the entire codebase).
- Every subsequent prompt MUST maintain 0 errors and not introduce regressions.

---

## 4. Expo Go & Backend Connectivity Verification

- Backend microservices stack verified via B6 smoke test suite (12/12 steps green on Gateway port `8090`).
- App launches in Expo Go, loads `RootNavigator`, reaches `Login` screen, navigates to `SignUp`, receives email verification code (`VerifyEmail`), and lands on `Home`.

---

## 5. Screen Inventory & Disposition Ledger (Spec §4.3)

| Screen File | Route Name | Spec Disposition | Notes |
|---|---|---|---|
| `SplashScreen.tsx` | `Splash` | **KEEP** | Initial splash / auth state check |
| `GetStartedScreen.tsx` | `GetStarted` | **KEEP** | Welcome landing screen |
| `LoginScreen.tsx` | `Login` | **KEEP** | Email/Password login (remove Google button stub) |
| `SignUpScreen.tsx` | `SignUp` | **KEEP** | Account creation (remove Google button stub) |
| `ForgotPasswordScreen.tsx` | `ForgotPassword` | **KEEP** | Password reset request |
| `ResetPasswordScreen.tsx` | `ResetPassword` | **KEEP** | Code reset execution |
| `VerifyEmailScreen.tsx` | `VerifyEmail` | **KEEP** | 6-digit email verification |
| `VerificationScreen.tsx` | `Verification` | **KEEP** | Manager identity verification |
| `HomeScreen.tsx` | `Home` | **KEEP** | Student dashboard with notification badge |
| `DiscoveryScreen.tsx` | `HostelList` | **KEEP** | Renamed Hostels tab root with multi-filters |
| `HostelDetailScreen.tsx` | `HostelDetail` | **KEEP** | Hostel gallery & room types |
| `ChooseRoomTypeScreen.tsx` | `ChooseRoomType` | **KEEP** | Tier selection |
| `PickRoomScreen.tsx` | `PickRoom` | **KEEP** | Bed selection |
| `HoldPendingScreen.tsx` | `HoldPending` | **KEEP** | 48-hour active hold countdown |
| `AccessCodeScreen.tsx` | `AccessCode` | **KEEP** | Offline confirmation code generator |
| `CodeVerifiedScreen.tsx` | `CodeVerified` | **KEEP** | Payment confirmation success |
| `FindRoommatesScreen.tsx` | `FindRoommates` | **KEEP** | Roommate search |
| `RoommateMatchingScreen.tsx` | `RoommateMatching` | **KEEP** | Roommate fit evaluation |
| `RoommateProfileScreen.tsx` | `RoommateProfile` | **KEEP** | Roommate candidate profile |
| `RoommateGroupScreen.tsx` | `RoommateGroup` | **KEEP** | Roommate group management |
| `AllocationScreen.tsx` | `Allocation` | **KEEP** | Room allocation view |
| `MatchesScreen.tsx` | `Matches` | **KEEP** | Compatibility matches feed & 402 quota modal |
| `MatchProfileScreen.tsx` | `MatchProfile` | **KEEP** | Match detail view |
| `ChatScreen.tsx` | `Chat` | **KEEP** | Conversations list |
| `IndividualChatScreen.tsx` | `IndividualChat` | **KEEP** | 1:1 direct messaging |
| `GroupChatScreen.tsx` | `GroupChat` | **KEEP** | Group chat messaging |
| `ProfileScreen.tsx` | `Profile` | **KEEP** | User profile tab |
| `EditProfileScreen.tsx` | `EditProfile` | **MERGE / REPLACE** | Replaced by `EditProfileHub` in v2 |
| `PreferencesScreen.tsx` | `Preferences` | **MERGE** | Merged into `EditPreferences` under `EditProfileHub` |
| `AccountScreen.tsx` | `Account` | **KEEP** | User account settings |
| `NotificationsScreen.tsx` | `Notifications` | **KEEP** | In-app notifications feed |
| `SettingsScreen.tsx` | `Settings` | **KEEP** | App settings hub |
| `AboutScreen.tsx` | `About` | **KEEP** | App about info |
| `HelpSupportScreen.tsx` | `HelpSupport` | **KEEP** | Support screen (WhatsApp + phone link) |
| `PrivacyScreen.tsx` | `PrivacyPolicy` | **KEEP** | Privacy policy text |
| `UpgradePremiumScreen.tsx` | `UpgradePremium` | **KEEP** | Paystack checkout & plan status |
| `ManagerDashboardScreen.tsx` | `ManagerDashboard` | **KEEP** | Manager dashboard tab |
| `MyHostelScreen.tsx` | `MyHostel` | **KEEP** | Manager hostel management |
| `InvitesScreen.tsx` | `Invites` | **KEEP** | Manager/Student invite management |
| `PlaceholderScreen.tsx` | `Placeholder` | **REMOVE** | Spec §4.3 explicit remove |
| `onboarding/AboutYouScreen.tsx` | `OnboardingAboutYou` | **MERGE** | Merged into `Essentials` screen |
| `onboarding/LifestyleFitScreen.tsx` | `OnboardingLifestyle` | **KEEP** | Renamed `Lifestyle` |
| `onboarding/UploadPhotosScreen.tsx` | `OnboardingPhotos` | **REMOVE** | Spec §4.3 explicit remove (item 20) |
| `onboarding/InterestsScreen.tsx` | `OnboardingInterests` | **REMOVE** | Spec §4.3 explicit remove as blocking step (item 9) |
| `onboarding/OnboardingCompleteScreen.tsx` | `OnboardingComplete` | **REMOVE / MERGE** | Direct redirect to Home |

---

## 6. Services Inventory (`src/services/`) & Dead Code Audit

| Service File | Key Exports | Status | Usage Notes |
|---|---|---|---|
| `apiClient.ts` | `apiClient`, `setAuthToken`, `getAuthToken` | **USED** | Core Axios HTTP client with Bearer auth header interceptor |
| `tokenStorage.ts` | `saveToken`, `getToken`, `removeToken` | **USED** | SecureStore wrapper for JWT token persistence |
| `authService.ts` | `login`, `register`, `verifyEmail`, `resendVerification` | **USED** | Identity service auth API calls |
| `profileService.ts` | `getProfile`, `updateProfile`, `getInterests`, `updateInterests` | **USED** | User profile and interest catalog management |
| `matchService.ts` | `getMatches`, `blockUser`, `getBlockedUsers`, `reportUser` | **USED** | Roommate compatibility feed & moderation |
| `hostelService.ts` | `getHostels`, `getHostelFilterOptions`, `getHostelById` | **USED** | Hostel search, multi-filters, and room types |
| `roommateService.ts` | `holdBed`, `getActiveHold`, `cancelHold`, `confirmCode` | **USED** | Bed holding and code redemption |
| `inviteService.ts` | `createInvite`, `redeemInvite`, `getRoommateSuggestions` | **USED** | Single-use room invite management |
| `managerService.ts` | `getManagerHostels`, `claimHostel`, `getCommissionStatus` | **USED** | Manager hostel & commission tools |
| `planService.ts` | `getUserPlan`, `initiateUpgrade`, `verifyUpgrade` | **USED** | Paystack premium subscription upgrade |
| `notificationService.ts` | `getNotifications`, `markAsRead` | **USED** | System notifications feed |
| `chatService.ts` | `getConversations`, `getMessages`, `sendMessage` | **USED** | REST chat history and messaging |
| `userService.ts` | `getUserSummary` | **USED** | User summary helper |
| `chatSocket.ts` | `connectWebSocket`, `disconnectWebSocket` | **DEAD** | Imported by 0 screens in codebase |
| `conversationService.ts` | `getMockConversations` | **DEAD** | Imported by 0 screens in codebase |

---

## 7. Theme Tokens Dump (`src/theme/`)

```ts
// colors.ts
export const colors = {
  primary: '#3B82F6',
  primaryDark: '#2563EB',
  primaryLight: '#EAF2FF',
  secondary: '#2A9D8F',
  accent: '#F5A623',
  background: '#FFFFFF',
  surface: '#F7F5F3',
  surfaceTint: '#F3F7FF',
  text: '#20201E',
  textMuted: '#6B6A66',
  border: '#E2E0DC',
  error: '#D64545',
  success: '#2A9D8F',
  white: '#FFFFFF',
};

// spacing.ts
export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 };

// typography.ts
export const typography = {
  h1: 30, h2: 22, body: 16, caption: 13,
  weightRegular: '400' as const, weightMedium: '500' as const, weightBold: '700' as const,
};

// shadows.ts
export const shadows = {
  sm: { shadowColor: '#1E3A8A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  md: { shadowColor: '#1E3A8A', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.1, shadowRadius: 16, elevation: 6 },
  lg: { shadowColor: '#1E3A8A', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.14, shadowRadius: 24, elevation: 10 },
};
```

---

## 8. Google Sign-in Finding

- **UI Button Presence**: `LoginScreen.tsx` and `SignUpScreen.tsx` contain visual UI buttons labeled `"Continue with Google"` with noop handlers `onPress={() => {}}`.
- **Dependencies**: Neither `package.json` nor `app.json` contains `expo-auth-session`, `@react-native-google-signin/google-signin`, or any OAuth package.
- **Backend Capability**: The backend API has no OAuth endpoints.
- **Conclusion**: **DEAD / DECORATIVE UI STUBS**. These buttons will be removed in F2 when auth screens are rebuilt per spec §4.3 item 1.

---

## 9. Package Compatibility for Expo Go (SDK 54)

- `expo-image-picker`: Installed (`~17.0.11`). Native support included in Expo Go SDK 54.
- `@react-native-community/datetimepicker`: Required by F1 (`DatePickerField`). Native support included in Expo Go SDK 54.
- **Verdict**: Both packages are **100% Expo Go compatible**. No custom development build is required.
