import React, { createContext, useContext, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import useAuthService from "../hooks/useAuthService";
import { AuthConfig, UserSessionInfo } from "../types/types";

interface AuthContextType {
  signIn: (sessionInfo: UserSessionInfo) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: () => boolean;
  currentSession: UserSessionInfo | null;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
  config: AuthConfig;
}

export function AuthProvider({ children, config }: AuthProviderProps) {
  const auth = useAuthService(config);
  const router = useRouter();

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push("/login");
    }
  }, [auth, router]);

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
