import { useState, useCallback, useEffect } from "react";
import {
  AuthError,
  DecodedToken,
  AuthConfig,
  AuthUser,
  AuthResponse,
  LoginCredentials,
} from "../contexts/AuthContext";
import { jwtDecode } from "jwt-decode";
import { setToken, getToken, removeToken } from "../utils/authUtils";

function useAuthService(config: AuthConfig) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  const isAuthenticated = useCallback((): boolean => {
    const token = getToken(config.tokenKey);
    if (!token) return false;
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      return decoded.exp > Date.now() / 1000;
    } catch {
      return false;
    }
  }, [config.tokenKey]);

  const login = useCallback(
    async (credentials: LoginCredentials): Promise<AuthUser> => {
      try {
        const response = await fetch(config.loginEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(credentials),
        });
        if (!response.ok) throw new AuthError("Login failed");

        const data: AuthResponse = await response.json();
        setToken(data.token, config.tokenKey);
        setUser(data.user);
        return data.user;
      } catch (error) {
        throw new AuthError("Login failed. Please check your credentials.");
      }
    },
    [config.loginEndpoint, config.tokenKey]
  );

  const logout = useCallback(async (): Promise<void> => {
    if (config.logoutEndpoint) {
      try {
        await fetch(config.logoutEndpoint, {
          method: "POST",
          headers: { Authorization: `Bearer ${getToken(config.tokenKey)}` },
        });
      } catch (error) {
        console.error("Logout endpoint error:", error);
      }
    }
    removeToken(config.tokenKey);
    setUser(null);
  }, [config.logoutEndpoint, config.tokenKey]);

  const getCurrentUser = useCallback(async (): Promise<AuthUser | null> => {
    if (!isAuthenticated()) return null;
    if (config.getUserEndpoint) {
      try {
        const response = await fetch(config.getUserEndpoint, {
          headers: { Authorization: `Bearer ${getToken(config.tokenKey)}` },
        });
        if (!response.ok) throw new AuthError("Failed to get user data");

        const userData: AuthUser = await response.json();
        setUser(userData);
        return userData;
      } catch (error) {
        logout();
        throw new AuthError("Failed to get user data. Please login again.");
      }
    }
    return null;
  }, [config.getUserEndpoint, config.tokenKey, isAuthenticated, logout]);

  const refreshToken = useCallback(async (): Promise<void> => {
    if (!isAuthenticated() || !config.refreshTokenEndpoint) {
      throw new AuthError(
        "No valid token to refresh or refresh endpoint not configured"
      );
    }
    try {
      const response = await fetch(config.refreshTokenEndpoint, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken(config.tokenKey)}` },
      });
      if (!response.ok) throw new AuthError("Token refresh failed");

      const data: AuthResponse = await response.json();
      setToken(data.token, config.tokenKey);
      setUser(data.user);
    } catch (error) {
      logout();
      throw new AuthError("Token refresh failed. Please login again.");
    }
  }, [config.refreshTokenEndpoint, config.tokenKey, isAuthenticated, logout]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      getCurrentUser().finally(() => {
        setLoading(false);
        setInitialized(true);
      });
    } else {
      setLoading(false);
      setInitialized(true);
    }
  }, [getCurrentUser]);

  return {
    user,
    loading: !initialized || loading,
    login,
    logout,
    isAuthenticated,
    getCurrentUser,
    refreshToken,
  };
}

export default useAuthService;
