import React, { createContext, useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuthService from "../hooks/useAuthService";
import { AuthConfig, AuthTokens, AuthUser } from "../types/types";

interface AuthContextType {
  tokens: AuthTokens | null;
  signIn: (tokens: AuthTokens) => Promise<AuthUser>;
  signOut: () => Promise<void>;
  isAuthenticated: () => boolean;
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
    if (!auth.isAuthenticated()) {
      router.push("/login");
    }
  }, [auth.isAuthenticated, router]);

  return (
    <AuthContext.Provider value={auth as any}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
