export type AuthUser = Record<string, unknown> & {
  id?: string;
};

export interface UserSessionInfo<TUser extends AuthUser = AuthUser> {
  accessToken: string;
  user?: TUser;
}

export type AuthSession<TUser extends AuthUser = AuthUser> =
  UserSessionInfo<TUser>;

export interface AuthTokenKeys {
  accessToken: string;
  user: string;
  tokenType: string;
}

export interface AuthConfig {
  tokenType: "Bearer" | "Basic" | "JWT" | "OAuth";
  tokenExpiryUnit?: "seconds" | "minutes" | "hours" | "days";
  tokenExpiry?: number;
  tokenKeys?: Partial<AuthTokenKeys>;
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

export interface DecodedToken {
  exp?: number;
  [key: string]: unknown;
}
