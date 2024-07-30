export interface AuthUser {
  id: string;
  [key: string]: any;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
}

export interface AuthConfig {
  tokenKeys: {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
  };
  refreshTokenFn?: (refreshToken: string) => Promise<AuthTokens>;
  loginRedirectUrl?: string;
  logoutRedirectUrl?: string;
  unauthorizedRedirectUrl?: string;
  tokenExpirationBuffer?: number;
}
export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

export interface DecodedToken {
  exp: number;
  user: AuthUser;
  [key: string]: any;
}
