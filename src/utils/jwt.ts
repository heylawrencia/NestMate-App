export interface JwtPayload {
  sub: string;
  email: string;
  iat: number;
  exp: number;
}

export function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const payloadSegment = token.split('.')[1];
    const base64 = payloadSegment.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => `%${c.charCodeAt(0).toString(16).padStart(2, '0')}`)
        .join(''),
    );
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

export function isJwtExpired(payload: JwtPayload): boolean {
  return payload.exp * 1000 <= Date.now();
}
