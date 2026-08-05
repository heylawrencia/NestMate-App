import React, { useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { MainTabParamList, RootStackParamList } from './types';
import { colors, type } from '../theme';
import { DrawerProvider } from '../context/DrawerContext';
import HomeDrawerMenu, { DrawerMenuItem } from '../components/HomeDrawerMenu';
import { displayNameFor } from '../utils/formatName';
import { useAuth } from '../context/AuthContext';
import HomeScreen from '../screens/HomeScreen';
import HostelsStackNavigator from './HostelsStackNavigator';
import ChatScreen from '../screens/ChatScreen';
import MatchesScreen from '../screens/MatchesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ManagerDashboardScreen from '../screens/ManagerDashboardScreen';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabNavigator({ navigation }: Props) {
  const { email, logout } = useAuth();
  const firstName = displayNameFor(email ?? '');
  const [drawerVisible, setDrawerVisible] = useState(false);

  // Read role from AuthContext (Task 6)
  // For demo/dev default, role === 'MANAGER' renders Manage tab in position 3
  const isManager = email?.toLowerCase().includes('manager');

  // Unread badge counts (Task 7 - plumbing initialized to 0 until F5 & F7)
  const unreadMessagesCount = 0;
  const unreadNotificationsCount = 0;

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
      icon: 'sparkles-outline',
      badgeCount: 2,
      onPress: () => closeDrawerThen(() => navigation.navigate('Home', { screen: 'Matches' } as never)),
    },
    {
      key: 'chats',
      label: 'Chats',
      icon: 'chatbubbles-outline',
      onPress: () => closeDrawerThen(() => navigation.navigate('Home', { screen: 'Chats' } as never)),
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
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarShowLabel: true,
          tabBarLabelStyle: {
            fontFamily: type.micro.fontFamily,
            fontSize: 11,
            lineHeight: 14,
            letterSpacing: 0.4,
            marginBottom: 4,
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.inkFaint,
          tabBarStyle: {
            height: 64,
            paddingTop: 6,
            backgroundColor: colors.surface,
            borderTopColor: colors.line,
            borderTopWidth: 1,
          },
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap = 'home-outline';

            if (route.name === 'HomeTab') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'HostelsStack') {
              iconName = focused ? 'business' : 'business-outline';
            } else if (route.name === 'Matches') {
              iconName = focused ? 'sparkles' : 'sparkles-outline';
            } else if (route.name === 'Manage') {
              iconName = focused ? 'briefcase' : 'briefcase-outline';
            } else if (route.name === 'Chats' || route.name === 'Chat') {
              iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
            } else if (route.name === 'Profile') {
              iconName = focused ? 'person' : 'person-outline';
            }

            return <Ionicons name={iconName} size={22} color={color} />;
          },
        })}
      >
        <Tab.Screen
          name="HomeTab"
          component={HomeScreen}
          options={{
            tabBarLabel: 'Home',
            tabBarBadge: unreadNotificationsCount > 0 ? unreadNotificationsCount : undefined,
          }}
        />
        <Tab.Screen
          name="HostelsStack"
          component={HostelsStackNavigator}
          options={{
            tabBarLabel: 'Hostels',
          }}
        />
        {isManager ? (
          <Tab.Screen
            name="Manage"
            component={(props: any) => <ManagerDashboardScreen {...props} />}
            options={{
              tabBarLabel: 'Manage',
            }}
          />
        ) : (
          <Tab.Screen
            name="Matches"
            component={(props: any) => <MatchesScreen {...props} />}
            options={{
              tabBarLabel: 'Matches',
            }}
          />
        )}
        <Tab.Screen
          name="Chats"
          component={(props: any) => <ChatScreen {...props} />}
          options={{
            tabBarLabel: 'Chats',
            tabBarBadge: unreadMessagesCount > 0 ? unreadMessagesCount : undefined,
          }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            tabBarLabel: 'Profile',
          }}
        />
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
