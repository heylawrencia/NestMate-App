export interface AuthUser {
  userId: number;
  email: string;
}

export interface LoginResult {
  success: boolean;
  user?: AuthUser;
  token?: string;
  errorMessage?: string;
  // Set when login fails specifically because the account's email isn't verified yet.
  requiresVerification?: boolean;
}
