export interface AuthUser {
  id?: string;
  [key: string | number]: any;
}
export interface UserSessionInfo {
  accessToken: string;
  user?: any;
}

export interface AuthConfig {
  tokenType: "Bearer" | "Basic" | "JWT" | "OAuth";
  tokenExpiry?: number;
  tokenKeys?: {
    accessToken: string;
  };
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

export interface DecodedToken {
  exp: number;
  [key: string]: any;
}
