import { LoginResult } from '../types/auth';
import { api, ApiError, setToken } from './apiClient';

/**
 * REAL implementation - calls the NESTMATE Spring Boot backend.
 * Seeded demo accounts (password: password123):
 *   ama@seed.nestmate.com · kojo@seed.nestmate.com
 *   abena@seed.nestmate.com · yaw@seed.nestmate.com
 *
 * Registration requires a @gmail.com address, and login is blocked until the
 * emailed code is verified (see verifyEmail below) - both enforced server-side.
 */

interface BackendAuthResponse {
  userId: number;
  email: string;
  token: string;
  role: 'STUDENT' | 'MANAGER';
  verified: boolean;
}

export async function login(email: string, password: string): Promise<LoginResult> {
  try {
    const res = await api<BackendAuthResponse>('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    setToken(res.token);
    return { success: true, user: { email: res.email, role: res.role } };
  } catch (e) {
    const message =
      e instanceof ApiError ? e.message : 'Cannot reach the server. Is the backend running?';
    const needsVerification = e instanceof ApiError && e.status === 403 && /verify/i.test(e.message);
    return { success: false, errorMessage: message, needsVerification };
  }
}

export async function register(
  email: string,
  password: string,
  fullName: string,
): Promise<LoginResult> {
  try {
    const res = await api<BackendAuthResponse>('/api/auth/register', {
      method: 'POST',
      body: { email, password, fullName },
    });
    setToken(res.token);
    return { success: true, user: { email: res.email } };
  } catch (e) {
    const message =
      e instanceof ApiError ? e.message : 'Cannot reach the server. Is the backend running?';
    return { success: false, errorMessage: message };
  }
}

export function logout() {
  setToken(null);
}

/** Sets the account's verified flag - required before login will succeed. */
export async function verifyEmail(email: string, code: string): Promise<LoginResult> {
  try {
    await api('/api/auth/verify-email', { method: 'POST', body: { email, code } });
    return { success: true };
  } catch (e) {
    const message = e instanceof ApiError ? e.message : 'Could not verify. Check your connection.';
    return { success: false, errorMessage: message };
  }
}

export async function resendVerification(email: string): Promise<LoginResult> {
  try {
    await api('/api/auth/resend-verification', { method: 'POST', body: { email } });
    return { success: true };
  } catch (e) {
    const message = e instanceof ApiError ? e.message : 'Could not resend. Check your connection.';
    return { success: false, errorMessage: message };
  }
}
