import React, { createContext, useContext, useEffect } from "react";
import { useRouter } from "next/router";
import useAuthService from "../hooks/useAuthService";

export interface AuthUser {
  id: string;
  [key: string]: any;
}

export interface LoginCredentials {
  [key: string]: any;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface AuthConfig {
  tokenKey: string;
  loginEndpoint: string;
  logoutEndpoint?: string;
  refreshTokenEndpoint?: string;
  getUserEndpoint?: string;
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

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthUser>;
  logout: () => Promise<void>;
  isAuthenticated: () => boolean;
  getCurrentUser: () => Promise<AuthUser | null>;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
  children,
  config,
}: {
  children: React.ReactNode;
  config: AuthConfig;
}) {
  const auth = useAuthService(config);
  const router = useRouter();

  useEffect(() => {
    if (!auth.loading && !auth.isAuthenticated()) {
      router.push("/login");
    }
  }, [auth.loading, auth.isAuthenticated, router]);

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
