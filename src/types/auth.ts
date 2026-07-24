export interface AuthUser {
  userId: number;
  email: string;
  role?: 'STUDENT' | 'MANAGER';
}

export interface LoginResult {
  success: boolean;
  user?: AuthUser;
  token?: string;
  errorMessage?: string;
  /** True when login failed specifically because the account isn't verified yet. */
  needsVerification?: boolean;
  requiresVerification?: boolean;
}
