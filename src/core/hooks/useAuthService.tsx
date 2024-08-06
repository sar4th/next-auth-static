import { useCallback } from "react";
import {
  getSession,
  removeTokens,
  setSessionInCookie,
} from "../utils/authUtils";
import { AuthConfig, UserSessionInfo } from "../types/types";

// Function to get cookie value by name
const getCookie = (name: string): string | null => {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
};

// Improved isAuthenticated function
const isAuthenticated = (config: AuthConfig): boolean => {
  const accessToken = getCookie(config.tokenKeys?.accessToken || "");
  // Add additional checks if needed, such as token expiry
  return !!accessToken;
};

interface UseAuthServiceReturn {
  signIn: (sessionInfo: UserSessionInfo) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: () => boolean;
  currentSession: UserSessionInfo | null;
}

function useAuthService(config: AuthConfig): UseAuthServiceReturn {
  const signIn = useCallback(
    async (sessionInfo: UserSessionInfo) => {
      try {
        setSessionInCookie(sessionInfo, config);
      } catch (error) {
        console.error("Failed to sign in:", error);
      }
    },
    [config]
  );

  const signOut = useCallback(async () => {
    try {
      removeTokens(config.tokenKeys || { accessToken: "accessToken" });
    } catch (error) {
      console.error("Failed to sign out:", error);
    }
  }, [config]);

  const getCurrentSession = useCallback(() => {
    if (isAuthenticated(config)) {
      return getSession(config);
    }
    return null;
  }, [config]);

  return {
    signIn,
    signOut,
    isAuthenticated: () => isAuthenticated(config),
    currentSession: getCurrentSession(),
  };
}

export default useAuthService;
