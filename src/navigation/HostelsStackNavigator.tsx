import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { HostelsStackParamList } from './types';
import HostelListScreen from '../screens/HostelListScreen';
import HostelDetailScreen from '../screens/HostelDetailScreen';
import AccessCodeScreen from '../screens/AccessCodeScreen';
import CodeVerifiedScreen from '../screens/CodeVerifiedScreen';
import ChooseRoomTypeScreen from '../screens/ChooseRoomTypeScreen';
import PickRoomScreen from '../screens/PickRoomScreen';
import HoldPendingScreen from '../screens/HoldPendingScreen';
import FindRoommatesScreen from '../screens/FindRoommatesScreen';
import RoommateMatchingScreen from '../screens/RoommateMatchingScreen';
import RoommateProfileScreen from '../screens/RoommateProfileScreen';
import RoommateGroupScreen from '../screens/RoommateGroupScreen';
import AllocationScreen from '../screens/AllocationScreen';

const Stack = createNativeStackNavigator<HostelsStackParamList>();

export default function HostelsStackNavigator() {
  return (
    <Stack.Navigator initialRouteName="HostelList" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HostelList" component={HostelListScreen} />
      <Stack.Screen name="HostelDetail" component={HostelDetailScreen} />
      <Stack.Screen name="AccessCode" component={AccessCodeScreen} />
      <Stack.Screen name="CodeVerified" component={CodeVerifiedScreen} />
      <Stack.Screen name="ChooseRoomType" component={ChooseRoomTypeScreen} />
      <Stack.Screen name="PickRoom" component={PickRoomScreen} />
      <Stack.Screen name="HoldPending" component={HoldPendingScreen} />
      <Stack.Screen name="FindRoommates" component={FindRoommatesScreen} />
      <Stack.Screen name="RoommateMatching" component={RoommateMatchingScreen} />
      <Stack.Screen name="RoommateProfile" component={RoommateProfileScreen} />
      <Stack.Screen name="RoommateGroup" component={RoommateGroupScreen} />
      <Stack.Screen name="Allocation" component={AllocationScreen} />
    </Stack.Navigator>
  );
}
