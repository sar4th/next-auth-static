import { useState, useCallback } from "react";
import { jwtDecode } from "jwt-decode";

import { getTokens, removeTokens, setTokens } from "../utils/authUtils";
import { AuthConfig, AuthTokens, AuthUser, DecodedToken } from "../types/types";

function useAuthService(config: AuthConfig) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [tokens, setTokensState] = useState<AuthTokens | null>(() => {
    const storedTokens = getTokens(config.tokenKeys);
    return storedTokens && isValidToken(storedTokens.accessToken)
      ? storedTokens
      : null;
  });

  const isValidToken = (token: string): boolean => {
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      return decoded.exp > Date.now() / 1000;
    } catch {
      return false;
    }
  };

  const isAuthenticated = useCallback((): boolean => {
    return !!tokens && isValidToken(tokens.accessToken);
  }, [tokens]);

  const signIn = useCallback(
    async (newTokens: AuthTokens) => {
      setTokens(newTokens, config.tokenKeys);

      const decodedToken = jwtDecode<DecodedToken>(newTokens.accessToken);
    },
    [config.tokenKeys]
  );

  const signOut = useCallback(async () => {
    setUser(null);
    removeTokens(config.tokenKeys);
  }, [config.tokenKeys]);

  return {
    tokens,
    signIn,
    signOut,
    isAuthenticated,
  };
}

export default useAuthService;
