import { Platform } from 'react-native';

function resolveBaseUrl(): string {
  const configured =
    process.env.EXPO_PUBLIC_API_BASE_URL ??
    process.env.EXPO_PUBLIC_API_URL ??
    'http://localhost:8080';
  if (Platform.OS === 'android' && configured.includes('localhost')) {
    return configured.replace('localhost', '10.0.2.2');
  }
  return configured;
}

export const BASE_URL = resolveBaseUrl();

export function getApiBaseUrl(): string {
  return BASE_URL;
}

/** Turns a backend-relative path (e.g. "/uploads/avatars/x.jpg") into a full URL against the
 * current BASE_URL, so it keeps working no matter what host the app is currently pointed at.
 * Absolute URLs and local device URIs (file://, data:, ph://, content://) pass through unchanged. */
export function resolveMediaUrl(path?: string | null): string | undefined {
  if (!path) return undefined;
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(path)) {
    return path;
  }
  return `${BASE_URL}${path}`;
}

let authToken: string | null = null;
let onUnauthorized: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null): void {
  onUnauthorized = handler;
}

export function setToken(token: string | null): void {
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

export function setAuthToken(token: string | null): void {
  setToken(token);
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
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    // Free-tier ngrok tunnels serve an HTML interstitial page instead of
    // proxying through unless this header is present.
    'ngrok-skip-browser-warning': 'true',
  };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  if (response.status === 401 || response.status === 403) {
    onUnauthorized?.();
  }

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message =
      data && typeof data.error === 'string' ? data.error : `Request failed (${response.status})`;
    throw new ApiError(response.status, message);
  }
  return data as T;
}

export const apiClient = {
  get: <T>(path: string) => api<T>(path, { method: 'GET' }),
  post: <T>(path: string, body?: unknown) => api<T>(path, { method: 'POST', body }),
  put: <T>(path: string, body?: unknown) => api<T>(path, { method: 'PUT', body }),
  delete: <T>(path: string) => api<T>(path, { method: 'DELETE' }),
};


