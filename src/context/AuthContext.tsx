import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

import * as authService from '../services/authService';
import { setAuthToken, setUnauthorizedHandler } from '../services/apiClient';
import * as tokenStorage from '../services/tokenStorage';
import { decodeJwtPayload, isJwtExpired } from '../utils/jwt';
import { LoginResult } from '../types/auth';

const isWeb = Platform.OS === 'web';
const FULL_NAME_KEY = 'nestmate.auth.fullname';

async function getStoredFullName(): Promise<string | null> {
  if (isWeb) {
    try {
      return typeof localStorage !== 'undefined' ? localStorage.getItem(FULL_NAME_KEY) : null;
    } catch {
      return null;
    }
  }
  return SecureStore.getItemAsync(FULL_NAME_KEY);
}

async function setStoredFullName(name: string): Promise<void> {
  if (isWeb) {
    try {
      if (typeof localStorage !== 'undefined') localStorage.setItem(FULL_NAME_KEY, name);
    } catch {}
    return;
  }
  await SecureStore.setItemAsync(FULL_NAME_KEY, name);
}

async function clearStoredFullName(): Promise<void> {
  if (isWeb) {
    try {
      if (typeof localStorage !== 'undefined') localStorage.removeItem(FULL_NAME_KEY);
    } catch {}
    return;
  }
  await SecureStore.deleteItemAsync(FULL_NAME_KEY);
}

interface AuthContextValue {
  token: string | null;
  userId: number | null;
  email: string | null;
  fullName: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  register: (email: string, password: string, fullName: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(async () => {
    await tokenStorage.clearToken();
    await clearStoredFullName();
    setAuthToken(null);
    setToken(null);
    setUserId(null);
    setEmail(null);
    setFullName(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      logout();
    });
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  useEffect(() => {
    (async () => {
      try {
        const storedToken = await tokenStorage.getToken();
        const storedName = await getStoredFullName();
        const payload = storedToken ? decodeJwtPayload(storedToken) : null;

        if (storedToken && payload && !isJwtExpired(payload)) {
          setAuthToken(storedToken);
          setToken(storedToken);
          setUserId(Number(payload.sub));
          setEmail(payload.email);
          setFullName(storedName);
        } else if (storedToken) {
          await tokenStorage.clearToken();
          await clearStoredFullName();
        }
      } catch (e) {
        console.warn('Failed to restore session:', e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const applyAuthResult = useCallback(async (result: LoginResult) => {
    if (result.success && result.token && result.user) {
      await tokenStorage.setToken(result.token);
      if (result.user.fullName) {
        await setStoredFullName(result.user.fullName);
        setFullName(result.user.fullName);
      }
      setAuthToken(result.token);
      setToken(result.token);
      setUserId(result.user.userId);
      setEmail(result.user.email);
    }
    return result;
  }, []);

  const login = useCallback(
    async (emailInput: string, password: string) => applyAuthResult(await authService.login(emailInput, password)),
    [applyAuthResult],
  );

  const register = useCallback(
    async (emailInput: string, password: string, name: string) =>
      applyAuthResult(await authService.register(emailInput, password, name)),
    [applyAuthResult],
  );

  const value = useMemo(
    () => ({ token, userId, email, fullName, isLoading, login, register, logout }),
    [token, userId, email, fullName, isLoading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
