import { jwtDecode } from "jwt-decode";
import {
  AuthConfig,
  AuthSession,
  AuthTokenKeys,
  AuthUser,
  DecodedToken,
  UserSessionInfo,
} from "../types/types";

export const DEFAULT_TOKEN_KEYS: AuthTokenKeys = {
  accessToken: "accessToken",
  user: "user",
  tokenType: "tokenType",
};

export const resolveTokenKeys = (config: AuthConfig): AuthTokenKeys => ({
  ...DEFAULT_TOKEN_KEYS,
  ...config.tokenKeys,
});

const encodeBase64 = (data: string): string => {
  return btoa(data);
};

const decodeBase64 = (data: string): string => {
  return atob(data);
};

const escapeRegExp = (value: string): string => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

export const getCookie = (name: string): string | null => {
  if (!name) {
    return null;
  }

  const match = document.cookie.match(
    new RegExp(`(?:^|; )${escapeRegExp(name)}=([^;]*)`)
  );

  return match ? decodeURIComponent(match[1]) : null;
};

const setCookie = (
  name: string,
  value: string,
  expiryDate: Date,
  secure: boolean = location.protocol === "https:",
  sameSite: "Strict" | "Lax" | "None" = "Strict"
) => {
  const cookieValue = encodeURIComponent(value);
  const cookieString = `${name}=${cookieValue}; expires=${expiryDate.toUTCString()}; path=/; SameSite=${sameSite}${
    secure ? "; Secure" : ""
  }`;

  document.cookie = cookieString;
};

const removeCookie = (name: string) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Strict${
    location.protocol === "https:" ? "; Secure" : ""
  }`;
};

const getExpiryDate = (config: AuthConfig): Date => {
  const now = new Date();
  const tokenExpiry = config.tokenExpiry ?? 1;
  const tokenExpiryUnit = config.tokenExpiryUnit ?? "hours";

  switch (tokenExpiryUnit) {
    case "seconds":
      return new Date(now.getTime() + tokenExpiry * 1000);
    case "minutes":
      return new Date(now.getTime() + tokenExpiry * 60 * 1000);
    case "hours":
      return new Date(now.getTime() + tokenExpiry * 60 * 60 * 1000);
    case "days":
      return new Date(now.getTime() + tokenExpiry * 24 * 60 * 60 * 1000);
  }
};

export const isJwtExpired = (accessToken: string): boolean => {
  try {
    const decodedToken = jwtDecode<DecodedToken>(accessToken);

    if (!decodedToken.exp) {
      return false;
    }

    return decodedToken.exp * 1000 <= Date.now();
  } catch {
    return false;
  }
};

export const setSessionInCookie = <TUser extends AuthUser>(
  userSessionInfo: UserSessionInfo<TUser>,
  config: AuthConfig
) => {
  try {
    const expiryDate = getExpiryDate(config);
    const tokenKeys = resolveTokenKeys(config);

    setCookie(tokenKeys.accessToken, userSessionInfo.accessToken, expiryDate);

    if (userSessionInfo.user) {
      const encodedUser = encodeBase64(JSON.stringify(userSessionInfo.user));
      setCookie(tokenKeys.user, encodedUser, expiryDate);
    }

    setCookie(tokenKeys.tokenType, config.tokenType, expiryDate);
  } catch (error) {
    console.error("Error setting session in cookie:", error);
    throw new Error("Failed to set session in cookie");
  }
};

export const getSession = <TUser extends AuthUser>(
  config: AuthConfig
): AuthSession<TUser> | null => {
  try {
    const tokenKeys = resolveTokenKeys(config);
    const accessToken = getCookie(tokenKeys.accessToken);
    const encodedUser = getCookie(tokenKeys.user);

    if (!accessToken) {
      return null;
    }

    if (isJwtExpired(accessToken)) {
      removeTokens(config);
      return null;
    }

    const user = encodedUser
      ? (JSON.parse(decodeBase64(encodedUser)) as TUser)
      : undefined;

    return {
      accessToken,
      user,
    };
  } catch (error) {
    console.error("Error retrieving session from cookies:", error);
    return null;
  }
};

export const removeTokens = (config: AuthConfig) => {
  const tokenKeys = resolveTokenKeys(config);

  removeCookie(tokenKeys.accessToken);
  removeCookie(tokenKeys.user);
  removeCookie(tokenKeys.tokenType);
};
