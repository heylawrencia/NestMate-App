import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import * as authService from '../services/authService';
import { setAuthToken, setUnauthorizedHandler } from '../services/apiClient';
import * as tokenStorage from '../services/tokenStorage';
import { decodeJwtPayload, isJwtExpired } from '../utils/jwt';
import { LoginResult } from '../types/auth';

interface AuthContextValue {
  token: string | null;
  userId: number | null;
  email: string | null;
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
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(async () => {
    await tokenStorage.clearToken();
    setAuthToken(null);
    setToken(null);
    setUserId(null);
    setEmail(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      logout();
    });
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  useEffect(() => {
    (async () => {
      const storedToken = await tokenStorage.getToken();
      const payload = storedToken ? decodeJwtPayload(storedToken) : null;

      if (storedToken && payload && !isJwtExpired(payload)) {
        setAuthToken(storedToken);
        setToken(storedToken);
        setUserId(Number(payload.sub));
        setEmail(payload.email);
      } else if (storedToken) {
        await tokenStorage.clearToken();
      }

      setIsLoading(false);
    })();
  }, []);

  const applyAuthResult = useCallback(async (result: LoginResult) => {
    if (result.success && result.token && result.user) {
      await tokenStorage.setToken(result.token);
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
    async (emailInput: string, password: string, fullName: string) =>
      applyAuthResult(await authService.register(emailInput, password, fullName)),
    [applyAuthResult],
  );

  const value = useMemo(
    () => ({ token, userId, email, isLoading, login, register, logout }),
    [token, userId, email, isLoading, login, register, logout],
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
