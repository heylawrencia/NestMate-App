import { apiClient, ApiError } from './apiClient';
import { AuthUser, LoginResult } from '../types/auth';

interface AuthApiResponse {
  userId: number;
  email: string;
  token: string;
  role: 'STUDENT' | 'MANAGER';
  verified: boolean;
}

interface SimpleResult {
  success: boolean;
  errorMessage?: string;
}

function toErrorMessage(err: unknown): string {
  return err instanceof ApiError ? err.message : 'Something went wrong. Please try again.';
}

async function authRequest(path: string, body: unknown): Promise<LoginResult> {
  try {
    const response = await apiClient.post<AuthApiResponse>(path, body);
    const user: AuthUser = { userId: response.userId, email: response.email };
    return { success: true, user, token: response.token };
  } catch (err) {
    // Login throws 403 only when the account's email isn't verified yet (AuthService.login).
    if (err instanceof ApiError && err.status === 403) {
      return { success: false, errorMessage: err.message, requiresVerification: true };
    }
    return { success: false, errorMessage: toErrorMessage(err) };
  }
}

export function login(email: string, password: string): Promise<LoginResult> {
  return authRequest('/api/auth/login', { email, password });
}

export function register(
  email: string,
  password: string,
  fullName: string,
): Promise<LoginResult> {
  return authRequest('/api/auth/register', { email, password, fullName });
}

export async function verifyEmail(email: string, code: string): Promise<SimpleResult> {
  try {
    await apiClient.post('/api/auth/verify-email', { email, code });
    return { success: true };
  } catch (err) {
    return { success: false, errorMessage: toErrorMessage(err) };
  }
}

export async function resendVerification(email: string): Promise<SimpleResult> {
  try {
    await apiClient.post('/api/auth/resend-verification', { email });
    return { success: true };
  } catch (err) {
    return { success: false, errorMessage: toErrorMessage(err) };
  }
}
