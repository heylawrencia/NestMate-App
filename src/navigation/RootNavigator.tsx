import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { RootStackParamList } from './types';
import SplashScreen from '../screens/SplashScreen';
import GetStartedScreen from '../screens/GetStartedScreen';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';
import VerifyEmailScreen from '../screens/VerifyEmailScreen';
import ChooseIntentScreen from '../screens/ChooseIntentScreen';
import EssentialsScreen from '../screens/EssentialsScreen';
import AboutYouScreen from '../screens/onboarding/AboutYouScreen';
import LifestyleFitScreen from '../screens/onboarding/LifestyleFitScreen';
import OnboardingCompleteScreen from '../screens/onboarding/OnboardingCompleteScreen';
import MainTabNavigator from './MainTabNavigator';
import ManagerDashboardScreen from '../screens/ManagerDashboardScreen';
import InvitesScreen from '../screens/InvitesScreen';
import MyHostelScreen from '../screens/MyHostelScreen';
import VerificationScreen from '../screens/VerificationScreen';
import SettingsScreen from '../screens/SettingsScreen';
import EditProfileHubScreen from '../screens/EditProfileHubScreen';
import EditBasicsScreen from '../screens/EditBasicsScreen';
import EditLifestyleScreen from '../screens/EditLifestyleScreen';
import EditPreferencesScreen from '../screens/EditPreferencesScreen';
import EditInterestsScreen from '../screens/EditInterestsScreen';
import TermsOfServiceScreen from '../screens/TermsOfServiceScreen';
import AccountScreen from '../screens/AccountScreen';
import PrivacyScreen from '../screens/PrivacyScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';
import AboutScreen from '../screens/AboutScreen';
import HelpSupportScreen from '../screens/HelpSupportScreen';
import InterestPickerScreen from '../screens/InterestPickerScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import PreferencesScreen from '../screens/PreferencesScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import MatchProfileScreen from '../screens/MatchProfileScreen';
import IndividualChatScreen from '../screens/IndividualChatScreen';
import GroupChatScreen from '../screens/GroupChatScreen';
import UpgradePremiumScreen from '../screens/UpgradePremiumScreen';
import HostelDetailScreen from '../screens/HostelDetailScreen';
import AccessCodeScreen from '../screens/AccessCodeScreen';
import HoldPendingScreen from '../screens/HoldPendingScreen';
import CodeVerifiedScreen from '../screens/CodeVerifiedScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="GetStarted" component={GetStartedScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
      <Stack.Screen name="ChooseIntent" component={ChooseIntentScreen} />
      <Stack.Screen name="Essentials" component={EssentialsScreen} />
      <Stack.Screen name="OnboardingAboutYou" component={AboutYouScreen} />
      <Stack.Screen name="OnboardingLifestyle" component={LifestyleFitScreen} />
      <Stack.Screen name="OnboardingComplete" component={OnboardingCompleteScreen} />
      <Stack.Screen name="Home" component={MainTabNavigator} />
      <Stack.Screen name="ManagerDashboard" component={ManagerDashboardScreen} />
      <Stack.Screen name="Invites" component={InvitesScreen} />
      <Stack.Screen name="MyHostel" component={MyHostelScreen} />
      <Stack.Screen name="Verification" component={VerificationScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="EditProfileHub" component={EditProfileHubScreen} />
      <Stack.Screen name="EditBasics" component={EditBasicsScreen} />
      <Stack.Screen name="EditLifestyle" component={EditLifestyleScreen} />
      <Stack.Screen name="EditPreferences" component={EditPreferencesScreen} />
      <Stack.Screen name="EditInterests" component={EditInterestsScreen} />
      <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      <Stack.Screen name="Account" component={AccountScreen} />
      <Stack.Screen name="Privacy" component={PrivacyScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
      <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
      <Stack.Screen name="InterestPicker" component={InterestPickerScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="Preferences" component={PreferencesScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="MatchProfile" component={MatchProfileScreen} />
      <Stack.Screen name="IndividualChat" component={IndividualChatScreen} />
      <Stack.Screen name="GroupChat" component={GroupChatScreen} />
      <Stack.Screen name="UpgradePremium" component={UpgradePremiumScreen} />
      <Stack.Screen name="HostelDetail" component={HostelDetailScreen as any} />
      <Stack.Screen name="AccessCode" component={AccessCodeScreen as any} />
      <Stack.Screen name="HoldPending" component={HoldPendingScreen as any} />
      <Stack.Screen name="CodeVerified" component={CodeVerifiedScreen as any} />
    </Stack.Navigator>
  );
}
