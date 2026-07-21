import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ExploreStackParamList } from './types';
import DiscoveryScreen from '../screens/DiscoveryScreen';
import HostelDetailScreen from '../screens/HostelDetailScreen';
import AccessCodeScreen from '../screens/AccessCodeScreen';
import CodeVerifiedScreen from '../screens/CodeVerifiedScreen';
import ChooseRoomTypeScreen from '../screens/ChooseRoomTypeScreen';
import FindRoommatesScreen from '../screens/FindRoommatesScreen';
import RoommateMatchingScreen from '../screens/RoommateMatchingScreen';
import RoommateProfileScreen from '../screens/RoommateProfileScreen';
import RoommateGroupScreen from '../screens/RoommateGroupScreen';
import AllocationScreen from '../screens/AllocationScreen';

const Stack = createNativeStackNavigator<ExploreStackParamList>();

export default function ExploreStackNavigator() {
  return (
    <Stack.Navigator initialRouteName="ExploreList" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ExploreList" component={DiscoveryScreen} />
      <Stack.Screen name="HostelDetail" component={HostelDetailScreen} />
      <Stack.Screen name="AccessCode" component={AccessCodeScreen} />
      <Stack.Screen name="CodeVerified" component={CodeVerifiedScreen} />
      <Stack.Screen name="ChooseRoomType" component={ChooseRoomTypeScreen} />
      <Stack.Screen name="FindRoommates" component={FindRoommatesScreen} />
      <Stack.Screen name="RoommateMatching" component={RoommateMatchingScreen} />
      <Stack.Screen name="RoommateProfile" component={RoommateProfileScreen} />
      <Stack.Screen name="RoommateGroup" component={RoommateGroupScreen} />
      <Stack.Screen name="Allocation" component={AllocationScreen} />
    </Stack.Navigator>
  );
}
