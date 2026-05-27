import React, { createContext, ReactNode, useContext, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import useAuthService, {
  UseAuthServiceReturn,
} from "../hooks/useAuthService";
import { AuthConfig, AuthUser } from "../types/types";

type AuthContextType<TUser extends AuthUser = AuthUser> =
  UseAuthServiceReturn<TUser>;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
  config: AuthConfig;
}

export function AuthProvider({ children, config }: AuthProviderProps) {
  const auth = useAuthService(config);

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export interface RequireAuthProps {
  children: ReactNode;
  loginPath?: string;
  fallback?: ReactNode;
}

export function RequireAuth({
  children,
  loginPath = "/login",
  fallback = null,
}: RequireAuthProps) {
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (auth.isReady && !auth.isAuthenticated && pathname !== loginPath) {
      router.push(loginPath);
    }
  }, [auth.isAuthenticated, auth.isReady, loginPath, pathname, router]);

  if (auth.isLoading || !auth.isAuthenticated) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

export function useAuth<TUser extends AuthUser = AuthUser>(): AuthContextType<TUser> {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context as AuthContextType<TUser>;
}
