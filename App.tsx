import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Sora_700Bold,
  Sora_600SemiBold,
} from '@expo-google-fonts/sora';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';

import ErrorBoundary from './src/components/ErrorBoundary';
import RootNavigator from './src/navigation/RootNavigator';
import { AuthProvider } from './src/context/AuthContext';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [fontsLoaded] = useFonts({
    Sora_700Bold,
    Sora_600SemiBold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    let mounted = true;

    async function prepare() {
      try {
        // Give fonts a maximum of 1.5 seconds to load; proceed anyway if offline/slow
        await new Promise((resolve) => setTimeout(resolve, 1500));
      } catch (e) {
        console.warn('App preparation warning:', e);
      } finally {
        if (mounted) {
          setAppIsReady(true);
          await SplashScreen.hideAsync().catch(() => {});
        }
      }
    }

    if (fontsLoaded) {
      setAppIsReady(true);
      SplashScreen.hideAsync().catch(() => {});
    } else {
      prepare();
    }

    return () => {
      mounted = false;
    };
  }, [fontsLoaded]);

  if (!appIsReady && !fontsLoaded) {
    return null;
  }

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <AuthProvider>
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </AuthProvider>
        <StatusBar style="dark" />
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
