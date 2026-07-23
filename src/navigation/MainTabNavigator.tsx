import React, { useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { MainTabParamList, RootStackParamList } from './types';
import { colors } from '../theme';
import { DrawerProvider } from '../context/DrawerContext';
import HomeDrawerMenu, { DrawerMenuItem } from '../components/HomeDrawerMenu';
import { displayNameFor } from '../utils/formatName';
import { useAuth } from '../context/AuthContext';
import HomeScreen from '../screens/HomeScreen';
import ExploreStackNavigator from './ExploreStackNavigator';
import ChatScreen from '../screens/ChatScreen';
import MatchesScreen from '../screens/MatchesScreen';
import ProfileScreen from '../screens/ProfileScreen';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_ICONS: Record<keyof MainTabParamList, { active: string; inactive: string }> = {
  HomeTab: { active: 'home', inactive: 'home-outline' },
  Explore: { active: 'compass', inactive: 'compass-outline' },
  Chat: { active: 'chatbubble', inactive: 'chatbubble-outline' },
  Matches: { active: 'heart', inactive: 'heart-outline' },
  Profile: { active: 'person', inactive: 'person-outline' },
};

export default function MainTabNavigator({ navigation }: Props) {
  const { email, logout } = useAuth();
  const firstName = displayNameFor(email ?? '');
  const [drawerVisible, setDrawerVisible] = useState(false);

  function closeDrawerThen(action: () => void | Promise<void>) {
    setDrawerVisible(false);
    action();
  }

  const drawerItems: DrawerMenuItem[] = [
    {
      key: 'my-hostel',
      label: 'My Hostel',
      icon: 'business-outline',
      active: true,
      onPress: () => closeDrawerThen(() => navigation.navigate('MyHostel')),
    },
    {
      key: 'my-matches',
      label: 'My Matches',
      icon: 'heart-outline',
      badgeCount: 2,
      onPress: () => closeDrawerThen(() => navigation.navigate('Home', { screen: 'Matches' } as never)),
    },
    {
      key: 'chats',
      label: 'Chats',
      icon: 'chatbubble-outline',
      onPress: () => closeDrawerThen(() => navigation.navigate('Home', { screen: 'Chat' } as never)),
    },
    {
      key: 'settings',
      label: 'Settings',
      icon: 'settings-outline',
      onPress: () => closeDrawerThen(() => navigation.navigate('Settings')),
    },
    {
      key: 'help-support',
      label: 'Help & Support',
      icon: 'help-circle-outline',
      onPress: () => closeDrawerThen(() => navigation.navigate('HelpSupport')),
    },
  ];

  return (
    <DrawerProvider openDrawer={() => setDrawerVisible(true)}>
      <Tab.Navigator
        screenOptions={({ route: tabRoute }) => ({
          headerShown: false,
          tabBarShowLabel: false,
          tabBarActiveTintColor: colors.text,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarStyle: {
            borderTopColor: colors.border,
            height: 64,
            paddingTop: 8,
            paddingBottom: 12,
          },
          tabBarIcon: ({ focused, color, size }) => {
            const icons = TAB_ICONS[tabRoute.name as keyof MainTabParamList];
            return (
              <Ionicons name={(focused ? icons.active : icons.inactive) as never} size={size} color={color} />
            );
          },
        })}
      >
        <Tab.Screen name="HomeTab" component={HomeScreen} />
        <Tab.Screen name="Explore" component={ExploreStackNavigator} />
        <Tab.Screen name="Chat" component={ChatScreen} />
        <Tab.Screen name="Matches" component={MatchesScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>

      <HomeDrawerMenu
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        name={firstName}
        verified
        items={drawerItems}
        onLogOut={() =>
          closeDrawerThen(async () => {
            await logout();
            navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
          })
        }
      />
    </DrawerProvider>
  );
}
