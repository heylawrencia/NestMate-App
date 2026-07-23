/**
 * Shared API client for the NESTMATE backend.
 * Set in .env as EXPO_PUBLIC_API_BASE_URL - change it there when the
 * backend's network address changes, no code edit needed. Falls back to
 * localhost (web mode, same machine) if .env is missing.
 */
export const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

let authToken: string | null = null;

export function setToken(token: string | null) {
  authToken = token;
  try {
    if (typeof localStorage !== 'undefined') {
      if (token) localStorage.setItem('nestmate_token', token);
      else localStorage.removeItem('nestmate_token');
    }
  } catch {
    // localStorage unavailable (native) - in-memory token is fine
  }
}

export function getToken(): string | null {
  if (authToken) return authToken;
  try {
    if (typeof localStorage !== 'undefined') {
      authToken = localStorage.getItem('nestmate_token');
    }
  } catch {
    // ignore
  }
  return authToken;
}

/** The logged-in user's id, decoded from the JWT's `sub` claim (identity-service sets sub = userId). */
export function getMyUserId(): number | null {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const id = Number(payload.sub);
    return Number.isFinite(id) ? id : null;
  } catch {
    return null;
  }
}

/** ws(s):// equivalent of BASE_URL, pointed at the raw-WebSocket transport of the SockJS chat endpoint. */
export function wsUrl(path: string): string {
  return `${BASE_URL.replace(/^http/, 'ws')}${path}`;
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function api<T>(
  path: string,
  options: { method?: string; body?: unknown } = {},
): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message =
      data && typeof data.error === 'string' ? data.error : `Request failed (${response.status})`;
    throw new ApiError(response.status, message);
  }
  return data as T;
}

