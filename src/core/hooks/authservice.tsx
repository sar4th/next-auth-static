import React from "react";
import {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
} from "react";
import jwtDecode from "jwt-decode";

interface DecodedToken {
  exp: number;
  [key: string]: any;
}

export interface AuthUser {
  id: string;
  [key: string]: any;
}

export interface LoginCredentials {
  [key: string]: any;
}

interface AuthResponse {
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

function useAuthService(config: AuthConfig) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const setToken = useCallback(
    (token: string) => {
      try {
        const decoded = jwtDecode<DecodedToken>(token);
        const expiryDate = new Date(decoded.exp * 1000);

        const cookieValue = encodeURIComponent(token);
        const cookieString = `${
          config.tokenKey
        }=${cookieValue}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Strict${
          location.protocol === "https:" ? "; Secure" : ""
        }`;

        document.cookie = cookieString;
      } catch (error) {
        throw new AuthError("Invalid token format");
      }
    },
    [config.tokenKey]
  );

  const getToken = useCallback((): string | null => {
    const cookies = document.cookie.split(";");
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split("=");
      if (name === config.tokenKey) {
        return decodeURIComponent(value);
      }
    }
    return null;
  }, [config.tokenKey]);

  const removeToken = useCallback(() => {
    document.cookie = `${
      config.tokenKey
    }=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Strict${
      location.protocol === "https:" ? "; Secure" : ""
    }`;
  }, [config.tokenKey]);

  const isAuthenticated = useCallback((): boolean => {
    const token = getToken();
    if (!token) return false;

    try {
      const decoded = jwtDecode<DecodedToken>(token);
      return decoded.exp > Date.now() / 1000;
    } catch {
      return false;
    }
  }, [getToken]);

  const login = useCallback(
    async (credentials: LoginCredentials): Promise<AuthUser> => {
      try {
        const response = await fetch(config.loginEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(credentials),
        });

        if (!response.ok) {
          throw new AuthError("Login failed");
        }

        const data: AuthResponse = await response.json();
        setToken(data.token);
        setUser(data.user);
        return data.user;
      } catch (error) {
        throw new AuthError("Login failed. Please check your credentials.");
      }
    },
    [config.loginEndpoint, setToken]
  );

  const logout = useCallback(async (): Promise<void> => {
    if (config.logoutEndpoint) {
      try {
        await fetch(config.logoutEndpoint, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        });
      } catch (error) {
        console.error("Logout endpoint error:", error);
      }
    }
    removeToken();
    setUser(null);
  }, [config.logoutEndpoint, getToken, removeToken]);

  const getCurrentUser = useCallback(async (): Promise<AuthUser | null> => {
    if (!isAuthenticated()) return null;

    if (config.getUserEndpoint) {
      try {
        const response = await fetch(config.getUserEndpoint, {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        });

        if (!response.ok) {
          throw new AuthError("Failed to get user data");
        }

        const userData: AuthUser = await response.json();
        setUser(userData);
        return userData;
      } catch (error) {
        logout();
        throw new AuthError("Failed to get user data. Please login again.");
      }
    }

    return null;
  }, [config.getUserEndpoint, getToken, isAuthenticated, logout]);

  const refreshToken = useCallback(async (): Promise<void> => {
    if (!isAuthenticated() || !config.refreshTokenEndpoint) {
      throw new AuthError(
        "No valid token to refresh or refresh endpoint not configured"
      );
    }

    try {
      const response = await fetch(config.refreshTokenEndpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      if (!response.ok) {
        throw new AuthError("Token refresh failed");
      }

      const data: AuthResponse = await response.json();
      setToken(data.token);
      setUser(data.user);
    } catch (error) {
      logout();
      throw new AuthError("Token refresh failed. Please login again.");
    }
  }, [
    config.refreshTokenEndpoint,
    getToken,
    isAuthenticated,
    logout,
    setToken,
  ]);

  useEffect(() => {
    getCurrentUser().finally(() => setLoading(false));
  }, [getCurrentUser]);

  return {
    user,
    loading,
    login,
    logout,
    isAuthenticated,
    getCurrentUser,
    refreshToken,
  };
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
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
