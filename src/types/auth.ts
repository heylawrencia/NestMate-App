export interface AuthUser {
  email: string;
  role?: 'STUDENT' | 'MANAGER';
}

export interface LoginResult {
  success: boolean;
  user?: AuthUser;
  errorMessage?: string;
  /** True when login failed specifically because the account isn't verified yet. */
  needsVerification?: boolean;
}
