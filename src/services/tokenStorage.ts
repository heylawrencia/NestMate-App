import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// expo-secure-store wraps the iOS Keychain / Android Keystore - it has no
// web implementation and throws if called there, so web falls back to
// localStorage (same tradeoff apiClient.ts's own token cache already makes).
const isWeb = Platform.OS === 'web';
const TOKEN_KEY = 'nestmate.auth.token';

export async function getToken(): Promise<string | null> {
  if (isWeb) {
    try {
      return typeof localStorage !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
    } catch {
      return null;
    }
  }
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function setToken(token: string): Promise<void> {
  if (isWeb) {
    try {
      if (typeof localStorage !== 'undefined') localStorage.setItem(TOKEN_KEY, token);
    } catch {
      // ignore
    }
    return;
  }
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function clearToken(): Promise<void> {
  if (isWeb) {
    try {
      if (typeof localStorage !== 'undefined') localStorage.removeItem(TOKEN_KEY);
    } catch {
      // ignore
    }
    return;
  }
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}
