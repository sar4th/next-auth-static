import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getSession,
  removeTokens,
  setSessionInCookie,
} from "../utils/authUtils";
import { AuthConfig, AuthSession, AuthUser, UserSessionInfo } from "../types/types";

export interface UseAuthServiceReturn<TUser extends AuthUser = AuthUser> {
  signIn: (sessionInfo: UserSessionInfo<TUser>) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => AuthSession<TUser> | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isReady: boolean;
  currentSession: AuthSession<TUser> | null;
}

function useAuthService<TUser extends AuthUser = AuthUser>(
  config: AuthConfig
): UseAuthServiceReturn<TUser> {
  const [currentSession, setCurrentSession] =
    useState<AuthSession<TUser> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshSession = useCallback(() => {
    const session = getSession<TUser>(config);
    setCurrentSession(session);
    return session;
  }, [config]);

  useEffect(() => {
    refreshSession();
    setIsLoading(false);
  }, [refreshSession]);

  const signIn = useCallback(
    async (sessionInfo: UserSessionInfo<TUser>) => {
      setSessionInCookie(sessionInfo, config);
      setCurrentSession(getSession<TUser>(config));
    },
    [config]
  );

  const signOut = useCallback(async () => {
    removeTokens(config);
    setCurrentSession(null);
  }, [config]);

  return useMemo(
    () => ({
      signIn,
      signOut,
      refreshSession,
      isAuthenticated: Boolean(currentSession),
      isLoading,
      isReady: !isLoading,
      currentSession,
    }),
    [currentSession, isLoading, refreshSession, signIn, signOut]
  );
}

export default useAuthService;
